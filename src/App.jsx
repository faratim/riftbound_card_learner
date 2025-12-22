import { useState } from 'react'
import cardData from './riftbound-cards.json'

const SETS = [
  { id: 'OGN', name: 'Origins' },
  { id: 'OGS', name: 'Proving Grounds' },
  { id: 'SFD', name: 'Spiritforged' }
]

const DOMAINS = [
  { id: 'body', name: 'Body', color: 'from-orange-500 to-orange-700', textColor: 'text-white' },
  { id: 'calm', name: 'Calm', color: 'from-green-500 to-emerald-700', textColor: 'text-white' },
  { id: 'chaos', name: 'Chaos', color: 'from-purple-500 to-purple-800', textColor: 'text-white' },
  { id: 'fury', name: 'Fury', color: 'from-red-500 to-red-800', textColor: 'text-white' },
  { id: 'mind', name: 'Mind', color: 'from-blue-400 to-blue-700', textColor: 'text-white' },
  { id: 'order', name: 'Order', color: 'from-yellow-400 to-yellow-600', textColor: 'text-gray-900' }
]

function App() {
  const [selectedSet, setSelectedSet] = useState(null)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [filteredCards, setFilteredCards] = useState([])
  const [blurTopLeft, setBlurTopLeft] = useState(true)
  const [blurTopRight, setBlurTopRight] = useState(true)
  const [blurBottom, setBlurBottom] = useState(true)

  const startLearning = () => {
    if (!selectedSet || !selectedDomain) return

    const cards = cardData.filter(card =>
      card.set === selectedSet &&
      card.domains.some(domain => domain.id === selectedDomain)
    )

    // Shuffle the cards randomly
    const shuffled = [...cards].sort(() => Math.random() - 0.5)

    setFilteredCards(shuffled)
    setCurrentCardIndex(0)
  }

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length)
    // Reset blurs when moving to next card
    setBlurTopLeft(true)
    setBlurTopRight(true)
    setBlurBottom(true)
  }

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length)
    // Reset blurs when moving to previous card
    setBlurTopLeft(true)
    setBlurTopRight(true)
    setBlurBottom(true)
  }

  const goBack = () => {
    setFilteredCards([])
    setCurrentCardIndex(0)
  }

  if (filteredCards.length > 0) {
    const currentCard = filteredCards[currentCardIndex]
    const isUnitCard = currentCard.cardType.some(type => type.id === 'unit')

    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={goBack}
            className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Back to Selection
          </button>

          <div className="text-center mb-4">
            <p className="text-lg">Card {currentCardIndex + 1} of {filteredCards.length}</p>
          </div>

          <div className="flex justify-center">
            <div className="relative inline-block">
              <img
                src={currentCard.cardImage.url}
                alt={currentCard.name}
                className="max-w-md rounded-lg shadow-2xl"
              />

              {/* Top-left blur overlay (energy cost + domain symbols) */}
              {blurTopLeft && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    setBlurTopLeft(false)
                  }}
                  className="absolute top-0 left-0 w-[18%] h-[28%] backdrop-blur-xl bg-black/20 cursor-pointer rounded-tl-lg"
                  style={{ backdropFilter: 'blur(20px)' }}
                />
              )}

              {/* Top-right blur overlay (power stat - Units only) */}
              {isUnitCard && blurTopRight && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    setBlurTopRight(false)
                  }}
                  className="absolute top-0 right-0 w-[18%] h-[18%] backdrop-blur-xl bg-black/20 cursor-pointer rounded-tr-lg"
                  style={{ backdropFilter: 'blur(20px)' }}
                />
              )}

              {/* Bottom blur overlay (card text/abilities) */}
              {blurBottom && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    setBlurBottom(false)
                  }}
                  className="absolute bottom-0 left-0 right-0 h-[35%] backdrop-blur-xl bg-black/20 cursor-pointer rounded-b-lg"
                  style={{ backdropFilter: 'blur(20px)' }}
                />
              )}

              {/* Previous card button - Left side */}
              <button
                onClick={prevCard}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition backdrop-blur-sm"
                aria-label="Previous card"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Next card button - Right side */}
              <button
                onClick={nextCard}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition backdrop-blur-sm"
                aria-label="Next card"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Riftbound Card Learner</h1>

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Select a Set</h2>
          <div className="grid grid-cols-3 gap-4">
            {SETS.map(set => (
              <button
                key={set.id}
                onClick={() => setSelectedSet(set.id)}
                className={`p-4 rounded-lg transition ${
                  selectedSet === set.id
                    ? 'bg-blue-600 ring-4 ring-blue-400'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {set.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Select a Domain (Color)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DOMAINS.map(domain => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`p-6 rounded-xl font-bold text-lg transition-all transform bg-gradient-to-br ${domain.color} ${domain.textColor} shadow-lg ${
                  selectedDomain === domain.id
                    ? 'ring-4 ring-white scale-105 shadow-2xl'
                    : 'opacity-80 hover:opacity-100 hover:scale-105 hover:shadow-xl'
                }`}
              >
                {domain.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={startLearning}
            disabled={!selectedSet || !selectedDomain}
            className={`px-8 py-4 text-xl font-bold rounded-lg transition ${
              selectedSet && selectedDomain
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
