# "My Own Damn Second Brain" — Core UI Specification

## 1. Experience North Star
- **Primary objective:** maintain instantaneous orientation and frictionless capture for neurodivergent minds. Every screen anchors the user with a stable tri-pane layout, persistent breadcrumbs, and color-coded landmarks.
- **Tone:** calm, competent, non-distracting. Microcopy is direct and literal ("New note", "Apply changes").
- **Interaction tempo:** 150–300 ms feedback for all actions, flash highlights (teal) for new insertions that fade within 1.2 s. No looping animations.

## 2. Design Tokens & Foundations
| Token | Dark Mode (default) | Light Mode |
|-------|---------------------|------------|
| Background 0 (App Shell) | `#101216` | `#F6F8FB` |
| Background 1 (Panels) | `#161920` | `#FFFFFF` |
| Background 2 (Inputs, blocks) | `#1E222C` | `#F2F4F9` |
| Primary text | `#EEF2FF` | `#1B1F2A` |
| Secondary text | `#A5ADC3` | `#56607A` |
| Accent 1 (teal) | `#3BCFB9` | `#1EA693` |
| Accent 2 (violet) | `#8C7CFF` | `#6156FF` |
| Border / Divider | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` |
| Focus ring | `#8C7CFF` @ 2 px outer glow | same |
| Radius | 8 px base, 12 px for modals/cards |
| Shadow | `0 8px 24px rgba(0,0,0,0.28)` for floating panes |
| Typography | **Font:** Inter / system fallback. | |
| Type scale | 14 / 16 / 18 / 20 / 24 / 32 px (body -> h1). Line height 1.45. |

- **Spacing scale:** 4 px increments. Standard stack spacing: 8, 12, 16, 24, 32 px. 
- **Iconography:** 16 px monochrome line icons, minimal detail. Icons always paired with text labels.
- **Accessibility:** WCAG AA contrast minimum 4.5:1. Focus state uses 2 px glow + 1 px inner border.

## 3. Layout Overview
The application uses a responsive three-column grid pinned to viewport height. Minimum width 1280 px.

```
┌─────────────────────────────┬───────────────────────────────────────────────┬────────────────────────────┐
│ Left Sidebar (280–320 px)   │ Markdown Canvas (fluid, max content 840 px)  │ Right Pane (360–420 px)    │
└─────────────────────────────┴───────────────────────────────────────────────┴────────────────────────────┘
```

- **Adaptive behavior:** Below 1200 px, right pane collapses to a tabbed drawer (overlay). Below 960 px, sidebar collapses to icon rail with hover flyout.
- **Sticky regions:** Sidebar header (Spaces switcher) and right-pane tab bar remain sticky while lists scroll independently.
- **Editor column:** Content column centered with 64 px inner gutters, ensuring 70–80 character line length.

## 4. Screen Specifications

### 4.1 Home / Default Workspace View
**Structure:**
1. **Top app bar (40 px height):** left-aligned app name, quick search (`Ctrl+K` hint), sync indicator (local checkmark). Right side houses settings cog, theme toggle, profile avatar (local user). Bar has `Background 1`, slight shadow.
2. **Left Sidebar** (scrollable):
   - **Spaces Switcher:** pill button with current space name, dropdown of other spaces. Searchable list, `Ctrl+1/2/...` shortcuts.
   - **Primary actions:** `+ Quick Note` button (accent teal, full width, keyboard hint `Ctrl+N`), `New Section` icon button in Section header.
   - **Navigation tree:**
     - Section headers in 14 px uppercase micro, expandable caret.
     - Notes show modified timestamp on hover, drag handle (6 dots) appears on focus.
     - Right-click context menu (menu surface `Background 2`, 12 px radius) with options and undo toast.
   - **Tabs:** bottom segmented control toggles `Tree / Tags / Versions`. Tags view lists tags sorted by frequency, with counts. Versions shows last-opened note history (per note).
   - **Collapse affordance:** chevron button at bottom.
