export default class Jump {
  constructor(gameWidth, gameHeight, gameSpeed) {
      this.width = 30;
      this.height = 10;
      this.x = gameWidth;
      this.y = gameHeight / 2 + Math.random() * (gameHeight / 2 - this.height);
      this.speed = gameSpeed;
  }

  draw(ctx) {
      ctx.fillStyle = 'orange';
      ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
      this.x -= this.speed;
  }
}