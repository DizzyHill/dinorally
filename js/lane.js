export default class Lane {
  constructor(yPosition, zIndex, laneHeight) {
      this.yPosition = yPosition; // Vertical position of the lane
      this.laneNumber = zIndex; // Determines layer order (higher zIndex is rendered in front)
      this.laneHeight = laneHeight; // The vertical range of the lane
      this.topBoundary = this.yPosition;
      this.bottomBoundary = this.yPosition + this.laneHeight;
      this.entities = []; // Objects in this lane (racers, obstacles, etc.)
  }

  draw(ctx) {
    const laneWidth = ctx.canvas.width;

    // Draw the lane line at the top
    ctx.beginPath();
    ctx.moveTo(0, this.yPosition);
    ctx.lineTo(laneWidth, this.yPosition);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';  // White with 0.5 opacity
    ctx.lineWidth = 2;
    ctx.stroke();

    // ctx.beginPath();
    // canvasContext.moveTo(0, this.yPosition + this.laneHeight);
    // canvasContext.lineTo(laneWidth, this.yPosition + this.laneHeight);
    // canvasContext.strokeStyle = 'green';
    // canvasContext.lineWidth = 4;
    // canvasContext.stroke();
    
  }

  // Add an entity to this lane (e.g., Racer, Obstacle)
  addEntity(entity) {
      this.entities.push(entity);
      entity.lane = this;
  }

  // Remove an entity from the lane
  removeEntity(entity) {
      this.entities = this.entities.filter(e => e !== entity);
  }

  // Check if a given y-position is within the bounds of the lane
  isInLane(yPosition) {
    // Check if the yPosition is within the lane's bounds
    return yPosition >= this.topBoundary && yPosition < this.bottomBoundary;
  }
}