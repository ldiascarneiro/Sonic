import test from 'node:test';
import assert from 'node:assert/strict';
import {GameAudio} from '../frontend/static/game-audio.mjs';

function device() {
  const spoken = [], notes = [], store = new Map();
  let cancels = 0;
  const host = {
    localStorage: {getItem: k => store.get(k), setItem: (k,v) => store.set(k,v)},
    speechSynthesis: {getVoices: () => [{localService:true,lang:'pt-BR'}], cancel: () => cancels++, speak: u => spoken.push(u)},
    SpeechSynthesisUtterance: class {constructor(text) {this.text = text;}},
    AudioContext: class {
      state = 'running'; currentTime = 0; destination = {};
      resume() { return Promise.resolve(); }
      createOscillator() {
        const note = {frequency:{},connect(){},disconnect(){},start(){this.started=true;},stop(){this.stops=(this.stops??0)+1;}};
        notes.push(note); return note;
      }
      createGain() {return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
    },
  };
  return {host, spoken, notes, store, cancels: () => cancels};
}
test('voz e efeitos começam somente após gesto do jogador', () => {
  const d=device(), sound=new GameAudio(d.host);
  assert.equal(sound.speak('Pergunta'),false); sound.ring();
  assert.equal(d.notes.length,0);
  sound.unlock(); sound.ring(); assert.equal(d.notes.length,2);
  assert.equal(sound.speak('Encontre azul'),true);
  assert.equal(d.spoken[0].text,'Encontre azul'); assert.equal(d.spoken[0].lang,'pt-BR');
});
test('desligar interrompe voz e notas e bloqueia novos sons; ligar restaura', () => {
  const d=device(), sound=new GameAudio(d.host);
  sound.unlock(); sound.ring(); sound.speak('Pergunta');
  sound.setEnabled(false);
  assert.ok(d.cancels()>0); assert.ok(d.notes.every(n=>n.stops===2));
  sound.ring(); assert.equal(sound.speak('Outra pergunta'),false);
  assert.equal(d.notes.length,2); assert.equal(d.spoken.length,1);
  assert.equal(new GameAudio(d.host).enabled,false);
  sound.setEnabled(true); sound.speak('Repetir pergunta'); assert.equal(d.spoken.length,2);
});
test('não utiliza vozes remotas ou de outro idioma', () => {
  const d=device(); d.host.speechSynthesis.getVoices=()=>[{localService:false,lang:'pt-BR'},{localService:true,lang:'en-US'}];
  const sound=new GameAudio(d.host); sound.unlock();
  assert.equal(sound.speak('Pergunta'),false); assert.equal(d.spoken.length,0);
});
test('continua funcionando sem APIs de áudio ou armazenamento', () => {
  const sound=new GameAudio({localStorage:{getItem(){throw Error();},setItem(){throw Error();}}});
  sound.unlock(); sound.ring(); assert.equal(sound.speak('Pergunta'),false);
  sound.setEnabled(false); sound.stop();
});
