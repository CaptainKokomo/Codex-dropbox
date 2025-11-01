package com.serenitywave.domain

data class BrainwaveBand(
    val id: String,
    val name: String,
    val frequencyRangeHz: ClosedFloatingPointRange<Double>,
    val description: String,
    val defaultCarrierHz: Double,
)

val defaultBands = listOf(
    BrainwaveBand(
        id = "delta",
        name = "Delta",
        frequencyRangeHz = 0.5..4.0,
        description = "Deep sleep, physical restoration, and subconscious healing cues.",
        defaultCarrierHz = 120.0
    ),
    BrainwaveBand(
        id = "theta",
        name = "Theta",
        frequencyRangeHz = 4.0..8.0,
        description = "Meditative calm, creative insights, and emotional processing.",
        defaultCarrierHz = 160.0
    ),
    BrainwaveBand(
        id = "alpha",
        name = "Alpha",
        frequencyRangeHz = 8.0..12.0,
        description = "Relaxed focus, reflective awareness, and light mindfulness.",
        defaultCarrierHz = 200.0
    ),
    BrainwaveBand(
        id = "beta",
        name = "Beta",
        frequencyRangeHz = 12.0..30.0,
        description = "Engaged attention, problem solving, and productive energy.",
        defaultCarrierHz = 240.0
    ),
    BrainwaveBand(
        id = "gamma",
        name = "Gamma",
        frequencyRangeHz = 30.0..80.0,
        description = "Peak cognition, integrative learning, and sensory clarity.",
        defaultCarrierHz = 280.0
    )
)
