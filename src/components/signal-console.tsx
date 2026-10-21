"use client";

import { useEffect, useState } from "react";
import { signals } from "@/lib/content";

const severityTone = {
  High: "bg-danger-soft text-danger",
  Medium: "bg-orange-soft text-orange",
} as const;

export function SignalConsole() {
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [explicitPlay, setExplicitPlay] = useState(false);
  const signal = signals[active];

  useEffect(() => {
    if (userPaused || hoverPaused) return;
    const timer = window.setInterval(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion && !explicitPlay) return;
      setActive((current) => (current + 1) % signals.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [userPaused, hoverPaused, explicitPlay]);

  return (
    <div
      className="overflow-hidden rounded-xl border border-line bg-surface"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHoverPaused(false);
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-semibold text-navy">Signal path</p>
          <p className="text-xs text-muted">
            Incoming signal, analysis, recommended action, measurable impact
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted uppercase">
            Interface concept
          </span>
          <button
            type="button"
            className="min-h-8 rounded-md border border-line px-2.5 text-xs font-semibold text-navy hover:border-navy/30"
            onClick={() => {
              setUserPaused((value) => {
                const next = !value;
                if (!next) setExplicitPlay(true);
                return next;
              });
            }}
            aria-pressed={!userPaused}
          >
            {userPaused ? "Play" : "Pause"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12">
        <div className="border-b border-line lg:col-span-4 lg:border-r lg:border-b-0">
          <p className="px-4 pt-4 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase sm:px-5">
            Incoming
          </p>
          <ul className="p-2" aria-label="Incoming signals">
            {signals.map((item, index) => {
              const selected = index === active;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActive(index)}
                    className={`w-full rounded-md px-3 py-3 text-left ${
                      selected ? "bg-paper" : "hover:bg-paper/70"
                    }`}
                  >
                    <span className="block text-[11px] font-medium tracking-wide text-cyan uppercase">
                      {item.source}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-navy">
                      {item.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          key={signal.id}
          className="signal-swap grid lg:col-span-8 lg:grid-cols-2"
        >
          <div className="border-b border-line px-4 py-5 sm:px-5 lg:border-r lg:border-b-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              Analysis
            </p>
            <h3 className="mt-3 text-xl font-semibold text-navy">{signal.theme}</h3>
            <p className="mt-3">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${severityTone[signal.severity]}`}
              >
                {signal.severity} severity
              </span>
            </p>
            <p className="mt-4 text-sm leading-6 text-muted">{signal.why}</p>
            <p className="mt-4 text-sm leading-6 text-ink">{signal.detail}</p>
          </div>
          <div className="bg-inverse px-4 py-5 text-on-inverse sm:px-5">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-on-inverse/60 uppercase">
              Recommended action
            </p>
            <p className="mt-3 text-lg leading-7 font-medium text-on-inverse">
              {signal.action}
            </p>
            <div className="mt-6 border-t border-on-inverse/15 pt-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-cyan uppercase">
                Measure
              </p>
              <p className="mt-2 text-sm leading-6 text-on-inverse/80">{signal.measure}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
