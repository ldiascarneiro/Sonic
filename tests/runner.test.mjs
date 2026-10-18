import test from 'node:test';
import assert from 'node:assert/strict';
import {newRace, advance, steer, jump, nextSegment, SEGMENT_SECONDS, JUMP_SECONDS} from '../frontend/static/runner-core.mjs';

test('pulo evita troncos e passa por anéis sem coletar nem perder pontos', () => {
  const state = newRace();
  state.score = 30; state.rings = 3;
  state.objects = ['log', 'ring'].map(kind => ({kind, lane: 1, progress: .85}));
  assert.equal(jump(state), true);
  assert.deepEqual(advance(state, .05), []);
  assert.equal(state.slow, 0);
  assert.equal(state.score, 30); assert.equal(state.rings, 3);
  assert.ok(state.objects.every(item => item.resolved && !item.collected));
  for (let i = 0; i < 25; i++) advance(state, .05);
  assert.equal(state.jumpRemaining, 0);
  state.objects = [{kind: 'ring', lane: 1, progress: .85}];
  assert.deepEqual(advance(state, .05), ['ring']);
});
test('não há pulo duplo; pausa de quiz congela salto e novo trecho pousa', () => {
  const state = newRace(); jump(state); advance(state, .05);
  const remaining = state.jumpRemaining;
  assert.equal(jump(state), false);
  assert.equal(state.jumpRemaining, remaining);
  steer(state, -1); assert.equal(state.lane, 0);
  state.checkpoint = true;
  advance(state, .05); assert.equal(state.jumpRemaining, remaining);
  assert.equal(jump(state), false);
  nextSegment(state); assert.equal(state.jumpRemaining, 0);
  assert.equal(jump(state), true);
});
test('pulo tem duração igual em 30 e 60 FPS e considera instante do pouso', () => {
  for (const fps of [30, 60]) {
    const state = newRace(); jump(state);
    for (let i = 0; i < fps * (JUMP_SECONDS + .1); i++) advance(state, 1 / fps);
    assert.equal(state.jumpRemaining, 0);
  }
  const beforeLanding = newRace(); beforeLanding.jumpRemaining = .045;
  beforeLanding.objects = [{kind: 'log', lane: 1, progress: .85}];
  assert.deepEqual(advance(beforeLanding, .05), []);
  const afterLanding = newRace(); afterLanding.jumpRemaining = .01;
  afterLanding.objects = [{kind: 'log', lane: 1, progress: .85}];
  assert.deepEqual(advance(afterLanding, .05), ['bump']);
});

test('setas trocam de faixa sem sair da pista', () => {
  const state = newRace();
  steer(state, -1); assert.equal(state.lane, 0);
  steer(state, -1); assert.equal(state.lane, 0);
  steer(state, 1); steer(state, 1); steer(state, 1);
  assert.equal(state.lane, 2);
});
test('anel só é coletado na mesma faixa e pontua uma única vez', () => {
  const state = newRace();
  state.objects = [{kind: 'ring', lane: 1, progress: .85}, {kind: 'ring', lane: 0, progress: .85}];
  assert.deepEqual(advance(state, .05), ['ring']);
  advance(state, .05);
  assert.equal(state.rings, 1); assert.equal(state.score, 10);
});
test('desviar evita colisão; tronco desacelera sem tirar pontos', () => {
  const state = newRace();
  state.score = 30; state.rings = 3;
  state.objects = [{kind: 'log', lane: 1, progress: .85}];
  steer(state, -1);
  assert.deepEqual(advance(state, .05), []);
  state.objects = [{kind: 'log', lane: 0, progress: .85}];
  assert.deepEqual(advance(state, .05), ['bump']);
  assert.ok(state.slow > 0);
  assert.equal(state.score, 30); assert.equal(state.rings, 3);
});
test('quiz congela simulação e continuar preserva pontuação', () => {
  const state = newRace();
  state.elapsed = SEGMENT_SECONDS - .01; state.score = 40; state.rings = 4;
  assert.deepEqual(advance(state, .05), ['checkpoint']);
  const saved = structuredClone(state);
  advance(state, .05); assert.deepEqual(state, saved);
  nextSegment(state);
  assert.equal(state.checkpoint, false); assert.equal(state.elapsed, 0);
  assert.equal(state.score, 40); assert.equal(state.rings, 4);
});
test('progressão é independente da taxa de quadros e tolera travamentos', () => {
  const low = newRace(), high = newRace();
  for (let i = 0; i < 240; i++) advance(low, 1/30);
  for (let i = 0; i < 480; i++) advance(high, 1/60);
  assert.equal(low.rings, high.rings);
  assert.ok(Math.abs(low.elapsed - high.elapsed) < .05);
  const before = high.elapsed; advance(high, 20);
  assert.ok(high.elapsed - before <= .051);
});
test('cada fileira tem um caminho livre e anel fora da faixa do tronco', () => {
  const state = newRace();
  for (let row = 0; row < 6; row++) {
    state.objects = [];
    state.elapsed = state.spawnAt;
    advance(state, .01);
    assert.equal(state.objects.length, 2);
    assert.notEqual(state.objects[0].lane, state.objects[1].lane);
    assert.deepEqual(state.objects.map(item => item.kind), ['log', 'ring']);
  }
});
