package com.serenitywave.ui.session

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.serenitywave.domain.ModulationType
import com.serenitywave.domain.AmbientLayer
import com.serenitywave.domain.SessionBlueprint
import com.serenitywave.domain.SessionPhase
import com.serenitywave.domain.ToneLayer
import com.serenitywave.domain.defaultAmbientLayers
import com.serenitywave.domain.defaultBands
import com.serenitywave.ui.LocalEnvironment
import kotlinx.coroutines.launch
import java.util.UUID

@Composable
fun SessionBuilderScreen() {
    val environment = LocalEnvironment.current
    val phases = remember { mutableStateListOf(createDefaultPhase()) }
    var sessionName by remember { mutableStateOf("My Session") }
    var tagsText by remember { mutableStateOf("Focus,Evening") }
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Build Session", style = MaterialTheme.typography.headlineSmall)
        OutlinedTextField(
            value = sessionName,
            onValueChange = { sessionName = it },
            label = { Text("Session name") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = tagsText,
            onValueChange = { tagsText = it },
            label = { Text("Tags (comma separated)") },
            modifier = Modifier.fillMaxWidth()
        )
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            itemsIndexed(phases, key = { _, phase -> phase.id }) { index, phase ->
                PhaseCard(
                    phase = phase,
                    onUpdate = { updated -> phases[index] = updated },
                    onDuplicate = {
                        phases.add(index + 1, phase.copy(id = UUID.randomUUID().toString(), name = phase.name + " copy"))
                    },
                    onDelete = { if (phases.size > 1) phases.removeAt(index) }
                )
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(onClick = { phases.add(createDefaultPhase()) }) { Text("Add Phase") }
            Button(onClick = {
                val blueprint = SessionBlueprint(
                    id = UUID.randomUUID().toString(),
                    name = sessionName,
                    tags = tagsText.split(',').mapNotNull { it.trim().takeIf(String::isNotEmpty) }.toSet(),
                    phases = phases.toList()
                )
                scope.launch {
                    environment.sessionRepository.saveSession(blueprint)
                }
            }) { Text("Save Session") }
        }
    }
}

@Composable
private fun PhaseCard(
    phase: SessionPhase,
    onUpdate: (SessionPhase) -> Unit,
    onDuplicate: () -> Unit,
    onDelete: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(phase.name, style = MaterialTheme.typography.titleMedium)
            OutlinedTextField(
                value = phase.name,
                onValueChange = { onUpdate(phase.copy(name = it)) },
                label = { Text("Phase name") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = phase.durationMinutes.toString(),
                onValueChange = { value ->
                    value.toIntOrNull()?.let { onUpdate(phase.copy(durationMinutes = it)) }
                },
                label = { Text("Duration (minutes)") },
                modifier = Modifier.fillMaxWidth()
            )
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = phase.fadeInSeconds.toString(),
                    onValueChange = { value -> value.toIntOrNull()?.let { onUpdate(phase.copy(fadeInSeconds = it)) } },
                    label = { Text("Fade In (s)") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = phase.fadeOutSeconds.toString(),
                    onValueChange = { value -> value.toIntOrNull()?.let { onUpdate(phase.copy(fadeOutSeconds = it)) } },
                    label = { Text("Fade Out (s)") },
                    modifier = Modifier.weight(1f)
                )
            }
            Text("Tone Layers", fontWeight = FontWeight.SemiBold)
            phase.toneLayers.forEachIndexed { index, tone ->
                ToneLayerEditor(tone = tone, onToneChange = { updated ->
                    val updatedLayers = phase.toneLayers.toMutableList()
                    updatedLayers[index] = updated
                    onUpdate(phase.copy(toneLayers = updatedLayers))
                })
            }
            Button(onClick = {
                val updated = phase.toneLayers + ToneLayer(
                    bandId = defaultBands.first().id,
                    beatFrequencyHz = defaultBands.first().frequencyRangeHz.start,
                    carrierFrequencyHz = defaultBands.first().defaultCarrierHz,
                    volume = 0.7f,
                    modulationType = ModulationType.Binaural
                )
                onUpdate(phase.copy(toneLayers = updated))
            }) { Text("Add Tone Layer") }
            Text("Ambient Layers", fontWeight = FontWeight.SemiBold)
            phase.ambientLayers.forEachIndexed { index, ambient ->
                AmbientLayerEditor(ambient = ambient, onAmbientChange = { updated ->
                    val updatedLayers = phase.ambientLayers.toMutableList()
                    updatedLayers[index] = updated
                    onUpdate(phase.copy(ambientLayers = updatedLayers))
                })
            }
            Button(onClick = {
                val nextAmbient = defaultAmbientLayers[(phase.ambientLayers.size) % defaultAmbientLayers.size]
                onUpdate(phase.copy(ambientLayers = phase.ambientLayers + nextAmbient))
            }) { Text("Add Ambient Layer") }
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(onClick = onDuplicate) { Text("Duplicate") }
                Button(onClick = onDelete) { Text("Delete") }
            }
        }
    }
}

@Composable
private fun ToneLayerEditor(tone: ToneLayer, onToneChange: (ToneLayer) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedTextField(
            value = tone.bandId,
            onValueChange = { onToneChange(tone.copy(bandId = it)) },
            label = { Text("Band ID") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = tone.beatFrequencyHz.toString(),
            onValueChange = { value -> value.toDoubleOrNull()?.let { onToneChange(tone.copy(beatFrequencyHz = it)) } },
            label = { Text("Beat Frequency") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = tone.carrierFrequencyHz.toString(),
            onValueChange = { value -> value.toDoubleOrNull()?.let { onToneChange(tone.copy(carrierFrequencyHz = it)) } },
            label = { Text("Carrier Frequency") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = tone.volume.toString(),
            onValueChange = { value -> value.toFloatOrNull()?.let { onToneChange(tone.copy(volume = it)) } },
            label = { Text("Volume") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = tone.modulationType.name,
            onValueChange = { name ->
                ModulationType.values().firstOrNull { it.name.equals(name, ignoreCase = true) }?.let {
                    onToneChange(tone.copy(modulationType = it))
                }
            },
            label = { Text("Modulation Type") },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun AmbientLayerEditor(ambient: AmbientLayer, onAmbientChange: (AmbientLayer) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedTextField(
            value = ambient.name,
            onValueChange = { onAmbientChange(ambient.copy(name = it)) },
            label = { Text("Ambient name") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = ambient.volume.toString(),
            onValueChange = { value -> value.toFloatOrNull()?.let { onAmbientChange(ambient.copy(volume = it)) } },
            label = { Text("Volume") },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

private fun createDefaultPhase(): SessionPhase = SessionPhase(
    id = UUID.randomUUID().toString(),
    name = "New Phase",
    durationMinutes = 10,
    toneLayers = listOf(
        ToneLayer(
            bandId = defaultBands.first().id,
            beatFrequencyHz = defaultBands.first().frequencyRangeHz.start,
            carrierFrequencyHz = defaultBands.first().defaultCarrierHz,
            volume = 0.7f,
            modulationType = ModulationType.Binaural
        )
    ),
    ambientLayers = emptyList(),
    fadeInSeconds = 10,
    fadeOutSeconds = 10
)
