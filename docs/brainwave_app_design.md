# SerenityWave: Brainwave Entrainment Mobile App Design Blueprint

## 1. Core App Architecture

### 1.1 Modular Overview
- **App Shell (Compose Multiplane UI)**
  - Adaptive layout orchestrator that switches between single-pane (folded) and dual-pane (unfolded) experiences using `WindowSizeClass` and Samsung Fold 6 postures.
  - Hosts navigation rail + bottom bar hybrid to minimize reach distance when folded while preserving at-a-glance discovery when unfolded.
  - Provides global theming (Material 3 custom theme) with serene gradients, gentle contrast, and motion-reduced options.
- **Experience Modules**
  - `PresetExperience`: surfaces curated brainwave presets with contextual education, handles preview + quick-start logic.
  - `CustomToneExperience`: provides tone synthesis controls, real-time preview, layer mixing, and validation.
  - `SessionComposerExperience`: timeline-based builder for multi-phase journeys, automation hints, and reminders.
  - `LibraryExperience`: consolidates saved presets, sessions, ambient mixes, and insights.
- **System Services**
  - `ToneEngine` (NDK-backed) for binaural/isochronic generation, parameter validation, and waveform streaming.
  - `AmbientMixer` for ambient loop management, normalization, and crossfades with tone layers.
  - `SessionManager` to schedule phases, apply envelopes, manage playback state, and provide analytics hooks.
  - `SyncService` (deferred) to manage encrypted backups, restore, and optional device-to-device sync.

### 1.2 Domain & Data Model
- **Domain Entities**
  - `BrainwaveBand`: { id, name, frequencyRangeHz, description, psychologicalEffects, recommendedUse }.
  - `ToneLayer`: { id, type (binaural|isochronic), carrierHz, beatHz, modulationDepth, volume }.
  - `AmbientLayer`: { id, assetUri, category, loopLength, volume, fadeCurve }.
  - `SessionPhase`: { id, tonePresetId, customToneConfig, durationMinutes, fadeInSec, fadeOutSec, ambientLayers[], guidanceNotes }.
  - `SessionBlueprint`: { id, title, description, phases[], tags[], moodColor, totalDuration, createdAt, updatedAt }.
  - `UserPreference`: { calmingTheme, assistiveTipsEnabled, defaultHeadphoneWarning, dailyReminderWindows }.
- **Repositories**
  - `PresetRepository` → seeded JSON + localized strings, exposes flows for filtering, search, and onboarding recommendations.
  - `LibraryRepository` → persists user-generated content via Room; surfaces Smart Collections derived from usage.
  - `PlaybackRepository` → caches last-played session, headphone status, and preview state for continuity.
- **Persistence**
  - Room database with entities: `PresetEntity`, `ToneLayerEntity`, `AmbientEntity`, `SessionPhaseEntity`, `SessionEntity`, `TagEntity`, `SessionTagCrossRef`.
  - DataStore for lightweight preferences (tooltips, reduced motion, reminder scheduling).
  - Background `WorkManager` job for snapshot backups and cleanup (e.g., removing orphaned ambient assets).

### 1.3 Audio Processing Pipeline
1. **Configuration Intake**: UI selections transformed into `PlaybackPlan` containing tone layers, ambient tracks, envelopes, and schedule markers.
2. **Synthesis Layer**: `ToneEngine` (C++ DSP) generates waveforms per layer using `AAudio` low-latency output; frequency adjustments clamp to safe ranges, jitter buffered to avoid clicks.
3. **Mixing Layer**: `AmbientMixer` handles multi-track blending, dynamic normalization, and psychoacoustic enhancements (e.g., gentle stereo widening for ambient layers only).
4. **Render Queue**: `SessionManager` sequences phases, applies fade curves, handles cross-phase transitions, and surfaces progress events to the UI via `StateFlow`.
5. **Monitoring & Telemetry**: RMS level monitoring feeds into UI visualizers and headphone safety warnings; anonymized session completion stats stored locally for insights.

### 1.4 State & Navigation Management
- Single-activity architecture with Compose Navigation, using nested graphs for each experience module.
- `ViewModel` + `StateFlow` for UI state; audio playback state held in `PlaybackStore` (singleton) exposed via `ImmutableStateFlow`.
- Snapshot state saved via `SavedStateHandle` + Room to survive process death and device folding transitions.
- Assisted navigation cues (breadcrumbs, micro-animations) are disabled automatically when `ReduceMotion` preference detected.

