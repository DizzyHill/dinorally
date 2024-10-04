import Collidable from './collidable.js';

export default class MysteryBox extends Collidable {
  constructor(x, y, speed, currentLane, preloadedImages, collectSound) {
    super(x, y, 90, 90, speed, currentLane); // Adjust width and height as needed
    this.image = preloadedImages;
    this.collectSound = collectSound;
    this.collectSound.volume = 0.7;  // Set volume (optional)
  }

  draw(ctx) {
    if (this.image) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  playCollectSound() {
    this.collectSound.play();
  }
}