package com.serenitywave

import android.app.Application
import com.serenitywave.data.LocalSessionRepository
import com.serenitywave.domain.SerenityWaveEnvironment

class SerenityWaveApp : Application() {
    lateinit var environment: SerenityWaveEnvironment
        private set

    override fun onCreate() {
        super.onCreate()
        val repository = LocalSessionRepository(context = this)
        environment = SerenityWaveEnvironment(repository)
    }
}
