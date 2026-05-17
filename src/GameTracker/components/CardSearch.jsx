import { useState, useMemo } from 'react'

export default function CardSearch({ cards, onPick, placeholder = 'Search…' }) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return cards
    return cards.filter(c => {
      if (c.name.toLowerCase().includes(needle)) return true
      if (c.champion && c.champion.toLowerCase().includes(needle)) return true
      return false
    })
  }, [cards, q])

  return (
    <div className="w-full flex flex-col gap-3">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-600"
        autoFocus
      />
      <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-2 pr-1">
        {filtered.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">No matches</div>
        )}
        {filtered.map(card => (
          <button
            key={card.id}
            onClick={() => onPick(card)}
            className="w-full flex items-center gap-3 p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-yellow-700/60 rounded-lg text-left transition"
          >
            <img
              src={card.cardImage?.url}
              alt=""
              className={`flex-shrink-0 object-cover bg-gray-900 ${
                card.orientation === 'landscape' ? 'w-20 h-14' : 'w-12 h-16'
              }`}
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">
                {card.champion ? `${card.champion}, ${card.name}` : card.name}
              </div>
              <div className="text-xs text-gray-400 flex flex-wrap gap-1.5 mt-0.5">
                <span>{card.publicCode}</span>
                {card.domains?.map(d => (
                  <span key={d.id} className="px-1.5 rounded bg-gray-700/60">{d.label}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
