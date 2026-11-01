import { Badge, Empty, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { connectSnapshot } from "@/server/modules/read/service";

export default async function SourcesPage() {
  const context = await requireOrg();
  const data = await connectSnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro eyebrow="Data sources" title="Ingestion history" text="Each upload keeps its name, hash, status, record count, and the job that processed it." />
      {!data.files.length ? <Empty title="No files yet" text="Upload a file from Business Connect. The synthetic demo seed also appears here when it is loaded." /> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="py-2">File</th>
              <th>Status</th>
              <th>Records</th>
              <th>Job</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {data.files.map((file) => {
              const job = data.jobs.find((item) => item.uploadedFileId === file.id);
              return (
                <tr key={file.id} className="border-t border-line">
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-navy">{file.originalName}</p>
                    <p className="text-xs text-muted">{file.createdAt.toISOString()} · {file.byteSize} bytes</p>
                  </td>
                  <td><Badge>{file.status}</Badge></td>
                  <td>{file.recordCount}</td>
                  <td>{job ? `${job.status} · read ${job.recordsRead} · wrote ${job.recordsWritten}` : "—"}</td>
                  <td className="max-w-xs text-danger">{file.error || job?.error || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
