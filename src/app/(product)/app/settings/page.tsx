import { ProfileForm } from "@/components/app/client";
import { DataTable, PageIntro, Section, tdClass, thClass } from "@/components/app/ui";
import { formatWhen, labelize } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { canAdminister } from "@/server/domain";
import { settingsSnapshot } from "@/server/modules/read/service";

export default async function SettingsPage() {
  const context = await requireOrg();
  const data = await settingsSnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro
        eyebrow="Organization settings"
        title="Company profile"
        text="The profile is the organization record. Saving it does not change another tenant."
      />
      <p className="text-sm leading-6 text-muted">Departments: {data.departments.map((department) => department.name).join(", ") || "none"}.</p>
      {canAdminister(context.role) && data.profile ? (
        <ProfileForm
          companyName={data.profile.companyName}
          industry={data.profile.industry ?? ""}
          employeeCount={data.profile.employeeCount}
          objectives={data.profile.objectives ?? ""}
        />
      ) : (
        <p className="text-sm leading-6 text-muted">Only an owner or administrator can edit the profile.</p>
      )}
      <Section title="Audit log" text="Recent actions recorded for this organization.">
        {data.audits.length ? (
          <DataTable caption="Recent audit log entries">
            <thead>
              <tr>
                <th className={thClass}>When</th>
                <th className={thClass}>Action</th>
                <th className={thClass}>Target</th>
              </tr>
            </thead>
            <tbody>
              {data.audits.map((entry) => (
                <tr key={entry.id}>
                  <td className={tdClass}>{formatWhen(entry.createdAt, true)}</td>
                  <td className={tdClass}>{labelize(entry.action)}</td>
                  <td className={`${tdClass} text-muted`}>{labelize(entry.targetType)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        ) : (
          <p className="text-sm leading-6 text-muted">No audited actions yet.</p>
        )}
      </Section>
    </>
  );
}
