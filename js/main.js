import Game from './game.js';  // Assuming all your JS files are in the same folder

document.getElementById('character-selection').style.display = 'flex';  // Show character selection menu

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');  // Initialize the game with the canvas element
    const startButtons = document.querySelectorAll('.start-game');

    // Listen for the character selection button click
    startButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const dinoName = e.target.getAttribute('data-dinoName');
            console.log("Selected dino: ", dinoName);
            game.startGame(dinoName);  // Start the game with the selected dino character
        });
    });

    // Add keyboard controls for player movement
    window.addEventListener('keydown', (e) => {
        if (!game.player) return;

        switch (e.key) {
            case 'ArrowUp':
                game.player.dy = -4;
                break;
            case 'ArrowDown':
                game.player.dy = 4;
                break;
            case 'ArrowLeft':
                game.player.dx = -2;
                break;
            case 'ArrowRight':
                game.player.dx = 2;
                break;
        }
    });

    // Reset player's velocity when the keys are released
    window.addEventListener('keyup', () => {
        if (game.player) {
            game.player.dy = 0;
            game.player.dx = 0;
        }
    });
});