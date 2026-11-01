import { eq } from "drizzle-orm";
import { createAuth } from "@/server/auth/auth";
import { getDb } from "@/server/db/client";
import { businessEvents, dataSources, organizationMembers, user } from "@/server/db/schema";
import { DEMO_AS_OF, DEMO_COMPANY, DEMO_EMAIL, DEMO_PASSWORD, buildSyntheticRecords } from "@/server/demo/synthetic-company";
import { ingestRecords } from "@/server/modules/ingestion/persist";
import { createOrganization } from "@/server/modules/organizations/service";

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

const membership = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, userId)).limit(1);
const organizationId = membership[0]?.organizationId
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
  const [source] = await db.select().from(dataSources).where(eq(dataSources.organizationId, organizationId));
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
console.log(`Synthetic company: ${DEMO_COMPANY}`);
console.log(`Sign in: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
process.exit(0);
