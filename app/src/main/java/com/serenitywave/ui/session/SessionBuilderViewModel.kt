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

    /**
     * Update the current session's display name in the builder state.
     *
     * @param name The new session name to set.
     */
    fun updateSessionName(name: String) {
        mutate { it.copy(sessionName = name) }
    }

    /**
     * Set the editable tags text for the session builder state.
     *
     * @param tags A comma-separated string of tag tokens as entered by the user (raw text shown in the tags input).
     */
    fun updateTagsText(tags: String) {
        mutate { it.copy(tagsText = tags) }
    }

    /**
     * Appends a new default session phase to the end of the phases list and updates derived state.
     */
    fun addPhase() {
        mutate { state ->
            state.copy(phases = state.phases + defaultSessionPhase())
        }
    }

    /**
     * Replaces the session phase at the given zero-based index with the provided `SessionPhase`.
     *
     * @param index Zero-based position of the phase to replace.
     * @param updated The new `SessionPhase` to store at `index`.
     */
    fun updatePhase(index: Int, updated: SessionPhase) {
        mutatePhase(index) { updated }
    }

    /**
     * Adds a duplicate of the phase at the given index with a new UUID and " copy" appended to its name.
     *
     * @param index The index of the phase to duplicate.
     */
    fun duplicatePhase(index: Int) {
        mutatePhase(index) { phase ->
            phase.copy(id = UUID.randomUUID().toString(), name = "${phase.name} copy")
        }
    }

    /**
     * Removes the session phase at the given index from the builder state.
     *
     * If the index is out of range or there is only one phase remaining, the state is left unchanged.
     *
     * @param index The zero-based index of the phase to remove.
     */
    fun deletePhase(index: Int) {
        mutate { state ->
            if (state.phases.size <= 1 || index !in state.phases.indices) return@mutate state
            state.copy(phases = state.phases.toMutableList().apply { removeAt(index) })
        }
    }

    /**
     * Replaces the tone layer at the given index within the specified phase.
     *
     * If either index is out of range, the state remains unchanged.
     *
     * @param phaseIndex Zero-based index of the phase containing the tone layer.
     * @param toneIndex Zero-based index of the tone layer to replace within the phase.
     * @param updated The ToneLayer to set at the specified index.
     */
    fun updateToneLayer(phaseIndex: Int, toneIndex: Int, updated: ToneLayer) {
        mutatePhase(phaseIndex) { phase ->
            if (toneIndex !in phase.toneLayers.indices) return@mutatePhase phase
            phase.copy(toneLayers = phase.toneLayers.toMutableList().apply { this[toneIndex] = updated })
        }
    }

    /**
     * Appends a new default ToneLayer to the phase at the given index.
     *
     * @param phaseIndex The index of the phase to which the new tone layer will be added.
     */
    fun addToneLayer(phaseIndex: Int) {
        mutatePhase(phaseIndex) { phase ->
            phase.copy(toneLayers = phase.toneLayers + defaultToneLayer())
        }
    }

    /**
     * Remove the tone layer at [toneIndex] from the phase at [phaseIndex] if removal is allowed.
     *
     * If the specified phase has only one tone layer or either index is out of range, the call is a no-op.
     *
     * @param phaseIndex Index of the phase to modify.
     * @param toneIndex Index of the tone layer to remove within the specified phase.
     */
    fun removeToneLayer(phaseIndex: Int, toneIndex: Int) {
        mutatePhase(phaseIndex) { phase ->
            if (phase.toneLayers.size <= 1 || toneIndex !in phase.toneLayers.indices) return@mutatePhase phase
            phase.copy(toneLayers = phase.toneLayers.toMutableList().apply { removeAt(toneIndex) })
        }
    }

    /**
     * Replaces the ambient layer at the specified indices within a phase.
     *
     * If either index is out of range the state is left unchanged.
     *
     * @param phaseIndex Index of the phase containing the ambient layer.
     * @param ambientIndex Index of the ambient layer to replace within the phase.
     * @param updated The ambient layer to set at the specified position.
     */
    fun updateAmbientLayer(phaseIndex: Int, ambientIndex: Int, updated: AmbientLayer) {
        mutatePhase(phaseIndex) { phase ->
            if (ambientIndex !in phase.ambientLayers.indices) return@mutatePhase phase
            phase.copy(ambientLayers = phase.ambientLayers.toMutableList().apply { this[ambientIndex] = updated })
        }
    }

    /**
     * Adds an ambient layer from the default set to the phase at the given index.
     *
     * Chooses the first default ambient not already present in the phase; if all defaults are present it appends the first default. If no default ambient exists or the index is invalid, the state is unchanged.
     *
     * @param phaseIndex Index of the phase to which the ambient layer will be added.
     */
    fun addAmbientLayer(phaseIndex: Int) {
        mutatePhase(phaseIndex) { phase ->
            val nextAmbient = defaultAmbientLayers.firstOrNull { candidate ->
                phase.ambientLayers.none { it.id == candidate.id }
            } ?: defaultAmbientLayers.firstOrNull() ?: return@mutatePhase phase
            phase.copy(ambientLayers = phase.ambientLayers + nextAmbient)
        }
    }

    /**
     * Removes the ambient layer at the given ambientIndex from the phase at phaseIndex.
     *
     * If either index is out of range, the state is left unchanged.
     *
     * @param phaseIndex Index of the phase to modify.
     * @param ambientIndex Index of the ambient layer to remove within the selected phase.
     */
    fun removeAmbientLayer(phaseIndex: Int, ambientIndex: Int) {
        mutatePhase(phaseIndex) { phase ->
            if (ambientIndex !in phase.ambientLayers.indices) return@mutatePhase phase
            phase.copy(ambientLayers = phase.ambientLayers.toMutableList().apply { removeAt(ambientIndex) })
        }
    }

    /**
     * Save the current session state to the repository.
     *
     * Validates the current builder state and, if invalid, sets `saveError` and clears `lastSavedMessage`.
     * If valid, constructs a SessionBlueprint (using "Untitled Session" when the name is blank), persists it
     * via the repository, and updates state flags: sets `isSaving` while saving, sets `lastSavedMessage` on success,
     * and sets `saveError` on failure.
     */
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

    /**
     * Applies a transformation to the session phase at the given index and updates the state's phases list.
     *
     * If the index is outside the current phases range, the state is left unchanged.
     *
     * @param index The zero-based position of the phase to update.
     * @param transform A function that receives the existing `SessionPhase` and returns the updated `SessionPhase`.
     */
    private fun mutatePhase(index: Int, transform: (SessionPhase) -> SessionPhase) {
        mutate { state ->
            if (index !in state.phases.indices) return@mutate state
            val updated = transform(state.phases[index])
            state.copy(
                phases = state.phases.toMutableList().apply { this[index] = updated }
            )
        }
    }

    /**
     * Applies a transformation to the current SessionBuilderState, optionally clears save status fields, and updates derived state.
     *
     * @param clearStatus If `true`, clears `saveError` and `lastSavedMessage` on the resulting state before recalculating derived fields.
     * @param transform A function that receives the current state and returns the updated state.
     */
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

    /**
     * Validate the session builder state and return a user-facing error message for the first detected problem.
     *
     * Checks performed: at least one phase exists, every phase has duration greater than zero, and every phase contains at least one tone layer.
     *
     * @param state The current SessionBuilderState to validate.
     * @return A validation error message when invalid, or `null` if the state is valid.
     */
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

    /**
             * Parse a comma-separated tag string into a set of cleaned, title-cased tags.
             *
             * @param raw The raw tag text (commas separate tags; may contain extra whitespace).
             * @return A set of unique tags with surrounding whitespace removed, empty tokens discarded, and the first character of each tag converted to title case.
             */
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
        /**
             * Creates a ViewModelProvider.Factory that instantiates SessionBuilderViewModel using the provided repository.
             *
             * @param repository Repository used to construct the SessionBuilderViewModel.
             * @return A ViewModelProvider.Factory that returns a SessionBuilderViewModel for matching model classes.
             * @throws IllegalArgumentException if the factory is asked to create a ViewModel of an unknown class.
             */
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

