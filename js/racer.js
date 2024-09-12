// racer.js
import { Tween, Easing } from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js';

export default class Racer {
  constructor(dinoName, track, lane, gameHeight, gameSpeed, gameWidth, isBot = false) {
    this.isBot = isBot;
    this.track = track
    this.currentLane = lane; // Use the provided lane
    this.dinoName = dinoName;
    // Dino-specific configurations
    switch(dinoName) {
      case 'Bash':
        this.height = 120;
        this.width = 100;
        this.color = 'red';
        break;
      case 'Comet':
        this.height = 110;
        this.width = 124.4;
        this.color = 'blue';
        break;
      case 'Fuego':
        this.height = 100;
        this.width = 112.2;
        this.color = 'green';
        break;
      case 'Nitro':
        this.height = 100;
        this.width = 144;
        this.color = 'yellow';
        break;
    }

    // Calculate the vertical center of the lane
    const laneCenter = (this.currentLane.topBoundary + this.currentLane.bottomBoundary) / 2;
    
    this.x = 50; // Starting x position
    // Position the bottom of the racer at the vertical center of the lane
    this.y = laneCenter - this.height;
    this.dy = 0;
    this.dx = 0;
    this.acceleration = 1.5;  // How fast the player accelerates
    this.friction = 0.1;      // How quickly the player decelerates when the key is released
    this.maxSpeed = 4;        // Maximum speed the player can reach
    this.baseSpeed = gameSpeed; 
    this.speed = gameSpeed;
    this.raceStarted = false;
    this.boosted = false;
    this.isMoving = false;
    this.isJumping = false;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.boundaryRight = this.gameWidth - this.width;
    this.boundaryLeft = 0;
    this.boundaryTop = this.gameHeight * 0.55 - this.height;
    this.boundaryBottom = this.gameHeight - this.height;
    this.oscillationAmplitude = 0.03; // Vertical oscillation amplitude
    this.oscillationFrequency = 0.05; // Vertical oscillation frequency
    this.oscillationPhase = 0; // Initial phase for oscillation

    this.shadowBaseWidth = this.width * 0.8;  // Base size of the shadow
    this.shadowBaseHeight = this.height * 0.2; // Base height of the shadow

    // Array to store frames
    this.frames = [];

    // Load the frames
    for (let i = 1; i <= 4; i++) {
        const img = new Image();
        img.src = `./assets/racers/${dinoName}/${dinoName}_${i}.png`;
        this.frames.push(img);
    }

    // Frame control variables
    this.currentFrame = 0;      // Start with the first frame
    this.frameInterval = 100;   // Adjust the interval (in ms) for frame switching
    this.lastFrameTime = Date.now(); // Track time to switch frames

    this.laneNumber = this.currentLane.laneNumber; // Set the initial lane number
    this.originalSpeed = gameSpeed;
  }
  // Update frame logic based on whether the race has started
  
  animateFrames() {
    const now = Date.now();

    if (!this.raceStarted) {
      // Before the race starts, keep showing the first frame
      this.currentFrame = 0;
    } else {
      // After the race starts, loop through frames 1, 2, and 3 (0-indexed as 1, 2, 3)
      if (now - this.lastFrameTime > this.frameInterval) {
          // Cycle through frames 1 to 3
          this.currentFrame = (this.currentFrame + 1) % 3 + 1; // +1 to skip the first frame (index 0)
          this.lastFrameTime = now;
      }
    }
  }

  botAI() {
    // Add simple AI behavior for bots
    // Example: Move forward with a small chance of jumping
    if (this.stalled) {
      this.dx = -this.speed;
    } else {
      this.x += this.speed;
    }

    // Random jump logic for bots
    if (Math.random() < 0.01) {
        this.jump();
    }
  }


