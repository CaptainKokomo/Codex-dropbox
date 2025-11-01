package com.serenitywave

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.CompositionLocalProvider
import androidx.core.view.WindowCompat
import com.serenitywave.ui.AppNavigation
import com.serenitywave.ui.LocalEnvironment
import com.serenitywave.ui.theme.SerenityWaveTheme

class MainActivity : ComponentActivity() {
    /**
     * Initializes the activity, configures window insets, and sets the Jetpack Compose UI with the app environment and navigation.
     *
     * Sets the window to draw behind system bars, retrieves the application environment from `SerenityWaveApp`,
     * applies `SerenityWaveTheme`, provides `LocalEnvironment` to the composition, and launches `AppNavigation` as the root UI.
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val app = application as SerenityWaveApp
        setContent {
            SerenityWaveTheme {
                CompositionLocalProvider(LocalEnvironment provides app.environment) {
                    AppNavigation()
                }
            }
        }
    }
}