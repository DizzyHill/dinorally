export default class Coin {
  constructor(gameWidth, gameHeight, gameSpeed) {
      this.width = 20;
      this.height = 20;
      this.radius = 10;
      this.x = gameWidth;
      this.y = gameHeight / 2 + Math.random() * (gameHeight / 2 - this.height);
      this.speed = gameSpeed;
      // Load the coin sound
      this.coinSound = new Audio('./assets/sounds/coin.mp3'); // Path to your coin sound
      this.coinSound.volume = 0.5;  // Set volume (optional)
  }

  draw(ctx) {
      ctx.fillStyle = 'gold';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Draw a circle
      ctx.fill();
  }

  update() {
      this.x -= this.speed;
  }
  // Play the coin sound
  playCoinSound() {
    this.coinSound.play();
  }
}