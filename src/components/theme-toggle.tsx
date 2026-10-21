"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type ThemeChoice = "light" | "dark" | "system";

const storageKey = "avasara-theme";
const eventName = "avasara-theme-change";

function isChoice(value: string | null | undefined): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

function applyTheme(choice: ThemeChoice) {
  const dark =
    choice === "dark" ||
    (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themeChoice = choice;
  try {
    localStorage.setItem(storageKey, choice);
  } catch {
    /* Private browsing can block storage. The choice still applies for this view. */
  }
  window.dispatchEvent(new Event(eventName));
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMedia = () => {
    if (document.documentElement.dataset.themeChoice === "system") applyTheme("system");
    else onStoreChange();
  };
  media.addEventListener("change", onMedia);
  window.addEventListener(eventName, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    media.removeEventListener("change", onMedia);
    window.removeEventListener(eventName, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  const choice = document.documentElement.dataset.themeChoice;
  return isChoice(choice) ? choice : "system";
}

function getServerSnapshot(): ThemeChoice {
  return "system";
}

const nextChoice: Record<ThemeChoice, ThemeChoice> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const labels: Record<ThemeChoice, string> = {
  light: "Theme: light. Switch to dark.",
  dark: "Theme: dark. Switch to system.",
  system: "Theme: system. Switch to light.",
};

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const Icon = choice === "dark" ? Moon : choice === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={() => applyTheme(nextChoice[choice])}
      aria-label={labels[choice]}
      className="inline-flex size-11 items-center justify-center rounded-lg border border-line text-navy hover:border-cyan hover:text-cyan"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
