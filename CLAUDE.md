# CLAUDE.md

Context for Claude Code sessions working on this app.

## What this app is

A personal Riftbound TCG companion app focused on **winning tournaments**. Three modes:

1. **Card Learner** (`src/App.jsx`) — Flashcard-style study. Pick a set + domain, swipe through shuffled cards with blurred regions you can tap to reveal. Has a "Hidden" mode that filters to cards whose text starts with `[Hidden]`.
2. **ScoreKeeper** (`src/ScoreKeeper.jsx`) — Two-player score tracker with Conquer/Hold buttons, dice roller, XP, and score history. Used at the table to keep game state.
3. **Game Tracker** *(in development)* — In-game checklist/prompter. Walks you screen-by-screen through every phase of a turn so you never miss a trigger or scoring opportunity. Persists each game to Supabase for later analysis.

Riftbound is Riot's TCG (1v1 constructed). Not Legends of Runeterra. Card data comes from the official card gallery.

## Tech stack

- **Vite + React 18** (no TypeScript)
- **Tailwind CSS** for styling (plus inline styles in ScoreKeeper)
- **Supabase** for auth (magic link) + Postgres persistence — only for Game Tracker user data; cards stay in JSON
- **Vercel** for deployment

Single-developer app for now. Multi-user (with RLS) is wired up so plans/games can eventually be shared.

## Card data

- `src/riftbound-cards.json` — full card database (~950 cards), produced by `scripts/fetch-cards.js`
- `scripts/fetch-cards.js` scrapes the official Riftbound card gallery's `__NEXT_DATA__` blob and transforms it. Run with `node scripts/fetch-cards.js`. Output goes to `src/riftbound-cards-new.json`; manually replace `riftbound-cards.json` after reviewing.
- Card shape: `id`, `name`, `publicCode`, `set` (`OGN`/`OGS`/`SFD`/`UNL`), `domains` (array of `{id,label}`), `cardType` (array — **currently always empty due to a fetch-script bug; type is recovered from `cardImage.accessibilityText` prefix instead**), `rarity`, `cardImage.url`, `text`, optional `energy`/`power`/`might`.
- Sets in order: Origins (`OGN`), Proving Grounds (`OGS`), Spiritforged (`SFD`), Unleashed (`UNL`).
- Six domains: `body`, `calm`, `chaos`, `fury`, `mind`, `order`.
- Helpers in `src/lib/cards.js`: `getCardType(card)` derives type from accessibilityText (`Legend`, `Unit`, `Spell`, `Battlefield`, `Gear`, `Rune`); `getLegends()` returns 40 deduped legends with a `champion` field attached from `src/lib/champions.js`; `getBattlefields()` returns 56 deduped battlefields.
- `src/lib/champions.js` — manual mapping from legend subtitle to League of Legends champion name. Some entries marked `??` are best-guesses pending verification.

**Never put cards in Supabase.** They're static, version-controlled, refreshable. Only user-generated data (games, matches, plans) belongs in Supabase.

## Riftbound deck-construction rules (reference)

For when we later add a deck builder:
- Legend: 1 (determines the 2 allowed domains)
- Chosen Champion: 1, must match Legend's champion tag
- Main Deck: exactly 40 cards, *includes* Chosen Champion
- Rune Deck: exactly 12, match Legend's domains
- Battlefields: exactly 3 distinct
- Sideboard: exactly **0 or 8** (not 0–8)
- Copy limit: max 3 of any named card across main + sideboard combined
- **Unique** cards: max 1 copy
- Signature cards: max 3 total with the Legend's champion tag
- Sideboarding: between games only; can swap Chosen Champion to one matching the Legend; cannot change Legend or Battlefields after registration; main deck must still be exactly 40 after swaps

## Game Tracker feature

The flow is a screen-by-screen state machine. Each screen is either tap-to-advance or has a small input. Mobile-first; assume phone at the table.

### Pre-game flow
1. Start Game
2. Your Legend (searchable dropdown filtered to legends; deduped to 40 base champions; searchable by champion name OR subtitle)
3. Their Legend (same)
4. Your Battlefield (searchable dropdown filtered to battlefields)
5. Their Battlefield
6. Battlefield prompt — "Check the Battlefields" (acknowledgment, tap anywhere)
7. Shuffle Deck, Shuffle Runes (acknowledgment, tap anywhere)
8. Who's going first? (You | Opponent)
9. Playing to? (8 | 9 | 10) — there's a battlefield that bumps the target to 9, and to 10 if both players play it. This step creates the `games` row in Supabase.

