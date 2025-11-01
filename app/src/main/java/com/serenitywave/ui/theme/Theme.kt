package com.serenitywave.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = SoftTeal,
    onPrimary = DeepTeal,
    secondary = Lavender,
    background = Mist,
    surface = Sand,
    onSurface = DeepTeal
)

private val DarkColors = darkColorScheme(
    primary = SoftTeal,
    onPrimary = DeepTeal,
    secondary = Lavender,
    background = DeepTeal,
    surface = DeepTeal,
    onSurface = Mist
)

/**
 * Applies the SerenityWave Material 3 theme to [content] using the library's predefined light and dark color schemes.
 *
 * @param darkTheme When `true`, the theme uses the dark color scheme; when `false`, the light color scheme is used. Defaults to the system dark mode setting.
 * @param content Composable content to be styled with the SerenityWave theme.
 */
@Composable
fun SerenityWaveTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}