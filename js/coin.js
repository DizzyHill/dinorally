export default class Coin {
  constructor(gameWidth, gameHeight, gameSpeed) {
      this.width = 20;
      this.height = 20;
      this.radius = 10;
      this.x = gameWidth;
      this.y = gameHeight / 2 + Math.random() * (gameHeight / 2 - this.height);
      this.speed = gameSpeed;
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
}