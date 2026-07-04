/**
 * Scroll-driven video scrubbing engine (Animation Bible §2.1).
 * Never calls play(); lerps currentTime toward the scroll target each tick,
 * smoothing seek latency in both directions. Detects stalls → degraded mode.
 */
import { gsap } from "@/lib/gsap";
import { VIDEO_SCRUB_LERP } from "@/constants/motion";

export interface VideoScrubber {
  setProgress(p: number): void;
  prime(): Promise<void>;
  destroy(): void;
  onStallDegrade?: () => void;
}

export function createVideoScrubber(video: HTMLVideoElement): VideoScrubber {
  let target = 0;
  let primed = false;
  let stalls = 0;
  let lastCheck = 0;
  let destroyed = false;

  const scrubber: VideoScrubber = {
    setProgress(p: number) {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        target = p * Math.max(video.duration - 0.05, 0);
      }
    },
    async prime() {
      if (primed) return;
      try {
        video.muted = true;
        await video.play();
        video.pause();
        video.currentTime = 0;
        primed = true;
      } catch {
        /* autoplay refused — first scroll interaction will retry */
      }
    },
    destroy() {
      destroyed = true;
      gsap.ticker.remove(tick);
    },
  };

  const tick = () => {
    if (destroyed || !Number.isFinite(video.duration) || video.duration === 0) return;
    const diff = target - video.currentTime;
    if (Math.abs(diff) < 0.001) return;

    const now = performance.now();
    if (video.seeking) {
      if (now - lastCheck > 250) {
        stalls++;
        lastCheck = now;
        if (stalls > 3) scrubber.onStallDegrade?.();
      }
      return;
    }
    lastCheck = now;
    video.currentTime += diff * VIDEO_SCRUB_LERP;
  };

  gsap.ticker.add(tick);
  return scrubber;
}
