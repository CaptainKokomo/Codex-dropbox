package com.serenitywave.data

import com.serenitywave.domain.SessionBlueprint
import kotlinx.serialization.SerializationException
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json

object SessionStorageCodec {
    private val json = Json {
        prettyPrint = false
        encodeDefaults = true
        ignoreUnknownKeys = true
    }

    private val serializer = ListSerializer(SessionBlueprint.serializer())

    fun encode(sessions: List<SessionBlueprint>): String =
        json.encodeToString(serializer, sessions)

    fun decode(value: String): List<SessionBlueprint> =
        json.decodeFromString(serializer, value)

    fun decodeOrEmpty(value: String?): List<SessionBlueprint> {
        if (value.isNullOrBlank()) return emptyList()
        return try {
            decode(value)
        } catch (_: SerializationException) {
            emptyList()
        }
    }
}
