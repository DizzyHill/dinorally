import Game from './game.js';  // Assuming all your JS files are in the same folder

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game('gameCanvas');  // Initialize the game with the canvas element
  const startButtons = document.querySelectorAll('.start-game');
  const startRaceButton = document.getElementById('start-race');
  
  // Listen for the character selection button click
  startButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const dinoName = e.target.getAttribute('data-dinoName');
      console.log("Selected dino: ", dinoName);
      game.setUpGame(dinoName);  // Start the game with the selected dino character
      
      // Attempt to lock orientation when starting the game
      await requestFullscreenAndLockOrientation();
    });
  });

  startRaceButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("Starting Race");
    game.startGame();
  });
  
  // Mobile control buttons
  const upButton = document.getElementById('up-button');
  const downButton = document.getElementById('down-button');
  const jumpButton = document.getElementById('jump-button');
  const fireButton = document.getElementById('fire-button');

  // Touch controls
  if ('ontouchstart' in window) {
    // Up button
    upButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.isMoving = true;
        game.player.moveUp();
      }
    });

    upButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.dy = 0;
        game.player.isMoving = false;
      }
    });

    // Down button
    downButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.isMoving = true;
        game.player.moveDown();
      }
    });

    downButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.dy = 0;
        game.player.isMoving = false;
      }
    });

    // Jump button
    jumpButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.jump();
      }
    });

    // Fire button
    fireButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) {
        game.fireProjectile(game.player);
      }
    });
  }

  // Add keyboard controls for player movement
  window.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (!game.player) return;
        
    game.player.isMoving = true;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        game.player.moveUp();
      break;
      case 'ArrowDown':
      case 's':
      case 'S':
        game.player.moveDown();
      break;
      case 'ArrowLeft':
      case 'a':
        // game.player.moveLeft();
      break;
      case 'ArrowRight':
      case 'd':
      case 'D':
      case 'Shift':
        game.player.accelerate(true, game.difficulty_level);
        // game.player.moveRight();
      break;
      case ' ':
        game.player.jump();  // Call jump method for smooth jump
      break;
      case 'e':
      case 'E':
      case 'f':
      case 'F':
        game.fireProjectile(game.player);
      break;
    }
  });
  
  // Reset player's velocity when the keys are released
  window.addEventListener('keyup', (e) => {
    if (game.player) {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        game.player.dy = 0;
        break;
        case 'ArrowDown':
        case 's':
        game.player.dy = 0;
        break;
        case 'ArrowLeft':
        case 'a':
        // game.player.dx = 0;
        break;
        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'Shift':
        // game.player.dx = 0;
        game.player.accelerate(false, game.difficulty_level);
        break;
      }
      game.player.isMoving = game.player.dy !== 0 || game.player.dx !== 0;
    }
  });

  // Add this function to resize the canvas
  function resizeCanvas() {
    const canvas = game.canvas;
    const container = document.getElementById('main');

    let scale = Math.min(
        container.clientWidth / canvas.width,
        container.clientHeight / canvas.height
    );

    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;
  }

  // Call resizeCanvas when the page loads and on resize
  window.addEventListener('load', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
});

// Function to request fullscreen and lock orientation
async function requestFullscreenAndLockOrientation() {
  const mainContainer = document.getElementById('main'); // Select the main container for fullscreen
  
  // Request fullscreen on the main container or body
  if (mainContainer.requestFullscreen) {
    await mainContainer.requestFullscreen();
  } else if (mainContainer.webkitRequestFullscreen) { /* Safari */
    await mainContainer.webkitRequestFullscreen();
  } else if (mainContainer.msRequestFullscreen) { /* IE11 */
    await mainContainer.msRequestFullscreen();
  }

  // Lock orientation to landscape
  if (screen.orientation && screen.orientation.lock) {
    try {
      await screen.orientation.lock('landscape');
      console.log('Orientation locked to landscape');
    } catch (error) {
      console.error('Orientation lock failed:', error);
    }
  } else if (window.screen.lockOrientation) {
    // Deprecated methods for older browsers
    const success = screen.lockOrientation('landscape');
    if (success) {
      console.log('Orientation locked to landscape using deprecated method');
    } else {
      console.error('Orientation lock failed using deprecated method');
    }
  } else {
    console.warn('Screen Orientation API not supported');
  }
}

// Function to check current orientation and show/hide overlay
function checkOrientation() {
  const overlay = document.getElementById('orientation-overlay');
  if (window.matchMedia("(orientation: portrait)").matches) {
    overlay.style.display = 'flex';
  } else {
    overlay.style.display = 'none';
  }
}

// Listen for orientation changes
window.addEventListener('orientationchange', checkOrientation);
window.addEventListener('resize', checkOrientation);

// Initial check on page load
document.addEventListener('DOMContentLoaded', () => {
  checkOrientation();
});