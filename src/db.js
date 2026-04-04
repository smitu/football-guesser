import { supabase } from "./supabase";

// ─── SAVE GAME RESULT ───
export async function saveGameResult(userId, gameMode, totalScore, roundsPlayed, roundsCorrect, details = []) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("game_results")
    .insert({
      user_id: userId,
      game_mode: gameMode,
      total_score: totalScore,
      rounds_played: roundsPlayed,
      rounds_correct: roundsCorrect,
      details,
    })
    .select()
    .single();
  if (error) console.error("saveGameResult error:", error);
  return data;
}

// ─── GET LEADERBOARD ───
export async function getLeaderboard(gameMode, limit = 10) {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("game_mode", gameMode)
    .order("best_score", { ascending: false })
    .limit(limit);
  if (error) console.error("getLeaderboard error:", error);
  return data || [];
}

// ─── GET USER GAME HISTORY ───
export async function getUserHistory(userId, gameMode = null, limit = 20) {
  if (!userId) return [];
  let query = supabase
    .from("game_results")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(limit);
  if (gameMode) query = query.eq("game_mode", gameMode);
  const { data, error } = await query;
  if (error) console.error("getUserHistory error:", error);
  return data || [];
}

// ─── UPDATE LEARN PROGRESS ───
export async function updateLearnProgress(userId, category, answered, correct, streak) {
  if (!userId) return null;
  const { data: existing } = await supabase
    .from("learn_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("learn_progress")
      .update({
        questions_answered: existing.questions_answered + answered,
        questions_correct: existing.questions_correct + correct,
        best_streak: Math.max(existing.best_streak, streak),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) console.error("updateLearnProgress error:", error);
    return data;
  } else {
    const { data, error } = await supabase
      .from("learn_progress")
      .insert({
        user_id: userId,
        category,
        questions_answered: answered,
        questions_correct: correct,
        best_streak: streak,
      })
      .select()
      .single();
    if (error) console.error("updateLearnProgress error:", error);
    return data;
  }
}

// ─── GET LEARN PROGRESS ───
export async function getLearnProgress(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("learn_progress")
    .select("*")
    .eq("user_id", userId);
  if (error) console.error("getLearnProgress error:", error);
  return data || [];
}

// ─── GET USER STATS ───
export async function getUserStats(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) console.error("getUserStats error:", error);
  return data;
}
