import AuthGate from './AuthGate'
import GameSession from './GameSession'

export default function GameTracker({ onBack }) {
  return (
    <AuthGate onBack={onBack}>
      <GameSession onBack={onBack} />
    </AuthGate>
  )
}
