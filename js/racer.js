// racer.js
import { Tween, Easing } from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js';

export default class Racer {
  // static racerSound = new Audio('./assets/sounds/dino.mp3');
  static jumpSound = new Audio('./assets/sounds/jump.mp3');

  constructor(dinoName, track, lane, gameHeight, gameSpeed, gameWidth, isBot = false, extraLives = 0, racerSounds) {
    this.isBot = isBot;
    this.isPlayer = !this.isBot;
    this.track = track
    this.lane = lane; // Use the provided lane
    this.dinoName = dinoName;
    this.racerSounds = racerSounds;
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
    
    this.x = 50; // Starting x position
    // Position the bottom of the racer at the vertical center of the lane
    this.y = (this.lane.topBoundary + this.lane.bottomBoundary) / 2 - this.height;
    this.dy = 0;
    this.dx = 0;
    this.acceleration = 1.5;  // How fast the player accelerates
    this.isAccelerating = false;
    this.friction = 0.1;      // How quickly the player decelerates when the key is released
    this.maxSpeed = 4;        // Maximum speed the player can reach
    this.baseSpeed = gameSpeed; 
    this.speed = gameSpeed;
    this.raceStarted = false;
    this.boosted = false;
    this.isMoving = false;
    this.isJumping = false;
    this.notJumping = !this.isJumping;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.boundaryTop = this.track.topBoundary - this.height;
    this.boundaryBottom = this.track.bottomBoundary - this.height;
    this.oscillationAmplitude = 0.03; // Vertical oscillation amplitude
    this.oscillationFrequency = 0.05; // Vertical oscillation frequency
    this.oscillationPhase = 0; // Initial phase for oscillation

    this.shadowBaseWidth = this.width * 0.8;  // Base size of the shadow
    this.shadowBaseHeight = this.height * 0.2; // Base height of the shadow
    // this.racerSound = Racer.racerSound;
    // this.racerSound.volume = 0.5;
    this.jumpSound = this.racerSounds.jump;

    // Array to store frames
    this.frames = [];

    // Load the frames
    for (let i = 1; i <= 4; i++) {
        const img = new Image();
        img.src = `./assets/racers/${dinoName.toLowerCase()}/${dinoName.toLowerCase()}_${i}.png`;
        img.onload = () => {
          // console.log(`Loaded image: ${img.src}`);
        };
        img.onerror = (e) => {
            console.error(`Failed to load image: ${img.src}`, e);
        };
        this.frames.push(img);
    }

    // Frame control variables
    this.currentFrame = 0;      // Start with the first frame
    this.frameInterval = 100;   // Adjust the interval (in ms) for frame switching
    this.lastFrameTime = Date.now(); // Track time to switch frames

    this.laneNumber = this.lane.laneNumber; // Set the initial lane number
    this.originalSpeed = gameSpeed;
    this.lives = extraLives;
    this.collectableCount = 3;
    this.coinCount = 0;
  }

  hit() {
    if (this.isBot) {
      this.stall();
      return false;
    } else {
      if (this.lives > 0) {
        this.lives--;
        this.stall();
        return false;
      }
      return true;
    }
  }

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

