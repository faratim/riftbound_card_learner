import CardSearch from '../components/CardSearch'
import { getLegends, getBattlefields } from '../../lib/cards'
import * as api from '../gameApi'
import { STEPS } from '../gameState'

export function LegendPicker({ label, onPick, accent }) {
  return (
    <ScreenLayout title={label} accent={accent}>
      <CardSearch
        cards={getLegends()}
        placeholder="Search legends…"
        onPick={(card) => onPick(card.id)}
        accent={accent}
      />
    </ScreenLayout>
  )
}

export function BattlefieldPicker({ title, sublabel, owner, onPick }) {
  // Distinct accent per owner so it's obvious which battlefield (yours vs theirs) we're picking.
  const accent = owner === 'theirs' ? '#e46540' : '#e9c349'
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="text-center mb-1 inline-block w-full text-xs font-semibold uppercase tracking-widest"
        style={{ color: accent }}
      >
        {owner === 'theirs' ? "Opponent's pick · battlefield 2 of 2" : 'Your pick · battlefield 1 of 2'}
      </div>
      <h2 className="text-xl font-semibold text-center mb-1" style={{ color: accent }}>
        {title}
      </h2>
      {sublabel && (
        <p className="text-gray-400 text-sm text-center mb-4">{sublabel}</p>
      )}
      <CardSearch
        cards={getBattlefields()}
        placeholder="Search battlefields…"
        onPick={(card) => onPick(card.id)}
      />
    </div>
  )
}

export function BattlefieldPrompt({ onNext }) {
  return (
    <TapToAdvance
      onNext={onNext}
      title="Check the Battlefields"
      sublabel="Which one helps you most? Should you deviate from your normal plan?"
    />
  )
}

export function ShufflePrompt({ onNext }) {
  return (
    <TapToAdvance
      onNext={onNext}
      title="Shuffle"
      sublabel="Shuffle your Main Deck and your Rune Deck."
    />
  )
}

export function FirstPlayerPicker({ onPick }) {
  return (
    <ScreenLayout title="Who is going first?">
      <div className="grid grid-cols-2 gap-3 w-full">
        <BigButton onClick={() => onPick('me')} variant="gold">You</BigButton>
        <BigButton onClick={() => onPick('them')} variant="dark">Opponent</BigButton>
      </div>
    </ScreenLayout>
  )
}

export function WinThresholdPicker({ state, session, dispatch }) {
  async function handlePick(threshold) {
    dispatch({ type: 'SET_FIELD', field: 'win_threshold', value: threshold })
    try {
      if (state.id) {
        await api.updateGame(state.id, { win_threshold: threshold })
      } else {
        const game = await api.createGame({
          user_id: session.user.id,
          my_legend_card_id: state.my_legend_card_id,
          their_legend_card_id: state.their_legend_card_id,
          my_battlefield_card_id: state.my_battlefield_card_id,
          their_battlefield_card_id: state.their_battlefield_card_id,
          win_threshold: threshold,
          first_player: state.first_player,
          current_step: state.current_step,
        })
        dispatch({ type: 'SET_GAME_ID', id: game.id })
      }
    } catch (err) {
      console.error('createGame failed', err)
      alert('Failed to create game: ' + err.message)
      return
    }
    dispatch({ type: 'ADVANCE' })
  }
  return (
    <ScreenLayout title="Playing to?">
      <div className="grid grid-cols-3 gap-3 w-full">
        <BigButton onClick={() => handlePick(8)} variant="gold">8</BigButton>
        <BigButton onClick={() => handlePick(9)} variant="dark">9</BigButton>
        <BigButton onClick={() => handlePick(10)} variant="dark">10</BigButton>
      </div>
      <p className="text-xs text-gray-500 text-center mt-4">
        9 if a battlefield bumps the target, 10 if both players play it.
      </p>
    </ScreenLayout>
  )
}

// ----- Shared building blocks -----

export function ScreenLayout({ title, sublabel, children, accent = '#e9c349' }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-1" style={{ color: accent }}>
        {title}
      </h2>
      {sublabel && (
        <p className="text-gray-400 text-sm text-center mb-6">{sublabel}</p>
      )}
      {!sublabel && <div className="mb-4" />}
      {children}
    </div>
  )
}

export function TapToAdvance({ title, sublabel, onNext, nextLabel = 'Next', accent = '#e9c349' }) {
  // Whole tall area is clickable — tap anywhere within the main screen area to advance.
  return (
    <button
      type="button"
      onClick={onNext}
      className="w-full min-h-[70vh] flex items-center justify-center cursor-pointer"
    >
      <div className="w-full max-w-md mx-auto pointer-events-none">
        <h2 className="text-3xl font-semibold text-center mb-2" style={{ color: accent }}>
          {title}
        </h2>
        {sublabel && (
          <p className="text-gray-400 text-base text-center mb-8">{sublabel}</p>
        )}
        <div
          className="w-full py-5 rounded-lg text-lg font-semibold text-center"
          style={{ background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a' }}
        >
          {nextLabel}
        </div>
        <p className="text-center text-xs text-gray-600 mt-3">tap anywhere to advance</p>
      </div>
    </button>
  )
}

export function BigButton({ children, onClick, variant = 'gold' }) {
  const style = variant === 'gold'
    ? { background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a' }
    : {}
  const cls = variant === 'gold'
    ? 'py-5 rounded-lg text-xl font-semibold'
    : 'py-5 rounded-lg text-xl font-semibold bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'
  return (
    <button onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  )
}

export function YesNoChoice({ title, sublabel, onPick, accent }) {
  return (
    <ScreenLayout title={title} sublabel={sublabel} accent={accent}>
      <div className="grid grid-cols-2 gap-3 w-full">
        <BigButton onClick={() => onPick(true)} variant="gold">Yes</BigButton>
        <BigButton onClick={() => onPick(false)} variant="dark">No</BigButton>
      </div>
    </ScreenLayout>
  )
}

export { STEPS }