  // Draw the shadow beneath the player
  drawShadow(ctx) {
    // Determine if the player is jumping
    const shadowY = this.isJumping ? this.shadowFixedY : (this.y + this.height);
    
    let shadowScale = 1;
    if (this.isJumping) {
      // Scale the shadow based on the player's jump height
      shadowScale = 1 - Math.abs(this.y - this.gameHeight / 2) / 200; // Adjust shadow scale based on player's height (adjust the divisor for smoother scale)
      
      // Clamp shadowScale between 0.5 and 1 to ensure it doesn't shrink too much
      shadowScale = Math.max(0.5, Math.min(1, shadowScale));
    }

    // Calculate the shadow's width and height based on the scale
    const shadowWidth = this.shadowBaseWidth * shadowScale;
    const shadowHeight = this.shadowBaseHeight * shadowScale;
    
    // Create a radial gradient for dithering the shadow edges
    const gradient = ctx.createRadialGradient(
      this.x + this.width / 2,  // X position of shadow center
      shadowY,                  // Y position of shadow
      shadowWidth / 4,          // Inner radius (darker part)
      this.x + this.width / 2,  // X position of shadow center
      shadowY,                  // Y position of shadow
      shadowWidth / 2           // Outer radius (lighter, more transparent part)
    );

    // Define gradient color stops to create the dithering effect
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');  // Darker center
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');    // Fully transparent edges

    // Draw the shadow directly underneath the player
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,    // Shadow is centered horizontally with the player
      shadowY,                    // Shadow Y position (fixed when jumping)
      shadowWidth / 2,
      shadowHeight / 2,
      0,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = gradient;  // Semi-transparent black shadow
    ctx.fill();
  }

  draw(ctx) {
    // Update frames based on raceStarted status
    this.animateFrames();
    // Draw the shadow first (beneath the player)
    this.drawShadow(ctx);

    // Draw the current frame
    const frame = this.frames[this.currentFrame];

    if (frame.complete) {
        ctx.drawImage(frame, this.x, this.y, this.width, this.height);
    } else {
        // Fallback in case image hasn't loaded yet
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Visualize the hitbox around the player
    // ctx.strokeStyle = 'red'; // Color of the hitbox line
    // ctx.lineWidth = 2; // Thickness of the hitbox line

    // // Draw the original full player hitbox
    // ctx.strokeRect(this.x, this.y, this.width, this.height);

    // // Optional: Draw a reduced hitbox for more precise collision detection
    // const paddingX = this.width * 0.25;
    // const paddingY = this.height * 0.25;
    // ctx.strokeStyle = 'green'; // Different color for the reduced hitbox
    // ctx.strokeRect(
    //     this.x + paddingX / 2, // Apply horizontal padding
    //     this.y + paddingY / 2, // Apply vertical padding
    //     this.width - paddingX,  // Adjust width for padding
    //     this.height - paddingY  // Adjust height for padding
    // );
  }

  update() {
    if (!this.raceStarted) {
      // If the race hasn't started, don't update position
      return;
    }

    if (this.isBot) {
      this.botAI(); // Bots will have automated movement logic
    } else {
      this.updateLanePosition(); // Players will have manual movement
    }

    if (!this.isMoving) {
        // Apply friction (deceleration) when not moving
        if (this.dx > 0) {
            this.dx = Math.max(0, this.dx - this.friction);
        } else if (this.dx < 0) {
            this.dx = Math.min(0, this.dx + this.friction);
        }

        if (this.dy > 0) {
            this.dy = Math.max(0, this.dy - this.friction);
        } else if (this.dy < 0) {
            this.dy = Math.min(0, this.dy + this.friction);
        }
    }

    // Update player position
    this.x += this.dx;
    this.y += this.dy;

    // Keep the player within the game bounds (example)
    // Block Player from going to the top part of the screen 
    if (!this.isJumping && this.y < this.boundaryTop) this.y = this.boundaryTop;
    // Block Player from going past the bottom part of the screen
    if (this.y > this.boundaryBottom) this.y = this.boundaryBottom;
    // Block Player from going past the left part of the screen
    if (this.x < this.boundaryLeft) {
        this.x = this.boundaryLeft;
    }
    // Block Player from going past the right part of the screen
    if (this.x > this.boundaryRight) {
        this.x = this.boundaryRight;
    }
  }

  // Change the current lane based on the player's movement
  // changeLane(up) {
  //   const currentLaneIndex = this.track.lanes.indexOf(this.currentLane);
  //   const newLaneIndex = up ? currentLaneIndex - 1 : currentLaneIndex + 1;
    
  //   if (newLaneIndex >= 0 && newLaneIndex < this.track.lanes.length) {
  //     // Update the current lane to the new lane
  //     this.currentLane = this.track.lanes[newLaneIndex];
      
  //     // Adjust the racer's y position to match the new lane's y position
  //     // this.y = this.currentLane.yPosition;
  
  //     // Update the lane number (zIndex)
  //     this.laneNumber = this.currentLane.laneNumber;

  //     console.log("lane number: " + this.laneNumber);
  //   }
  // }

  moveUp() {
    if (!this.raceStarted) return;
    if (this.dy > -this.maxSpeed) {
        this.dy -= this.acceleration;  // Accelerate upwards
    }
  }

  moveDown() {
    if (!this.raceStarted) return;
    if (this.dy < this.maxSpeed) {
        this.dy += this.acceleration;  // Accelerate downwards
    }
  }

  moveLeft() {
    if (!this.raceStarted) return;
    if (this.dx > -this.maxSpeed) {
        this.dx -= this.acceleration;  // Accelerate left
    }
  }

  moveRight() {
    if (!this.raceStarted) return;
    if (this.dx < this.maxSpeed) {
        this.dx += this.acceleration;  // Accelerate right
    }
  }
  // In your update loop or game loop, check if the racer crosses lane boundaries
  // updateLanePosition() {
  //   this.laneNumber = this.currentLane.laneNumber;
  //   console.log("draw lane: " + this.laneNumber, this.currentLane.topBoundry, this.currentLane.bottomBoundry);

  //   // Check if the racer has moved into a new lane
  //   for (let i = 0; i < this.track.lanes.length; i++) {
  //     const lane = this.track.lanes[i];

  //     // If racer's y is within the current lane's top and bottom boundaries
  //     if (this.y >= lane.topBoundary && this.y <= lane.bottomBoundary) {
  //       if (this.currentLane !== lane) {
  //         // Update the current lane and lane number
  //         this.currentLane = lane;
  //         this.laneNumber = lane.laneNumber;

  //         console.log("Racer has entered lane: " + this.laneNumber);
  //       }
  //       break;
  //     }
  //   }
  // }
  updateLanePosition() {
    if (!this.isJumping) {
      const racerBottom = this.y + this.height;
      const currentLane = this.track.lanes.find(lane => lane.isInLane(racerBottom));
      
      if (currentLane && currentLane !== this.currentLane) {
          this.currentLane = currentLane;
          this.laneNumber = this.currentLane.laneNumber;
          console.log("Racer has entered lane: " + this.laneNumber);
      }
    }
  }

  setSpeedChangeCallback(callback) {
    this.onSpeedChange = callback;
  }

  applyBoost(boost) {
    if (this.boosted) return;

    this.boosted = true;
    const originalSpeed = this.speed;
    this.speed *= 4;
    
    if (this.onSpeedChange) {
      this.onSpeedChange(this.speed);
    }
    
    setTimeout(() => {
      this.speed = originalSpeed;
      this.boosted = false;
      if (this.onSpeedChange) {
        this.onSpeedChange(this.speed);
      }
    }, 1000);
  }

  // If you need to change speed in other methods, don't forget to call the callback
  setSpeed(newSpeed) {
    this.speed = newSpeed;
    if (this.onSpeedChange) {
      this.onSpeedChange(this.speed);
    }
  }

  stall(delay = 1000) {
    console.log(this.dinoName + " Stalled");
    this.stalled = true;
    const originalDx = this.dx;
    this.dx = 0;

    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      this.visible = !this.visible;
      blinkCount++;
      if (blinkCount >= 6) { // 3 full blinks (on-off-on-off-on-off)
        clearInterval(blinkInterval);
        this.visible = true;
      }
    }, 100); // Faster blink interval for more noticeable effect