### 1.5 Intelligent Saving System
- Quick actions: `Save`, `Save & Pin`, `Add to Routine` available contextually on preview/player surfaces.
- Autosave drafts for custom tones and session blueprints; unsaved changes banner with calming highlight prompts.
- Tagging engine suggests labels using lightweight on-device NLP from descriptions (`Wellness`, `Morning`, `Focus`).
- Duplicates detection groups near-identical presets and offers merge guidance.
- Library insights panel visualizes streaks, favorite bands, and duration balance using soft data viz palettes.

## 2. Main UI Flows

### 2.1 Selecting a Standard Preset
1. **Home Dashboard**
   - Fold-aware split layout: navigation rail + discovery panel on unfolded screen; collapsible bottom sheet navigation when folded for thumb reach.
   - Featured presets surfaced via hero cards with mood imagery, short copy ("Theta — Drift into lucid creativity").
   - Contextual education module with swipeable cards summarizing brainwave science in plain language.
   - Wellness cues: breathing prompt tucked into top-right, optional focus timer suggestion before playback.
2. **Preset Details**
   - Expanded sheet (90% height) showcasing waveform, frequency range chips, testimonials, and recommended durations.
   - Ambient suggestions displayed as pill buttons with preview icons; tooltips explain best pairing ("Forest keeps you grounded during focus blocks").
   - Accessibility: large `Play Preview` button, voice guidance toggle, haptic tick for key actions.
3. **Playback Overlay**
   - Minimal controls float above a serene animated background; dynamic timer with ring visualization.
   - `Adjust Ambient` button reveals vertical sliders for each layer.
   - `Notes` section encourages intention setting; journaling prompt saved to session log.
4. **Completion Summary**
   - Gentle success screen with completion stats, recommended next steps (e.g., "Save to Evening Routine?"), mood reflection quick survey.

### 2.2 Creating a Custom Tone
1. **Generator Landing**
   - Dual-pane layout: parameter stack on left, real-time spectrum visualizer + waveform preview on right when unfolded.
   - On fold, collapsible parameter sections maintain focus with progressive disclosure.
   - Tip carousel (dismissible) explains binaural vs isochronic benefits.
2. **Layer Configuration**
   - Touch-optimized sliders with magnetic stops at Delta/Theta/Alpha/Beta/Gamma thresholds; long-press reveals tooltip with effect summary.
   - Numerical steppers for precise Hz adjustment; headphone safety indicator lights up when carrier frequency might be uncomfortable.
   - `Add Layer` FAB opens modal with presets for common blends ("Theta + Rain"), or custom blank layer.
3. **Ambient Integration**
   - Ambient gallery with looping previews and tag filters (Nature, Atmospheric, Instrumental).
   - Independent volume, stereo width, and high-cut filter sliders; real-time preview toggles for quick A/B comparisons.
4. **Preview & Validation**
   - `Live Preview` button toggles continuous playback; UI displays CPU load indicator to reassure reliability.
   - Validation panel warns about conflicting beats or excessive modulation depth, suggesting corrections.
5. **Saving Custom Preset**
   - Friendly modal requesting name, mood color, tags, optional intention note.
   - Choice: `Save as Preset`, `Send to Session Builder`, or `Start Playback Now`.
   - Autosave ensures nothing lost if user collapses device mid-creation.

### 2.3 Building a Multi-Phase Session
1. **Session Composer Canvas**
   - Horizontal timeline with draggable phase tiles; pinch-zoom adjusts granularity on unfolded screen.
   - Phase palette column contains standard presets, custom presets, and templates with educational tooltips.
   - Sticky header summarizing total duration, targeted outcomes, and breathing cadence suggestions.
2. **Phase Editing Drawer**
   - Selecting a tile opens side drawer (or modal when folded) with deep controls: duration pickers, fade curves, layer mix, optional affirmations.
   - Real-time preview of transitions; cross-fade graph updates to show amplitude envelopes.
   - `Energy Balance` indicator surfaces warnings if transitions are too abrupt or total session exceeds user-defined limits.
3. **Automation & Guidance**
   - Smart suggestions bar offers adjustments ("Extend Theta to maintain relaxation arc").
   - Guided templates (Sleep Ladder, Focus Sprint, Meditation Journey) pre-populate phases and fade curves while remaining editable.
   - Tooltips explain rationale for recommended order, reducing cognitive load.
4. **Scheduling & Export**
   - `Schedule` tab integrates with Android AlarmManager for reminders; optional calendar export.
   - `Share Blueprint` exports human-readable summary or QR code for quick import by friends.
   - `Session Notes` area captures intentions or therapist recommendations; synced with completion log.

