// player.js
import { Tween, Easing } from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js';

export default class Player {
    constructor(dinoName, color, gameHeight, gameSpeed, gameWidth) {
        this.width = 100;
        this.height = 75;

        // Set dimensions based on the dinosaur name
        if (dinoName === 'Bash') {
            this.height = 120;
            this.width = 100;
        }
        if (dinoName === 'Comet') {
            this.height = 110;
            this.width = 124.4;
        }
        if (dinoName === 'Fuego') {
            this.height = 100;
            this.width = 112.2;
        }
        if (dinoName === 'Nitro') {
            this.height = 100;
            this.width = 144;
        }

        this.x = 50;
        this.y = gameHeight / 2 - this.height / 2;
        this.dy = 0;
        this.dx = 0;
        this.color = color;
        this.baseSpeed = gameSpeed;
        this.speed = gameSpeed;
        this.raceStarted = gameSpeed > 0;
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
        this.image = new Image();
        this.image.src = `./assets/${dinoName}.png`;

        // Initialize shadow properties
        this.shadowScale = 1; // Normal size shadow
        this.shadowWidth = this.width * 0.7; // Shadow width based on player size
        this.shadowHeight = 10; // Fixed height for the shadow
        this.shadowY = this.y + this.height; // Shadow initially placed under the player

        // Handle jump input
        document.addEventListener('keydown', (event) => {
            if (event.key === ' ') {
                if (!this.isJumping) {
                    this.jump();
                }
            }
        });
    }

    draw(ctx) {
        // Draw shadow first (so it's underneath the player)
        this.drawShadow(ctx);

        // Draw the player
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Optional: Visualize the hitbox
        // ctx.strokeStyle = 'red'; // Hitbox color
        // ctx.lineWidth = 2; // Hitbox line thickness
        // ctx.strokeRect(this.x, this.y, this.width, this.height);

        // // Draw reduced hitbox (optional)
        // const paddingX = this.width * 0.25;
        // const paddingY = this.height * 0.25;
        // ctx.strokeStyle = 'green';
        // ctx.strokeRect(
        //     this.x + paddingX / 2,
        //     this.y + paddingY / 2,
        //     this.width - paddingX,
        //     this.height - paddingY
        // );
    }

    drawShadow(ctx) {
        // Calculate shadow position and scale
        const shadowX = this.x + this.width / 2 - (this.shadowWidth * this.shadowScale) / 2;
        this.shadowY = this.boundaryBottom + 5; // Shadow remains near the ground level

        // Set shadow style and draw it
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
        ctx.beginPath();
        ctx.ellipse(
            shadowX, 
            this.shadowY, 
            this.shadowWidth * this.shadowScale, 
            this.shadowHeight * this.shadowScale, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }

    update() {
        // Apply vertical oscillation for running effect
        this.oscillationPhase += this.oscillationFrequency;
        this.y += Math.sin(this.oscillationPhase) * this.oscillationAmplitude;
        this.x += this.dx;
        this.y += this.dy;

        // Adjust shadow scale based on jump height
        if (this.isJumping) {
            let jumpProgress = Math.abs((this.y - (this.boundaryBottom - this.height)) / 120); // Jump height is 120
            this.shadowScale = 1 - Math.min(jumpProgress * 0.6, 0.6); // Shrink shadow up to 60%
        } else {
            this.shadowScale = 1; // Reset shadow when not jumping
        }

        // Block Player from going past boundaries
        if (!this.isJumping && this.y < this.boundaryTop) this.y = this.boundaryTop;
        if (this.y > this.boundaryBottom) this.y = this.boundaryBottom;
        if (this.x < this.boundaryLeft) this.x = this.boundaryLeft;
        if (this.x > this.boundaryRight) this.x = this.boundaryRight;
    }

    boost(boostTime = 1000) {
        this.boosted = true;
        setTimeout(() => {
            this.boosted = false;
        }, boostTime);
    }

    stall(delay = 1000) {
        console.log("Player Stalled");
        this.stalled = true;
        this.dx = 0;
        setTimeout(() => {
            console.log("Player Unstalled");
            this.stalled = false;
            this.dx = Math.random() * 2 + 1;  // Assign a new speed after stalling
        }, delay); // Stall for 1 second by default
    }

    jump() {
        if (!this.isJumping) {
            console.log("Jumping");
            this.isJumping = true;  
            let originalY = this.y;
            let jumpHeight = 120;
            let jumpDuration = 800;

            // Animate the jump up
            const upTween = new Tween(this)
                .to({ y: originalY - jumpHeight }, jumpDuration / 2)
                .easing(Easing.Quadratic.Out);

            // Animate the fall down
            const downTween = new Tween(this)
                .to({ y: originalY }, jumpDuration / 2)
                .easing(Easing.Quadratic.In)
                .onComplete(() => {
                    this.isJumping = false;
                    this.shadowScale = 1; // Reset shadow when player lands
                });

            // Chain the tweens: jump up, then fall down
            upTween.chain(downTween);
            upTween.start();
        }
    }
}
