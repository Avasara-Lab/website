import { ProfileForm } from "@/components/app/client";
import { Badge, DataTable, Empty, PageIntro, Section, tdClass, thClass } from "@/components/app/ui";
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
        title={data.profile?.companyName || context.organizationName}
        text="This name is the active organization in the header and sidebar. Saving the profile changes only this organization."
      />
      <section className="panel rounded-xl p-5">
        <h2 className="text-sm font-semibold text-navy">Departments</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Set when the organization was created. Opportunities use these names when they are grouped.</p>
        {data.departments.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.departments.map((department) => (
              <li key={department.id}>
                <Badge>{department.name}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">None recorded.</p>
        )}
      </section>
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
          <Empty title="No audited actions yet" text="Uploads, invitations, and approvals appear here after someone takes those actions in this organization." />
        )}
      </Section>
    </>
  );
}
