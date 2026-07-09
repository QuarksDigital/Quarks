"use client";

import { useRef, type RefObject } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import {
  createCollisionsScene,
  type CollisionsRefs,
  type CollisionBlockRefs,
} from "@/animations/scenes/collisions";
import Odometer from "@/components/ui/Odometer";
import { COLLISIONS, type CollisionDef } from "@/constants/content";

interface BlockBind {
  block: RefObject<HTMLElement | null>;
  beamL: RefObject<HTMLDivElement | null>;
  beamR: RefObject<HTMLDivElement | null>;
  flash: RefObject<HTMLDivElement | null>;
  media: RefObject<HTMLDivElement | null>;
  mediaImg: RefObject<HTMLImageElement | null>;
  title: RefObject<HTMLHeadingElement | null>;
  meta: RefObject<HTMLDivElement | null>;
  metrics: RefObject<HTMLDivElement | null>;
}

function useBlockBind(): { bind: BlockBind; refs: CollisionBlockRefs } {
  const block = useRef<HTMLElement>(null);
  const beamL = useRef<HTMLDivElement>(null);
  const beamR = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const mediaImg = useRef<HTMLImageElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const metrics = useRef<HTMLDivElement>(null);
  return {
    bind: { block, beamL, beamR, flash, media, mediaImg, title, meta, metrics },
    refs: {
      get block() {
        return block.current;
      },
      get beamL() {
        return beamL.current;
      },
      get beamR() {
        return beamR.current;
      },
      get flash() {
        return flash.current;
      },
      get media() {
        return media.current;
      },
      get mediaImg() {
        return mediaImg.current;
      },
      get title() {
        return title.current;
      },
      get meta() {
        return meta.current;
      },
      get metrics() {
        return metrics.current;
      },
    },
  };
}

function CollisionBlock({
  c,
  bind,
  eager,
}: {
  c: CollisionDef;
  bind: BlockBind;
  eager: boolean;
}) {
  const { block, beamL, beamR, flash, media, mediaImg, title, meta, metrics } =
    bind;
  return (
    <article
      ref={block}
      className="relative flex h-screen flex-col justify-center overflow-hidden px-6 lg:px-24"
      style={{ zIndex: "var(--z-scene)" }}
    >
      <div
        ref={beamL}
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-px w-[45vw]"
        style={{
          background: "linear-gradient(to right, transparent, #38dbff)",
          boxShadow: "0 0 12px rgba(56,219,255,0.8)",
        }}
      >
        <span
          className="type-mono absolute -top-5 right-0 text-cherenkov-300"
          style={{ fontSize: "0.6rem" }}
        >
          {c.client}
        </span>
      </div>
      <div
        ref={beamR}
        aria-hidden="true"
        className="absolute right-0 top-1/2 h-px w-[45vw]"
        style={{
          background: "linear-gradient(to left, transparent, #9ff1ff)",
          boxShadow: "0 0 12px rgba(159,241,255,0.8)",
        }}
      >
        <span
          className="type-mono absolute -top-5 left-0 text-dust"
          style={{ fontSize: "0.6rem" }}
        >
          QUARKS
        </span>
      </div>
      <div
        ref={flash}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(232,252,255,0.9), rgba(56,219,255,0.35) 45%, transparent 75%)",
        }}
      />

      <div
        ref={media}
        className="absolute inset-0 will-change-transform"
        data-cursor="media"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- WebGL displacement texture source; sizes controlled */}
        <img
          ref={mediaImg}
          src={c.image}
          alt={`${c.client} - case visual`}
          className="h-full w-full object-cover"
          loading={eager ? "eager" : "lazy"}
          draggable={false}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(4,4,10,0.9) 0%, rgba(4,4,10,0.2) 40%, rgba(4,4,10,0.35) 100%)",
          }}
        />
      </div>

      <div className="relative flex h-full flex-col justify-end pb-[12vh]">
        <div ref={meta} className="type-mono mb-4 text-cherenkov-300">
          {c.index} - {c.client} × QUARKS - {c.sector} - {c.year}
        </div>
        <h3
          ref={title}
          className="type-display text-starlight"
          style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)" }}
        >
          <span className="block overflow-hidden">
            <span data-line className="block">
              {c.product}
            </span>
          </span>
        </h3>
        <div ref={metrics} className="mt-8 flex flex-wrap gap-10">
          {c.metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <span className="type-display text-3xl text-whitehot lg:text-5xl">
                <Odometer value={m.value} prefix={m.prefix} suffix={m.suffix} />
              </span>
              <span
                className="type-mono text-dust"
                style={{ fontSize: "0.62rem" }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Collisions() {
  const wrapper = useRef<HTMLElement>(null);
  const b0 = useBlockBind();
  const b1 = useBlockBind();
  const b2 = useBlockBind();
  const all = [b0, b1, b2];

  useSceneTrigger<CollisionsRefs>((args) => createCollisionsScene(args), {
    get wrapper() {
      return wrapper.current;
    },
    blocks: all.map((b) => b.refs),
  });

  return (
    <section
      ref={wrapper}
      id="collisions"
      aria-label="Selected work - collisions"
    >
      {COLLISIONS.map((c, i) => (
        <CollisionBlock key={c.id} c={c} bind={all[i].bind} eager={i === 0} />
      ))}
    </section>
  );
}
