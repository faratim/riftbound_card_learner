export const STEPS = {
  PREGAME_LEGEND_MINE: 'pregame.legend_mine',
  PREGAME_LEGEND_THEIRS: 'pregame.legend_theirs',
  PREGAME_BF_MINE: 'pregame.bf_mine',
  PREGAME_BF_THEIRS: 'pregame.bf_theirs',
  PREGAME_BF_PROMPT: 'pregame.bf_prompt',
  PREGAME_SHUFFLE: 'pregame.shuffle',
  PREGAME_FIRST_PLAYER: 'pregame.first_player',
  PREGAME_WIN_THRESHOLD: 'pregame.win_threshold',

  MY_FIRST_CHECK_BF: 'turn1.my.check_bf',
  MY_FIRST_TWO_DROP: 'turn1.my.two_drop',
  MY_FIRST_GOALS: 'turn1.my.goals',

  THEIR_FIRST_TWO_DROP: 'turn1.their.two_drop',

  MY_AWAKEN: 'turn.my.awaken',
  MY_BEGINNING: 'turn.my.beginning',
  MY_CHANNEL: 'turn.my.channel',
  MY_DRAW: 'turn.my.draw',
  MY_ENERGY: 'turn.my.energy',
  MY_FAR: 'turn.my.far',
  MY_GUYS: 'turn.my.guys',
  MY_HAND: 'turn.my.hand',
  MY_GOALS: 'turn.my.goals',

  MY_SCORING: 'turn.my.scoring',
  THEIR_SCORING: 'turn.their.scoring',

  MY_POST_BF: 'turn.my.post.bf',
  MY_POST_THREATS: 'turn.my.post.threats',
  MY_POST_FINAL: 'turn.my.post.final',

  THEIR_HANDOFF: 'turn.their.handoff',

  FINISHED: 'finished',
}

const PREGAME_FLOW = [
  STEPS.PREGAME_LEGEND_MINE,
  STEPS.PREGAME_LEGEND_THEIRS,
  STEPS.PREGAME_BF_MINE,
  STEPS.PREGAME_BF_THEIRS,
  STEPS.PREGAME_SHUFFLE,
  STEPS.PREGAME_FIRST_PLAYER,
  STEPS.PREGAME_WIN_THRESHOLD,
]

const MY_FIRST_TURN_FLOW = [
  STEPS.MY_FIRST_CHECK_BF,
  STEPS.MY_FIRST_TWO_DROP,
  STEPS.MY_FIRST_GOALS,
  STEPS.MY_SCORING,
  STEPS.MY_POST_BF,
  STEPS.MY_POST_THREATS,
  STEPS.MY_POST_FINAL,
]

const THEIR_FIRST_TURN_FLOW = [
  STEPS.THEIR_FIRST_TWO_DROP,
  STEPS.THEIR_SCORING,
]

const MY_NORMAL_TURN_FLOW = [
  STEPS.MY_AWAKEN,
  STEPS.MY_BEGINNING,
  STEPS.MY_CHANNEL,
  STEPS.MY_DRAW,
  STEPS.MY_ENERGY,
  STEPS.MY_FAR,
  STEPS.MY_GUYS,
  STEPS.MY_HAND,
  STEPS.MY_GOALS,
  STEPS.MY_SCORING,
  STEPS.MY_POST_BF,
  STEPS.MY_POST_THREATS,
  STEPS.MY_POST_FINAL,
]

const THEIR_NORMAL_TURN_FLOW = [
  STEPS.THEIR_SCORING,
]

export function isPregameStep(step) {
  return PREGAME_FLOW.includes(step)
}

export function getCurrentFlow(state) {
  if (isPregameStep(state.current_step)) return PREGAME_FLOW
  const isFirstTurn = state.current_turn_number <= 2
  if (state.current_turn_player === 'me') {
    return isFirstTurn ? MY_FIRST_TURN_FLOW : MY_NORMAL_TURN_FLOW
  }
  return isFirstTurn ? THEIR_FIRST_TURN_FLOW : THEIR_NORMAL_TURN_FLOW
}

export function getNextStep(state) {
  const flow = getCurrentFlow(state)
  const idx = flow.indexOf(state.current_step)
  if (idx === -1) return state.current_step
  if (idx < flow.length - 1) return flow[idx + 1]

  // End of current flow → transition to next phase
  if (isPregameStep(state.current_step)) {
    return state.first_player === 'me'
      ? MY_FIRST_TURN_FLOW[0]
      : THEIR_FIRST_TURN_FLOW[0]
  }

  const nextPlayer = state.current_turn_player === 'me' ? 'them' : 'me'
  const nextTurnNumber = state.current_turn_number + 1
  const nextIsFirstTurn = nextTurnNumber <= 2

  if (nextPlayer === 'me') {
    return nextIsFirstTurn ? MY_FIRST_TURN_FLOW[0] : MY_NORMAL_TURN_FLOW[0]
  }
  return nextIsFirstTurn ? THEIR_FIRST_TURN_FLOW[0] : THEIR_NORMAL_TURN_FLOW[0]
}

