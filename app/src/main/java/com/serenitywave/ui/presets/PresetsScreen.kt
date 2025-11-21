package com.serenitywave.ui.presets

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.serenitywave.domain.BrainwaveBand
import com.serenitywave.domain.defaultBands

@Composable
fun PresetsScreen() {
    var selectedBand by remember { mutableStateOf<BrainwaveBand?>(null) }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Brainwave Presets", style = MaterialTheme.typography.headlineSmall)
        defaultBands.forEach { band ->
            Card(
                onClick = { selectedBand = band },
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(band.name, style = MaterialTheme.typography.titleMedium)
                    Text(
                        text = "${band.frequencyRangeHz.start}-${band.frequencyRangeHz.endInclusive} Hz",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Text(
                        text = band.description,
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                    Button(
                        onClick = { selectedBand = band },
                        modifier = Modifier
                            .align(Alignment.End)
                            .padding(top = 12.dp)
                    ) {
                        Text("Preview")
                    }
                }
            }
        }
        selectedBand?.let {
            Text(
                text = "Selected preset: ${it.name} (${it.frequencyRangeHz.start}-${it.frequencyRangeHz.endInclusive} Hz)",
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}
