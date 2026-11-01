import { and, eq, inArray } from "drizzle-orm";
import { createAuth } from "@/server/auth/auth";
import { getDb } from "@/server/db/client";
import { businessEvents, dataSources, organizationMembers, organizations, user } from "@/server/db/schema";
import { seedRefusal } from "@/server/demo/seed-guard";
import { DEMO_AS_OF, DEMO_COMPANY, DEMO_EMAIL, DEMO_PASSWORD, buildSyntheticRecords } from "@/server/demo/synthetic-company";
import { ingestRecords } from "@/server/modules/ingestion/persist";
import { createOrganization } from "@/server/modules/organizations/service";

const refusal = seedRefusal(process.env);
if (refusal) {
  console.error(refusal);
  process.exit(1);
}

const db = getDb();
const existing = await db.select().from(user).where(eq(user.email, DEMO_EMAIL)).limit(1);
let userId = existing[0]?.id;
if (!userId) {
  const auth = createAuth(db);
  const result = await auth.api.signUpEmail({
    body: { name: "Demo Founder", email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });
  userId = result.user.id;
}

const memberships = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, userId));
const memberOrgIds = memberships.map((membership) => membership.organizationId);
const existingOrgs = memberOrgIds.length
  ? await db.select().from(organizations).where(inArray(organizations.id, memberOrgIds))
  : [];
const demoOrg = existingOrgs.find((organization) => organization.synthetic && organization.name === DEMO_COMPANY);
const organizationId = demoOrg?.id
  ?? await createOrganization(db, {
    userId,
    name: DEMO_COMPANY,
    industry: "Software",
    employeeCount: 25,
    objectives: "Reduce repeated support replies, late sales follow-ups, and manual weekly reporting.",
    departmentNames: ["Sales", "Customer Support", "Operations"],
    synthetic: true,
  });

const [already] = await db.select({ id: businessEvents.id }).from(businessEvents).where(eq(businessEvents.organizationId, organizationId)).limit(1);
if (!already) {
  const sources = await db.select().from(dataSources).where(and(eq(dataSources.organizationId, organizationId), eq(dataSources.type, "upload")));
  const source = sources[0];
  if (!source) throw new Error("The demo organization has no upload source.");
  const result = await ingestRecords(db, {
    organizationId,
    dataSourceId: source.id,
    records: buildSyntheticRecords(),
    asOf: DEMO_AS_OF,
  });
  console.log(`Seeded ${result.written} synthetic records, ${result.signals} signals, ${result.opportunities} opportunities.`);
} else {
  console.log("Demo organization already has events. Seed left them in place.");
}
console.log(`Synthetic company: ${DEMO_COMPANY}. These records are not customer results.`);
console.log(`Non-production sign-in: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
process.exit(0);
