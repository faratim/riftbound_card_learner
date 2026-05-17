import { supabase } from '../lib/supabase'

export async function createGame(payload) {
  const { data, error } = await supabase
    .from('games')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGame(id, patch) {
  const { error } = await supabase.from('games').update(patch).eq('id', id)
  if (error) throw error
}

export async function createTurn(game_id, turn_number, player) {
  const { data, error } = await supabase
    .from('game_turns')
    .insert({ game_id, turn_number, player })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTurn(id, patch) {
  const { error } = await supabase.from('game_turns').update(patch).eq('id', id)
  if (error) throw error
}

export async function addScoringEvent(event) {
  const { data, error } = await supabase
    .from('scoring_events')
    .insert(event)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateScoringEvent(id, patch) {
  const { data, error } = await supabase
    .from('scoring_events')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteScoringEvent(id) {
  const { error } = await supabase.from('scoring_events').delete().eq('id', id)
  if (error) throw error
}

export async function loadInProgressGame(user_id) {
  const { data, error } = await supabase
    .from('games')
    .select('*, game_turns(*), scoring_events(*)')
    .eq('user_id', user_id)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function abandonGame(id) {
  return updateGame(id, {
    status: 'abandoned',
    ended_at: new Date().toISOString(),
  })
}

export async function finishGame(id, result) {
  return updateGame(id, {
    status: 'finished',
    result,
    ended_at: new Date().toISOString(),
  })
}
