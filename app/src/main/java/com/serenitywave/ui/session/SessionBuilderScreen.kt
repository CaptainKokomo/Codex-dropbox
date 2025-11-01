package com.serenitywave.ui.session

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.serenitywave.domain.AmbientLayer
import com.serenitywave.domain.ModulationType
import com.serenitywave.domain.SessionPhase
import com.serenitywave.domain.ToneLayer
import com.serenitywave.ui.LocalEnvironment

/**
 * Presents the session builder UI and wires it to a SessionBuilderViewModel from the current environment.
 *
 * Displays editable fields for session name and tags, a list of editable session phases (with tone and ambient layer editors),
 * and controls to add, duplicate, delete, and reorder session content; it also shows total duration, save status, errors, and a Save action
 * that dispatches changes to the ViewModel.
 */
@Composable
fun SessionBuilderScreen() {
    val environment = LocalEnvironment.current
    val viewModel: SessionBuilderViewModel = viewModel(
        factory = SessionBuilderViewModel.factory(environment.sessionRepository)
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Build Session", style = MaterialTheme.typography.headlineSmall)
        OutlinedTextField(
            value = state.sessionName,
            onValueChange = viewModel::updateSessionName,
            label = { Text("Session name") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = state.tagsText,
            onValueChange = viewModel::updateTagsText,
            label = { Text("Tags (comma separated)") },
            modifier = Modifier.fillMaxWidth()
        )
        Text(
            text = "Total duration: ${state.totalDurationMinutes} min",
            style = MaterialTheme.typography.bodyMedium
        )
        state.saveError?.let {
            Text(it, color = MaterialTheme.colorScheme.error)
        }
        if (!state.canSave) {
            Text(
                text = "Add at least one tone layer per phase with a duration above zero.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        state.lastSavedMessage?.let {
            Text(it, color = MaterialTheme.colorScheme.tertiary)
        }
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            itemsIndexed(state.phases, key = { _, phase -> phase.id }) { index, phase ->
                PhaseCard(
                    phase = phase,
                    canDelete = state.phases.size > 1,
                    onPhaseChange = { updated -> viewModel.updatePhase(index, updated) },
                    onToneLayerChange = { toneIndex, updated -> viewModel.updateToneLayer(index, toneIndex, updated) },
                    onAddToneLayer = { viewModel.addToneLayer(index) },
                    onRemoveToneLayer = { toneIndex -> viewModel.removeToneLayer(index, toneIndex) },
                    onAmbientLayerChange = { ambientIndex, updated -> viewModel.updateAmbientLayer(index, ambientIndex, updated) },
                    onAddAmbientLayer = { viewModel.addAmbientLayer(index) },
                    onRemoveAmbientLayer = { ambientIndex -> viewModel.removeAmbientLayer(index, ambientIndex) },
                    onDuplicate = { viewModel.duplicatePhase(index) },
                    onDelete = { viewModel.deletePhase(index) }
                )
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(onClick = viewModel::addPhase) { Text("Add Phase") }
            Button(
                onClick = viewModel::saveSession,
                enabled = state.canSave && !state.isSaving
            ) {
                if (state.isSaving) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("Saving…")
                } else {
                    Text("Save Session")
                }
            }
        }
    }
}

/**
 * Renders an editable card for a single session phase, including its metadata, tone layers, and ambient layers.
 *
 * Displays fields for editing phase name, duration, fade timings, a list of ToneLayer editors (with add/remove),
 * a list of AmbientLayer editors (with add/remove), and actions to duplicate or delete the phase.
 *
 * @param phase The SessionPhase model to display and edit.
 * @param canDelete Whether the Delete action should be enabled.
 * @param onPhaseChange Invoked with an updated SessionPhase when any top-level phase property changes.
 * @param onToneLayerChange Invoked with the index and updated ToneLayer when a tone layer changes.
 * @param onAddToneLayer Invoked to add a new tone layer to this phase.
 * @param onRemoveToneLayer Invoked with the index of the tone layer to remove.
 * @param onAmbientLayerChange Invoked with the index and updated AmbientLayer when an ambient layer changes.
 * @param onAddAmbientLayer Invoked to add a new ambient layer to this phase.
 * @param onRemoveAmbientLayer Invoked with the index of the ambient layer to remove.
 * @param onDuplicate Invoked to duplicate this phase.
 * @param onDelete Invoked to delete this phase.
 */
@Composable
private fun PhaseCard(
    phase: SessionPhase,
    canDelete: Boolean,
    onPhaseChange: (SessionPhase) -> Unit,
    onToneLayerChange: (Int, ToneLayer) -> Unit,
    onAddToneLayer: () -> Unit,
    onRemoveToneLayer: (Int) -> Unit,
    onAmbientLayerChange: (Int, AmbientLayer) -> Unit,
    onAddAmbientLayer: () -> Unit,
    onRemoveAmbientLayer: (Int) -> Unit,
    onDuplicate: () -> Unit,
    onDelete: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(phase.name, style = MaterialTheme.typography.titleMedium)
            OutlinedTextField(
                value = phase.name,
                onValueChange = { onPhaseChange(phase.copy(name = it)) },
                label = { Text("Phase name") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = phase.durationMinutes.toString(),
                onValueChange = { value ->
                    value.toIntOrNull()?.let { onPhaseChange(phase.copy(durationMinutes = it)) }
                },
                label = { Text("Duration (minutes)") },
                modifier = Modifier.fillMaxWidth()
            )
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = phase.fadeInSeconds.toString(),
                    onValueChange = { value -> value.toIntOrNull()?.let { onPhaseChange(phase.copy(fadeInSeconds = it)) } },
                    label = { Text("Fade In (s)") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = phase.fadeOutSeconds.toString(),
                    onValueChange = { value -> value.toIntOrNull()?.let { onPhaseChange(phase.copy(fadeOutSeconds = it)) } },
                    label = { Text("Fade Out (s)") },
                    modifier = Modifier.weight(1f)
                )
            }
            Text("Tone Layers", fontWeight = FontWeight.SemiBold)
            phase.toneLayers.forEachIndexed { index, tone ->
                ToneLayerEditor(
                    tone = tone,
                    canRemove = phase.toneLayers.size > 1,
                    onToneChange = { updated -> onToneLayerChange(index, updated) },
                    onRemove = { onRemoveToneLayer(index) }
                )
            }
            Button(onClick = onAddToneLayer) { Text("Add Tone Layer") }
            Text("Ambient Layers", fontWeight = FontWeight.SemiBold)
            phase.ambientLayers.forEachIndexed { index, ambient ->
                AmbientLayerEditor(
                    ambient = ambient,
                    onAmbientChange = { updated -> onAmbientLayerChange(index, updated) },
                    onRemove = { onRemoveAmbientLayer(index) }
                )
            }
            Button(onClick = onAddAmbientLayer) { Text("Add Ambient Layer") }
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(onClick = onDuplicate) { Text("Duplicate") }
                Button(onClick = onDelete, enabled = canDelete) { Text("Delete") }
            }
        }
    }
}

