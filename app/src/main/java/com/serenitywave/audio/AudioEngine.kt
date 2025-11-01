package com.serenitywave.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.util.Log
import java.io.Closeable
import kotlin.math.PI
import kotlin.math.min
import kotlin.math.sin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Lightweight audio runner that emits a calming sine wave placeholder while counting down the
 * active brainwave phase. The real synthesis pipeline will plug in here during the audio milestone.
 */
class AudioEngine(
    coroutineScope: CoroutineScope? = null,
    private val phaseDurationResolver: (sessionId: String) -> Int = { DEFAULT_PHASE_SECONDS }
) : Closeable {

    private val ownsScope = coroutineScope == null
    private val scope = coroutineScope ?: CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentPhaseRemainingSeconds = MutableStateFlow(0)
    val currentPhaseRemainingSeconds: StateFlow<Int> = _currentPhaseRemainingSeconds.asStateFlow()

    private var playbackJob: Job? = null
    private var toneJob: Job? = null
    private var audioTrack: AudioTrack? = null

    fun play(sessionId: String) {
        val durationSeconds = phaseDurationResolver(sessionId).coerceAtLeast(0)
        if (durationSeconds <= 0) {
            stop()
            return
        }

        playbackJob?.cancel()
        playbackJob = scope.launch {
            cleanup(resetRemaining = true)
            try {
                val track = prepareAudioTrack()
                _isPlaying.value = true
                _currentPhaseRemainingSeconds.value = durationSeconds

                toneJob = launch(Dispatchers.Default) {
                    generateTone(track, durationSeconds)
                }

                var remaining = durationSeconds
                while (remaining > 0 && isActive) {
                    delay(ONE_SECOND_MILLIS)
                    if (!isActive) break
                    remaining -= 1
                    _currentPhaseRemainingSeconds.value = remaining
                }
            } catch (error: Throwable) {
                Log.e(TAG, "Failed to play session $sessionId", error)
            } finally {
                cleanup(resetRemaining = true)
            }
        }
    }

    fun stop() {
        playbackJob?.cancel()
        playbackJob = null
        scope.launch { cleanup(resetRemaining = true) }
    }

    override fun close() {
        playbackJob?.cancel()
        playbackJob = null
        cleanup(resetRemaining = true)
        if (ownsScope) {
            scope.cancel()
        }
    }

    private fun prepareAudioTrack(): AudioTrack {
        val bufferSize = AudioTrack.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )

        return AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
            )
            .setAudioFormat(
                AudioFormat.Builder()
                    .setSampleRate(SAMPLE_RATE)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build()
            )
            .setTransferMode(AudioTrack.MODE_STREAM)
            .setBufferSizeInBytes(bufferSize)
            .build()
            .also {
                it.play()
                audioTrack = it
            }
    }

    private suspend fun generateTone(track: AudioTrack, durationSeconds: Int) {
        try {
            val minBuffer = AudioTrack.getMinBufferSize(
                SAMPLE_RATE,
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )
            val buffer = ShortArray(maxOf(minBuffer / 2, 256))
            val totalSamples = durationSeconds * SAMPLE_RATE
            var writtenSamples = 0

            while (writtenSamples < totalSamples && isActive) {
                val samplesToWrite = min(buffer.size, totalSamples - writtenSamples)
                for (i in 0 until samplesToWrite) {
                    val sampleIndex = writtenSamples + i
                    val angle = 2.0 * PI * PLACEHOLDER_FREQUENCY_HZ * sampleIndex / SAMPLE_RATE
                    buffer[i] = (sin(angle) * Short.MAX_VALUE * PLACEHOLDER_AMPLITUDE).toInt().toShort()
                }
                if (!isActive) break
                track.write(buffer, 0, samplesToWrite, AudioTrack.WRITE_BLOCKING)
                writtenSamples += samplesToWrite
            }
        } catch (error: Throwable) {
            Log.e(TAG, "Tone generation failed", error)
        }
    }

    private fun cleanup(resetRemaining: Boolean) {
        toneJob?.cancel()
        toneJob = null

        audioTrack?.let { track ->
            runCatching { track.stop() }.onFailure { Log.w(TAG, "AudioTrack stop failed", it) }
            track.release()
        }
        audioTrack = null

        if (resetRemaining) {
            _currentPhaseRemainingSeconds.value = 0
        }
        _isPlaying.value = false
    }

    companion object {
        private const val TAG = "AudioEngine"
        private const val SAMPLE_RATE = 44_100
        private const val PLACEHOLDER_FREQUENCY_HZ = 220.0
        private const val PLACEHOLDER_AMPLITUDE = 0.25
        private const val DEFAULT_PHASE_SECONDS = 60
        private const val ONE_SECOND_MILLIS = 1_000L
    }
}
