import Collidable from './collidable.js';

export default class Coin extends Collidable {
  constructor(x, y, speed, currentLane, preloadedImages, coinSound) {
    super(x, y, 30, 40, speed, currentLane); // Adjust width and height as needed
    this.image = preloadedImages;
    this.coinSound = coinSound;
    this.coinSound.volume = 0.5;  // Set volume (optional)
  }

  draw(ctx) {
    if (this.image) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  playCoinSound() {
    this.coinSound.play();
  }
}