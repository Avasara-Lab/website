import Link from "next/link";
import { MarkNotifications } from "@/components/app/client";
import { Empty, PageIntro, StatusBadge } from "@/components/app/ui";
import { formatWhen } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { listNotifications } from "@/server/modules/read/service";

export default async function NotificationsPage() {
  const context = await requireOrg();
  const rows = await listNotifications(context.db, context.organizationId);
  const unread = rows.filter((row) => !row.readAt).map((row) => row.id);
  return (
    <>
      <PageIntro
        eyebrow="Notifications"
        title="Signals and opportunities that changed"
        text="A high-severity signal or a new opportunity creates a notification for this organization. Open the linked item when you want to act on it."
        actions={<MarkNotifications ids={unread} />}
      />
      {!rows.length ? (
        <Empty title="No notifications" text="They appear when analysis finds a high-severity signal or a new opportunity." action={{ href: "/app/signals", label: "Review signals" }} />
      ) : (
        <ul className="grid gap-3">
          {rows.map((row) => {
            const body = (
              <>
                <StatusBadge value={row.readAt ? "read" : "unread"} />
                <h2 className="mt-2 font-semibold text-navy">{row.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{row.body}</p>
                <p className="mt-2 text-xs text-muted">{formatWhen(row.createdAt, true)}</p>
              </>
            );
            const className = `panel block rounded-xl p-4 ${row.readAt ? "" : "border-l-2 border-l-orange"}`;
            return (
              <li key={row.id}>
                {row.href ? (
                  <Link href={row.href} className={`${className} hover:border-cyan/40`}>
                    {body}
                  </Link>
                ) : (
                  <article className={className}>{body}</article>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
