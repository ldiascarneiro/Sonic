import {newRace, steer, jump, JUMP_SECONDS, advance, nextSegment} from './runner-core.mjs?v=3';
import {drawSonicRunner, drawSonicBall, drawSonicCheer} from './sonic-runner.mjs?v=8';
import {GameAudio} from './game-audio.mjs';

const root = document.querySelector('#runner-game');
const canvas = document.querySelector('#race');
const ctx = canvas.getContext('2d');
const state = newRace();
const $ = selector => document.querySelector(selector);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let phase = 'ready';
let step = Number(root.dataset.step);
let previous = 0;
const audio = new GameAudio();
let spokenQuestion = false;
let celebrationTime = 0;
let nextQuiz = '';
let complete = false;
let visualLane = state.lane;
let visualLean = 0;

function controls() {
  $('#left').disabled = $('#right').disabled = phase !== 'running';
  $('#jump').disabled = phase !== 'running';
  $('#pause').disabled = !['running', 'paused'].includes(phase);
  $('#pause').textContent = phase === 'paused' ? '▶ Continuar' : 'Ⅱ Pausar';
}
function hud() {
  $('#ring-count').textContent = state.rings;
  $('#score').textContent = state.score;
  $('#discoveries').textContent = step;
}
function focusRace() { canvas.focus({preventScroll: true}); }
function move(direction) {
  if (phase === 'running') steer(state, direction);
}
function leap() {
  if (phase === 'running' && jump(state)) {
    $('#race-status').textContent = 'Sonic pulou! Passa por cima dos troncos e dos anéis.';
  }
}
function pause() {
  if (phase !== 'running') return;
  phase = 'paused';
  $('#paused').hidden = false;
  audio.stop();
  controls();
  $('#resume').focus({preventScroll: true});
}
function resume() {
  if (phase !== 'paused') return;
  audio.unlock();
  phase = 'running';
  $('#paused').hidden = true;
  controls();
  focusRace();
}
$('#pause').addEventListener('click', () => phase === 'paused' ? resume() : pause());
$('#resume').addEventListener('click', resume);
$('#left').addEventListener('click', () => move(-1));
$('#right').addEventListener('click', () => move(1));
$('#jump').addEventListener('click', leap);
document.addEventListener('keydown', event => {
  // Preserva Espaço para ativar botões e links focados pelo teclado.
  if (phase === 'running' && (event.code === 'Space' || event.key === 'ArrowUp') &&
      !event.target.closest('button, a, input, textarea, select, [contenteditable]')) {
    event.preventDefault();
    if (!event.repeat) leap();
  }
  if (phase === 'running' && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    if (!event.repeat) move(event.key === 'ArrowLeft' ? -1 : 1);
  }
  if (event.key === 'Escape') pause();
});
function leaveGame() { pause(); audio.stop(); }
document.addEventListener('visibilitychange', () => {
  if (document.hidden) leaveGame();
  else if (phase === 'quiz') readQuiz();
});
window.addEventListener('blur', leaveGame);
window.addEventListener('pagehide', () => audio.stop());

