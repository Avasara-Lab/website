import { ProfileForm } from "@/components/app/client";
import { PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { canAdminister } from "@/server/domain";
import { settingsSnapshot } from "@/server/modules/read/service";

export default async function SettingsPage() {
  const context = await requireOrg();
  const data = await settingsSnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro eyebrow="Organization settings" title="Company profile" text="The profile is the organization record. It does not change another tenant." />
      <p className="text-sm text-muted">Departments: {data.departments.map((department) => department.name).join(", ") || "none"}.</p>
      {canAdminister(context.role) && data.profile ? (
        <ProfileForm
          companyName={data.profile.companyName}
          industry={data.profile.industry ?? ""}
          employeeCount={data.profile.employeeCount}
          objectives={data.profile.objectives ?? ""}
        />
      ) : <p className="text-sm text-muted">Only an owner or administrator can edit the profile.</p>}
      <section>
        <h2 className="text-lg font-semibold text-navy">Audit log</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {data.audits.map((entry) => <li key={entry.id} className="text-muted">{entry.createdAt.toISOString()} · {entry.action} · {entry.targetType}</li>)}
          {!data.audits.length ? <li className="text-muted">No audited actions yet.</li> : null}
        </ul>
      </section>
    </>
  );
}
