package com.serenitywave.data

import com.serenitywave.domain.SessionBlueprint
import kotlinx.coroutines.flow.Flow

interface SessionRepository {
    val sessions: Flow<List<SessionBlueprint>>
    /**
 * Persists the given SessionBlueprint in the repository.
 *
 * @param session The SessionBlueprint to create or update. 
 */
suspend fun saveSession(session: SessionBlueprint)
    /**
 * Deletes the session with the given identifier.
 *
 * @param id The unique identifier of the session to remove.
 */
suspend fun deleteSession(id: String)
}