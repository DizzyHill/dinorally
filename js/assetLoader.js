class AssetLoader {
  constructor() {
    this.preloadedImages = {};
    this.audioAssets = {};
  }

  async loadAllAssets() {
    try {
      await Promise.all([
        this.preloadImages('obstacles', [
          './assets/obstacles/DR_VG_boulder(250x300).png',
          './assets/obstacles/DR_VG_tire(250x350).png'
        ]),
        this.preloadImages('explosions', [
          './assets/fireball_explosion/explosion_1.png',
          './assets/fireball_explosion/explosion_2.png',
          './assets/fireball_explosion/explosion_3.png'
        ]),
        this.preloadImages('projectiles', [
          './assets/projectiles/fireball_1.png',
          './assets/projectiles/fireball_2.png',
          './assets/projectiles/fireball_3.png',
          './assets/projectiles/fireball_4.png'
        ]),
        this.preloadRacerImages(['Nitro', 'Comet', 'Fuego', 'Bash']),
        this.preloadImages('boosts', ['./assets/boost/speedboost.png']),
        this.preloadImages('coins', ['./assets/collectables/DR_VG_pickleWeb(200x300).png']),
        this.preloadImages('collectables', ['./assets/collectables/hot_sauce.png']),
        this.loadAudioAssets()
      ]);
      console.log('All assets loaded successfully');
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }

  preloadImages(category, imageSources) {
    return new Promise((resolve, reject) => {
      let loadedCount = 0;
      const totalImages = imageSources.length;

      const onLoad = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          console.log(`All ${category} images loaded successfully`);
          resolve();
        }
      };

      const onError = (src) => {
        console.error(`Failed to load image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };

      this.preloadedImages[category] = {};
      imageSources.forEach(src => {
        const img = new Image();
        img.onload = onLoad;
        img.onerror = () => onError(src);
        img.src = src;
        this.preloadedImages[category][src] = img;
      });
    });
  }

  preloadRacerImages(dinos) {
    const imageSources = dinos.flatMap(dino => 
      [1, 2, 3, 4].map(i => `./assets/racers/${dino.toLowerCase()}/${dino.toLowerCase()}_${i}.png`)
    );
    return this.preloadImages('racers', imageSources);
  }

  loadAudioAssets() {
    const audioAssets = {
      theme: { src: './assets/sounds/theme.mp3', loop: true, volume: 0.5 },
      gameOver: { src: './assets/sounds/game_over.mp3', loop: false, volume: 0.7 },
      countdown: { src: './assets/sounds/321go.mp3', loop: false, volume: 0.3 }
    };

    const audioPromises = Object.entries(audioAssets).map(([key, { src, loop, volume }]) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = volume;
        audio.oncanplaythrough = () => {
          this.audioAssets[key] = audio;
          resolve();
        };
        audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
      });
    });

    return Promise.all(audioPromises);
  }

  getImage(category, src) {
    return this.preloadedImages[category][src];
  }

  getAudio(key) {
    return this.audioAssets[key];
  }
}

export default AssetLoader;
