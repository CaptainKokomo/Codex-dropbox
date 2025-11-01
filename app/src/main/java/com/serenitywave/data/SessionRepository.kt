package com.serenitywave.data

import com.serenitywave.domain.SessionBlueprint
import kotlinx.coroutines.flow.Flow

interface SessionRepository {
    val sessions: Flow<List<SessionBlueprint>>
    suspend fun saveSession(session: SessionBlueprint)
    suspend fun deleteSession(id: String)
}
