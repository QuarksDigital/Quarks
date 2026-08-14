"use client";

/**
 * QUARKS - background audio.
 *
 * Off until asked. Browsers block autoplay with sound, and unrequested audio
 * on a studio site is worse than none, so nothing loads or plays until the
 * visitor presses the control - `preload="none"` means the 5 MB track isn't
 * even fetched for people who never turn it on.
 *
 * The button is a four-bar equaliser that animates only while playing, so its
 * state is legible at a glance without a label.
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { AUDIO } from "@/constants/content";
import { COLORS } from "@/constants/tokens";
import { routeStore } from "@/lib/route";

const BARS = [0, 1, 2, 3];

export default function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rootRef = useRef<HTMLButtonElement>(null);
  const animRef = useRef<gsap.core.Tween | null>(null);
  const [on, setOn] = useState(false);

  // Invert with the route theme, like the rest of the chrome.
  useEffect(() => {
    return routeStore.subscribe(({ theme }) => {
      const light = theme === "light";
      gsap.to(rootRef.current, {
        color: light ? COLORS.ink : COLORS.bone,
        borderColor: light ? "rgba(11,12,15,.18)" : "rgba(241,240,236,.16)",
        duration: 0.5,
      });
    });
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (on) {
      animRef.current?.kill();
      animRef.current = null;
      gsap.to(barsRef.current.filter(Boolean), { scaleY: 1, duration: 0.3, ease: "power2.out" });
      // Fade out rather than cutting, then pause.
      gsap.to(audio, {
        volume: 0,
        duration: 0.4,
        ease: "none",
        onComplete: () => audio.pause(),
      });
      setOn(false);
      return;
    }

    audio.volume = 0;
    audio
      .play()
      .then(() => {
        gsap.to(audio, { volume: AUDIO.volume, duration: 1.2, ease: "power2.out" });
        animRef.current = gsap.to(barsRef.current.filter(Boolean), {
          scaleY: 2.1,
          duration: 0.42,
          repeat: -1,
          yoyo: true,
          stagger: 0.12,
          transformOrigin: "center",
          ease: "sine.inOut",
        });
        setOn(true);
      })
      .catch(() => {
        // Autoplay policy or a missing file - stay silent and stay off.
      });
  };

  useEffect(() => {
    const tween = animRef;
    return () => {
      tween.current?.kill();
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={AUDIO.track} loop preload="none" aria-hidden="true" />
      <button
        ref={rootRef}
        type="button"
        data-q="sound"
        data-cursor="link"
        aria-pressed={on}
        aria-label={on ? AUDIO.labelOn : AUDIO.labelOff}
        title={on ? AUDIO.labelOn : AUDIO.labelOff}
        onClick={toggle}
        className="flex h-9 w-9 shrink-0 items-center justify-center gap-[3px] rounded-full"
        style={{
          border: "1px solid rgba(241,240,236,.16)",
          transition: "border-color .5s",
        }}
      >
        {BARS.map((i) => (
          <span
            key={i}
            ref={(el) => {
              barsRef.current[i] = el;
            }}
            data-q="sbar"
            className="block w-px rounded-full"
            style={{
              height: 9,
              background: "currentColor",
              opacity: on ? 1 : 0.55,
              transition: "opacity .3s",
            }}
          />
        ))}
      </button>
    </>
  );
}
