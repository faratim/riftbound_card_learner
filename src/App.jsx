import { useState } from 'react'
import cardData from './riftbound-cards.json'

const SETS = [
  { id: 'OGN', name: 'Origins', bgImage: '/images/origins.png', bgPosition: 'center 3%' },
  { id: 'OGS', name: 'Proving Grounds', bgImage: '/images/proving-grounds.png', bgPosition: 'center' },
  { id: 'SFD', name: 'Spiritforged', bgImage: '/images/spiritforged.jpg', bgPosition: 'center 27%' }
]

const DOMAINS = [
  { id: 'body', name: 'Body', color: 'from-orange-500 to-orange-700', textColor: 'text-white', bgImage: '/images/body.jpg' },
  { id: 'calm', name: 'Calm', color: 'from-green-500 to-emerald-700', textColor: 'text-white', bgImage: '/images/calm.jpg' },
  { id: 'chaos', name: 'Chaos', color: 'from-purple-500 to-purple-800', textColor: 'text-white', bgImage: '/images/chaos.jpg' },
  { id: 'fury', name: 'Fury', color: 'from-red-500 to-red-800', textColor: 'text-white', bgImage: '/images/fury.jpg' },
  { id: 'mind', name: 'Mind', color: 'from-blue-400 to-blue-700', textColor: 'text-white', bgImage: '/images/mind.jpg' },
  { id: 'order', name: 'Order', color: 'from-yellow-400 to-yellow-600', textColor: 'text-gray-900', bgImage: '/images/order.jpg' }
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
      <div className="min-h-screen bg-gray-900 text-white p-0 md:p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={goBack}
            className="mt-3 mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded mx-3"
          >
            Back to Selection
          </button>

          <div className="flex items-center justify-between mb-4 max-w-md mx-auto px-3">
            <button
              onClick={prevCard}
              className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg px-4 py-2 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              aria-label="Previous card"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="hidden sm:inline">Prev</span>
            </button>

            <p className="text-lg font-semibold">Card {currentCardIndex + 1} of {filteredCards.length}</p>

            <button
              onClick={nextCard}
              className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg px-4 py-2 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              aria-label="Next card"
            >
              <span className="hidden sm:inline">Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center px-3">
            <div className="relative max-w-md w-full">
              <img
                src={currentCard.cardImage.url}
                alt={currentCard.name}
                className="w-full rounded-lg shadow-2xl"
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
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6 max-w-md mx-auto px-3">
            <button
              onClick={prevCard}
              className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl px-6 py-3 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg font-semibold flex-1"
              aria-label="Previous card"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span>Previous</span>
            </button>

            <button
              onClick={nextCard}
              className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl px-6 py-3 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg font-semibold flex-1"
              aria-label="Next card"
            >
              <span>Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-3 py-6">
      <h1 className="text-4xl font-bold text-center mb-8">Riftbound Card Learner</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Select a Set</h2>
          <div className="flex flex-col md:flex-row gap-3">
            {SETS.map(set => (
              <button
                key={set.id}
                onClick={() => setSelectedSet(set.id)}
                className={`p-4 rounded-xl font-bold text-lg transition-all shadow-lg md:flex-1 relative overflow-hidden ${
                  selectedSet === set.id
                    ? 'ring-4 ring-blue-400 shadow-2xl'
                    : 'hover:shadow-xl'
                }`}
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${set.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: set.bgPosition
                }}
              >
                <span className="relative z-10" style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9)' }}>{set.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Select a Domain (Color)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DOMAINS.map(domain => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`p-4 rounded-xl font-bold text-lg transition-all shadow-lg relative overflow-hidden ${
                  selectedDomain === domain.id
                    ? 'ring-4 ring-white shadow-2xl'
                    : 'hover:shadow-xl'
                }`}
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${domain.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 35%'
                }}
              >
                <span className="relative z-10 text-white" style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9)' }}>{domain.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={startLearning}
            disabled={!selectedSet || !selectedDomain}
            className={`w-full px-8 py-4 text-xl font-bold rounded-lg transition ${
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
