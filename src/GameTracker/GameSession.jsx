import { useReducer, useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from '../lib/auth'
import { reducer, initialState, STEPS, isPregameStep, isFirstRoundDone, getCurrentPlayerTurnNumber } from './gameState'
import * as api from './gameApi'
import {
  LegendPicker,
  BattlefieldPicker,
  ShufflePrompt,
  FirstPlayerPicker,
  WinThresholdPicker,
} from './screens/Pregame'
import {
  CheckBattlefields,
  GoalsSet,
  ConsiderBattlefields,
  ConsiderThreats,
  FinalValue,
  TwoDrop,
  Awaken,
  Beginning,
  Channel,
  Draw,
  Energy,
  Guys,
  Hand,
  Far,
  TheirTurnHandoff,
} from './screens/Turn'
import ScoringScreen from './screens/Scoring'

export default function GameSession({ onBack }) {
  const session = useSession()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [hydrating, setHydrating] = useState(true)
  const [resumePrompt, setResumePrompt] = useState(null)
  const [view, setView] = useState('start') // 'start' | 'playing'
  const [exitConfirm, setExitConfirm] = useState(false)

  // Check for an in-progress game on mount
  useEffect(() => {
    if (!session) return
    let cancelled = false
    api.loadInProgressGame(session.user.id)
      .then(game => {
        if (cancelled) return
        if (game) setResumePrompt(game)
        setHydrating(false)
      })
      .catch(err => {
        console.error('Resume check failed', err)
        if (!cancelled) setHydrating(false)
      })
    return () => { cancelled = true }
  }, [session])

  // Persist current_step to Supabase on changes once game is created
  useEffect(() => {
    if (!state.id) return
    api.updateGame(state.id, { current_step: state.current_step }).catch(console.error)
  }, [state.id, state.current_step])

  // Auto-create a turn row when entering a new turn
  useEffect(() => {
    if (!state.id) return
    if (state.current_turn_number <= 0) return
    if (state.current_turn_id) return
    api.createTurn(state.id, state.current_turn_number, state.current_turn_player)
      .then(turn => dispatch({ type: 'SET_TURN_ID', id: turn.id }))
      .catch(console.error)
  }, [state.id, state.current_turn_number, state.current_turn_player, state.current_turn_id])

  const startNewGame = useCallback(() => {
    dispatch({ type: 'RESET' })
    setView('playing')
  }, [])

  const resumeGame = useCallback(async () => {
    if (!resumePrompt) return
    const events = (resumePrompt.scoring_events || [])
    let my_score = 0, their_score = 0
    for (const e of events) {
      const pts = e.score_type === 'other' ? 0 : e.points
      if (e.scorer === 'me') my_score += pts
      else if (e.scorer === 'them') their_score += pts
    }
    const turns = resumePrompt.game_turns || []
    const latestTurn = turns.sort((a, b) => b.turn_number - a.turn_number)[0]

    dispatch({
      type: 'HYDRATE',
      payload: {
        id: resumePrompt.id,
        status: resumePrompt.status,
        current_step: resumePrompt.current_step || STEPS.PREGAME_LEGEND_MINE,
        my_legend_card_id: resumePrompt.my_legend_card_id,
        their_legend_card_id: resumePrompt.their_legend_card_id,
        left_battlefield_card_id: resumePrompt.left_battlefield_card_id,
        right_battlefield_card_id: resumePrompt.right_battlefield_card_id,
        has_baron_pit: resumePrompt.has_baron_pit,
        win_threshold: resumePrompt.win_threshold,
        first_player: resumePrompt.first_player,
        current_turn_number: latestTurn?.turn_number ?? 0,
        current_turn_player: latestTurn?.player ?? null,
        current_turn_id: latestTurn?.id ?? null,
        current_turn_two_drop: latestTurn?.two_drop ?? null,
        scoring_events: events,
        my_score,
        their_score,
      },
    })
    setResumePrompt(null)
    setView('playing')
  }, [resumePrompt])

  const abandonAndStart = useCallback(async () => {
    if (resumePrompt) {
      await api.abandonGame(resumePrompt.id).catch(console.error)
    }
    setResumePrompt(null)
    startNewGame()
  }, [resumePrompt, startNewGame])

  if (hydrating) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    )
  }

  if (view === 'start') {
    return (
      <StartScreen
        userEmail={session?.user?.email}
        onSignOut={signOut}
        onBack={onBack}
        resumePrompt={resumePrompt}
        onResume={resumeGame}
        onDiscardResume={abandonAndStart}
        onStart={startNewGame}
      />
    )
  }

  // view === 'playing'
  const goBack = () => dispatch({ type: 'BACK' })
  const canGoBack = (state.step_history || []).length > 0

  async function handleExitConfirm() {
    if (state.id) {
      await api.abandonGame(state.id).catch(console.error)
    }
    dispatch({ type: 'RESET' })
    setExitConfirm(false)
    setView('start')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <GameHeader
        state={state}
        onBack={canGoBack ? goBack : null}
        onExit={() => setExitConfirm(true)}
      />
      {!state.current_turn_number && (
        <div className="px-4 pt-3 max-w-md mx-auto w-full flex items-center justify-between">
          {canGoBack ? (
            <button
              onClick={goBack}
              className="text-sm text-gray-400 hover:text-gray-200"
            >
              ← Back
            </button>
          ) : <div />}
          <button
            onClick={() => setExitConfirm(true)}
            className="text-sm text-gray-500 hover:text-gray-300"
          >
            Exit
          </button>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-6">
        <StepScreen state={state} dispatch={dispatch} session={session} />
      </div>
      {isFirstRoundDone(state) && (
        <FinishGameBar gameId={state.id} onFinished={() => setView('start')} />
      )}
      {exitConfirm && (
        <ExitConfirmModal
          onConfirm={handleExitConfirm}
          onCancel={() => setExitConfirm(false)}
        />
      )}
    </div>
  )
}

function StartScreen({ userEmail, onSignOut, onBack, resumePrompt, onResume, onDiscardResume, onStart }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
          ← Back
        </button>
        <div className="text-xs text-gray-500">
          {userEmail}{' '}
          <button onClick={onSignOut} className="ml-2 underline hover:text-gray-300">Sign out</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <h1 className="text-3xl font-semibold text-center mb-2" style={{ color: '#e9c349' }}>
          Game Tracker
        </h1>
        <p className="text-gray-400 text-sm text-center mb-10">
          Step-by-step prompter so you never miss a trigger.
        </p>

        {resumePrompt && (
          <div className="w-full bg-gray-800 border border-yellow-700/40 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 font-medium mb-3">Game in progress</p>
            <p className="text-gray-400 text-sm mb-4">
              Started {new Date(resumePrompt.started_at).toLocaleString()} — current step:{' '}
              <span className="text-gray-200">{resumePrompt.current_step || '(beginning)'}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={onResume}
                className="flex-1 py-2 rounded font-medium"
                style={{ background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a' }}
              >
                Resume
              </button>
              <button
                onClick={onDiscardResume}
                className="flex-1 py-2 rounded font-medium bg-gray-700 hover:bg-gray-600 text-gray-200"
              >
                Discard & Start New
              </button>
            </div>
          </div>
        )}

        {!resumePrompt && (
          <button
            onClick={onStart}
            className="w-full py-4 rounded-lg text-lg font-semibold"
            style={{ background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a' }}
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  )
}

function GameHeader({ state, onBack, onExit }) {
  if (state.current_turn_number <= 0 || !state.current_turn_player) {
    return null
  }

  const isMine = state.current_turn_player === 'me'
  const playerTurn = getCurrentPlayerTurnNumber(state)
  const turnLabel = isMine ? `Your Turn ${playerTurn}` : `Their Turn ${playerTurn}`
  const winning = state.my_score > state.their_score
  const losing = state.my_score < state.their_score

  return (
    <div className="sticky top-0 z-30 bg-gray-950/85 backdrop-blur border-b border-gray-800">
      <div className="px-4 py-2 flex items-center justify-between gap-3 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-200 text-sm leading-none pr-2"
            >
              ←
            </button>
          )}
          <div className="flex items-baseline gap-3">
            <div
              className="text-2xl font-bold leading-none"
              style={winning ? { color: '#e9c349' } : {}}
            >
              {state.my_score}
            </div>
            <div className="text-xs text-gray-500">vs</div>
            <div
              className="text-2xl font-bold leading-none"
              style={losing ? { color: '#e46540' } : {}}
            >
              {state.their_score}
            </div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider ml-1">
              to {state.win_threshold ?? '?'}
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div
            className="text-xs font-semibold uppercase tracking-widest leading-none"
            style={{ color: isMine ? '#e9c349' : '#e46540' }}
          >
            {turnLabel}
          </div>
          <button
            onClick={onExit}
            className="text-[11px] text-gray-600 hover:text-gray-400 leading-none"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  )
}

function FinishGameBar({ gameId, onFinished }) {
  async function handleFinish() {
    if (!gameId) return onFinished()
    await api.finishGame(gameId, null).catch(console.error)
    onFinished()
  }
  return (
    <div className="sticky bottom-0 bg-gray-950/80 backdrop-blur border-t border-gray-800 p-3">
      <button
        onClick={handleFinish}
        className="w-full py-3 rounded font-medium bg-gray-800 hover:bg-gray-700 text-gray-200"
      >
        Finish Game
      </button>
    </div>
  )
}

function StepScreen({ state, dispatch, session }) {
  const step = state.current_step
  const advance = () => dispatch({ type: 'ADVANCE' })
  const setField = (field, value) => dispatch({ type: 'SET_FIELD', field, value })
  const pickAndAdvance = (field) => (value) => {
    setField(field, value)
    advance()
  }

  switch (step) {
    case STEPS.PREGAME_LEGEND_MINE:
      return <LegendPicker label="Your Legend" onPick={pickAndAdvance('my_legend_card_id')} />

    case STEPS.PREGAME_LEGEND_THEIRS:
      return <LegendPicker label="Their Legend" onPick={pickAndAdvance('their_legend_card_id')} accent="#e46540" />

    case STEPS.PREGAME_BF_MINE:
      return (
        <BattlefieldPicker
          owner="mine"
          title="Which battlefield helps you most in this matchup?"
          onPick={pickAndAdvance('my_battlefield_card_id')}
        />
      )

    case STEPS.PREGAME_BF_THEIRS:
      return (
        <BattlefieldPicker
          owner="theirs"
          title="Which battlefield is your opponent playing?"
          onPick={pickAndAdvance('their_battlefield_card_id')}
        />
      )

    case STEPS.PREGAME_SHUFFLE:
      return <ShufflePrompt onNext={advance} />

    case STEPS.PREGAME_FIRST_PLAYER:
      return <FirstPlayerPicker onPick={pickAndAdvance('first_player')} />

    case STEPS.PREGAME_WIN_THRESHOLD:
      return <WinThresholdPicker state={state} session={session} dispatch={dispatch} />

    // First turn — mine
    case STEPS.MY_FIRST_CHECK_BF: return <CheckBattlefields onNext={advance} />
    case STEPS.MY_FIRST_TWO_DROP: return <TwoDrop state={state} dispatch={dispatch} />
    case STEPS.MY_FIRST_GOALS:    return <GoalsSet onNext={advance} />

    // First turn — theirs
    case STEPS.THEIR_FIRST_TWO_DROP: return <TwoDrop state={state} dispatch={dispatch} accent="#e46540" />

    // Normal turn — mine (ABCDEFGH)
    case STEPS.MY_AWAKEN:    return <Awaken onNext={advance} />
    case STEPS.MY_BEGINNING: return <Beginning onNext={advance} />
    case STEPS.MY_CHANNEL:   return <Channel onNext={advance} />
    case STEPS.MY_DRAW:      return <Draw onNext={advance} />
    case STEPS.MY_ENERGY:    return <Energy onNext={advance} />
    case STEPS.MY_FAR:       return <Far state={state} onNext={advance} />
    case STEPS.MY_GUYS:      return <Guys onNext={advance} />
    case STEPS.MY_HAND:      return <Hand onNext={advance} />
    case STEPS.MY_GOALS:     return <GoalsSet onNext={advance} />

    // Post-scoring (shared between first and normal "my" turns)
    case STEPS.MY_POST_BF:      return <ConsiderBattlefields onNext={advance} />
    case STEPS.MY_POST_THREATS: return <ConsiderThreats onNext={advance} />
    case STEPS.MY_POST_FINAL:   return <FinalValue onPass={advance} />

    // Their turn handoff
    case STEPS.THEIR_HANDOFF: return <TheirTurnHandoff onNext={advance} />

    case STEPS.MY_SCORING:
    case STEPS.THEIR_SCORING:
      return <ScoringScreen state={state} dispatch={dispatch} />

    default:
      return (
        <PlaceholderScreen
          label={step}
          sublabel="(placeholder — real screen TBD)"
          onNext={advance}
        />
      )
  }
}

function ExitConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Exit game?</h3>
        <p className="text-gray-400 text-sm">This game will be discarded. You can start a new one from the main screen.</p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg font-medium bg-gray-800 hover:bg-gray-700 text-gray-200"
          >
            Keep Playing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-lg font-semibold bg-red-900/60 hover:bg-red-900/80 border border-red-800 text-red-200"
          >
            Discard & Exit
          </button>
        </div>
      </div>
    </div>
  )
}

function PlaceholderScreen({ label, sublabel, nextLabel = 'Next →', onNext }) {
  return (
    <div className="w-full max-w-md text-center">
      <h2 className="text-xl font-medium mb-1" style={{ color: '#e9c349' }}>{label}</h2>
      {sublabel && <p className="text-gray-500 text-sm mb-8">{sublabel}</p>}
      <button
        onClick={onNext}
        className="w-full py-4 rounded-lg text-lg font-semibold"
        style={{ background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a' }}
      >
        {nextLabel}
      </button>
    </div>
  )
}
