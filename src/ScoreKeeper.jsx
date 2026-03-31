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

function PlayerPanel({ idx, flipped, history, xp, xpFlash, onConquer, onHold, onUndo, onXPChange }) {
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
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {xpFlash && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  [xpFlash === 'up' ? 'top' : 'bottom']: 0,
                  height: '50%',
                  background: `linear-gradient(180deg, rgba(233,195,73,0.24), rgba(233,195,73,0.06))`,
                  opacity: 0,
                  animation: 'xp-flash 320ms ease-out forwards',
                  pointerEvents: 'none',
                }}
              />
            )}
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
  const [xpFlash, setXPFlash] = useState([null, null])
  const [showReset, setShowReset] = useState(false)
  const [diceModal, setDiceModal] = useState(null)
  const [actionFlash, setActionFlash] = useState(null)
  const rollIntervalRef = useRef(null)
  const actionFlashTimeoutRef = useRef(null)
  const xpFlashTimeoutsRef = useRef([null, null])

  const [timerStart, setTimerStart] = useState(DEFAULT_SECONDS)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SECONDS)
  const [timerRunning, setTimerRunning] = useState(false)
  const [showTimerEdit, setShowTimerEdit] = useState(false)
  const [timerEditMins, setTimerEditMins] = useState('60')

  const handleConquer = (idx) => {
    setHistories(prev => { const n = [prev[0].slice(), prev[1].slice()]; n[idx].push('C'); return n })
    setActionFlash({ id: Date.now(), idx, type: 'conquer' })
  }
  const handleHold = (idx) => {
    setHistories(prev => { const n = [prev[0].slice(), prev[1].slice()]; n[idx].push('H'); return n })
    setActionFlash({ id: Date.now(), idx, type: 'hold' })
  }
  const handleUndo = (idx) => {
    setHistories(prev => {
      if (prev[idx].length === 0) return prev
      const n = [prev[0].slice(), prev[1].slice()]; n[idx].pop(); return n
    })
  }
  const handleXPChange = (idx, delta) => {
    setXP(prev => { const n = [...prev]; n[idx] += delta; return n })
    setXPFlash(prev => {
      const next = [...prev]
      next[idx] = delta > 0 ? 'up' : 'down'
      return next
    })
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => { document.body.style.overflow = prev; document.body.style.touchAction = '' }
  }, [])

  useEffect(() => {
    if (!actionFlash) return
    if (actionFlashTimeoutRef.current) clearTimeout(actionFlashTimeoutRef.current)
    actionFlashTimeoutRef.current = setTimeout(() => {
      setActionFlash(null)
      actionFlashTimeoutRef.current = null
    }, 650)
    return () => {
      if (actionFlashTimeoutRef.current) {
        clearTimeout(actionFlashTimeoutRef.current)
        actionFlashTimeoutRef.current = null
      }
    }
  }, [actionFlash])

  useEffect(() => {
    xpFlash.forEach((flash, idx) => {
      if (!flash) return
      if (xpFlashTimeoutsRef.current[idx]) clearTimeout(xpFlashTimeoutsRef.current[idx])
      xpFlashTimeoutsRef.current[idx] = setTimeout(() => {
        setXPFlash(prev => {
          const next = [...prev]
          next[idx] = null
          return next
        })
        xpFlashTimeoutsRef.current[idx] = null
      }, 320)
    })

    return () => {
      xpFlashTimeoutsRef.current.forEach((timeoutId, idx) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          xpFlashTimeoutsRef.current[idx] = null
        }
      })
    }
  }, [xpFlash])

  useEffect(() => {
    if (!timerRunning) return
    if (timeLeft <= 0) { setTimerRunning(false); return }
    const id = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { setTimerRunning(false); return 0 } return prev - 1 })
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
    setTimerStart(secs); setTimeLeft(secs); setShowTimerEdit(false)
  }

  const rollDice = () => {
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)

    const finalP1 = [randDie(), randDie()]
    const finalP2 = [randDie(), randDie()]
    const p1Total = finalP1[0] + finalP1[1]
    const p2Total = finalP2[0] + finalP2[1]
    const winner = p1Total > p2Total ? 0 : p2Total > p1Total ? 1 : -1

    setDiceModal({ phase: 'rolling', p1: [randDie(), randDie()], p2: [randDie(), randDie()] })

    const DURATION = 1500
    const TICK = 80
    let elapsed = 0

    rollIntervalRef.current = setInterval(() => {
      elapsed += TICK
      if (elapsed >= DURATION) {
        clearInterval(rollIntervalRef.current)
        rollIntervalRef.current = null
        setDiceModal({ phase: 'result', p1: finalP1, p2: finalP2, winner, p1Total, p2Total })
        if (winner === -1) {
          setTimeout(() => rollDice(), 1400)
        }
      } else {
        setDiceModal(prev => prev ? { ...prev, p1: [randDie(), randDie()], p2: [randDie(), randDie()] } : prev)
      }
    }, TICK)
  }

  const confirmReset = () => {
    setHistories([[], []]); setXP([0, 0]); setShowReset(false); setDiceModal(null)
  }

  const pct = timerStart > 0 ? timeLeft / timerStart : 0
  const timerColor = timeLeft === 0 ? '#f87171' : pct < 0.25 ? GOLD : 'rgba(255,255,255,0.72)'

  const ghostBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s',
    WebkitTapHighlightColor: 'transparent',
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', touchAction: 'none', overscrollBehavior: 'none' }}>
      <style>{`
        @keyframes conquer-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.45);
          }
          18% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.92);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.7);
          }
        }

        @keyframes conquer-ring {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.35);
          }
          22% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.65);
          }
        }

        @keyframes xp-flash {
          0% {
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>

      {actionFlash && (
        <div
          key={actionFlash.id}
          className="fixed inset-0 pointer-events-none z-40"
          aria-hidden="true"
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 'clamp(120px, 34vw, 220px)',
              height: 'clamp(120px, 34vw, 220px)',
              borderRadius: '999px',
              border: '1px solid rgba(233,195,73,0.28)',
              boxShadow: '0 0 40px rgba(233,195,73,0.18), inset 0 0 24px rgba(233,195,73,0.12)',
              background: 'radial-gradient(circle, rgba(233,195,73,0.12) 0%, rgba(233,195,73,0.05) 35%, rgba(233,195,73,0) 72%)',
              animation: 'conquer-ring 650ms cubic-bezier(0.18, 0.7, 0.2, 1) forwards',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              filter: 'drop-shadow(0 0 18px rgba(233,195,73,0.45)) drop-shadow(0 0 38px rgba(233,195,73,0.2))',
              animation: 'conquer-burst 650ms cubic-bezier(0.18, 0.7, 0.2, 1) forwards',
            }}
          >
            {actionFlash.type === 'conquer' ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={GOLD}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 'clamp(88px, 24vw, 156px)', height: 'clamp(88px, 24vw, 156px)', opacity: 0.95 }}
              >
                <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                <path d="M13 19l6-6" />
                <path d="M16 16l4 4" />
                <path d="M8 8l-5 5" />
                <path d="M3.5 20.5l3-3" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={GOLD}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 'clamp(88px, 24vw, 156px)', height: 'clamp(88px, 24vw, 156px)', opacity: 0.95 }}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            )}
          </div>
        </div>
      )}

      <PlayerPanel idx={0} flipped={true} history={histories[0]} xp={xp[0]} xpFlash={xpFlash[0]}
        onConquer={handleConquer} onHold={handleHold} onUndo={handleUndo} onXPChange={handleXPChange} />

      {/* ── Toolbar ── */}
      <div
        className="shrink-0 flex items-center px-3 gap-2 z-30"
        style={{
          height: 68, fontFamily: SG,
          background: '#0e0e11',
          borderTop: `1px solid ${GOLD_BORDER}`,
          borderBottom: `1px solid ${GOLD_BORDER}`,
        }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => setShowReset(true)} style={ghostBtn} aria-label="Reset">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={18} height={18}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
          <button onClick={rollDice} style={ghostBtn} aria-label="Roll dice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <button
            onClick={handleTimerClick}
            className="relative px-3 py-1 rounded-xl transition-colors hover:bg-white/5"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '2.2rem', letterSpacing: '0.06em', color: timerColor, lineHeight: 1 }}>
              {formatTime(timeLeft)}
            </span>
            <span style={{ position: 'absolute', top: 'calc(100% - 6px)', left: 0, right: 0, textAlign: 'center', fontFamily: SG, fontSize: 8, fontWeight: 600, letterSpacing: '0.18em', color: GOLD, opacity: timerRunning ? 0 : 0.45, textTransform: 'uppercase', transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
              Tap to change
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTimerRunning(r => !r)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 44, borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
              background: timerRunning ? 'rgba(255,255,255,0.08)' : GOLD_DIM,
              border: `2px solid ${timerRunning ? 'rgba(255,255,255,0.2)' : GOLD_BORDER}`,
              color: timerRunning ? 'rgba(255,255,255,0.8)' : GOLD,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {timerRunning ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
                <rect x="5" y="4" width="4" height="16" rx="1.5" /><rect x="15" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={onBack}
            style={{ ...ghostBtn, width: 44, height: 44, borderRadius: 12 }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(233,195,73,0.5)' }} />
          </button>
        </div>
      </div>

      <PlayerPanel idx={1} flipped={false} history={histories[1]} xp={xp[1]} xpFlash={xpFlash[1]}
        onConquer={handleConquer} onHold={handleHold} onUndo={handleUndo} onXPChange={handleXPChange} />

      {/* ── Reset modal ── */}
      {showReset && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 w-full max-w-xs flex flex-col gap-4" style={{ background: '#1a1a1f', border: `1px solid ${GOLD_BORDER}`, fontFamily: SG }}>
            <h3 className="text-white text-xl font-bold text-center">Reset all scores?</h3>
            <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>All scores and XP will be cleared.</p>
            <button onClick={confirmReset} className="rounded-xl py-3 text-base font-bold" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}>Reset</button>
            <button onClick={() => setShowReset(false)} className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Timer edit modal ── */}
      {showTimerEdit && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 w-full max-w-xs flex flex-col gap-4" style={{ background: '#1a1a1f', border: `1px solid ${GOLD_BORDER}`, fontFamily: SG }}>
            <h3 className="text-white text-xl font-bold text-center">Set timer</h3>
            <div className="flex items-center justify-center gap-3">
              <input
                type="number" min="1" max="999"
                value={timerEditMins}
                onChange={e => setTimerEditMins(e.target.value)}
                className="w-24 text-center text-3xl font-bold rounded-xl py-3 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${GOLD_BORDER}`, color: GOLD, fontFamily: "'Rajdhani', sans-serif" }}
              />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: SG }}>min</span>
            </div>
            <button onClick={confirmTimerEdit} className="rounded-xl py-3 text-base font-bold" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}>Set</button>
            <button onClick={() => setShowTimerEdit(false)} className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Dice modal ── */}
      {diceModal !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => { if (diceModal.phase === 'result' && diceModal.winner !== -1) { if (rollIntervalRef.current) clearInterval(rollIntervalRef.current); setDiceModal(null) } }}
        >
          <div
            className="rounded-2xl p-6 flex flex-col gap-5 w-full max-w-sm mx-4"
            style={{ background: '#1a1a1f', border: `1px solid ${GOLD_BORDER}`, fontFamily: SG }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-center text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(233,195,73,0.45)' }}>
              {diceModal.phase === 'rolling' ? 'Rolling…' : diceModal.winner === -1 ? 'Tie — Rolling again…' : 'Chosen by fate'}
            </p>

            <div className="flex items-center justify-center gap-6">
              {/* Top player (idx 0, flipped) */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Top</span>
                <div className="flex gap-2">
                  <DieFace value={diceModal.p1[0]} spinning={diceModal.phase === 'rolling'} />
                  <DieFace value={diceModal.p1[1]} spinning={diceModal.phase === 'rolling'} />
                </div>
                {diceModal.phase === 'result' && (
                  <span style={{ fontFamily: SG, fontWeight: 700, fontSize: 22, color: diceModal.winner === 0 ? GOLD : 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
                    {diceModal.p1Total}
                  </span>
                )}
              </div>

              {/* Bottom player (idx 1) */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Bottom</span>
                <div className="flex gap-2">
                  <DieFace value={diceModal.p2[0]} spinning={diceModal.phase === 'rolling'} />
                  <DieFace value={diceModal.p2[1]} spinning={diceModal.phase === 'rolling'} />
                </div>
                {diceModal.phase === 'result' && (
                  <span style={{ fontFamily: SG, fontWeight: 700, fontSize: 22, color: diceModal.winner === 1 ? GOLD : 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
                    {diceModal.p2Total}
                  </span>
                )}
              </div>
            </div>

            {diceModal.phase === 'result' && diceModal.winner !== -1 && (
              <>
                <div className="flex flex-col items-center gap-2">
                  <svg className="animate-bounce" viewBox="0 0 60 80" width={64} height={84} style={{ filter: `drop-shadow(0 0 12px rgba(233,195,73,0.65))` }}>
                    {diceModal.winner === 0
                      ? <polygon points="30,0 60,38 42,38 42,80 18,80 18,38 0,38" fill={GOLD} />
                      : <polygon points="30,80 0,42 18,42 18,0 42,0 42,42 60,42" fill={GOLD} />
                    }
                  </svg>
                  <span style={{ fontFamily: SG, fontWeight: 800, fontSize: 18, color: GOLD, letterSpacing: '0.04em' }}>
                    {diceModal.winner === 0 ? 'Top' : 'Bottom'} goes first
                  </span>
                </div>
                <button
                  onClick={() => { if (rollIntervalRef.current) clearInterval(rollIntervalRef.current); setDiceModal(null) }}
                  className="rounded-xl py-3 text-sm font-bold"
                  style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}
                >
                  Got it
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
