export type Cue = 'start' | 'shot' | 'hit' | 'hurt' | 'coin' | 'door' | 'chest' | 'dash' | 'pulse' | 'win' | 'lose';

const NOTES: Record<Cue, [number, number, number, OscillatorType]> = {
  start: [440, 660, 0.18, 'sine'], shot: [620, 290, 0.065, 'triangle'],
  hit: [210, 95, 0.085, 'sawtooth'], hurt: [170, 65, 0.26, 'sawtooth'],
  coin: [700, 1050, 0.13, 'sine'], door: [330, 540, 0.22, 'triangle'],
  chest: [470, 940, 0.32, 'sine'], dash: [380, 850, 0.14, 'triangle'],
  pulse: [160, 700, 0.4, 'sine'], win: [520, 1040, 0.55, 'sine'],
  lose: [300, 100, 0.5, 'triangle'],
};
const MIN_GAP: Partial<Record<Cue, number>> = { shot: 0.11, hit: 0.12, coin: 0.09 };

/** Small synthesized cues, made in code so the project has no borrowed audio. */
export class Soundscape {
  private context?: AudioContext;
  private master?: GainNode;
  private lastCue = new Map<Cue, number>();
  muted = false;

  unlock(): void {
    if (this.muted) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = 0.8;
        this.master.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') void this.context.resume();
    } catch { /* Browser without Web Audio stays silent. */ }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!muted) this.unlock();
    if (this.context && this.master) this.master.gain.setTargetAtTime(muted ? 0 : 0.8, this.context.currentTime, 0.012);
  }

  play(cue: Cue): void {
    if (this.muted || !this.context || !this.master) return;
    if (this.context.state === 'suspended') {
      void this.context.resume().then(() => this.play(cue)).catch(() => undefined);
      return;
    }
    if (this.context.state !== 'running') return;
    const [from, to, duration, shape] = NOTES[cue];
    const now = this.context.currentTime;
    if (now - (this.lastCue.get(cue) ?? -Infinity) < (MIN_GAP[cue] ?? 0)) return;
    this.lastCue.set(cue, now);
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = shape;
    oscillator.frequency.setValueAtTime(from, now);
    oscillator.frequency.exponentialRampToValueAtTime(to, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(cue === 'hurt' || cue === 'win' ? 0.075 : 0.045, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
}
