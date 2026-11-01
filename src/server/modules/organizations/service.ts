import { and, eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/client";
import {
  aiConfigurations,
  businessProfiles,
  dataSources,
  departments,
  invitations,
  organizationMembers,
  organizations,
} from "@/server/db/schema";
import { CONNECTOR_TYPES, type Role, isRole } from "@/server/domain";
import { DEFAULT_MODELS } from "@/server/modules/meta-ai/catalog";
import { createId, randomToken, sha256 } from "@/server/ids";

const CONNECTOR_LABELS: Record<string, string> = {
  upload: "File upload",
  hubspot: "HubSpot",
  gmail: "Gmail",
  slack: "Slack",
  notion: "Notion",
  clickup: "ClickUp",
  quickbooks: "QuickBooks",
};

export async function createOrganization(
  db: AppDatabase,
  input: {
    userId: string;
    name: string;
    industry?: string | null;
    employeeCount?: number | null;
    objectives?: string | null;
    departmentNames?: string[];
    synthetic?: boolean;
  },
) {
  const organizationId = createId();
  const slug = `${slugify(input.name)}-${organizationId.slice(0, 8)}`;
  const now = new Date();
  await db.insert(organizations).values({
    id: organizationId,
    name: input.name.trim(),
    slug,
    synthetic: input.synthetic ?? false,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(organizationMembers).values({
    id: createId(),
    organizationId,
    userId: input.userId,
    role: "owner",
  });
  await db.insert(businessProfiles).values({
    id: createId(),
    organizationId,
    companyName: input.name.trim(),
    industry: input.industry ?? null,
    employeeCount: input.employeeCount ?? null,
    objectives: input.objectives ?? null,
  });
  const names = input.departmentNames?.length ? input.departmentNames : ["General"];
  await db.insert(departments).values(
    [...new Set(names.map((name) => name.trim()).filter(Boolean))].map((name) => ({
      id: createId(),
      organizationId,
      name,
    })),
  );
  await db.insert(dataSources).values(
    CONNECTOR_TYPES.map((type) => ({
      id: createId(),
      organizationId,
      name: CONNECTOR_LABELS[type],
      type,
      status: type === "upload" ? "ready" : "needs_configuration",
      recordCount: 0,
    })),
  );
  await db.insert(aiConfigurations).values({
    id: createId(),
    organizationId,
    ...DEFAULT_MODELS,
  });
  return organizationId;
}

export async function updateProfile(
  db: AppDatabase,
  organizationId: string,
  input: { companyName: string; industry: string; employeeCount: number | null; objectives: string },
) {
  await db
    .update(businessProfiles)
    .set({
      companyName: input.companyName,
      industry: input.industry,
      employeeCount: input.employeeCount,
      objectives: input.objectives,
      updatedAt: new Date(),
    })
    .where(eq(businessProfiles.organizationId, organizationId));
  await db.update(organizations).set({ name: input.companyName, updatedAt: new Date() }).where(eq(organizations.id, organizationId));
}

export async function createInvitation(db: AppDatabase, input: { organizationId: string; email: string; role: Role; createdBy: string }) {
  if (!isRole(input.role) || input.role === "owner") {
    throw new Error("Choose administrator, manager, or member.");
  }
  const token = randomToken();
  const id = createId();
  await db.insert(invitations).values({
    id,
    organizationId: input.organizationId,
    email: input.email.toLowerCase(),
    role: input.role,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: input.createdBy,
  });
  return { id, token };
}

export async function acceptInvitation(db: AppDatabase, input: { token: string; userId: string; email: string }) {
  const [invite] = await db.select().from(invitations).where(eq(invitations.tokenHash, sha256(input.token))).limit(1);
  if (!invite || invite.acceptedAt || invite.expiresAt.getTime() < Date.now()) {
    throw new Error("This invitation is missing or expired.");
  }
  if (invite.email !== input.email.toLowerCase()) {
    throw new Error("Sign in with the invited email address.");
  }
  if (!isRole(invite.role)) throw new Error("This invitation has an unknown role.");
  const [existing] = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, invite.organizationId), eq(organizationMembers.userId, input.userId)))
    .limit(1);
  if (!existing) {
    await db.insert(organizationMembers).values({
      id: createId(),
      organizationId: invite.organizationId,
      userId: input.userId,
      role: invite.role,
    });
  }
  await db.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, invite.id));
  return invite.organizationId;
}

function slugify(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "org";
}
