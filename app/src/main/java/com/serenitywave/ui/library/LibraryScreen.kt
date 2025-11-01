package com.serenitywave.ui.library

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.serenitywave.domain.SessionBlueprint
import com.serenitywave.ui.LocalEnvironment
import kotlinx.coroutines.launch
import androidx.lifecycle.compose.collectAsStateWithLifecycle

/**
 * Displays saved sessions from the current environment and provides Play and Delete controls for each.
 *
 * The composable observes the environment's session repository and shows a header plus either a
 * placeholder when no sessions exist or a scrollable list of SessionCard items. Tapping Delete
 * removes the session from the repository.
 */
@Composable
fun LibraryScreen() {
    val environment = LocalEnvironment.current
    val sessions by environment.sessionRepository.sessions.collectAsStateWithLifecycle(initialValue = emptyList())
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Saved Sessions", style = MaterialTheme.typography.headlineSmall)
        if (sessions.isEmpty()) {
            Text("No sessions saved yet. Create one from the Sessions tab.")
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(sessions) { session ->
                    SessionCard(
                        session = session,
                        onDelete = {
                            scope.launch { environment.sessionRepository.deleteSession(session.id) }
                        },
                        onPlay = { /* TODO playback hook */ }
                    )
                }
            }
        }
    }
}

/**
 * Renders a card summarizing a saved session and exposes Play and Delete actions.
 *
 * Displays the session name, comma-separated tags, number of phases, and total duration in minutes,
 * and provides buttons to trigger playback or deletion.
 *
 * @param session The session blueprint whose metadata is shown.
 * @param onPlay Callback invoked when the "Play" button is pressed.
 * @param onDelete Callback invoked when the "Delete" button is pressed.
 */
@Composable
private fun SessionCard(
    session: SessionBlueprint,
    onPlay: () -> Unit,
    onDelete: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(session.name, style = MaterialTheme.typography.titleMedium)
            Text(session.tags.joinToString(separator = ", "))
            val totalMinutes = session.phases.sumOf { it.durationMinutes }
            Text("Phases: ${session.phases.size}")
            Text("Total duration: ${totalMinutes} min")
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                TextButton(onClick = onPlay) { Text("Play") }
                TextButton(onClick = onDelete) { Text("Delete") }
            }
        }
    }
}