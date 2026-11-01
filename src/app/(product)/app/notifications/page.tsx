import { MarkNotifications } from "@/components/app/client";
import { Badge, Empty, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { listNotifications } from "@/server/modules/read/service";
import Link from "next/link";

export default async function NotificationsPage() {
  const context = await requireOrg();
  const rows = await listNotifications(context.db, context.organizationId);
  const unread = rows.filter((row) => !row.readAt).map((row) => row.id);
  return (
    <>
      <PageIntro eyebrow="Notifications" title="Signals and opportunities that changed" text="A high-severity signal or a new opportunity creates a notification for this organization." />
      <MarkNotifications ids={unread} />
      {!rows.length ? <Empty title="No notifications" text="They appear when analysis finds a high-severity signal or a new opportunity." /> : null}
      <ul className="grid gap-3">
        {rows.map((row) => (
          <li key={row.id} className="panel rounded-xl p-4">
            <Badge tone={row.readAt ? "neutral" : "orange"}>{row.readAt ? "read" : "unread"}</Badge>
            <h2 className="mt-2 font-semibold text-navy">{row.href ? <Link href={row.href}>{row.title}</Link> : row.title}</h2>
            <p className="text-sm leading-6 text-muted">{row.body}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
