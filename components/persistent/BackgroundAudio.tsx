"use client";

import { useEffect } from "react";

export default function BackgroundAudio() {
  useEffect(() => {
    const audio = new Audio("/sounds/background-1.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = "auto";

    let started = false;
    const events = ["scroll", "wheel", "touchstart", "pointerdown", "keydown", "click"];

    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, start));
    };
    function start() {
      if (started) return;
      audio
        .play()
        .then(() => {
          started = true;
          cleanup();
        })
        .catch(() => {
          /* gesture not strong enough yet — a later event will retry */
        });
    }

    events.forEach((e) => window.addEventListener(e, start, { passive: true }));

    return () => {
      cleanup();
      audio.pause();
      audio.src = "";
    };
  }, []);

  return null;
}
