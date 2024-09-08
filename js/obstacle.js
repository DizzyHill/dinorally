// obstacle.js
export default class Obstacle {
  constructor(gameWidth, gameHeight, gameSpeed) {
      this.width = 40;
      this.height = 60;
      this.x = gameWidth;
      this.y = gameHeight / 2 + Math.random() * (gameHeight / 2 - this.height);
      this.speed = gameSpeed;
  }

  draw(ctx) {
      ctx.fillStyle = 'pink';
      ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
      this.x -= this.speed;
  }
}