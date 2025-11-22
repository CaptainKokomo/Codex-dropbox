package com.serenitywave.audio

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AudioEngine {
    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentPhaseRemainingSeconds = MutableStateFlow(0)
    val currentPhaseRemainingSeconds: StateFlow<Int> = _currentPhaseRemainingSeconds.asStateFlow()

    fun play(sessionId: String) {
        _isPlaying.value = true
        _currentPhaseRemainingSeconds.value = 0
    }

    fun stop() {
        _isPlaying.value = false
        _currentPhaseRemainingSeconds.value = 0
    }
}