### First turn (mine)
- Check battlefields? (next)
- Two drop? (Yes / No) — recorded
- Goals Set? (next)
- **Scoring screen** (see below)
- Consider Battlefields (next)
- Consider Threats (next)
- Any final value on the board? (Pass button)

### First turn (theirs)
- Two drop? (Yes / No)
- **Scoring screen** (from their POV; side button reads "You Scored")
- Your Turn button

### Normal turn (mine) — mnemonic A-B-C-D-E-F-G-H
- **A**waken
- **B**eginning & Battlefields (Scoring)
- **C**hannel
- **D**raw
- **E**nergy
- **F**ar — displays current score
- **G**uys
- **H**and
- Goals Set?
- **Scoring screen**
- Consider Battlefields
- Consider Threats
- Any final value? (Pass)

### Normal turn (theirs)
- **Scoring screen** (their POV)
- Your Turn button

### The scoring (C/H/O) screen
Renders one row per battlefield in play. Each row:
- Battlefield name (Left, Right, optionally Baron Pit)
- Three buttons: **C** (Conquer), **H** (Hold), **O** (Other / no score)
- Points modifier: `1` / `2` / `3` (defaults to 1) — Riftbound sometimes scores 2 or 3 for a single Conquer/Hold
- Re-tapping changes the selection until the turn is passed; after passing, the turn's scoring is locked

Also on this screen:
- **Opponent Scored** button (your turn) or **You Scored** button (their turn) — opens a modal: pick battlefield + C/H/O + points modifier
- **Add Baron Pit** button — Baron Pit may be added at any point during the game and stays for the rest. Once added, it becomes a third row on every subsequent scoring screen.
- **Ready to Pass** button — advances to the post-scoring "Consider Battlefields / Threats / Final value" sequence

### Sticky controls
- **Persistent score readout** at top of every in-game screen: `You {n} — Them {n}, to {threshold}`
- **Finish Game** button sticky at bottom of every screen *after* both opening turns are done

### Resume
If a game is in `status='in_progress'` for the current user, the app offers to resume it on next load. Resume restores the current step (`games.current_step`) and game state.

## Supabase schema

Tables (with RLS — users only see their own rows):

- `games` — one row per game played. Columns: `id`, `user_id`, `my_legend_card_id`, `their_legend_card_id`, `my_battlefield_card_id`, `their_battlefield_card_id`, `has_baron_pit` (bool, flips true mid-game via in-game "Add Baron Pit" button), `win_threshold` (8/9/10), `first_player` (`me`/`them`), `status` (`in_progress`/`finished`/`abandoned`), `result` (`W`/`L`/`D`, nullable until finished), `current_step` (text, for resume), `started_at`, `ended_at`, `notes`
- `game_turns` — `id`, `game_id`, `turn_number`, `player` (`me`/`them`), `two_drop` (bool, nullable), `created_at`
- `scoring_events` — `id`, `game_id`, `turn_id` (nullable for off-turn scores), `scorer` (`me`/`them`), `battlefield` (`mine`/`theirs`/`baron_pit`), `score_type` (`conquer`/`hold`/`other`), `points` (1–3, default 1), `created_at`

`other` events exist mainly to record "neither C nor H was chosen this turn for this battlefield" — they don't add points but preserve the per-turn decision trail.

Auth: Supabase magic link, hand-rolled minimal UI.

## File layout

```
src/
  App.jsx              — top-level mode switcher (Card Learner / ScoreKeeper / Game Tracker)
  ScoreKeeper.jsx      — two-player score tracker
  GameTracker/         — (in development) game tracker mode
    ...
  lib/
    supabase.js        — Supabase client + auth helpers
  riftbound-cards.json — card database
public/
  images/              — set + domain background images
scripts/
  fetch-cards.js       — card data refresh script
  README.md            — script docs
```

## Conventions

- Mobile-first. Big tap targets, single column on small screens.
- Tap-to-advance screens advance on tapping anywhere reasonable (not just a small button), since you're using this one-handed at a table.
- Persistent state belongs in Supabase from day 1; nothing important should live only in component state.
- Card data is read from JSON; never re-fetch at runtime.
- Match the existing visual style: dark slate background, gold/amber accents (`#e9c349`), Space Grotesk for headings where used.
- No TypeScript. No test framework currently installed.

## Commands

```bash
npm run dev          # vite dev server
npm run build        # production build
npm run preview      # preview production build locally
node scripts/fetch-cards.js   # refresh card data (writes to src/riftbound-cards-new.json)
```

## Environment variables

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Stored locally in `.env` (gitignored), and configured in Vercel for production.
