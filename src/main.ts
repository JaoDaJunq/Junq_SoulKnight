import Phaser from 'phaser';
import './style.css';
import { ArenaScene } from './scenes/ArenaScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#10182b',
  render: { pixelArt: true, antialias: false },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 3 },
  scene: [ArenaScene],
});

game.events.once(Phaser.Core.Events.READY, () => {
  game.canvas.tabIndex = 0;
  game.canvas.setAttribute('aria-label', 'Arena do jogo. Use WASD para mover, clique para atirar, Espaço para desviar e Escape para pausar.');
  game.canvas.addEventListener('pointerdown', () => game.canvas.focus());
  window.addEventListener('resize', () => game.scale.refresh());
  document.addEventListener('fullscreenchange', () => game.scale.refresh());
});
