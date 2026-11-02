import Link from "next/link";
import { DataTable, Empty, PageIntro, StatusBadge, secondaryButtonClass, tdClass, thClass } from "@/components/app/ui";
import { formatWhen } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { connectSnapshot } from "@/server/modules/read/service";

export default async function SourcesPage() {
  const context = await requireOrg();
  const data = await connectSnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro
        eyebrow="Data sources"
        title="Ingestion history"
        text="Each upload keeps its name, status, record count, and the job that processed it. Files appear here after you upload them from Business Connect."
        actions={
          <Link href="/app/connect" className={secondaryButtonClass}>
            Upload a file
          </Link>
        }
      />
      {!data.files.length ? (
        <Empty
          title="No files yet"
          text="Upload a file from Business Connect. The synthetic demo seed also appears here when it is loaded as a file."
          action={{ href: "/app/connect", label: "Upload a file" }}
        />
      ) : (
        <DataTable caption="Uploaded files and ingestion jobs">
          <thead>
            <tr>
              <th className={thClass}>File</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Records</th>
              <th className={thClass}>Job</th>
              <th className={thClass}>Error</th>
            </tr>
          </thead>
          <tbody>
            {data.files.map((file) => {
              const job = data.jobs.find((item) => item.uploadedFileId === file.id);
              const error = file.error || job?.error || "";
              return (
                <tr key={file.id} className="hover:bg-paper">
                  <td className={tdClass}>
                    <p className="font-semibold">{file.originalName}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatWhen(file.createdAt, true)} · {formatBytes(file.byteSize)}
                    </p>
                  </td>
                  <td className={tdClass}>
                    <StatusBadge value={file.status} />
                  </td>
                  <td className={`${tdClass} tabular-nums`}>{file.recordCount}</td>
                  <td className={tdClass}>
                    {job ? (
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <StatusBadge value={job.status} />
                        <span className="text-muted">read {job.recordsRead} · wrote {job.recordsWritten}</span>
                      </span>
                    ) : (
                      <span className="text-muted">No job recorded</span>
                    )}
                  </td>
                  <td className={`${tdClass} max-w-xs text-danger`}>{error || <span className="text-muted">No error</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      )}
    </>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
