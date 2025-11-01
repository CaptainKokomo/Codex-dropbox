package com.serenitywave.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.serenitywave.domain.SessionBlueprint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

private const val STORE_NAME = "serenitywave_sessions"

private val Context.dataStore by preferencesDataStore(STORE_NAME)

class LocalSessionRepository(
    private val context: Context,
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
) : SessionRepository {

    private val sessionsKey = stringPreferencesKey("sessions")

    override val sessions: Flow<List<SessionBlueprint>> =
        context.dataStore.data
            .catch { emit(emptyPreferences()) }
            .map { prefs -> SessionStorageCodec.decodeOrEmpty(prefs[sessionsKey]) }
            .stateIn(scope, SharingStarted.Eagerly, emptyList())

    /**
     * Upserts the given session into the locally persisted session list.
     *
     * If a session with the same `id` already exists it is replaced; otherwise the session is appended.
     *
     * @param session The session to save or replace in storage.
     */
    override suspend fun saveSession(session: SessionBlueprint) {
        context.dataStore.edit { prefs ->
            val current = SessionStorageCodec.decodeOrEmpty(prefs[sessionsKey]).toMutableList()
            val index = current.indexOfFirst { it.id == session.id }
            if (index >= 0) {
                current[index] = session
            } else {
                current.add(session)
            }
            prefs[sessionsKey] = SessionStorageCodec.encode(current)
        }
    }

    /**
     * Remove the session with the given id from the persisted session list.
     *
     * If no session matches the provided id, the stored list remains unchanged.
     *
     * @param id The identifier of the session to remove.
     */
    override suspend fun deleteSession(id: String) {
        context.dataStore.edit { prefs ->
            val filtered = SessionStorageCodec
                .decodeOrEmpty(prefs[sessionsKey])
                .filterNot { it.id == id }
            prefs[sessionsKey] = SessionStorageCodec.encode(filtered)
        }
    }

    init {
        // Ensure DataStore starts eagerly.
        scope.launch { sessions.collect { } }
    }
}