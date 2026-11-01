import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/server/auth/auth";
import { getDb, type AppDatabase } from "@/server/db/client";
import { organizationMembers, organizations } from "@/server/db/schema";
import { type Role, isRole } from "@/server/domain";

export const ORG_COOKIE = "avasara_org";

export type OrgContext = {
  db: AppDatabase;
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  organizationName: string;
  synthetic: boolean;
  role: Role;
  memberships: { organizationId: string; name: string; role: Role; synthetic: boolean }[];
};

export async function readSession(requestHeaders?: Headers) {
  const headerList = requestHeaders ?? (await headers());
  return getAuth().api.getSession({ headers: headerList });
}

export async function listMemberships(db: AppDatabase, userId: string) {
  const rows = await db
    .select({
      organizationId: organizationMembers.organizationId,
      role: organizationMembers.role,
      name: organizations.name,
      synthetic: organizations.synthetic,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userId, userId));
  return rows.filter((row): row is typeof row & { role: Role } => isRole(row.role));
}

export async function requireOrg(): Promise<OrgContext> {
  const session = await readSession();
  if (!session) redirect("/login");
  const db = getDb();
  const memberships = await listMemberships(db, session.user.id);
  if (!memberships.length) redirect("/app/onboarding");
  const jar = await cookies();
  const requested = jar.get(ORG_COOKIE)?.value;
  const current = memberships.find((item) => item.organizationId === requested) ?? memberships[0];
  return {
    db,
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    organizationId: current.organizationId,
    organizationName: current.name,
    synthetic: current.synthetic,
    role: current.role,
    memberships,
  };
}

export async function requireUser() {
  const session = await readSession();
  if (!session) redirect("/login");
  return { db: getDb(), userId: session.user.id, email: session.user.email, name: session.user.name };
}
