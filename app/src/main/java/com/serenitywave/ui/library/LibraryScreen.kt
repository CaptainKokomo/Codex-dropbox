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
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.serenitywave.domain.SessionBlueprint
import com.serenitywave.ui.LocalEnvironment

@Composable
fun LibraryScreen() {
    val environment = LocalEnvironment.current
    val sessions by environment.sessionRepository.sessions.collectAsState(initial = emptyList())

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
                        onDelete = { environment.sessionRepository.deleteSession(session.id) },
                        onPlay = { /* TODO playback hook */ }
                    )
                }
            }
        }
    }
}

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
            Text("Phases: ${session.phases.size}")
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                TextButton(onClick = onPlay) { Text("Play") }
                TextButton(onClick = onDelete) { Text("Delete") }
            }
        }
    }
}
