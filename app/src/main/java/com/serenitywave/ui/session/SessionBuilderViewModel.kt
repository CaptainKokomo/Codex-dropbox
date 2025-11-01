package com.serenitywave.ui.session

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.serenitywave.data.SessionRepository
import com.serenitywave.domain.AmbientLayer
import com.serenitywave.domain.ModulationType
import com.serenitywave.domain.SessionBlueprint
import com.serenitywave.domain.SessionPhase
import com.serenitywave.domain.ToneLayer
import com.serenitywave.domain.defaultAmbientLayers
import com.serenitywave.domain.defaultBands
import java.util.UUID
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class SessionBuilderViewModel(
    private val repository: SessionRepository
) : ViewModel() {

    private val _state = MutableStateFlow(SessionBuilderState().recalculateDerived())
    val state: StateFlow<SessionBuilderState> = _state

    fun updateSessionName(name: String) {
        mutate { it.copy(sessionName = name) }
    }

    fun updateTagsText(tags: String) {
        mutate { it.copy(tagsText = tags) }
    }

    fun addPhase() {
        mutate { state ->
            state.copy(phases = state.phases + defaultSessionPhase())
        }
    }

    fun updatePhase(index: Int, updated: SessionPhase) {
        mutatePhase(index) { updated }
    }

    fun duplicatePhase(index: Int) {
        mutatePhase(index) { phase ->
            phase.copy(id = UUID.randomUUID().toString(), name = "${phase.name} copy")
        }
    }

    fun deletePhase(index: Int) {
        mutate { state ->
            if (state.phases.size <= 1 || index !in state.phases.indices) return@mutate state
            state.copy(phases = state.phases.toMutableList().apply { removeAt(index) })
        }
    }

    fun updateToneLayer(phaseIndex: Int, toneIndex: Int, updated: ToneLayer) {
        mutatePhase(phaseIndex) { phase ->
            if (toneIndex !in phase.toneLayers.indices) return@mutatePhase phase
            phase.copy(toneLayers = phase.toneLayers.toMutableList().apply { this[toneIndex] = updated })
        }
    }

    fun addToneLayer(phaseIndex: Int) {
        mutatePhase(phaseIndex) { phase ->
            phase.copy(toneLayers = phase.toneLayers + defaultToneLayer())
        }
    }

    fun removeToneLayer(phaseIndex: Int, toneIndex: Int) {
        mutatePhase(phaseIndex) { phase ->
            if (phase.toneLayers.size <= 1 || toneIndex !in phase.toneLayers.indices) return@mutatePhase phase
            phase.copy(toneLayers = phase.toneLayers.toMutableList().apply { removeAt(toneIndex) })
        }
    }

    fun updateAmbientLayer(phaseIndex: Int, ambientIndex: Int, updated: AmbientLayer) {
        mutatePhase(phaseIndex) { phase ->
            if (ambientIndex !in phase.ambientLayers.indices) return@mutatePhase phase
            phase.copy(ambientLayers = phase.ambientLayers.toMutableList().apply { this[ambientIndex] = updated })
        }
    }

    fun addAmbientLayer(phaseIndex: Int) {
        mutatePhase(phaseIndex) { phase ->
            val nextAmbient = defaultAmbientLayers.firstOrNull { candidate ->
                phase.ambientLayers.none { it.id == candidate.id }
            } ?: defaultAmbientLayers.firstOrNull() ?: return@mutatePhase phase
            phase.copy(ambientLayers = phase.ambientLayers + nextAmbient)
        }
    }

    fun removeAmbientLayer(phaseIndex: Int, ambientIndex: Int) {
        mutatePhase(phaseIndex) { phase ->
            if (ambientIndex !in phase.ambientLayers.indices) return@mutatePhase phase
            phase.copy(ambientLayers = phase.ambientLayers.toMutableList().apply { removeAt(ambientIndex) })
        }
    }

    fun saveSession() {
        val current = _state.value
        val validationError = validate(current)
        if (validationError != null) {
            mutate(clearStatus = false) {
                it.copy(saveError = validationError, lastSavedMessage = null)
            }
            return
        }

        val blueprint = SessionBlueprint(
            id = UUID.randomUUID().toString(),
            name = current.sessionName.ifBlank { "Untitled Session" },
            tags = parseTags(current.tagsText),
            phases = current.phases
        )

        viewModelScope.launch {
            mutate { it.copy(isSaving = true) }
            runCatching { repository.saveSession(blueprint) }
                .onSuccess {
                    mutate(clearStatus = false) {
                        it.copy(
                            isSaving = false,
                            lastSavedMessage = "Saved \"${blueprint.name}\""
                        )
                    }
                }
                .onFailure { error ->
                    mutate(clearStatus = false) {
                        it.copy(
                            isSaving = false,
                            saveError = error.message ?: "Unable to save session"
                        )
                    }
                }
        }
    }

    private fun mutatePhase(index: Int, transform: (SessionPhase) -> SessionPhase) {
        mutate { state ->
            if (index !in state.phases.indices) return@mutate state
            val updated = transform(state.phases[index])
            state.copy(
                phases = state.phases.toMutableList().apply { this[index] = updated }
            )
        }
    }

    private fun mutate(
        clearStatus: Boolean = true,
        transform: (SessionBuilderState) -> SessionBuilderState
    ) {
        _state.update { current ->
            var updated = transform(current)
            if (clearStatus) {
                updated = updated.copy(saveError = null, lastSavedMessage = null)
            }
            updated.recalculateDerived()
        }
    }

    private fun validate(state: SessionBuilderState): String? {
        if (state.phases.isEmpty()) {
            return "Add at least one phase to save a session."
        }
        if (state.phases.any { it.durationMinutes <= 0 }) {
            return "Phase durations must be greater than zero."
        }
        if (state.phases.any { it.toneLayers.isEmpty() }) {
            return "Each phase needs at least one tone layer."
        }
        return null
    }

    private fun parseTags(raw: String): Set<String> =
        raw.split(',')
            .mapNotNull { token -> token.trim().takeIf { it.isNotEmpty() } }
            .map { token ->
                token.replaceFirstChar { char ->
                    if (char.isLowerCase()) char.titlecase() else char.toString()
                }
            }
            .toSet()

    companion object {
        fun factory(repository: SessionRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    if (modelClass.isAssignableFrom(SessionBuilderViewModel::class.java)) {
                        return SessionBuilderViewModel(repository) as T
                    }
                    throw IllegalArgumentException("Unknown ViewModel class ${'$'}modelClass")
                }
            }
    }
}

