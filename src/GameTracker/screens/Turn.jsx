import { TapToAdvance, YesNoChoice, ScreenLayout } from './Pregame'
import * as api from '../gameApi'

export function CheckBattlefields({ onNext }) {
  return (
    <TapToAdvance
      title="Check Battlefields"
      sublabel="What does each battlefield reward? Plan your route."
      onNext={onNext}
    />
  )
}

export function GoalsSet({ onNext }) {
  return (
    <TapToAdvance
      title="Goals Set?"
      sublabel="Are your priorities for this turn clear?"
      onNext={onNext}
    />
  )
}

export function ConsiderBattlefields({ onNext }) {
  return (
    <TapToAdvance
      title="Consider Battlefields"
      sublabel="Did your positioning change? Any conquers or holds locked in?"
      onNext={onNext}
    />
  )
}

export function ConsiderThreats({ onNext }) {
  return (
    <TapToAdvance
      title="Consider Threats"
      sublabel="What might they do next turn? Do you have answers?"
      onNext={onNext}
    />
  )
}

export function FinalValue({ onPass }) {
  return (
    <TapToAdvance
      title="Any final value on the board?"
      sublabel="One last look before passing — anything else to play, channel, or activate?"
      onNext={onPass}
      nextLabel="Pass"
    />
  )
}

export function TwoDrop({ state, dispatch }) {
  const isMine = state.current_turn_player === 'me'
  const subtitle = isMine
    ? 'Were you able to play a two-drop?'
    : 'Did your opponent play a two-drop?'

  async function pick(value) {
    dispatch({ type: 'SET_TWO_DROP', value })
    if (state.current_turn_id) {
      try {
        await api.updateTurn(state.current_turn_id, { two_drop: value })
      } catch (err) {
        console.error('updateTurn(two_drop) failed', err)
      }
    }
    dispatch({ type: 'ADVANCE' })
  }
  return <YesNoChoice title="Two-drop?" sublabel={subtitle} onPick={pick} />
}

// ABCDEFGH normal-turn steps
export function Awaken({ onNext }) {
  return <TapToAdvance title="Awaken" sublabel="Ready your units and resources." onNext={onNext} />
}
export function Beginning({ onNext }) {
  return <TapToAdvance title="Beginning & Battlefields" sublabel="Score from any battlefields you hold." onNext={onNext} />
}
export function Channel({ onNext }) {
  return <TapToAdvance title="Channel" sublabel="Channel runes / set resources." onNext={onNext} />
}
export function Draw({ onNext }) {
  return <TapToAdvance title="Draw" sublabel="Draw your card for the turn." onNext={onNext} />
}
export function Energy({ onNext }) {
  return <TapToAdvance title="Energy" sublabel="Check available energy this turn." onNext={onNext} />
}
export function Guys({ onNext }) {
  return <TapToAdvance title="Guys" sublabel="What units do you have? What can you play?" onNext={onNext} />
}
export function Hand({ onNext }) {
  return <TapToAdvance title="Hand" sublabel="Review your hand and the plan." onNext={onNext} />
}

export function Far({ state, onNext }) {
  return (
    <ScreenLayout title="Far" sublabel="Current score">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-4 text-center">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">You</div>
            <div className="text-5xl font-bold" style={{ color: '#e9c349' }}>{state.my_score}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Them</div>
            <div className="text-5xl font-bold text-gray-300">{state.their_score}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-4">playing to {state.win_threshold}</div>
      </div>
      <button
        onClick={onNext}
        className="w-full py-5 rounded-lg text-lg font-semibold"
        style={{ background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a' }}
      >
        Next
      </button>
    </ScreenLayout>
  )
}

export function TheirTurnHandoff({ onNext }) {
  return (
    <ScreenLayout title="Their turn" sublabel="Tap when they pass back to you.">
      <button
        onClick={onNext}
        className="w-full py-6 rounded-lg text-xl font-semibold"
        style={{ background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a' }}
      >
        Your Turn →
      </button>
    </ScreenLayout>
  )
}
