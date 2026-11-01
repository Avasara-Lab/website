"use client";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="panel rounded-xl p-6" role="alert">
      <h1 className="text-xl font-semibold text-navy">The workspace could not load this view.</h1>
      <p className="mt-2 text-sm leading-6 text-muted">The request failed before the page could finish. Your data is unchanged. Try the view again.</p>
      <button className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