3. **Editor Canvas:**
   - **Note header:**
     - Breadcrumb (`Space › Section`), note title (32 px, weight 600), metadata pill (structured properties) right-aligned.
     - Action buttons: `Share (local export)`, `Version History`, `More` (ellipsis) in top-right of canvas header.
   - **Block editing area:**
     - Each block has 12 px vertical spacing. Hover shows left gutter with drag handle, block type icon, and quick actions.
     - Inline formatting toolbar appears above selection (floating panel, 8 px radius) with bold, italic, highlight, link, comment, AI.
     - Slash menu emerges at cursor with grouped commands, fuzzy search.
     - Insert feedback: newly added block background flashes accent teal at 20% opacity.
   - **Backlinks panel:** pinned at bottom; collapsible section titled “Linked from (3)”. Items show snippet and open in side peek.
4. **Right Pane:**
   - **Header:** segmented tabs `Chat` | `Tools` (accent underline). Context selector dropdown below (pill buttons `Note`, `Folder`, `Space`).
   - **Chat tab:**
     - Transcript cards alternating background shades. User messages right aligned, assistant left.
     - Sticky composer with multiline input, `Shift+Enter` for newline, `Ctrl+Enter` send. Buttons: `Insert to note`, `Copy`, `Clear`.
   - **Tools tab:**
     - Grid list of tool cards (2 columns). Each card: icon, label, short description, primary button `Run`. Secondary button `Configure` for options (target note, merge target etc.).
     - Running state shows progress bar (teal) and ability to cancel.
   - **Diff drawer:** results slide over editor from right (occupying 420 px). Shows side-by-side original vs proposed diff. Buttons `Apply`, `Apply to new note`, `Discard`. Undo toast on apply.

### 4.2 Quick Capture Overlay (`Ctrl+N`)
- **Trigger:** global command or sidebar button. 
- **Presentation:** Centered modal sheet (480 px width) with dim backdrop (60% opacity). Motion: fade + 12 px upward shift, 150 ms.
- **Content:**
  - Title input (20 px) with placeholder “Note title or leave blank”.
  - Body textarea (auto-expanding, min 6 lines) with markdown hints below.
  - Metadata picker dropdown for target space/section (defaults Inbox).
  - Buttons: `Save to Inbox` (accent) and `Discard` (ghost). `Enter` submits, `Esc` closes.
  - Confirmation toast bottom-right “Saved to Inbox · Undo”.

### 4.3 Global Search (`Ctrl+K`)
- **Overlay:** full-width command palette docked from top (max 680 px width, centered). Dark background with 8 px radius.
- **Tabs:** `Text` | `Semantic`. Keyboard arrows navigate results. Typeahead delay <80 ms.
- **Result item layout:** Title (18 px), breadcrumb (12 px, accent violet), snippet (14 px truncated). Icons for note/section/space.
- **Actions:** `Enter` opens, `Ctrl+Enter` open in split, `Alt+Enter` preview in right pane.

### 4.4 Structured List Folder View
- **Folder header:** toggle `Structured list` (switch). When on, show horizontal property toolbar with dropdowns to add up to 4 metadata fields (Status, Type, Priority, Date).
- **Table strip:** sticky top table showing notes as rows. Columns: Title (link), properties (chips). Sorting icons on hover. Filters presented as pill chips under column headers.
- **Below table:** standard note list preview, plus button to `Add row` (creates note with metadata template).

### 4.5 Version History View
- Accessible via note header or sidebar Versions tab. Opens right-side overlay (same width as AI pane) stacking over Tools.
- Timeline list with timestamp, actor icon (user vs AI), action summary. Selecting entry shows diff preview in main canvas overlay with `Restore` button.
- Restoring triggers confirmation toast and new snapshot creation.

### 4.6 Settings Panel
- Right-side modal sliding from app edge (width 480 px). Sections: General, Appearance, Shortcuts, Data.
- Dark mode default with preview toggle. Shortcut editor uses key capture chips.

## 5. Cognitive / ADHD-Focused Principles
- **Anchoring:** consistent placement of primary actions (top-left for creation, top-right for secondary). Breadcrumbs persist.
- **Progressive disclosure:** AI diff overlays only when needed; structured metadata hidden until enabled.
- **Minimize context switching:** Quick capture accessible without leaving keyboard; AI tools operate in-place with preview.
- **Visual rhythm:** uniform spacing, alternating background shades in lists help chunking. Title and section headers separated by consistent 24 px.
- **Attention cues:** 
  - Color-coded highlights for active pane (thin 2 px accent border).
  - Sidebar currently selected note uses accent background at 12% opacity.
  - Unread / new notes show small teal dot until opened.
- **Reduce clutter:** default views show only essential metadata; advanced filters appear inline chips upon invocation.
- **Undo safety:** every destructive action triggers toast with undo button.

