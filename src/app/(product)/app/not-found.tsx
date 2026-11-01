import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel rounded-xl p-6">
      <h1 className="text-xl font-semibold text-navy">That record is not in this organization.</h1>
      <p className="mt-2 text-sm leading-6 text-muted">The link may be wrong, or the record belongs to a different workspace.</p>
      <Link href="/app" className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-cyan">Back to overview</Link>
    </div>
  );
}
