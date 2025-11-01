package com.serenitywave.ui.session

import com.serenitywave.data.SessionRepository
import com.serenitywave.domain.SessionBlueprint
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class SessionBuilderViewModelTest {
    private val dispatcher = StandardTestDispatcher()
    private lateinit var repository: FakeSessionRepository

    @Before
    fun setUp() {
        Dispatchers.setMain(dispatcher)
        repository = FakeSessionRepository()
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state exposes default phase and is immediately saveable`() = runTest(dispatcher) {
        val viewModel = SessionBuilderViewModel(repository)

        val state = viewModel.state.value
        assertEquals(1, state.phases.size)
        assertTrue(state.canSave)
        assertEquals(10, state.totalDurationMinutes)
    }

    @Test
    fun `adding a phase updates count and total duration`() = runTest(dispatcher) {
        val viewModel = SessionBuilderViewModel(repository)

        viewModel.addPhase()

        val state = viewModel.state.value
        assertEquals(2, state.phases.size)
        assertEquals(20, state.totalDurationMinutes)
    }

    @Test
    fun `save session persists blueprint and surfaces feedback`() = runTest(dispatcher) {
        val viewModel = SessionBuilderViewModel(repository)

        viewModel.updateSessionName("Evening Flow")
        viewModel.updateTagsText("Calm,Night")

        viewModel.saveSession()
        advanceUntilIdle()

        assertEquals(1, repository.savedSessions.size)
        val saved = repository.savedSessions.first()
        assertEquals("Evening Flow", saved.name)

        val state = viewModel.state.value
        assertFalse(state.isSaving)
        assertTrue(state.lastSavedMessage?.contains("Evening Flow") == true)
    }

    private class FakeSessionRepository : SessionRepository {
        private val backing = MutableStateFlow<List<SessionBlueprint>>(emptyList())
        val savedSessions: MutableList<SessionBlueprint> = mutableListOf()

        override val sessions: Flow<List<SessionBlueprint>> = backing

        override suspend fun saveSession(session: SessionBlueprint) {
            savedSessions.removeAll { it.id == session.id }
            savedSessions.add(session)
            backing.value = savedSessions.toList()
        }

        override suspend fun deleteSession(id: String) {
            savedSessions.removeAll { it.id == id }
            backing.update { sessions -> sessions.filterNot { it.id == id } }
        }
    }
}
