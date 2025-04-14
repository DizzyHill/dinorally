import Lane from './lane.js';

export default class Track {
  constructor(topBoundary, bottomBoundary, width) {
    this.topBoundary = topBoundary;
    this.bottomBoundary = bottomBoundary;
    this.width = width;
    this.height = bottomBoundary - topBoundary;
    this.lanes = [];
  }

  createLanes(count) {
    const laneHeight = this.height / count;
    for (let i = 0; i < count; i++) {
      const yPosition = this.topBoundary + i * laneHeight;
      this.lanes.push(new Lane(yPosition, i + 1, laneHeight));
    }
  }

  draw(ctx) {
    // Draw top boundary
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';  // White with 0.5 opacity
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, this.topBoundary);
    ctx.lineTo(this.width, this.topBoundary);
    ctx.stroke();

    // // Draw bottom boundary
    // ctx.strokeStyle = 'rgba(0, 128, 0, 0.5)';  // Green with 0.5 opacity
    // ctx.beginPath();
    // ctx.moveTo(0, this.bottomBoundary);
    // ctx.lineTo(this.width, this.bottomBoundary);
    // ctx.stroke();

    // Draw lanes
    this.lanes.forEach(lane => lane.draw(ctx));
  }
}