import { useState } from 'react'

function PlayerPanel({ idx, flipped, history, xp, onConquer, onHold, onUndo, onXPChange }) {
  const score = history.length
  const bg = idx === 0
    ? 'linear-gradient(160deg, #5C2B1A 0%, #3D1A0D 50%, #2A1008 100%)'
    : 'linear-gradient(160deg, #2D3B2A 0%, #1E2829 60%, #261832 100%)'

  // Screen-space orientation helpers
  const decrementSide = flipped ? 'right' : 'left'
  const scoreSide     = flipped ? 'left'  : 'right'
  const conquerEdge   = flipped ? 'bottom': 'top'
  const holdEdge      = flipped ? 'top'   : 'bottom'

  // Show last 14 entries so the list doesn't get too long visually
  const visibleHistory = history.slice(-14)
  const startNum = history.length - visibleHistory.length + 1

  return (
    <div className="flex-1 relative overflow-hidden" style={{ background: bg }}>
      {/* ── Visual layer (rotated so each player reads from their end) ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{ transform: flipped ? 'rotate(180deg)' : 'none' }}
      >
        {/* Thin vertical divider separating left / right zones */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />

        {/* CONQUER zone — right half, top */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-12 rounded-full bg-amber-200/35 flex items-center justify-center text-2xl font-bold text-amber-200 shadow-lg">+</div>
          <span className="text-white/60 text-xs font-bold tracking-widest uppercase">Conquer</span>
        </div>

        {/* Thin horizontal divider splitting the two right zones */}
        <div className="absolute top-1/2 right-0 w-1/2 h-px bg-white/20" />

        {/* HOLD zone — right half, bottom */}
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 flex flex-col items-center justify-center gap-1">
          <div className="w-12 h-12 rounded-full bg-amber-200/35 flex items-center justify-center text-2xl font-bold text-amber-200 shadow-lg">+</div>
          <span className="text-white/60 text-xs font-bold tracking-widest uppercase">Hold</span>
        </div>

        {/* Score — centered on full panel */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold text-white leading-none"
            style={{ fontSize: 'clamp(72px, 20vw, 130px)', textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}
          >
            {score}
          </span>
        </div>

        {/* History list — left half, grows upward from the bottom */}
        <div className="absolute top-14 bottom-16 left-0 w-1/2 flex flex-col justify-end pl-4 pb-1 gap-0">
          {visibleHistory.map((type, i) => (
            <span key={i} className="text-white/50 font-mono text-lg leading-snug">
              {startNum + i}{type}
            </span>
          ))}
        </div>

        {/* Minus circle — centered in left half */}
        <div className="absolute left-0 top-0 w-1/2 h-full flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-amber-200/35 flex items-center justify-center text-3xl font-bold text-amber-200 shadow-lg">
            −
          </div>
        </div>

      </div>

      {/* ── Invisible tap zones (screen-space) ── */}

      {/* Undo (left side from player's view) */}
      <div
        className="absolute top-0 h-full w-1/2 z-10 cursor-pointer active:bg-white/5 transition-colors"
        style={{ [decrementSide]: 0, touchAction: 'manipulation' }}
        onClick={() => onUndo(idx)}
      />
      {/* Conquer (player's top-right) */}
      <div
        className="absolute w-1/2 h-1/2 z-10 cursor-pointer active:bg-white/5 transition-colors"
        style={{ [scoreSide]: 0, [conquerEdge]: 0, touchAction: 'manipulation' }}
        onClick={() => onConquer(idx)}
      />
      {/* Hold (player's bottom-right) */}
      <div
        className="absolute w-1/2 h-1/2 z-10 cursor-pointer active:bg-white/5 transition-colors"
        style={{ [scoreSide]: 0, [holdEdge]: 0, touchAction: 'manipulation' }}
        onClick={() => onHold(idx)}
      />

      {/* XP interactive (screen-space, above tap zones) */}
      {/*
        Flipped player: their top-left in player-space = bottom-right in screen-space
        Normal player:  top-left in both spaces
      */}
      <div
        className={`absolute z-20 flex items-center gap-1 ${flipped ? 'bottom-4 right-4' : 'top-4 left-4'}`}
        style={flipped ? { transform: 'rotate(180deg)', touchAction: 'manipulation' } : { touchAction: 'manipulation' }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onXPChange(idx, -1) }}
          className="w-8 h-8 rounded-full bg-amber-200/30 hover:bg-amber-200/50 active:bg-amber-200/60 text-amber-200 font-bold flex items-center justify-center transition-colors"
        >−</button>
        <span className="text-white/70 text-xs font-semibold min-w-[3rem] text-center select-none">XP {xp}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onXPChange(idx, 1) }}
          className="w-8 h-8 rounded-full bg-amber-200/30 hover:bg-amber-200/50 active:bg-amber-200/60 text-amber-200 font-bold flex items-center justify-center transition-colors"
        >+</button>
      </div>
    </div>
  )
}

export default function ScoreKeeper({ onBack }) {
  const [histories, setHistories] = useState([[], []])
  const [xp, setXP] = useState([0, 0])
  const [showReset, setShowReset] = useState(false)
  const [diceResult, setDiceResult] = useState(null)

  const handleConquer = (idx) => {
    setHistories(prev => {
      const next = [prev[0].slice(), prev[1].slice()]
      next[idx].push('C')
      return next
    })
  }

  const handleHold = (idx) => {
    setHistories(prev => {
      const next = [prev[0].slice(), prev[1].slice()]
      next[idx].push('H')
      return next
    })
  }

  const handleUndo = (idx) => {
    setHistories(prev => {
      if (prev[idx].length === 0) return prev
      const next = [prev[0].slice(), prev[1].slice()]
      next[idx].pop()
      return next
    })
  }

  const handleXPChange = (idx, delta) => {
    setXP(prev => { const n = [...prev]; n[idx] += delta; return n })
  }

  const rollDice = () => {
    const winner = Math.floor(Math.random() * 2)
    setDiceResult(winner)
    setTimeout(() => setDiceResult(null), 3000)
  }

  const confirmReset = () => {
    setHistories([[], []])
    setXP([0, 0])
    setShowReset(false)
    setDiceResult(null)
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      <PlayerPanel
        idx={0} flipped={true}
        history={histories[0]} xp={xp[0]}
        onConquer={handleConquer} onHold={handleHold} onUndo={handleUndo} onXPChange={handleXPChange}
      />

      {/* ── Toolbar ── */}
      <div className="shrink-0 bg-blue-700 flex items-center justify-between px-4 z-30" style={{ height: 64 }}>
        <button onClick={() => setShowReset(true)} className="text-white/80 hover:text-white transition-colors p-2 rounded-lg" aria-label="Reset scores">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>

        <button onClick={rollDice} className="text-white/80 hover:text-white transition-colors p-2 rounded-lg" aria-label="Roll dice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="text-center leading-tight" style={{ transform: 'rotate(180deg)' }}>
            <div className="text-white/70 font-semibold text-xs">Riftbound</div>
            <div className="text-white/70 font-semibold text-xs">Companion</div>
          </div>
          <div className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/40">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
          </div>
          <div className="text-center leading-tight">
            <div className="text-white/70 font-semibold text-xs">Riftbound</div>
            <div className="text-white/70 font-semibold text-xs">Companion</div>
          </div>
        </div>

        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-amber-200/35 hover:bg-amber-200/55 active:bg-amber-200/65 transition-colors flex items-center justify-center" aria-label="Return to home">
          <div className="w-4 h-4 rounded-sm bg-amber-900/70" />
        </button>
      </div>

      <PlayerPanel
        idx={1} flipped={false}
        history={histories[1]} xp={xp[1]}
        onConquer={handleConquer} onHold={handleHold} onUndo={handleUndo} onXPChange={handleXPChange}
      />

      {/* ── Reset confirm modal ── */}
      {showReset && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl flex flex-col gap-4">
            <h3 className="text-white text-xl font-bold text-center">Reset all scores?</h3>
            <p className="text-white/60 text-sm text-center">All scores and XP will be reset to 0.</p>
            <button onClick={confirmReset} className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl py-3 text-lg font-bold transition-colors">Reset</button>
            <button onClick={() => setShowReset(false)} className="text-white/50 hover:text-white/70 text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* ── Dice result toast ── */}
      {diceResult !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gray-900/95 border border-gray-600 rounded-2xl px-8 py-6 shadow-2xl text-center">
            <p className="text-white/60 text-sm mb-1">Chosen by fate</p>
            <p className="text-white text-2xl font-bold">Player {diceResult + 1} decides!</p>
          </div>
        </div>
      )}
    </div>
  )
}