### 2.4 Saving and Managing Sessions
1. **Library Overview**
   - Segmented control toggles between Presets, Sessions, Ambient Mixes, Favorites, and Smart Collections.
   - Masonry grid with adaptive card sizes to optimize foldable screen real estate; list view for compact mode.
   - Search with chip filters (brainwave band, duration, mood, ambient type); voice search for accessibility.
2. **Detail Views**
   - Each item displays stats (plays, average completion, last mood note) and offers quick actions (Play, Edit, Duplicate, Share, Archive).
   - `Insights` tab visualizes weekly patterns, recommended adjustments, and highlights underused presets.
   - `Wellness Log` integrates optional journaling entries tied to sessions.
3. **Organization Tools**
   - Drag-and-drop tagging, customizable folders ("Morning Ritual", "Deep Recovery").
   - Bulk edit mode with multi-select gestures optimized for large screen.
   - Smart Collections auto-curated (e.g., "Deep Rest" for Delta-dominant sessions, "Creative Flow" for Theta + Ambient Rain combos).
4. **Backup & Sync**
   - Settings panel surfaces backup status, encryption details, and last sync time.
   - Import/export flows guide user with step-by-step instructions, progress animations, and success confirmation.
   - Local-only mode respected for privacy-first users; prompts clarify trade-offs.

## 3. Ideal Android Tech Stack
- **Language & UI**: Kotlin, Jetpack Compose, Material 3 adaptive theming, `Compose Multiplatform WindowSizeClass` support.
- **Navigation & State**: Compose Navigation, `ViewModel`, `StateFlow`, `Coroutines`, `Molecule` (optional) for reactive state modeling.
- **Dependency Injection**: Hilt (with assisted injection for playback components), Kotlin Multiplatform ready for future expansion.
- **Audio**: NDK C++ DSP engine, `AAudio` low-latency output, ExoPlayer for ambient audio, `Oboe` optional for broader device support.
- **Persistence**: Room, DataStore, `EncryptedFile` for sensitive exports, `WorkManager` for background sync + health checks.
- **Testing & QA**: JUnit5, Turbine for Flow testing, Compose UI tests, Snapshot testing, instrumentation on multiple fold postures, custom audio regression harness validating Hz accuracy.
- **Analytics & Feedback**: Privacy-first analytics (e.g., self-hosted Posthog or Firebase with limited scope), on-device sentiment analysis for feedback surveys.
- **DevOps**: Gradle managed with version catalogs, GitHub Actions CI running lint, detekt, ktfmt, unit/UI/audio tests; internal beta via Firebase App Distribution.

## 4. Lifecycle Management & Continuous Improvement
- **Design QA Rituals**
  - Weekly calm-tech heuristic review ensuring color harmony, microcopy empathy, and fold posture ergonomics.
  - Accessibility audits verifying WCAG AA contrast, TalkBack pathways, captioning for educational content.
  - Usability tests with mixed-experience users; iterate on friction points in generator and session composer.
- **Product Intelligence Loop**
  - Local analytics identify drop-off points; design sprints address issues with targeted experiments.
  - AI-powered suggestions engine refines preset recommendations based on completion patterns while preserving privacy (on-device processing).
  - Release readiness checklist covering audio accuracy, UI cohesion, performance under fold transitions, and battery impact.
- **Content & Community Management**
  - Clinical advisor reviews brainwave effect copy quarterly to maintain accuracy and trust.
  - Seasonal ambient packs released with calming visuals and story-driven descriptions.
  - Built-in education hub updated iteratively with micro-lessons on mindfulness and safe listening practices.

## 5. Psychological Comfort & Intuitive Clarity
- Palette built around cool blues, muted purples, and warm neutrals with adjustable saturation for low-light environments.
- Progressive disclosure: advanced options hidden behind `More Controls` to minimize cognitive load; default flows remain linear and reassuring.
- Micro-interactions use gentle haptics and subtle animations (<200ms, ease-in-out); motion-reduced mode replaces with fades.
- Language guidelines center user agency ("How would you like to feel today?") and set expectations without overpromising.
- Context breadcrumbs maintain orientation ("Session • Build • Phase 2"), while empty states provide supportive guidance rather than error tone.
- Wellness safeguards: headphone reminders, suggested breaks, and optional mindful check-ins before/after long sessions.

## 6. Next Steps & Continuous Evaluation
- Prioritize prototyping custom generator and session composer in Figma with fold-aware layouts; run quick preference tests on tone controls.
- Build interactive sound demos early to validate audio engine performance and ensure real-time previews stay glitch-free.
- Establish analytics dashboard to monitor time-to-first-session, preset adoption, and user retention across routines.
- Schedule bi-weekly cross-functional reviews (design, audio engineering, content) to ensure holistic quality and timely iteration.