## 6. Interaction States
- **Hover:** elevate background 4% lighter, show icons.
- **Focus:** accent violet outline + drop shadow.
- **Active:** button pressed state darkens by 8%.
- **Disabled:** reduced opacity 40%, maintain text legibility.
- **Drag & Drop:** ghost outline follows cursor; drop zones highlight with dashed border.
- **Context menus:** appear within 4 px of trigger, keyboard accessible via `Shift+F10`.

## 7. Component Architecture (Front-End)
```
<AppShell>
  <GlobalShortcuts />
  <CommandPalette />
  <ToastStack />
  <QuickCaptureSheet />
  <TopBar>
    <SpaceSwitcher />
    <GlobalSearchButton />
    <StatusIndicators />
    <UserMenu />
  </TopBar>
  <MainLayout>
    <Sidebar>
      <SpaceHeader />
      <PrimaryActions />
      <SidebarTabs>
        <SidebarTree />
        <TagDirectory />
        <VersionsList />
      </SidebarTabs>
      <CollapseHandle />
    </Sidebar>
    <EditorPane>
      <NoteHeader>
        <Breadcrumbs />
        <TitleEditor />
        <MetadataChips />
        <HeaderActions />
      </NoteHeader>
      <BlockEditor>
        <BlockList>
          <BlockItem /> // polymorphic block renderer
        </BlockList>
        <InlineToolbar />
        <SlashCommandMenu />
        <BacklinksPanel />
      </BlockEditor>
    </EditorPane>
    <RightDock>
      <AIPane>
        <AIPaneTabs>
          <AIChat />
          <AITools />
        </AIPaneTabs>
        <ContextSelector />
      </AIPane>
      <DiffDrawer />
      <VersionOverlay />
    </RightDock>
  </MainLayout>
</AppShell>
```

### 7.1 Reusable Blocks
- `<BlockItem>` props: `type`, `markdown`, `metadata`, `isFocused`. Subcomponents: `<HeadingBlock>`, `<ParagraphBlock>`, `<ListBlock>`, `<TodoBlock>`, `<CodeBlock>`, `<QuoteBlock>`, `<ImageBlock>`, `<TableBlock>`, `<DividerBlock>`.
- `<SlashCommandMenu>` handles fuzzy search, grouped suggestions, executed commands dispatch events to editor store.
- `<InlineToolbar>` positioned relative to selection; uses portal to root for layering.
- `<BacklinksPanel>` fetches references from local graph index.
- `<StructuredTable>` renders when folder mode active; reuses `<PropertyChip>` components.

### 7.2 Component Contracts
| Component | Primary Props | States | Notes |
|-----------|---------------|--------|-------|
| `<SidebarTree>` | `nodes`, `activeId`, `onSelect`, `onContextAction`, `onReorder` | `hovered`, `focused`, `dragging`, `collapsed` | Virtualized list when >200 notes; context menu built from array of actions for extensibility. |
| `<BlockEditor>` | `noteId`, `blocks`, `onChange`, `selection`, `mode` (`edit`/`preview`) | `empty`, `readonly`, `aiPreview` | Manages history stack; exposes imperative handle for slash menu placement. |
| `<AIChat>` | `contextScope`, `messages`, `onSend`, `onInsert` | `loading`, `streaming`, `blocked` | Streams tokens into transcript; auto-scroll only when user at bottom. |
| `<AITools>` | `tools`, `runningToolId`, `onRun`, `onConfigure`, `onCancel` | `idle`, `configuring`, `running`, `error`, `complete` | Each tool definition includes `id`, `label`, `description`, `defaultContext`, and `requiresNoteSelection`. |
| `<DiffDrawer>` | `diff`, `onApply`, `onApplyNew`, `onDiscard` | `hidden`, `visible`, `applying` | Rendered via CSS grid with syntax highlighting for insert/delete; show keyboard hints `Ctrl+Enter` apply, `Esc` discard. |
| `<QuickCaptureSheet>` | `isOpen`, `defaultSpaceId`, `onSubmit`, `onClose` | `dirty`, `saving`, `error`, `success` | Uses optimistic save; closes after toast unless user keeps typing within 400 ms. |
| `<CommandPalette>` | `isOpen`, `query`, `results`, `mode`, `onSelect`, `onChangeMode` | `emptyState`, `showShortcuts` | Maintains recent searches (max 8). Arrow key navigation loops. |