export const initialState = {
  id: null,
  status: 'in_progress',
  current_step: STEPS.PREGAME_LEGEND_MINE,

  my_legend_card_id: null,
  their_legend_card_id: null,
  my_battlefield_card_id: null,
  their_battlefield_card_id: null,
  has_baron_pit: false,
  win_threshold: null,
  first_player: null,

  current_turn_number: 0,
  current_turn_player: null,
  current_turn_id: null,
  current_turn_two_drop: null,
  current_turn_scoring: {},

  my_score: 0,
  their_score: 0,
  scoring_events: [],

  step_history: [],
}

export function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return { ...initialState, ...(action.payload || {}) }

    case 'HYDRATE':
      return { ...state, ...action.payload }

    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }

    case 'SET_STEP':
      return { ...state, current_step: action.step }

    case 'ADVANCE': {
      const nextStep = getNextStep(state)
      const flow = getCurrentFlow(state)
      const wasLastStep = flow[flow.length - 1] === state.current_step
      const wasPregame = isPregameStep(state.current_step)

      const historyEntry = {
        current_step: state.current_step,
        current_turn_number: state.current_turn_number,
        current_turn_player: state.current_turn_player,
        current_turn_two_drop: state.current_turn_two_drop,
        current_turn_scoring: state.current_turn_scoring,
        current_turn_id: state.current_turn_id,
      }

      let next = {
        ...state,
        current_step: nextStep,
        step_history: [...(state.step_history || []), historyEntry],
      }

      if (wasLastStep && wasPregame) {
        next.current_turn_number = 1
        next.current_turn_player = state.first_player
        next.current_turn_two_drop = null
        next.current_turn_scoring = {}
        next.current_turn_id = null
      } else if (wasLastStep && !wasPregame) {
        next.current_turn_number = state.current_turn_number + 1
        next.current_turn_player = state.current_turn_player === 'me' ? 'them' : 'me'
        next.current_turn_two_drop = null
        next.current_turn_scoring = {}
        next.current_turn_id = null
      }
      return next
    }

    case 'BACK': {
      const history = state.step_history || []
      if (history.length === 0) return state
      const prev = history[history.length - 1]
      return {
        ...state,
        ...prev,
        step_history: history.slice(0, -1),
      }
    }

    case 'SET_TWO_DROP':
      return { ...state, current_turn_two_drop: action.value }

    case 'SET_TURN_SCORING_LOCAL':
      return {
        ...state,
        current_turn_scoring: {
          ...state.current_turn_scoring,
          [action.battlefield]: action.value,
        },
      }

    case 'ADD_BARON_PIT':
      return { ...state, has_baron_pit: true }

    case 'ADD_SCORING_EVENT': {
      const ev = action.event
      const events = [...state.scoring_events, ev]
      const my_score = ev.scorer === 'me' ? state.my_score + ev.points : state.my_score
      const their_score = ev.scorer === 'them' ? state.their_score + ev.points : state.their_score
      return { ...state, scoring_events: events, my_score, their_score }
    }

    case 'REPLACE_SCORING_EVENT': {
      // Used when an event is updated (same id). Removes the existing event by id and adds new.
      const { event } = action
      const filtered = state.scoring_events.filter(e => e.id !== event.id)
      return recomputeWithEvents(state, [...filtered, event])
    }

    case 'REMOVE_SCORING_EVENT': {
      const { id } = action
      const filtered = state.scoring_events.filter(e => e.id !== id)
      return recomputeWithEvents(state, filtered)
    }

    case 'SET_GAME_ID':
      return { ...state, id: action.id }

    case 'SET_TURN_ID':
      return { ...state, current_turn_id: action.id }

    case 'FINISH_GAME':
      return { ...state, status: 'finished' }

    default:
      return state
  }
}

export function isFirstRoundDone(state) {
  // Finish Game button shows after both opening turns are done — i.e. once we're on turn 3 or later.
  return state.current_turn_number >= 3
}

// Each player has their own count: 1st mover's turn N = global turns 2N-1, 2nd mover's turn N = global turns 2N.
// Returns the current_turn_player's per-player turn number (e.g. "your turn 2", "their turn 1").
export function getCurrentPlayerTurnNumber(state) {
  const t = state.current_turn_number
  if (t <= 0 || !state.first_player) return 0
  if (state.current_turn_player === state.first_player) {
    return Math.ceil(t / 2)
  }
  return Math.floor(t / 2)
}

function recomputeWithEvents(state, events) {
  let my_score = 0, their_score = 0
  for (const e of events) {
    if (e.scorer === 'me') my_score += e.points
    else if (e.scorer === 'them') their_score += e.points
  }
  return { ...state, scoring_events: events, my_score, their_score }
}

export function getCurrentTurnSelection(state, battlefield, scorer) {
  return state.scoring_events.find(e =>
    e.turn_id === state.current_turn_id &&
    e.battlefield === battlefield &&
    e.scorer === scorer
  ) || null
}
