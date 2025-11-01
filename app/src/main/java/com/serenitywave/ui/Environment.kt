package com.serenitywave.ui

import androidx.compose.runtime.staticCompositionLocalOf
import com.serenitywave.domain.SerenityWaveEnvironment

val LocalEnvironment = staticCompositionLocalOf<SerenityWaveEnvironment> {
    error("SerenityWaveEnvironment not provided")
}