data class SessionBuilderState(
    val sessionName: String = "My Session",
    val tagsText: String = "Focus,Evening",
    val phases: List<SessionPhase> = listOf(defaultSessionPhase()),
    val isSaving: Boolean = false,
    val saveError: String? = null,
    val lastSavedMessage: String? = null,
    val totalDurationMinutes: Int = 0,
    val canSave: Boolean = false
)

private fun SessionBuilderState.recalculateDerived(): SessionBuilderState {
    val totalMinutes = phases.sumOf { it.durationMinutes.coerceAtLeast(0) }
    val isValid = phases.isNotEmpty() && phases.all { it.durationMinutes > 0 && it.toneLayers.isNotEmpty() }
    return copy(
        totalDurationMinutes = totalMinutes,
        canSave = isValid,
        saveError = if (isValid) null else saveError
    )
}

internal fun defaultSessionPhase(): SessionPhase = SessionPhase(
    id = UUID.randomUUID().toString(),
    name = "New Phase",
    durationMinutes = 10,
    toneLayers = listOf(defaultToneLayer()),
    ambientLayers = emptyList(),
    fadeInSeconds = 10,
    fadeOutSeconds = 10
)

private fun defaultToneLayer(): ToneLayer {
    val band = defaultBands.first()
    return ToneLayer(
        bandId = band.id,
        beatFrequencyHz = band.frequencyRangeHz.start,
        carrierFrequencyHz = band.defaultCarrierHz,
        volume = 0.7f,
        modulationType = ModulationType.Binaural
    )
}