    setTimeout(() => {
      console.log(this.dinoName + " Unstalled");
      this.stalled = false;
      this.dx = originalDx; // Restore original speed
    }, delay);
  }

  jump() {
    if (!this.raceStarted || this.isJumping) return;
    if (!this.isJumping) {  // Ensure jump happens only once per press
        this.isJumping = true;  // Set jumping flag
        this.jumpStartLane = this.currentLane; // Store the starting lane
        
        // Lock the shadow's y-position when the jump starts
        this.shadowFixedY = this.y + this.height;
        
        let originalY = this.y;
        let jumpHeight = 120;  // Adjust based on desired jump height
        let jumpDuration = 800;  // Time to complete the jump animation

        // Animate the jump up
        const upTween = new Tween(this)
            .to({ y: originalY - jumpHeight }, jumpDuration / 2)
            .easing(Easing.Quadratic.Out);
        
        // Animate the fall down
        const downTween = new Tween(this)
            .to({ y: originalY }, jumpDuration / 2)
            .easing(Easing.Quadratic.In)
            .onComplete(() => {
                this.isJumping = false;  // Reset jumping flag after landing
                this.currentLane = this.jumpStartLane; // Reset to the starting lane
                this.laneNumber = this.currentLane.laneNumber;
            });

        // Chain the tweens: jump up, then fall down
        upTween.chain(downTween);
        upTween.start();
    }
  }

  startRace() {
    this.raceStarted = true;
  }
}