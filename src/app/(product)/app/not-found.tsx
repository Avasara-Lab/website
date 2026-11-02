import Link from "next/link";
import { secondaryButtonClass } from "@/components/app/ui";

export default function NotFound() {
  return (
    <div className="panel rounded-xl p-6">
      <h1 className="text-xl font-semibold text-navy">That record is not in this organization.</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
        The link may be wrong, or the record belongs to a different workspace. Check the active organization in the header, then return to the overview.
      </p>
      <Link href="/app" className={`${secondaryButtonClass} mt-4`}>
        Back to overview
      </Link>
    </div>
  );
}