function voiceSetup() {
  const button = $('#listen');
  if (button) { button.hidden = false; button.disabled = !audio.enabled || !audio.voice(); }
  const notice = $('#voice-notice');
  notice.hidden = !audio.enabled || !!audio.voice();
  notice.textContent = 'Não há voz local em português disponível. Um adulto precisa ativar uma voz em português no dispositivo para ouvir as perguntas.';
}
function readQuiz(prefix = '') {
  if (phase !== 'quiz' || document.hidden) return;
  const numbers = [...document.querySelectorAll('#answers .number-choice')].map(el => el.textContent.trim());
  const choices = numbers.length ? ` As opções são: ${numbers.join(', ')}.` : '';
  spokenQuestion = audio.speak(prefix + ($('#instruction').dataset.speech || $('#instruction').textContent) + choices);
}
function soundLabel() {
  $('#sound-toggle').textContent = audio.enabled ? '🔊 Som ligado' : '🔇 Som desligado';
  $('#sound-toggle').setAttribute('aria-pressed', String(audio.enabled));
  $('#sound-toggle').setAttribute('aria-label', audio.enabled ? 'Desligar o som' : 'Ligar o som');
  voiceSetup();
}
audio.onSpeechError = () => {
  $('#voice-notice').hidden = false;
  $('#voice-notice').textContent = 'Toque em “Ouvir a pergunta” para tentar ouvir novamente.';
};
$('#sound-toggle').addEventListener('click', () => {
  audio.setEnabled(!audio.enabled);
  soundLabel();
  if (audio.enabled && phase === 'quiz') readQuiz();
  if (audio.enabled && phase === 'answered') audio.speak('Muito bem! Você acertou! Toque em continuar.');
});
window.speechSynthesis?.addEventListener('voiceschanged', () => {
  voiceSetup();
  if (!spokenQuestion) readQuiz();
});
$('#quiz-content').addEventListener('click', event => {
  if (event.target.closest('#listen')) { audio.unlock(); readQuiz(); }
});
$('#quiz-content').addEventListener('submit', async event => {
  event.preventDefault();
  if (phase !== 'quiz' || !event.submitter) return;
  const form = event.target;
  const body = new URLSearchParams(new FormData(form));
  body.set('choice', event.submitter.value);
  const fieldset = form.querySelector('fieldset');
  fieldset.disabled = true;
  phase = 'saving';
  audio.stop();
  $('#quiz-feedback').textContent = 'Vamos conferir…';
  try {
    const response = await fetch(form.action, {method: 'POST', body, headers: {'Accept': 'application/json'}, signal: AbortSignal.timeout(10000)});
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('unavailable');
    const result = await response.json();
    audio.stop();
    $('#quiz-feedback').textContent = result.game.feedback;
    if (result.game.step > step) {
      step = result.game.step;
      state.score += 25;
      hud();
      phase = 'answered';
      celebrationTime = 0;
      $('#quiz-content').hidden = true;
      $('#sonic-cheer').hidden = false;
      $('#voice-notice').hidden = true;
      audio.speak('Muito bem! Você acertou! Toque em continuar.');
      complete = result.game.complete;
      nextQuiz = result.quiz_html;
      $('#continue-run').hidden = false;
      $('#continue-run').textContent = complete ? 'Ver minha aventura ★' : 'Continuar correndo →';
      $('#continue-run').focus({preventScroll: true});
    } else {
      // Fragmento produzido pelo próprio Flask, com escape Jinja e mesma origem.
      $('#quiz-content').replaceChildren(...new DOMParser().parseFromString(result.quiz_html, 'text/html').body.childNodes);
      phase = 'quiz';
      voiceSetup();
      readQuiz('Vamos tentar de novo! ');
      $('#instruction').focus({preventScroll: true});
    }
  } catch {
    phase = 'quiz';
    fieldset.disabled = false;
    $('#quiz-feedback').textContent = 'Não conseguimos conferir agora. Tente tocar novamente. Se a aventura expirou, volte ao início.';
    audio.speak('Não conseguimos conferir agora. Tente de novo.');
  }
});
$('#continue-run').addEventListener('click', () => {
  audio.stop();
  audio.unlock();
  $('#sonic-cheer').hidden = true;
  $('#quiz-content').hidden = false;
  $('#checkpoint').hidden = true;
  if (complete) {
    phase = 'finished';
    $('#finished').hidden = false;
    $('#final-score').textContent = `${state.rings} anéis e ${state.score} pontos nesta corrida!`;
    $('#finished a').focus({preventScroll: true});
    audio.speak('Você conseguiu! Agora vamos beber água e descansar um pouquinho.');
  } else {
    $('#quiz-content').replaceChildren(...new DOMParser().parseFromString(nextQuiz, 'text/html').body.childNodes);
    $('#continue-run').hidden = true;
    $('#quiz-feedback').textContent = '';
    nextSegment(state);
    phase = 'running';
    voiceSetup();
    focusRace();
  }
  controls();
});
$('#start-run').disabled = false;
$('#start-run').textContent = '▶ Correr!';
$('#start-run').addEventListener('click', () => {
  audio.unlock();
  audio.speak('Vamos correr! Pegue os anéis e desvie dos troncos usando as setinhas.');
  phase = 'running';
  $('#ready').hidden = true;
  controls();
  focusRace();
});