/**
 * Recomputes derived fields and returns an updated copy of this state.
 *
 * Recalculates totalDurationMinutes as the sum of phase durations (treating negative durations as zero),
 * sets canSave to true only when there is at least one phase and every phase has duration > 0 and at least one tone layer,
 * and clears saveError when the resulting state is valid.
 *
 * @return A copy of this SessionBuilderState with updated `totalDurationMinutes`, `canSave`, and `saveError`.
 */
private fun SessionBuilderState.recalculateDerived(): SessionBuilderState {
    val totalMinutes = phases.sumOf { it.durationMinutes.coerceAtLeast(0) }
    val isValid = phases.isNotEmpty() && phases.all { it.durationMinutes > 0 && it.toneLayers.isNotEmpty() }
    return copy(
        totalDurationMinutes = totalMinutes,
        canSave = isValid,
        saveError = if (isValid) null else saveError
    )
}

/**
 * Creates a new default SessionPhase pre-populated with sensible initial values.
 *
 * @return A SessionPhase with a unique id, name "New Phase", duration of 10 minutes,
 * one default ToneLayer, no ambient layers, fade-in of 10 seconds, and fade-out of 10 seconds.
 */
internal fun defaultSessionPhase(): SessionPhase = SessionPhase(
    id = UUID.randomUUID().toString(),
    name = "New Phase",
    durationMinutes = 10,
    toneLayers = listOf(defaultToneLayer()),
    ambientLayers = emptyList(),
    fadeInSeconds = 10,
    fadeOutSeconds = 10
)

/**
 * Creates a default ToneLayer configured from the first entry in the default band list.
 *
 * The returned ToneLayer uses the band's id, sets the beat frequency to the band's frequency range start,
 * the carrier frequency to the band's default carrier, a volume of 0.7, and `ModulationType.Binaural`.
 *
 * @return A preconfigured ToneLayer suitable for new phases.
 */
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