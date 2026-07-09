/**
 * Singleton background-audio controller.
 *
 * Behavior: the ambient track plays from the start on every load/reload and keeps
 * playing until the user turns it off with the toggle (the off state is per-session,
 * so a reload starts the sound again).
 *
 * Browsers block unmuted autoplay without a user gesture, so we (1) try to play
 * audibly right away, and (2) if that's blocked, prime the track muted and unmute
 * on the first interaction (scroll/touch/click) - unmuting an already-playing
 * element needs no gesture.
 */

const SRC = "/sounds/background-1.mp3";
const VOLUME = 0.3;

let audio: HTMLAudioElement | null = null;
let enabled = true; // does the user want sound this session?
const listeners = new Set<(enabled: boolean) => void>();

function notify() {
  listeners.forEach((l) => l(enabled));
}

/** Create the audio element and start it from the beginning. Idempotent. */
export function initBackgroundAudio(): () => void {
  if (typeof window === "undefined" || audio) return () => {};

  audio = new Audio(SRC);
  audio.loop = true;
  audio.volume = VOLUME;
  audio.preload = "auto";
  audio.currentTime = 0;

  // 1) Try to play audibly right away.
  audio.muted = false;
  audio.play().catch(() => {
    // 2) Autoplay was blocked - prime muted so the element is already running,
    //    then unmute on the first interaction (scroll included).
    if (!audio || !enabled) return;
    audio.muted = true;
    audio.play().catch(() => {});
  });

  const events = [
    "scroll",
    "wheel",
    "touchstart",
    "touchmove",
    "pointerdown",
    "keydown",
    "click",
  ];

  const cleanup = () => events.forEach((e) => window.removeEventListener(e, unlock));

  function unlock() {
    if (!audio || !enabled) return;
    if (!audio.muted && !audio.paused) {
      cleanup();
      return;
    }
    audio.muted = false;
    audio.play().catch(() => {});
    cleanup();
  }

  events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));

  return cleanup;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

/** Flip sound on/off for this session, (un)pausing the track. */
export function toggleSound(): boolean {
  // If autoplay was blocked, the track is already running but muted while we
  // wait for a gesture. The button click IS that gesture - so the first press
  // should just switch the sound on (unmute), not toggle it off. Without this,
  // this click and the window "unlock" listener cancel out and the user has to
  // click twice.
  if (audio && enabled && audio.muted && !audio.paused) {
    audio.muted = false;
    audio.play().catch(() => {});
    notify();
    return enabled;
  }

  enabled = !enabled;

  if (audio) {
    if (enabled) {
      audio.muted = false;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  notify();
  return enabled;
}

/** Subscribe to on/off changes. Returns an unsubscribe fn. */
export function subscribeSound(listener: (enabled: boolean) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
