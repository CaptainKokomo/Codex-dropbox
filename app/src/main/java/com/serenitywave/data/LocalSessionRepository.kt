package com.serenitywave.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.serenitywave.domain.SessionBlueprint
import com.serenitywave.domain.SessionPhase
import com.serenitywave.domain.AmbientLayer
import com.serenitywave.domain.ToneLayer
import com.serenitywave.domain.ModulationType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

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
            .map { prefs ->
                prefs[sessionsKey]?.let { json -> decodeSessions(json) } ?: emptyList()
            }
            .stateIn(scope, SharingStarted.Eagerly, emptyList())

    override suspend fun saveSession(session: SessionBlueprint) {
        context.dataStore.edit { prefs ->
            val current = prefs[sessionsKey]?.let { decodeSessions(it).toMutableList() } ?: mutableListOf()
            val index = current.indexOfFirst { it.id == session.id }
            if (index >= 0) {
                current[index] = session
            } else {
                current.add(session)
            }
            prefs[sessionsKey] = encodeSessions(current)
        }
    }

    override suspend fun deleteSession(id: String) {
        context.dataStore.edit { prefs ->
            val current = prefs[sessionsKey]?.let { decodeSessions(it) } ?: emptyList()
            prefs[sessionsKey] = encodeSessions(current.filterNot { it.id == id })
        }
    }

    private fun encodeSessions(sessions: List<SessionBlueprint>): String {
        val array = JSONArray()
        sessions.forEach { session ->
            val phasesArray = JSONArray()
            session.phases.forEach { phase ->
                val phaseObject = JSONObject().apply {
                    put("id", phase.id)
                    put("name", phase.name)
                    put("duration", phase.durationMinutes)
                    put("fadeIn", phase.fadeInSeconds)
                    put("fadeOut", phase.fadeOutSeconds)
                    put("tones", JSONArray().apply {
                        phase.toneLayers.forEach { tone ->
                            put(JSONObject().apply {
                                put("band", tone.bandId)
                                put("beat", tone.beatFrequencyHz)
                                put("carrier", tone.carrierFrequencyHz)
                                put("volume", tone.volume)
                                put("type", tone.modulationType.name)
                            })
                        }
                    })
                    put("ambients", JSONArray().apply {
                        phase.ambientLayers.forEach { ambient ->
                            put(JSONObject().apply {
                                put("id", ambient.id)
                                put("name", ambient.name)
                                put("asset", ambient.assetPath)
                                put("volume", ambient.volume)
                            })
                        }
                    })
                }
                phasesArray.put(phaseObject)
            }
            array.put(
                JSONObject().apply {
                    put("id", session.id)
                    put("name", session.name)
                    put("tags", JSONArray(session.tags.toList()))
                    put("notes", session.notes)
                    put("phases", phasesArray)
                }
            )
        }
        return array.toString()
    }

    private fun decodeSessions(json: String): List<SessionBlueprint> {
        val array = JSONArray(json)
        return buildList {
            for (i in 0 until array.length()) {
                val sessionObject = array.getJSONObject(i)
                val phasesArray = sessionObject.getJSONArray("phases")
                val phases = buildList {
                    for (p in 0 until phasesArray.length()) {
                        val phaseObject = phasesArray.getJSONObject(p)
                        val toneArray = phaseObject.getJSONArray("tones")
                        val tones = buildList {
                            for (t in 0 until toneArray.length()) {
                                val toneObject = toneArray.getJSONObject(t)
                                add(
                                    ToneLayer(
                                        bandId = toneObject.getString("band"),
                                        beatFrequencyHz = toneObject.getDouble("beat"),
                                        carrierFrequencyHz = toneObject.getDouble("carrier"),
                                        volume = toneObject.getDouble("volume").toFloat(),
                                        modulationType = ModulationType.valueOf(toneObject.getString("type"))
                                    )
                                )
                            }
                        }
                        val ambientsArray = phaseObject.getJSONArray("ambients")
                        val ambients = buildList {
                            for (a in 0 until ambientsArray.length()) {
                                val ambientObject = ambientsArray.getJSONObject(a)
                                add(
                                    AmbientLayer(
                                        id = ambientObject.getString("id"),
                                        name = ambientObject.getString("name"),
                                        assetPath = ambientObject.getString("asset"),
                                        volume = ambientObject.getDouble("volume").toFloat()
                                    )
                                )
                            }
                        }
                        add(
                            SessionPhase(
                                id = phaseObject.getString("id"),
                                name = phaseObject.getString("name"),
                                durationMinutes = phaseObject.getInt("duration"),
                                toneLayers = tones,
                                ambientLayers = ambients,
                                fadeInSeconds = phaseObject.getInt("fadeIn"),
                                fadeOutSeconds = phaseObject.getInt("fadeOut")
                            )
                        )
                    }
                }
                val tagsArray = sessionObject.getJSONArray("tags")
                val tags = buildSet {
                    for (t in 0 until tagsArray.length()) {
                        add(tagsArray.getString(t))
                    }
                }
                add(
                    SessionBlueprint(
                        id = sessionObject.getString("id"),
                        name = sessionObject.getString("name"),
                        tags = tags,
                        phases = phases,
                        notes = sessionObject.optString("notes").takeIf { it.isNotEmpty() }
                    )
                )
            }
        }
    }

    init {
        // Ensure DataStore starts eagerly.
        scope.launch { sessions.collect() }
    }
}
