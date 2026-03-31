import { useState, useEffect } from 'react'

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

        {/* XP display — top 25% of left half */}
        <div className="absolute top-0 left-0 w-1/2 h-1/4 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-200/35 flex items-center justify-center text-2xl font-bold text-amber-200">−</div>
            <span className="text-white/80 text-lg font-bold min-w-[4rem] text-center">XP {xp}</span>
            <div className="w-11 h-11 rounded-full bg-amber-200/35 flex items-center justify-center text-2xl font-bold text-amber-200">+</div>
          </div>
        </div>

        {/* Thin horizontal divider below XP zone */}
        <div className="absolute top-1/4 left-0 w-1/2 h-px bg-white/10" />

        {/* Minus circle — bottom 75% of left half */}
        <div className="absolute top-1/4 left-0 w-1/2 h-3/4 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-200/35 flex items-center justify-center text-4xl font-bold text-amber-200 shadow-lg">
            −
          </div>
        </div>

        {/* History list — left half, within minus zone, grows upward from bottom */}
        <div className="absolute top-1/4 bottom-12 left-0 w-1/2 flex flex-col justify-end pl-4 pb-1 gap-0">
          {visibleHistory.map((type, i) => (
            <span key={i} className="text-white/50 font-mono text-lg leading-snug">
              {startNum + i}{type}
            </span>
          ))}
        </div>

      </div>

      {/* ── Invisible tap zones (screen-space) ── */}

      {/* Undo — bottom 75% of the decrement side (below XP zone) */}
      <div
        className="absolute w-1/2 h-3/4 z-10 cursor-pointer active:bg-white/5 transition-colors"
        style={{
          [decrementSide]: 0,
          [flipped ? 'top' : 'bottom']: 0,
          touchAction: 'manipulation',
        }}
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

      {/* XP interactive zone — top 25% of decrement side (screen-space) */}
      <div
        className="absolute w-1/2 h-1/4 z-20 flex items-center justify-center"
        style={flipped
          ? { right: 0, bottom: 0, transform: 'rotate(180deg)', touchAction: 'manipulation' }
          : { left: 0, top: 0, touchAction: 'manipulation' }
        }
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onXPChange(idx, -1) }}
            className="w-11 h-11 rounded-full bg-transparent text-transparent font-bold flex items-center justify-center"
          >−</button>
          <span className="text-transparent text-lg font-bold min-w-[4rem] text-center select-none">XP {xp}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onXPChange(idx, 1) }}
            className="w-11 h-11 rounded-full bg-transparent text-transparent font-bold flex items-center justify-center"
          >+</button>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_SECONDS = 60 * 60

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function ScoreKeeper({ onBack }) {
  const [histories, setHistories] = useState([[], []])
  const [xp, setXP] = useState([0, 0])
  const [showReset, setShowReset] = useState(false)
  const [diceResult, setDiceResult] = useState(null)

  const [timerStart, setTimerStart] = useState(DEFAULT_SECONDS)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SECONDS)
  const [timerRunning, setTimerRunning] = useState(false)
  const [showTimerEdit, setShowTimerEdit] = useState(false)
  const [timerEditMins, setTimerEditMins] = useState('60')

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

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = prev
      document.body.style.touchAction = ''
    }
  }, [])

  useEffect(() => {
    if (!timerRunning) return
    if (timeLeft <= 0) { setTimerRunning(false); return }
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setTimerRunning(false); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [timerRunning, timeLeft])

  const handleTimerClick = () => {
    if (!timerRunning) {
      setTimerEditMins(Math.round(timerStart / 60).toString())
      setShowTimerEdit(true)
    }
  }

  const confirmTimerEdit = () => {
    const mins = Math.max(1, parseInt(timerEditMins) || 1)
    const secs = mins * 60
    setTimerStart(secs)
    setTimeLeft(secs)
    setShowTimerEdit(false)
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
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', touchAction: 'none', overscrollBehavior: 'none' }}>
      <PlayerPanel
        idx={0} flipped={true}
        history={histories[0]} xp={xp[0]}
        onConquer={handleConquer} onHold={handleHold} onUndo={handleUndo} onXPChange={handleXPChange}
      />

      {/* ── Toolbar ── */}
      <div className="shrink-0 bg-gray-900 flex items-center px-3 z-30" style={{ height: 68 }}>
        {/* Left: Reset + Dice */}
        <div className="flex items-center gap-1">
          <button onClick={() => setShowReset(true)} className="text-white/70 hover:text-white transition-colors p-2 rounded-lg" aria-label="Reset scores">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
          <button onClick={rollDice} className="text-white/70 hover:text-white transition-colors p-2 rounded-lg" aria-label="Roll dice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>

        {/* Center: Timer */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={handleTimerClick}
            className={`transition-colors leading-none ${
              timeLeft === 0 ? 'text-red-400' : timerRunning ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '2rem', letterSpacing: '0.05em' }}
            aria-label="Timer"
          >
            {formatTime(timeLeft)}
          </button>
        </div>

        {/* Right: Play/Pause + Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimerRunning(r => !r)}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
              timerRunning
                ? 'border-white/50 bg-white/15 hover:bg-white/25 text-white'
                : 'border-amber-400/60 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300'
            }`}
            aria-label={timerRunning ? 'Pause timer' : 'Start timer'}
          >
            {timerRunning ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <rect x="5" y="4" width="4" height="16" rx="1" />
                <rect x="15" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
          </button>
          <button onClick={onBack} className="w-11 h-11 rounded-lg bg-amber-200/35 hover:bg-amber-200/55 active:bg-amber-200/65 transition-colors flex items-center justify-center" aria-label="Return to home">
            <div className="w-5 h-5 rounded-sm bg-amber-900/70" />
          </button>
        </div>
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

      {/* ── Timer edit modal ── */}
      {showTimerEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-xs shadow-2xl flex flex-col gap-4">
            <h3 className="text-white text-xl font-bold text-center">Set timer</h3>
            <div className="flex items-center justify-center gap-3">
              <input
                type="number"
                min="1"
                max="999"
                value={timerEditMins}
                onChange={e => setTimerEditMins(e.target.value)}
                className="w-24 bg-gray-700 text-white text-center text-3xl font-mono font-bold rounded-xl py-3 border border-gray-600 focus:outline-none focus:border-amber-400"
              />
              <span className="text-white/60 text-lg">min</span>
            </div>
            <button onClick={confirmTimerEdit} className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl py-3 text-lg font-bold transition-colors">Set</button>
            <button onClick={() => setShowTimerEdit(false)} className="text-white/50 hover:text-white/70 text-sm transition-colors">Cancel</button>
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
