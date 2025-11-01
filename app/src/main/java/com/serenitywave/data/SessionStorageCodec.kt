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

    /**
         * Serialize a list of SessionBlueprint objects into JSON.
         *
         * @return The JSON string representing the provided sessions list.
         */
        fun encode(sessions: List<SessionBlueprint>): String =
        json.encodeToString(serializer, sessions)

    /**
         * Deserialize a JSON string into a list of SessionBlueprint objects.
         *
         * @param value JSON string representing a list of SessionBlueprint.
         * @return A list of SessionBlueprint parsed from the input JSON.
         */
        fun decode(value: String): List<SessionBlueprint> =
        json.decodeFromString(serializer, value)

    /**
     * Parse a JSON string into a list of SessionBlueprints, treating null, blank, or invalid input as empty.
     *
     * @param value The JSON string to decode; may be null or blank.
     * @return A list of SessionBlueprint parsed from the input, or an empty list if the input is null, blank, or cannot be deserialized.
     */
    fun decodeOrEmpty(value: String?): List<SessionBlueprint> {
        if (value.isNullOrBlank()) return emptyList()
        return try {
            decode(value)
        } catch (_: SerializationException) {
            emptyList()
        }
    }
}