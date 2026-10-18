// Simulação sem DOM, testável. Pontos são recreativos e locais, sem ranking.
export const SEGMENT_SECONDS = 18;
export const JUMP_SECONDS = 1;
export function jump(state) {
  if (state.checkpoint || state.jumpRemaining > 0) return false;
  state.jumpRemaining = JUMP_SECONDS;
  return true;
}
export function newRace() {
  return {lane: 1, elapsed: 0, spawnAt: 0.8, objects: [], rings: 0, score: 0, slow: 0, row: 0, checkpoint: false, jumpRemaining: 0};
}
export function steer(state, direction) {
  state.lane = Math.max(0, Math.min(2, state.lane + direction));
}
export function nextSegment(state) {
  state.elapsed = 0;
  state.spawnAt = 0.8;
  state.objects = [];
  state.slow = 0;
  state.jumpRemaining = 0;
  state.checkpoint = false;
}
export function advance(state, dt) {
  if (state.checkpoint) return [];
  const events = [];
  // Uma aba travada não teletransporta objetos nem causa colisões inesperadas.
  dt = Math.max(0, Math.min(dt, 0.05));
  state.slow = Math.max(0, state.slow - dt);
  const travel = dt * (state.slow > 0 ? 0.45 : 1);
  state.elapsed += travel;
  if (state.elapsed >= SEGMENT_SECONDS) {
    state.checkpoint = true;
    return ['checkpoint'];
  }
  if (state.elapsed >= state.spawnAt && state.elapsed < SEGMENT_SECONDS - 4.5) {
    const obstacle = [0, 2, 1, 0, 1, 2][state.row % 6];
    const ringLane = [1, 1, 2, 2, 0, 0][state.row % 6];
    state.objects.push({kind: 'log', lane: obstacle, progress: 0});
    state.objects.push({kind: 'ring', lane: ringLane, progress: 0});
    state.spawnAt += 1.8;
    state.row += 1;
  }
  for (const item of state.objects) {
    const before = item.progress;
    item.progress += travel / 4.2;
    if (!item.resolved && before < 0.86 && item.progress >= 0.86) {
      item.resolved = true;
      // Usa o instante da passagem, inclusive quando o pouso ocorre neste quadro.
      const crossingTime = dt * (0.86 - before) / (item.progress - before);
      const airborne = state.jumpRemaining > crossingTime;
      if (item.lane === state.lane && !airborne) {
        item.collected = true;
        if (item.kind === 'ring') {
          state.rings += 1;
          state.score += 10;
          events.push('ring');
        } else {
          state.slow = 1.2;
          events.push('bump');
        }
      }
    }
  }
  state.objects = state.objects.filter(item => item.progress < 1.12 && !item.collected);
  state.jumpRemaining = Math.max(0, state.jumpRemaining - dt);
  return events;
}