### 7.3 Data Flows
- **Editor pipeline:** Markdown blocks are stored as array of `{id, type, content, attrs}`. All edits funnel through `editorStore.dispatch({type: 'BLOCK_UPDATE', ...})`, ensuring undo stack consistency.
- **Sidebar sync:** File watcher emits `treeUpdated` events. Sidebar reconciles diff to maintain collapse state and selection without full rerender.
- **AI requests:** `aiWorker.request({scope, prompt, payload})` returns async iterator for streaming; updates either chat transcript or tool result store. Snapshot taken automatically before mutating note state.
- **Versioning:** `snapshotService.create(noteId, source)` invoked on manual save, AI apply, or every 5 minutes of inactivity.
- **Search index:** Background worker increments `searchIndexQueue` when note saved; dedupes by noteId to avoid duplicate reindexing.

### 7.4 State Management
- Local-first store (e.g., Zustand or Redux Toolkit) with file system adapter.
- Notes persisted as `.md` with YAML front matter for metadata. AI-generated diffs stored as `.diff` snapshots alongside notes.
- Undo stack per note; global snapshots stored in `.snapshots` hidden folder within space.
- AI pane communicates with embedded model via Web Worker to keep UI responsive.

### 7.5 Keyboard Coverage
- `Ctrl+N` Quick capture.
- `Ctrl+Shift+N` new note in current section.
- `Ctrl+Alt+Arrow` move notes between sections.
- `Ctrl+K` search palette.
- `/` open slash menu at start of empty block.
- `Alt+Shift+F` focus AI pane; `Esc` returns focus.
- `Ctrl+Shift+[` and `Ctrl+Shift+]` collapse/expand sidebar.

## 8. Data & File Conventions
- **Spaces directory:** `/MySecondBrain/{space}/{section}/{note}.md`
- **Structured metadata:** YAML front matter example:
  ```yaml
  ---
  status: active
  type: research
  priority: medium
  tags: ["#adhd", "#product"]
  backlinks: ["daily-log-2024-08-14"]
  ---
  ```
- **Snapshots:** `/MySecondBrain/.snapshots/{note}/{timestamp}.md`
- **AI diffs:** `/MySecondBrain/.diffs/{note}/{timestamp}.patch`

## 9. Offline & Performance Notes
- Preload current space tree into memory. Lazy-load note bodies when selected.
- Use IndexedDB cache for search indexes (text + embeddings). Rebuild in background.
- Debounced file writes (300 ms) with manual `Ctrl+S` override.
- All features operable without network.

## 10. Future Hooks
- Potential plugin slots: left sidebar footer (`<SidebarExtensions />`), block-level AI actions, custom metadata field renderers.
- API surface intentionally simple: events `noteUpdated`, `noteMoved`, `aiApplied` for automation hooks.


## 11. Blueprint Deliverables (Non-HTML)
- **Master layout boards:** Create dark-mode artboards at 1440×900 and 1280×720, documenting the tri-pane layout, compact mode (sidebar collapsed), and narrow mode (AI dock hidden). Provide spacing annotations (8 px grid) and redlines for column widths.
- **Interaction storyboards:** Sequence diagrams for Quick Capture, AI diff application, Structured List toggling, and Version Restore. Each storyboard should call out attention cues (flash highlight, focus ring) and undo affordances.
- **Component inventory:** Token-driven variants for buttons, inputs, tabs, tree items, block handles, toasts, and AI tool cards. Include states (default/hover/focus/active/disabled) in a single sheet for developer hand-off.
- **Content guidelines:** Microcopy list for top-level controls (`"New note"`, `"Apply to new note"`, error toasts). Document formatting for metadata chips (Title Case, icon + label) and status colors (teal = active, amber = pending, magenta = blocked).
- **File naming:** Export all assets as `.mdx` or `.png` slices inside `/design/boards/`, keeping names aligned with components (`sidebar-tree.png`, `ai-diff-drawer.png`). No executable prototypes required.

## 12. Interaction Storyboards (Text Walkthroughs)
### 12.1 Quick Capture → Inbox
1. Press `Ctrl+N` from any focus state; `<QuickCaptureSheet>` opens with focus on title.
2. User types title and body; hint text below updates to show Markdown shortcuts as they type (`*` → bullet list, `[]` → task).
3. `Enter` commits save. Loader ring animates on `Save to Inbox` button for <=200 ms.
4. Sheet closes, toast appears bottom-right (`Saved to Inbox · Undo`). If `Undo` pressed, note removed and sheet reopens with previous content cached.

