"use client";

import { useMemo, useState } from "react";
import { feedbackItems, feedbackThemes } from "@/lib/content";

const severityTone = {
  High: "bg-danger-soft text-danger",
  Medium: "bg-orange-soft text-orange",
  Low: "bg-cyan-soft text-cyan",
} as const;

export function FeedbackDemo() {
  const [theme, setTheme] = useState<(typeof feedbackThemes)[number]>("All");
  const [selectedId, setSelectedId] = useState<string>(feedbackItems[0].id);

  const visible = useMemo(
    () =>
      feedbackItems.filter((item) => theme === "All" || item.theme === theme),
    [theme],
  );

  const selected =
    visible.find((item) => item.id === selectedId) ?? visible[0] ?? feedbackItems[0];

  const counts = feedbackThemes
    .filter((item) => item !== "All")
    .map((item) => ({
      theme: item,
      count: feedbackItems.filter((entry) => entry.theme === item).length,
    }));

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <p className="text-sm font-semibold text-navy">Sample reading</p>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
            Synthetic demo data. These records are examples written for the
            interface. They are not live customer data and are not produced by
            a connected analysis service.
          </p>
        </div>
        <p className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
          {feedbackItems.length} sample records
        </p>
      </div>

      <div className="grid gap-2 border-b border-line px-4 py-3 sm:grid-cols-4 sm:px-5">
        {counts.map((item) => (
          <p key={item.theme} className="text-sm text-muted">
            <span className="font-semibold text-navy">{item.count}</span> {item.theme}
          </p>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-line px-4 py-3 sm:px-5">
        {feedbackThemes.map((item) => {
          const active = item === theme;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setTheme(item);
                const next = feedbackItems.find(
                  (entry) => item === "All" || entry.theme === item,
                );
                if (next) setSelectedId(next.id);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-btn text-on-btn"
                  : "bg-paper text-navy hover:bg-line"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5">
        <ul className="divide-y divide-line lg:col-span-2 lg:border-r lg:border-line" aria-label="Sample feedback">
          {visible.map((item) => {
            const active = item.id === selected.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full px-4 py-4 text-left sm:px-5 ${
                    active ? "bg-paper" : "hover:bg-paper/70"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold tracking-wide text-cyan uppercase">
                      {item.source} · {item.theme}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityTone[item.severity]}`}
                    >
                      {item.severity}
                    </span>
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-ink">
                    {item.quote}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-line px-4 py-5 sm:px-6 lg:col-span-3 lg:border-t-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
            Recommended next step
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-navy">{selected.productArea}</h3>
          <p className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-navy">
              {selected.theme}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityTone[selected.severity]}`}
            >
              {selected.severity} severity
            </span>
          </p>
          <blockquote className="mt-5 border-l-2 border-line pl-4 text-sm leading-6 text-muted">
            {selected.quote}
          </blockquote>
          <p className="mt-5 text-base leading-7 text-ink">{selected.nextStep}</p>
          <p className="mt-6 text-xs leading-5 text-muted">
            A working product would need connected sources, a review step for
            the team, and a record of whether the action changed the theme.
            This demo does not do that work.
          </p>
        </div>
      </div>
    </div>
  );
}
