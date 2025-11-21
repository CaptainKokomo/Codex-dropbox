package com.serenitywave.data

import com.serenitywave.domain.AmbientLayer
import com.serenitywave.domain.ModulationType
import com.serenitywave.domain.SessionBlueprint
import com.serenitywave.domain.SessionPhase
import com.serenitywave.domain.ToneLayer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SessionStorageCodecTest {

    @Test
    fun `encode and decode preserve session structure`() {
        val original = listOf(sampleSession())

        val encoded = SessionStorageCodec.encode(original)
        val decoded = SessionStorageCodec.decode(encoded)

        assertEquals(original, decoded)
    }

    @Test
    fun `decodeOrEmpty handles invalid json input`() {
        val decoded = SessionStorageCodec.decodeOrEmpty("not-json")

        assertTrue(decoded.isEmpty())
    }

    private fun sampleSession(): SessionBlueprint {
        val tone = ToneLayer(
            bandId = "theta",
            beatFrequencyHz = 6.5,
            carrierFrequencyHz = 180.0,
            volume = 0.75f,
            modulationType = ModulationType.Binaural
        )
        val ambient = AmbientLayer(
            id = "forest",
            name = "Forest Birds",
            assetPath = "ambient/forest.mp3",
            volume = 0.5f
        )
        val phase = SessionPhase(
            id = "phase-1",
            name = "Drift",
            durationMinutes = 20,
            toneLayers = listOf(tone),
            ambientLayers = listOf(ambient),
            fadeInSeconds = 8,
            fadeOutSeconds = 8
        )
        return SessionBlueprint(
            id = "session-1",
            name = "Evening Wind Down",
            tags = setOf("Relax", "Night"),
            phases = listOf(phase),
            notes = "Gentle ramp down"
        )
    }
}