### 12.2 AI Tool → Diff Application
1. User selects block(s); presses `Alt+A` or clicks AI icon → `<AITools>` auto-selects "Clean up writing" with current selection context.
2. Tool card enters `running` state with teal progress bar; `<DiffDrawer>` slides in once proposal ready.
3. Diff view highlights additions in teal, deletions in violet strikethrough. Keyboard hint overlay shows `Ctrl+Enter Apply`, `Ctrl+Shift+Enter New Note`, `Esc` discard.
4. Choosing Apply triggers `snapshotService.create(noteId, 'AI Tool: Clean up writing')`, updates blocks, closes drawer, emits toast `Changes applied · Undo`.

### 12.3 Structured List Toggle
1. User toggles `Structured list` switch in folder header.
2. `<StructuredTable>` animates into view (fade/slide). Default columns: Title, Status (dropdown), Priority (chip), Date (date picker).
3. Filters appear as inline pill chips beneath column headers. Selecting filter updates note list below with matching metadata.
4. Turning off Structured list collapses table with reverse animation, but retains metadata definitions for quick reactivation.

### 12.4 Version Restore Flow
1. From note header, user opens `Version History`; `<VersionOverlay>` slides from right with timeline.
2. Selecting snapshot reveals diff preview inside overlay with metadata (timestamp, actor, action).
3. `Restore` button triggers confirmation inline (`Are you sure? Restore will replace current note.`). Confirming saves new snapshot tagged `Restored from {timestamp}`.
4. Overlay closes, note content updates, toast announces success with `View details` link to reopened overlay if needed.

## 13. Accessibility & Cognitive Support Checklist
- **Focus order:** Linear left-to-right: Top bar → Sidebar → Editor → AI Pane → Footer/backlinks. Skip links (`Alt+S` for sidebar, `Alt+E` for editor) accelerate navigation.
- **Reduced motion mode:** Respect OS prefers-reduced-motion; disable slide animations, replace with fades under 120 ms.
- **Color dependencies:** All color-coded signals have secondary cues (icons, text labels). Example: Status chips include icon shapes (circle active, triangle pending, square blocked).
- **Chunking cues:** Use alternating row shading in tables (`Background 1`/`Background 2`) and section separators with clear labels.
- **Notification hygiene:** Toasts auto-dismiss after 4 s but remain in `<ToastStack>` history (accessible via `Ctrl+Shift+H`).
- **Error prevention:** Destructive actions require confirmation + undo. Delete dialogs default focus on safe option.

## 14. Deliverable Packaging & Launch Experience
- **Installer artifacts:** Ship signed installers for macOS (.dmg), Windows (.msi), Linux (.AppImage). Each includes embedded runtime; first launch opens onboarding wizard without CLI.
- **Auto-launch preference:** Option in onboarding to enable "Start at login". UI clarifies storage path and offline nature.
- **Update channel:** In-app modal accessible via Settings → Updates. Checks local patch manifest; downloads delta packages to `~/Library/Application Support/MySecondBrain/updates` and applies on restart.
- **Crash recovery:** On unexpected shutdown, reopen last edited note with yellow banner `Recovered content` and diff comparison.
- **Help surface:** `F1` opens side panel with searchable docs (markdown rendered). Includes onboarding checklist and keyboard cheat sheet.

## 15. Implementation Notes Without Browser Dependence
- **Desktop shell recommendation:** Package the application with Tauri or Electron-lite configuration embedded in the desktop client, enabling double-click launch with no command-line usage.
- **Local-first storage:** Mount the Markdown workspace directory via OS-native file pickers on first launch. Persist the path and auto-reopen last space without CLI scripts.
- **Auto-update UX:** Provide in-app “Check for updates” button that triggers differential patching, avoiding manual terminal commands.
- **Testing strategy:** Utilize component-story previews (Storybook/ Ladle) compiled to static builds that ship with the app as `/docs` mode, giving QA the ability to open reference states without running dev servers.
- **Future extensibility:** Architect the renderer as a modular React/Svelte component library so the same UI can back additional shells (web, desktop) if desired, but the primary distribution remains a desktop binary.
