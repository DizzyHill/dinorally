export default class Collidable {
  constructor(x, y, width, height, speed, currentLane) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.currentLane = currentLane;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    // Basic drawing method, to be overridden by subclasses
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}