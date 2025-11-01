package com.serenitywave.ui.tone

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.serenitywave.domain.ModulationType
import com.serenitywave.domain.defaultBands

/**
 * Displays a screen for creating and previewing a custom tone with selectable band, frequencies, volume, and modulation.
 *
 * Provides UI controls to select a frequency band, adjust beat frequency and carrier frequency via sliders, set playback volume,
 * choose a modulation type, and trigger a preview of the configured tone. Internal state for the selected band, frequencies,
 * volume, and modulation is managed within the composable.
 */
@Composable
fun CustomToneScreen() {
    var selectedBandIndex by remember { mutableStateOf(0) }
    var beatFrequency by remember { mutableStateOf(defaultBands[selectedBandIndex].frequencyRangeHz.start) }
    var carrierFrequency by remember { mutableStateOf(defaultBands[selectedBandIndex].defaultCarrierHz) }
    var volume by remember { mutableStateOf(0.8f) }
    var modulation by remember { mutableStateOf(ModulationType.Binaural) }

    val band = defaultBands[selectedBandIndex]

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Create Custom Tone", style = MaterialTheme.typography.headlineSmall)
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text("Select Band", fontWeight = FontWeight.SemiBold)
                BandChips(selected = selectedBandIndex, onSelected = {
                    selectedBandIndex = it
                    beatFrequency = defaultBands[it].frequencyRangeHz.start
                    carrierFrequency = defaultBands[it].defaultCarrierHz
                })
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Beat Frequency: ${"%.2f".format(beatFrequency)} Hz")
                    Slider(
                        value = beatFrequency.toFloat(),
                        onValueChange = { beatFrequency = it.toDouble() },
                        valueRange = band.frequencyRangeHz.start.toFloat()..band.frequencyRangeHz.endInclusive.toFloat()
                    )
                }
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Carrier Frequency: ${"%.1f".format(carrierFrequency)} Hz")
                    Slider(
                        value = carrierFrequency.toFloat(),
                        onValueChange = { carrierFrequency = it.toDouble() },
                        valueRange = 100f..400f
                    )
                }
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Volume: ${(volume * 100).toInt()}%")
                    Slider(
                        value = volume,
                        onValueChange = { volume = it }
                    )
                }
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Modulation Type")
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        ModulationType.values().forEach { type ->
                            Button(onClick = { modulation = type }) {
                                Text(
                                    if (modulation == type) "${type.name} (active)" else type.name
                                )
                            }
                        }
                    }
                }
                Button(onClick = { /* trigger preview */ }) {
                    Text("Play Preview")
                }
                Text("Current modulation: ${modulation.name}")
            }
        }
    }
}

/**
 * Renders a horizontal group of buttons for each available band and notifies when a band is chosen.
 *
 * @param selected The index of the currently selected band (provided for caller state; this composable does not apply selection styling).
 * @param onSelected Callback invoked with the index of the band when its button is clicked.
 */
@Composable
private fun BandChips(selected: Int, onSelected: (Int) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        defaultBands.forEachIndexed { index, band ->
            Button(onClick = { onSelected(index) }) {
                Text(band.name)
            }
        }
    }
}