package com.serenitywave

import android.app.Application
import com.serenitywave.data.LocalSessionRepository
import com.serenitywave.domain.SerenityWaveEnvironment

class SerenityWaveApp : Application() {
    lateinit var environment: SerenityWaveEnvironment
        private set

    /**
     * Initializes the application and prepares the global SerenityWaveEnvironment.
     *
     * Creates and assigns the app-wide SerenityWaveEnvironment using a LocalSessionRepository
     * constructed with the application context.
     */
    override fun onCreate() {
        super.onCreate()
        val repository = LocalSessionRepository(context = this)
        environment = SerenityWaveEnvironment(repository)
    }
}