function ellipse(x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function polygon(points, color) {
  ctx.fillStyle = color; ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); ctx.fill();
}
function project(lane, progress) {
  const p = Math.max(0, progress);
  return {x: 450 + (lane - 1) * (60 + p * 230), y: 145 + p * 390, size: 0.25 + p * 0.95};
}
function draw() {
  ctx.clearRect(0, 0, 900, 560);
  ctx.fillStyle = '#d8f2ff'; ctx.fillRect(0, 0, 900, 560);
  ellipse(756, 65, 38, 38, '#ffdf7b');
  ellipse(145, 77, 64, 20, '#fff'); ellipse(182, 64, 37, 27, '#fff');
  ellipse(630, 108, 48, 16, '#fff');
  ellipse(120, 205, 340, 95, '#86cba4'); ellipse(740, 205, 320, 105, '#67b88f');
  ctx.fillStyle = '#79bc70'; ctx.fillRect(0, 170, 900, 390);
  polygon([[342,145],[558,145],[895,560],[5,560]], '#d9bb8b');
  polygon([[342,145],[352,145],[34,560],[5,560]], '#fff0bb');
  polygon([[548,145],[558,145],[895,560],[866,560]], '#fff0bb');
  for (const x of [414,486]) {
    ctx.strokeStyle = '#f8e7c2'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x,145); ctx.lineTo(x === 414 ? 300 : 600,560); ctx.stroke();
  }
  // Movimento reduzido remove o cenário animado, preservando os objetos do jogo.
  if (!reduced.matches) {
    for (let row = 0; row < 8; row++) {
      const p = ((row / 8 + state.elapsed * 0.16) % 1);
      const y = 155 + p * 400;
      ellipse(290 - p * 280, y, 8 + p * 8, 4 + p * 4, '#d2eaa0');
      ellipse(610 + p * 280, y, 8 + p * 8, 4 + p * 4, '#d2eaa0');
    }
  }
  for (const object of [...state.objects].sort((a,b) => a.progress - b.progress)) {
    const {x,y,size} = project(object.lane, object.progress);
    ellipse(x,y + 10 * size,27 * size,8 * size,'#967e5e55');
    if (object.kind === 'ring') {
      ctx.strokeStyle = '#cf8b13'; ctx.lineWidth = 10 * size;
      ctx.beginPath(); ctx.ellipse(x,y - 21 * size,18 * size,26 * size,0,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#ffdb45'; ctx.lineWidth = 6 * size; ctx.stroke();
    } else {
      ctx.fillStyle = '#985c39'; ctx.fillRect(x-40*size,y-30*size,80*size,35*size);
      ellipse(x-40*size,y-12*size,12*size,18*size,'#bd8150');
      ellipse(x+40*size,y-12*size,12*size,18*size,'#efc68d');
      ellipse(x+40*size,y-12*size,6*size,10*size,'#ba854d');
      ctx.strokeStyle = '#70492e'; ctx.lineWidth = 3*size;
      ctx.beginPath(); ctx.moveTo(x-25*size,y-20*size); ctx.lineTo(x+25*size,y-20*size); ctx.stroke();
    }
  }
  const player = project(visualLane, 0.86);
  if (state.jumpRemaining > 0) {
    drawSonicBall(ctx, {x: player.x, ground: 490,
      progress: 1 - state.jumpRemaining / JUMP_SECONDS, reduced: reduced.matches});
  } else {
    drawSonicRunner(ctx, {x: player.x, ground: 490, time: state.elapsed,
      lean: visualLean, reduced: reduced.matches});
  }
  if (state.slow > 0) {
    ctx.fillStyle = '#17294c'; ctx.font = 'bold 23px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Opa! Vamos com calma.',450,45);
  }
}
function frame(timestamp) {
  const dt = previous ? (timestamp - previous)/1000 : 0;
  previous = timestamp;
  if (phase === 'running') {
    for (const event of advance(state, dt)) {
      if (event === 'ring') { $('#race-status').textContent = 'Mais um anel! +10 pontos'; audio.ring(); }
      if (event === 'bump') $('#race-status').textContent = 'Opa, um tronco! Desvie com ← ou →. Seus anéis continuam com você.';
      if (event === 'checkpoint') {
        phase = 'quiz';
        $('#checkpoint').hidden = false;
        $('#instruction').focus({preventScroll: true});
        controls();
        spokenQuestion = false;
        voiceSetup();
        readQuiz();
      }
    }
    hud();
    // Interpolação visual curta; a faixa lógica continua respondendo imediatamente.
    const smoothing = 1 - Math.exp(-24 * Math.min(dt, .05));
    const offset = state.lane - visualLane;
    visualLean += (Math.max(-.22, Math.min(.22, offset * .32)) - visualLean) * smoothing;
    visualLane += offset * smoothing;
    if (reduced.matches) { visualLane = state.lane; visualLean = 0; }
  }
  draw();
  if (phase === 'answered') {
    if (!document.hidden && document.hasFocus()) celebrationTime += Math.min(dt, .05);
    const cheer = $('#sonic-cheer');
    drawSonicCheer(cheer.getContext('2d'), celebrationTime, reduced.matches);
  }
  requestAnimationFrame(frame);
}
soundLabel();
controls();
requestAnimationFrame(frame);
