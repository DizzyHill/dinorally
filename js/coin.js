import Collidable from './collidable.js';

export default class Coin extends Collidable {
  constructor(x, y, speed, currentLane) {
    super(x, y, 30, 30, speed, currentLane); // Adjust width and height as needed
    this.image = new Image();
    this.image.src = './assets/DR_VG_pickleWeb(200x300).png';
    this.coinSound = new Audio('./assets/sounds/coin.mp3'); // Update with your actual sound path
    this.coinSound.volume = 0.5;  // Set volume (optional)
    
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  playCoinSound() {
    this.coinSound.play();
  }
}