  // Draw the shadow beneath the player
  drawShadow(ctx) {
    // Determine if the player is jumping
    const shadowY = this.isJumping ? this.shadowFixedY : (this.y + this.height - 5);
    
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

    // Only draw the racer if it's visible
    if (this.visible !== false) {
      // Draw the current frame
      const frame = this.frames[this.currentFrame];

      if (frame.complete) {
        ctx.drawImage(frame, this.x, this.y, this.width, this.height);
      }
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

    if (this.stalled) {
      // If the racer is stalled, move backwards
      this.x += this.dx;
      return;
    }

    // Update Racer vertical position
    this.y += this.dy;

    const viewWidthLeft = this.gameWidth / 2 - this.width;
    const viewWidthRight = this.gameWidth / 2 + this.width;
    
    if (this.isBot) {
      // Use the current speed (which will be boosted if a boost was hit)
      this.dx = this.speed;
      this.x += this.dx;

      // Gradually move the player back into view
      if (this.x < this.track.width / 2 - this.width * 2) {
        const overflowDistance = viewWidthLeft - this.x;
        const moveForwardSpeed = Math.min(overflowDistance, this.speed);
        this.x += moveForwardSpeed;
      }
      
      if (this.x > this.track.width / 2 + this.width * 2) {
        const overflowDistance = this.x - viewWidthRight;
        const moveBackSpeed = Math.min(overflowDistance, this.speed);
        this.x -= moveBackSpeed;
      }
  
      // Random lane change logic
      if (Math.random() < 0.005) { // Adjust this probability as needed
        const direction = Math.random() < 0.5 ? 'up' : 'down';
        this.changeLane(direction === 'up');
      }

    } else {

      if (!this.isJumping) {
        const racerBottom = this.y + this.height;
        const currentLane = this.track.lanes.find(lane => lane.isInLane(racerBottom));
      
        if (currentLane && currentLane !== this.lane) {
          this.lane = currentLane;
          this.laneNumber = this.lane.laneNumber;
          // console.log("Racer has entered lane: " + this.laneNumber);
        }
      }

    }

    // Keep the player within the game bounds
    // Block Racer from going outside the top part of the track 
    if (!this.isJumping && this.y < this.boundaryTop) this.y = this.boundaryTop;
    // Block Racer from going past the bottom part of the track
    if (this.y > this.boundaryBottom) this.y = this.boundaryBottom;
    
    if (this.isPlayer) {
      // Block Player from going past the left part of the track
      if (this.x < 0) {
          this.x = 0;
      }
      
      // Gradually move the player back into view
      if (this.x < viewWidthLeft) {
        const overflowDistance = viewWidthLeft - this.x;
        const moveForwardSpeed = Math.min(overflowDistance, this.speed);
        this.x += moveForwardSpeed;
      }
      
      if (this.x > viewWidthRight) {
        const overflowDistance = this.x - viewWidthRight;
        const moveBackSpeed = Math.min(overflowDistance, this.speed);
        this.x -= moveBackSpeed;
      }

      if (this.x > this.track.width / 2 - this.width) {
        this.x = this.track.width / 2 - this.width;
        this.dx = this.speed + this.acceleration;
      }
    }
  }

  botAI() {
    if (this.stalled) {
      // If the bot is stalled, don't perform any AI actions
      return;
    }

    // Use the current speed (which will be boosted if a boost was hit)
    this.dx = this.speed;
    this.x += this.dx;

    // if (this.x < 0 - this.width * 2) {
    //   this.boost();
    // }

    // if (this.x > this.track.width + this.width) {
    //   this.boost();
    // }

    // Random lane change logic
    if (Math.random() < 0.005) { // Adjust this probability as needed
      const direction = Math.random() < 0.5 ? 'up' : 'down';
      this.changeLane(direction === 'up');
    }
  }

  changeLane(up) {
    const currentLaneIndex = this.track.lanes.indexOf(this.lane);
    const newLaneIndex = up ? currentLaneIndex - 1 : currentLaneIndex + 1;
    
    if (newLaneIndex >= 0 && newLaneIndex < this.track.lanes.length) {
      this.lane = this.track.lanes[newLaneIndex];
      this.laneNumber = this.lane.laneNumber;
      
      // Smoothly move to the new lane's center
      const newY = (this.lane.topBoundary + this.lane.bottomBoundary) / 2 - this.height;
      new Tween(this)
        .to({ y: newY }, 500) // 500ms duration, adjust as needed
        .easing(Easing.Quadratic.InOut)
        .start();
    }
  }
  
  updateLanePosition() {
    if (!this.isJumping) {
      const racerBottom = this.y + this.height;
      const currentLane = this.track.lanes.find(lane => lane.isInLane(racerBottom));
      
      if (currentLane && currentLane !== this.lane) {
          this.lane = currentLane;
          this.laneNumber = this.lane.laneNumber;
          // console.log("Racer has entered lane: " + this.laneNumber);
      }
    }
  }

  setSpeedChangeCallback(callback) {
    this.onSpeedChange = callback;
  }

  accelerate(isAccelerating, ogSpeed) {
    if (this.raceStarted) {
      this.isAccelerating = isAccelerating;
      const accelerationFactor = 1.5; // 5% increase
      
      if (this.isAccelerating) {
        this.speed = ogSpeed * accelerationFactor;
        // console.log("Speed: " + this.speed);
      } else {
        this.speed = ogSpeed;
        // console.log("Speed: " + this.speed);
      }

      if (this.onSpeedChange) {
        this.onSpeedChange(this.speed);
      }
    }
  }

  boost(boostTime = 1000) {
    if (this.boosted) return;
    this.jump();
    this.boosted = true;
    const originalSpeed = this.speed;
    this.speed *= 2;
    
    if (this.isPlayer && this.onSpeedChange) {
      this.onSpeedChange(this.speed);
    }
    
    setTimeout(() => {
      this.speed = originalSpeed;
      this.boosted = false;
      if (this.onSpeedChange) {
        this.onSpeedChange(this.speed);
      }
    }, boostTime);
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
    let originalDx = this.dx;
    let originalDy = this.dy;
    this.stalled = true;
    // Stop the Racer    
    this.dx = -this.speed;
    this.dy = 0;

    this.visible = true; // Ensure visibility at the start
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
      this.dy = originalDy; // Restore original speed
      this.visible = true; // Ensure visibility after stall
    }, delay);
  }

  jump() {
    if (!this.raceStarted || this.isJumping) return;
    if (!this.isJumping) {  // Ensure jump happens only once per press
        this.jumpSound.play();
        this.isJumping = true;  // Set jumping flag
        this.jumpStartLane = this.lane; // Store the starting lane
        
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
                this.lane = this.jumpStartLane; // Reset to the starting lane
                this.laneNumber = this.lane.laneNumber;
            });

        // Chain the tweens: jump up, then fall down
        upTween.chain(downTween);
        upTween.start();
    }
  }

  moveUp() {
    if (!this.raceStarted) return;
    // if (this.dy > -this.maxSpeed) {
    //     this.dy -= this.acceleration;  // Accelerate upwards
    // }
    this.changeLane(true);
  }

  moveDown() {
    if (!this.raceStarted) return;
    // if (this.dy < this.maxSpeed) {
    //     this.dy += this.acceleration;  // Accelerate downwards
    // }
    this.changeLane(false);
  }

  // moveLeft() {
  //   if (!this.raceStarted) return;
  //   if (this.dx > -this.maxSpeed) {
  //       this.dx -= this.acceleration;  // Accelerate left
  //   }
  // }

  // moveRight() {
  //   if (!this.raceStarted) return;
  //   if (this.dx < this.maxSpeed) {
  //     this.dx += this.acceleration;  // Accelerate right
  //   }
  // }

  startRace() {
    this.raceStarted = true;
  }

  collectCollectable() {
    if (this.collectableCount < 3) {
      this.collectableCount++;
    }
  }
}