/**
 * Renders an editor for a single tone layer with editable fields for band ID, beat frequency,
 * carrier frequency, volume, and modulation type.
 *
 * The editor reflects the provided `tone` values and invokes callbacks when the user changes
 * any field or requests removal.
 *
 * @param tone The current tone layer state to display and edit.
 * @param canRemove If true, shows a control that allows the user to remove this tone layer.
 * @param onToneChange Invoked with an updated `ToneLayer` when the user modifies any field.
 * @param onRemove Invoked when the user requests removal of this tone layer.
 */
@Composable
private fun ToneLayerEditor(
    tone: ToneLayer,
    canRemove: Boolean,
    onToneChange: (ToneLayer) -> Unit,
    onRemove: () -> Unit
) {
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
        if (canRemove) {
            TextButton(onClick = onRemove) { Text("Remove tone layer") }
        }
    }
}

/**
 * Editor UI for a single ambient layer.
 *
 * Displays editable fields for the ambient's name and volume and a button to remove the layer.
 *
 * @param ambient The AmbientLayer instance being edited.
 * @param onAmbientChange Invoked with an updated AmbientLayer when the user changes name or volume.
 * @param onRemove Invoked when the user requests removal of this ambient layer.
 */
@Composable
private fun AmbientLayerEditor(
    ambient: AmbientLayer,
    onAmbientChange: (AmbientLayer) -> Unit,
    onRemove: () -> Unit
) {
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
        TextButton(onClick = onRemove) { Text("Remove ambient layer") }
    }
}