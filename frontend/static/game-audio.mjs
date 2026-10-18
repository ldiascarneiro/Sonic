// Áudio gerado no dispositivo: sem downloads, microfone ou serviços externos.
export class GameAudio {
  constructor(host = window) {
    this.host = host;
    this.enabled = true;
    try { this.enabled = host.localStorage.getItem('sonic-sound') !== 'off'; } catch {}
    this.context = null;
    this.active = new Set();
    this.unlocked = false;
    this.onSpeechError = () => {};
  }
  voice() {
    const voices = this.host.speechSynthesis?.getVoices() ?? [];
    return voices.find(v => v.localService && /^pt-BR$/i.test(v.lang))
      ?? voices.find(v => v.localService && /^pt[-_]/i.test(v.lang));
  }
  unlock() {
    this.unlocked = true;
    if (!this.enabled) return;
    try {
      const AudioContext = this.host.AudioContext ?? this.host.webkitAudioContext;
      if (!this.context && AudioContext) this.context = new AudioContext();
      this.context?.resume()?.catch(() => {});
    } catch { /* O jogo continua se o dispositivo não tiver saída de áudio. */ }
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    try { this.host.localStorage.setItem('sonic-sound', enabled ? 'on' : 'off'); } catch {}
    if (!enabled) this.stop();
    else this.unlock();
  }
  stop() {
    this.host.speechSynthesis?.cancel();
    for (const oscillator of this.active) {
      try { oscillator.stop(); } catch {}
    }
    this.active.clear();
  }
  speak(text) {
    if (!this.enabled || !this.unlocked || !this.voice()) return false;
    this.host.speechSynthesis.cancel();
    const utterance = new this.host.SpeechSynthesisUtterance(text);
    utterance.voice = this.voice();
    utterance.lang = utterance.voice.lang;
    utterance.rate = .85;
    utterance.volume = .85;
    utterance.onerror = event => {
      if (!['interrupted', 'canceled'].includes(event.error)) this.onSpeechError();
    };
    this.host.speechSynthesis.speak(utterance);
    return true;
  }
  ring() {
    if (!this.enabled || !this.unlocked || this.context?.state !== 'running') return;
    // Duas notas curtas e suaves, criadas com osciladores; não é áudio dos jogos.
    for (const [offset, frequency] of [[0, 880], [.075, 1320]]) {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const start = this.context.currentTime + offset;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.09, start + .008);
      gain.gain.exponentialRampToValueAtTime(.001, start + .17);
      oscillator.connect(gain); gain.connect(this.context.destination);
      this.active.add(oscillator);
      oscillator.onended = () => { this.active.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + .19);
    }
  }
}
