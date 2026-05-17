import { useState } from 'react'
import { getCardById, getBaronPitCard } from '../../lib/cards'
import { getCurrentTurnSelection } from '../gameState'
import * as api from '../gameApi'

const SCORE_TYPE_LABELS = { conquer: 'Conquer', hold: 'Hold', other: 'Other' }

export default function ScoringScreen({ state, dispatch }) {
  const isMyTurn = state.current_turn_player === 'me'
  const title = isMyTurn ? 'Your Scoring' : 'Their Scoring'
  const sublabel = isMyTurn
    ? 'Tap Conquer, Hold, or Other for each battlefield this turn.'
    : 'Did they conquer or hold? Or no score?'

  const myBfCard = getCardById(state.my_battlefield_card_id)
  const theirBfCard = getCardById(state.their_battlefield_card_id)
  const baronPit = state.has_baron_pit ? getBaronPitCard() : null

  const rows = [
    { key: 'mine',      card: myBfCard,    label: 'Your Battlefield' },
    { key: 'theirs',    card: theirBfCard, label: 'Their Battlefield' },
    ...(baronPit ? [{ key: 'baron_pit', card: baronPit, label: 'Baron Pit' }] : []),
  ]

  const [sideModalOpen, setSideModalOpen] = useState(false)

  async function addBaronPit() {
    dispatch({ type: 'ADD_BARON_PIT' })
    if (state.id) {
      try {
        await api.updateGame(state.id, { has_baron_pit: true })
      } catch (err) {
        console.error('updateGame(has_baron_pit) failed', err)
      }
    }
  }

  function readyToPass() {
    dispatch({ type: 'ADVANCE' })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-1" style={{ color: '#e9c349' }}>{title}</h2>
      <p className="text-gray-400 text-sm text-center mb-5">{sublabel}</p>

      <div className="space-y-6">
        {rows.map(row => (
          <BattlefieldRow
            key={row.key}
            row={row}
            state={state}
            dispatch={dispatch}
            scorer={state.current_turn_player}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={() => setSideModalOpen(true)}
          className="py-3 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200"
        >
          {isMyTurn ? 'Opponent Scored' : 'You Scored'}
        </button>
        {!state.has_baron_pit ? (
          <button
            onClick={addBaronPit}
            className="py-3 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200"
          >
            + Add Baron Pit
          </button>
        ) : (
          <div className="py-3 rounded-lg text-sm font-medium bg-gray-900 border border-gray-800 text-gray-600 text-center">
            Baron Pit added
          </div>
        )}
      </div>

      <button
        onClick={readyToPass}
        className="w-full mt-5 py-5 rounded-lg text-lg font-semibold"
        style={{ background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a' }}
      >
        Ready to Pass →
      </button>

      {sideModalOpen && (
        <SideScoredModal
          state={state}
          dispatch={dispatch}
          rows={rows}
          scorer={isMyTurn ? 'them' : 'me'}
          title={isMyTurn ? 'Opponent Scored' : 'You Scored'}
          onClose={() => setSideModalOpen(false)}
        />
      )}
    </div>
  )
}

function BattlefieldRow({ row, state, dispatch, scorer }) {
  const selection = getCurrentTurnSelection(state, row.key, scorer)
  const selectedType = selection?.score_type || null
  const selectedPoints = selection?.points ?? 1

  if (!row.card) {
    const lookedUpId =
      row.key === 'mine' ? state.my_battlefield_card_id :
      row.key === 'theirs' ? state.their_battlefield_card_id :
      '(baron pit not found)'
    // eslint-disable-next-line no-console
    console.warn(`[BattlefieldRow] no card for "${row.key}", looked up id:`, JSON.stringify(lookedUpId))
  }

  async function setType(score_type) {
    if (!state.current_turn_id) return
    // Toggle off if tapping the same option
    if (selectedType === score_type) {
      try {
        await api.deleteScoringEvent(selection.id)
      } catch (err) {
        console.error('deleteScoringEvent failed', err)
        return
      }
      dispatch({ type: 'REMOVE_SCORING_EVENT', id: selection.id })
      return
    }

    const points = selectedPoints || 1

    if (selection) {
      try {
        const updated = await api.updateScoringEvent(selection.id, { score_type, points })
        dispatch({ type: 'REPLACE_SCORING_EVENT', event: updated })
      } catch (err) {
        console.error('updateScoringEvent failed', err)
      }
    } else {
      try {
        const created = await api.addScoringEvent({
          game_id: state.id,
          turn_id: state.current_turn_id,
          scorer,
          battlefield: row.key,
          score_type,
          points,
        })
        dispatch({ type: 'ADD_SCORING_EVENT', event: created })
      } catch (err) {
        console.error('addScoringEvent failed', err)
      }
    }
  }

  async function setPoints(points) {
    if (!selection) return
    try {
      const updated = await api.updateScoringEvent(selection.id, { points })
      dispatch({ type: 'REPLACE_SCORING_EVENT', event: updated })
    } catch (err) {
      console.error('updateScoringEvent(points) failed', err)
    }
  }

  const showPointsModifier = !!selectedType

  return (
    <div>
      <div
        className="relative w-full overflow-hidden rounded bg-gray-800"
        style={{ aspectRatio: '1039 / 744' }}
      >
        {row.card?.cardImage?.url && (
          <img
            src={row.card.cardImage.url}
            alt={row.card.name || ''}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.45 }}
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
          <div className="w-full grid grid-cols-3 gap-2">
            {['conquer', 'hold', 'other'].map(t => (
              <CHOButton
                key={t}
                label={SCORE_TYPE_LABELS[t]}
                short={t[0].toUpperCase()}
                selected={selectedType === t}
                onClick={() => setType(t)}
              />
            ))}
          </div>

          {showPointsModifier && (
            <div className="w-full flex items-center gap-2">
              <span
                className="text-xs text-white font-medium"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)' }}
              >
                Points:
              </span>
              {[1, 2, 3].map(p => (
                <button
                  key={p}
                  onClick={() => setPoints(p)}
                  className={`flex-1 py-1.5 rounded text-sm font-medium border ${
                    selectedPoints === p
                      ? 'border-yellow-600 text-yellow-200 bg-yellow-900/60'
                      : 'border-gray-700 text-gray-200 bg-gray-900/70 hover:bg-gray-800/80'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-2 px-1">
        <div className="font-semibold text-white text-base">{row.label}</div>
        {row.card?.name && (
          <div className="text-sm text-gray-400 truncate ml-2">{row.card.name}</div>
        )}
      </div>
    </div>
  )
}

function CHOButton({ label, short, selected, onClick }) {
  const base = 'py-3 rounded-lg text-sm font-bold border transition'
  if (selected) {
    return (
      <button
        onClick={onClick}
        className={base}
        style={{ background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a', borderColor: '#c69f2f' }}
      >
        <div className="text-base leading-none">{short}</div>
        <div className="text-[10px] mt-0.5 leading-none opacity-80">{label}</div>
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      className={`${base} bg-gray-800/80 hover:bg-gray-700/80 border-gray-700 text-gray-200`}
    >
      <div className="text-base leading-none">{short}</div>
      <div className="text-[10px] mt-0.5 leading-none opacity-70">{label}</div>
    </button>
  )
}

function SideScoredModal({ state, dispatch, rows, scorer, title, onClose }) {
  const [battlefield, setBattlefield] = useState(rows[0]?.key || 'mine')
  const [scoreType, setScoreType] = useState('conquer')
  const [points, setPoints] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  async function save() {
    if (!state.current_turn_id) {
      onClose()
      return
    }
    setSubmitting(true)
    try {
      const created = await api.addScoringEvent({
        game_id: state.id,
        turn_id: state.current_turn_id,
        scorer,
        battlefield,
        score_type: scoreType,
        points,
      })
      dispatch({ type: 'ADD_SCORING_EVENT', event: created })
      onClose()
    } catch (err) {
      console.error('addScoringEvent (side) failed', err)
      alert('Failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: '#e9c349' }}>{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Battlefield</div>
          <div className="grid grid-cols-3 gap-2">
            {rows.map(r => {
              const owner = r.key === 'mine' ? 'Yours' : r.key === 'theirs' ? 'Theirs' : 'Neutral'
              const cardName = r.card?.name || r.label
              return (
                <button
                  key={r.key}
                  onClick={() => setBattlefield(r.key)}
                  className={`py-2 px-1 rounded border flex flex-col items-center justify-center ${
                    battlefield === r.key
                      ? 'border-yellow-600 text-yellow-200 bg-yellow-900/30'
                      : 'border-gray-700 text-gray-200 bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-xs font-medium leading-tight truncate w-full text-center">
                    {cardName}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 leading-none">
                    {owner}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">How</div>
          <div className="grid grid-cols-3 gap-2">
            {['conquer', 'hold', 'other'].map(t => (
              <button
                key={t}
                onClick={() => setScoreType(t)}
                className={`py-2 rounded font-medium border ${
                  scoreType === t
                    ? 'border-yellow-600 text-yellow-300 bg-yellow-900/30'
                    : 'border-gray-700 text-gray-300 bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {SCORE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Points</div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(p => (
              <button
                key={p}
                onClick={() => setPoints(p)}
                className={`py-2 rounded font-medium border ${
                  points === p
                    ? 'border-yellow-600 text-yellow-300 bg-yellow-900/30'
                    : 'border-gray-700 text-gray-300 bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={submitting}
            className="flex-1 py-3 rounded-lg font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(180deg, #e9c349 0%, #c69f2f 100%)', color: '#1a1a1a' }}
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
