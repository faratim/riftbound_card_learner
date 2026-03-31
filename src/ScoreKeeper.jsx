import { useState, useEffect, useRef } from 'react'

const GOLD       = '#e9c349'
const GOLD_DIM   = 'rgba(233,195,73,0.15)'
const GOLD_BORDER= 'rgba(233,195,73,0.25)'
const PANEL_BG   = '#131316'
const SG         = "'Space Grotesk', sans-serif"

const randDie = () => Math.ceil(Math.random() * 6)

const DOT_POSITIONS = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[30, 30], [50, 50], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]],
}

function DieFace({ value, spinning, size = 64 }) {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1]
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.18, flexShrink: 0,
      background: spinning ? 'rgba(233,195,73,0.04)' : 'rgba(233,195,73,0.12)',
      border: `2px solid ${spinning ? 'rgba(233,195,73,0.25)' : 'rgba(233,195,73,0.5)'}`,
      position: 'relative', transition: 'background 0.15s, border-color 0.15s',
      boxShadow: spinning ? 'none' : `0 0 14px rgba(233,195,73,0.2)`,
    }}>
      {dots.map(([x, y], i) => (
        <div key={i} style={{
          position: 'absolute',
          width: size * 0.17, height: size * 0.17,
          borderRadius: '50%',
          background: GOLD,
          left: `${x}%`, top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          opacity: spinning ? 0.4 : 1,
          transition: 'opacity 0.15s',
        }} />
      ))}
    </div>
  )
}

function PlayerPanel({ idx, flipped, history, xp, onConquer, onHold, onUndo, onXPChange }) {
  const score = history.length
  const visibleHistory = history.slice(-9)
  const startNum = history.length - visibleHistory.length + 1

  return (
    <div className="flex-1 overflow-hidden" style={{ background: PANEL_BG }}>
      {/* Everything inside is rotated for the flipped player */}
      <div
        className="w-full h-full flex flex-col"
        style={{ transform: flipped ? 'rotate(180deg)' : 'none' }}
      >

        {/* ── Score area (top ~60%) ── */}
        <div className="flex-1 relative flex items-center overflow-hidden">

          {/* Radial glow behind score */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 70% at 55% 50%, rgba(233,195,73,0.08) 0%, transparent 70%)`
          }} />

          {/* Minus / undo — left quarter */}
          <button
            onClick={() => onUndo(idx)}
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
            style={{ width: '28%', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            <span style={{
              fontFamily: SG, fontWeight: 700,
              fontSize: 'clamp(40px, 11vw, 64px)',
              color: GOLD, opacity: 0.45, lineHeight: 1,
            }}>−</span>
          </button>

          {/* Score number — centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span style={{
              fontFamily: SG, fontWeight: 700,
              fontSize: 'clamp(80px, 22vw, 130px)',
              color: GOLD, lineHeight: 1,
              textShadow: `0 0 40px rgba(233,195,73,0.45), 0 0 80px rgba(233,195,73,0.18)`,
            }}>{score}</span>
          </div>

          {/* History — top-right, very subtle */}
          {visibleHistory.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-col items-end gap-0 pointer-events-none select-none">
              {visibleHistory.map((type, i) => (
                <span key={i} style={{ fontFamily: SG, fontSize: 15, color: 'rgba(233,195,73,0.35)', lineHeight: 1.6 }}>
                  {startNum + i}{type}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom row: CONQUER | HOLD | XP (40%) ── */}
        <div className="flex shrink-0" style={{ height: '40%', borderTop: `1px solid ${GOLD_BORDER}` }}>

          {/* CONQUER — hero card, solid gold */}
          <button
            onClick={() => onConquer(idx)}
            className="flex flex-col items-center active:brightness-110 transition-all"
            style={{
              flex: '0 0 33.33%',
              background: `rgba(233,195,73,0.13)`,
              borderRight: `1px solid ${GOLD_BORDER}`,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontFamily: SG, fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', color: GOLD, opacity: 0.75, textTransform: 'uppercase' }}>Conquer</span>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(233,195,73,0.15)',
              border: `1px solid ${GOLD_BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28, opacity: 0.85 }}>
                <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                <path d="M13 19l6-6" /><path d="M16 16l4 4" />
                <path d="M8 8l-5 5" /><path d="M3.5 20.5l3-3" />
              </svg>
            </div>
          </button>

          {/* HOLD — secondary, dark */}
          <button
            onClick={() => onHold(idx)}
            className="flex flex-col items-center active:brightness-125 transition-all"
            style={{
              flex: '0 0 33.33%',
              background: 'rgba(255,255,255,0.03)',
              borderLeft: `1px solid ${GOLD_BORDER}`,
              borderRight: `1px solid ${GOLD_BORDER}`,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontFamily: SG, fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', color: `rgba(233,195,73,0.55)`, textTransform: 'uppercase' }}>Hold</span>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(233,195,73,0.1)',
              border: `1px solid ${GOLD_BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26, opacity: 0.8 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </button>

          {/* XP — split tap zones with dedicated center lane */}
          <div
            style={{
              flex: '0 0 33.33%',
              background: 'rgba(255,255,255,0.015)',
              borderLeft: `1px solid ${GOLD_BORDER}`,
              display: 'grid',
              gridTemplateRows: '1fr auto 1fr',
              minHeight: 0,
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onXPChange(idx, 1) }}
              className="flex items-center justify-center active:brightness-125 transition-all"
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                background: 'transparent',
              }}
              aria-label="Increase XP"
            >
              <span style={{ color: GOLD, fontSize: 22, lineHeight: 1, opacity: 0.5, fontWeight: 300, pointerEvents: 'none' }}>+</span>
            </button>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '6px 10px',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontFamily: SG, fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', color: GOLD, opacity: 0.45, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>XP</span>
              <div style={{ height: 1, background: GOLD_BORDER, width: '70%', maxWidth: 72 }} />
              <span style={{ fontFamily: SG, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 32px)', color: 'rgba(255,255,255,0.77)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{xp}</span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onXPChange(idx, -1) }}
              className="flex items-center justify-center active:brightness-125 transition-all"
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                background: 'transparent',
              }}
              aria-label="Decrease XP"
            >
              <span style={{ color: GOLD, fontSize: 22, lineHeight: 1, opacity: 0.5, fontWeight: 300, pointerEvents: 'none' }}>−</span>
            </button>
          </div>

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
