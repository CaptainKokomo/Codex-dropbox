package com.serenitywave.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Album
import androidx.compose.material.icons.outlined.LibraryMusic
import androidx.compose.material.icons.outlined.QueueMusic
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.serenitywave.ui.library.LibraryScreen
import com.serenitywave.ui.presets.PresetsScreen
import com.serenitywave.ui.session.SessionBuilderScreen
import com.serenitywave.ui.tone.CustomToneScreen

sealed class NavDestination(val route: String, val label: String, val icon: @Composable () -> Unit) {
    object Presets : NavDestination("presets", "Presets", { Icon(Icons.Outlined.Album, contentDescription = null) })
    object Custom : NavDestination("custom", "Custom", { Icon(Icons.Outlined.Tune, contentDescription = null) })
    object Sessions : NavDestination("sessions", "Sessions", { Icon(Icons.Outlined.QueueMusic, contentDescription = null) })
    object Library : NavDestination("library", "Library", { Icon(Icons.Outlined.LibraryMusic, contentDescription = null) })
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val items = listOf(
        NavDestination.Presets,
        NavDestination.Custom,
        NavDestination.Sessions,
        NavDestination.Library
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                items.forEach { destination ->
                    NavigationBarItem(
                        selected = currentRoute == destination.route,
                        onClick = {
                            if (currentRoute != destination.route) {
                                navController.navigate(destination.route) {
                                    popUpTo(navController.graph.startDestinationId) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        },
                        icon = { destination.icon() },
                        label = { Text(destination.label) }
                    )
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = NavDestination.Presets.route,
            modifier = Modifier.padding(padding)
        ) {
            composable(NavDestination.Presets.route) { PresetsScreen() }
            composable(NavDestination.Custom.route) { CustomToneScreen() }
            composable(NavDestination.Sessions.route) { SessionBuilderScreen() }
            composable(NavDestination.Library.route) { LibraryScreen() }
        }
    }
}
