const SOUND_FILES = {
  "modern-background": "/sounds/modern-background.wav",
  "retro-background": "/sounds/retro-background.wav",
  "modern-points": "/sounds/modern-points.wav",
  "retro-points": "/sounds/retro-points.wav",
  "modern-game-over": "/sounds/modern-game-over.wav",
  "retro-game-over": "/sounds/retro-game-over.wav",
} as const;

export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private currentBackground?: HTMLAudioElement;
  private muted = false;
  private soundsLoaded = false;
  private hasUserInteraction = false;

  constructor() {
    this.sounds.forEach((sound) => {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (error) {
        console.warn("Error cleaning up old sound:", error);
      }
    });
    this.sounds.clear();
    this.currentBackground = undefined;

    this.initSounds();

    // listen for first user interaction (blocker stops autoplay)
    const startAudio = () => {
      this.hasUserInteraction = true;
      if (!this.muted && !this.currentBackground) {
        this.switchMode(false);
      }

      document.removeEventListener("click", startAudio);
      document.removeEventListener("keydown", startAudio);
    };

    document.addEventListener("click", startAudio);
    document.addEventListener("keydown", startAudio);
  }

  private async initSounds(): Promise<void> {
    try {
      await Promise.all([
        this.loadSound("modern-background"),
        this.loadSound("retro-background"),
      ]);
      this.soundsLoaded = true;

      Promise.all([
        this.loadSound("modern-points"),
        this.loadSound("retro-points"),
        this.loadSound("modern-game-over"),
        this.loadSound("retro-game-over"),
      ]).catch((error) => {
        console.warn("Some effect sounds failed to load:", error);
      });
    } catch (error) {
      console.warn("Background sounds failed to load:", error);
      this.soundsLoaded = true;
    }
  }

  private async loadSound(name: string): Promise<void> {
    try {
      const path = SOUND_FILES[name as keyof typeof SOUND_FILES];
      if (!path) {
        console.warn(`Sound file not configured: ${name}`);
        return;
      }

      const audio = new Audio();

      const loadPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Audio load timeout"));
        }, 5000);

        audio.addEventListener(
          "canplaythrough",
          () => {
            clearTimeout(timeout);
            resolve();
          },
          { once: true }
        );

        audio.addEventListener(
          "error",
          (e) => {
            clearTimeout(timeout);
            reject(e);
          },
          { once: true }
        );
      });

      audio.src = path;

      try {
        await loadPromise;
        if (name.includes("background")) {
          audio.loop = true;
        }
        this.sounds.set(name, audio);
      } catch (e) {
        console.warn(`Failed to load sound file: ${path}`, e);
      }
    } catch (error) {
      console.warn(`Error in loadSound for ${name}:`, error);
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.soundsLoaded) return;

    if (this.currentBackground) {
      try {
        if (muted) {
          this.currentBackground.pause();
        } else {
          const promise = this.currentBackground.play();
          if (promise)
            promise.catch((e) => console.warn("Audio play failed:", e));
        }
      } catch (error) {
        console.warn("Error toggling mute:", error);
      }
    }
  }

  switchMode(isRetro: boolean) {
    if (!this.soundsLoaded || (!this.hasUserInteraction && !this.muted)) return;

    if (this.currentBackground) {
      try {
        this.currentBackground.pause();
        this.currentBackground.currentTime = 0;
        this.currentBackground = undefined;
      } catch (error) {
        console.warn("Error stopping background:", error);
      }
    }

    const bgSound = this.sounds.get(
      isRetro ? "retro-background" : "modern-background"
    );
    if (bgSound && !this.muted) {
      try {
        bgSound.pause();
        bgSound.currentTime = 0;

        if (this.hasUserInteraction) {
          const promise = bgSound.play();
          if (promise)
            promise.catch((e) => console.warn("Audio play failed:", e));
        }
        this.currentBackground = bgSound;
      } catch (error) {
        console.warn("Error playing background:", error);
      }
    }
  }

  playPoints(isRetro: boolean) {
    if (this.muted || !this.soundsLoaded || !this.hasUserInteraction) return;

    const sound = this.sounds.get(isRetro ? "retro-points" : "modern-points");
    if (sound) {
      try {
        sound.currentTime = 0;
        const promise = sound.play();
        if (promise)
          promise.catch((e) => console.warn("Audio play failed:", e));
      } catch (error) {
        console.warn("Error playing points sound:", error);
      }
    }
  }

  playGameOver(isRetro: boolean) {
    if (this.muted || !this.soundsLoaded || !this.hasUserInteraction) return;

    if (this.currentBackground) {
      try {
        this.currentBackground.pause();
        this.currentBackground.currentTime = 0;
      } catch (error) {
        console.warn("Error stopping background:", error);
      }
    }

    const sound = this.sounds.get(
      isRetro ? "retro-game-over" : "modern-game-over"
    );
    if (sound) {
      try {
        const promise = sound.play();
        if (promise)
          promise.catch((e) => console.warn("Audio play failed:", e));
      } catch (error) {
        console.warn("Error playing game over sound:", error);
      }
    }
  }
}
