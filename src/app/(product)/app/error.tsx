"use client";

import Link from "next/link";
import { primaryButtonClass, secondaryButtonClass } from "@/components/app/ui";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="panel rounded-xl p-6" role="alert">
      <h1 className="text-xl font-semibold text-navy">The workspace could not load this view.</h1>
      <p className="mt-2 text-sm leading-6 text-muted">The request failed before the page could finish. Your data is unchanged. Try the view again, or return to the overview.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={primaryButtonClass} type="button" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/app" className={secondaryButtonClass}>
          Back to overview
        </Link>
      </div>
    </div>
  );
}
