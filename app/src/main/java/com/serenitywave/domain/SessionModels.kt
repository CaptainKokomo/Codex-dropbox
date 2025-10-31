package com.serenitywave.domain

data class ToneLayer(
    val bandId: String,
    val beatFrequencyHz: Double,
    val carrierFrequencyHz: Double,
    val volume: Float,
    val modulationType: ModulationType
)

data class AmbientLayer(
    val id: String,
    val name: String,
    val assetPath: String,
    val volume: Float,
)
 
val defaultAmbientLayers = listOf(
    AmbientLayer(id = "rain", name = "Gentle Rain", assetPath = "ambient/rain.mp3", volume = 0.5f),
    AmbientLayer(id = "forest", name = "Forest Birds", assetPath = "ambient/forest.mp3", volume = 0.5f),
    AmbientLayer(id = "ocean", name = "Ocean Waves", assetPath = "ambient/ocean.mp3", volume = 0.5f),
)

data class SessionPhase(
    val id: String,
    val name: String,
    val durationMinutes: Int,
    val toneLayers: List<ToneLayer>,
    val ambientLayers: List<AmbientLayer>,
    val fadeInSeconds: Int,
    val fadeOutSeconds: Int
)

data class SessionBlueprint(
    val id: String,
    val name: String,
    val tags: Set<String>,
    val phases: List<SessionPhase>,
    val notes: String? = null
)

enum class ModulationType { Binaural, Isochronic }
