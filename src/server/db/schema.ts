import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Better Auth tables. Property names match the adapter's camelCase field
 * names. SQL column names stay snake_case.
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: "date" }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: "date" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    uniqueIndex("account_provider_account_idx").on(table.providerId, table.accountId),
  ],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow(),
});

export const organizations = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    synthetic: boolean("synthetic").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("organizations_slug_idx").on(table.slug)],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("organization_members_org_user_idx").on(table.organizationId, table.userId),
    index("organization_members_user_idx").on(table.userId),
  ],
);

export const departments = pgTable(
  "departments",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("departments_org_name_idx").on(table.organizationId, table.name)],
);

export const businessProfiles = pgTable("business_profiles", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" })
    .unique(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  employeeCount: integer("employee_count"),
  objectives: text("objectives"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const invitations = pgTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "date" }),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("invitations_org_idx").on(table.organizationId),
    uniqueIndex("invitations_token_hash_idx").on(table.tokenHash),
  ],
);

export const dataSources = pgTable(
  "data_sources",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull(),
    recordCount: integer("record_count").notNull().default(0),
    lastError: text("last_error"),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("data_sources_org_idx").on(table.organizationId)],
);

export const uploadedFiles = pgTable(
  "uploaded_files",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    dataSourceId: text("data_source_id")
      .notNull()
      .references(() => dataSources.id, { onDelete: "cascade" }),
    originalName: text("original_name").notNull(),
    mediaType: text("media_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    sha256: text("sha256").notNull(),
    storageKey: text("storage_key").notNull(),
    status: text("status").notNull(),
    recordCount: integer("record_count").notNull().default(0),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("uploaded_files_org_idx").on(table.organizationId),
    uniqueIndex("uploaded_files_org_sha_idx").on(table.organizationId, table.sha256),
  ],
);

export const ingestionJobs = pgTable(
  "ingestion_jobs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    uploadedFileId: text("uploaded_file_id").references(() => uploadedFiles.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    attempts: integer("attempts").notNull().default(0),
    recordsRead: integer("records_read").notNull().default(0),
    recordsWritten: integer("records_written").notNull().default(0),
    error: text("error"),
    idempotencyKey: text("idempotency_key").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
    finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("ingestion_jobs_org_idx").on(table.organizationId),
    uniqueIndex("ingestion_jobs_idempotency_idx").on(table.organizationId, table.idempotencyKey),
  ],
);

export const businessEntities = pgTable(
  "business_entities",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    name: text("name").notNull(),
    externalKey: text("external_key").notNull(),
    attributes: jsonb("attributes").$type<Record<string, unknown>>().notNull().default({}),
    provenance: text("provenance").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("business_entities_org_kind_key_idx").on(table.organizationId, table.kind, table.externalKey),
    index("business_entities_org_idx").on(table.organizationId),
  ],
);

export const businessEvents = pgTable(
  "business_events",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    dataSourceId: text("data_source_id").references(() => dataSources.id, { onDelete: "set null" }),
    uploadedFileId: text("uploaded_file_id").references(() => uploadedFiles.id, { onDelete: "set null" }),
    entityId: text("entity_id").references(() => businessEntities.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true, mode: "date" }).notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    attributes: jsonb("attributes").$type<Record<string, unknown>>().notNull().default({}),
    provenance: text("provenance").notNull(),
    dedupeKey: text("dedupe_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("business_events_org_dedupe_idx").on(table.organizationId, table.dedupeKey),
    index("business_events_org_occurred_idx").on(table.organizationId, table.occurredAt),
    index("business_events_org_type_idx").on(table.organizationId, table.type),
  ],
);

export const businessRelationships = pgTable(
  "business_relationships",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    fromEntityId: text("from_entity_id")
      .notNull()
      .references(() => businessEntities.id, { onDelete: "cascade" }),
    toEntityId: text("to_entity_id")
      .notNull()
      .references(() => businessEntities.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("business_relationships_unique_idx").on(
      table.organizationId,
      table.fromEntityId,
      table.toEntityId,
      table.kind,
    ),
    index("business_relationships_org_idx").on(table.organizationId),
  ],
);

export const signals = pgTable(
  "signals",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    fingerprint: text("fingerprint").notNull(),
    category: text("category").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    frequency: integer("frequency").notNull(),
    firstObserved: timestamp("first_observed", { withTimezone: true, mode: "date" }).notNull(),
    lastObserved: timestamp("last_observed", { withTimezone: true, mode: "date" }).notNull(),
    departments: jsonb("departments").$type<string[]>().notNull().default([]),
    confidence: doublePrecision("confidence").notNull(),
    severity: text("severity").notNull(),
    trend: text("trend").notNull(),
    detectionMethod: text("detection_method").notNull(),
    opportunityGroup: text("opportunity_group").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("signals_org_fingerprint_idx").on(table.organizationId, table.fingerprint),
    index("signals_org_idx").on(table.organizationId),
  ],
);

export const signalEvidence = pgTable(
  "signal_evidence",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    signalId: text("signal_id")
      .notNull()
      .references(() => signals.id, { onDelete: "cascade" }),
    eventId: text("event_id")
      .notNull()
      .references(() => businessEvents.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    excerpt: text("excerpt").notNull(),
    provenance: text("provenance").notNull(),
  },
  (table) => [
    index("signal_evidence_signal_idx").on(table.signalId),
    uniqueIndex("signal_evidence_unique_idx").on(table.signalId, table.eventId, table.role),
  ],
);

export const opportunities = pgTable(
  "opportunities",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sourceKey: text("source_key").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    problem: text("problem").notNull(),
    departments: jsonb("departments").$type<string[]>().notNull().default([]),
    frequency: integer("frequency").notNull(),
    impactSummary: text("impact_summary").notNull(),
    confidence: doublePrecision("confidence").notNull(),
    estimatedMinutesSaved: integer("estimated_minutes_saved").notNull(),
    measuredMinutesSaved: integer("measured_minutes_saved"),
    recommendedSolution: text("recommended_solution").notNull(),
    suggestedAgent: text("suggested_agent").notNull(),
    executable: boolean("executable").notNull().default(false),
    complexity: text("complexity").notNull(),
    priorityScore: integer("priority_score").notNull(),
    priority: text("priority").notNull(),
    priorityMethod: text("priority_method").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("opportunities_org_source_idx").on(table.organizationId, table.sourceKey),
    index("opportunities_org_status_idx").on(table.organizationId, table.status),
  ],
);

export const opportunityEvidence = pgTable(
  "opportunity_evidence",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    signalId: text("signal_id")
      .notNull()
      .references(() => signals.id, { onDelete: "cascade" }),
    note: text("note").notNull(),
    provenance: text("provenance").notNull(),
  },
  (table) => [
    uniqueIndex("opportunity_evidence_unique_idx").on(table.opportunityId, table.signalId),
    index("opportunity_evidence_org_idx").on(table.organizationId),
  ],
);

export const interpretations = pgTable(
  "interpretations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    body: text("body").notNull(),
    model: text("model"),
    provenance: text("provenance").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("interpretations_org_target_idx").on(table.organizationId, table.targetType, table.targetId)],
);

export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    opportunityId: text("opportunity_id").references(() => opportunities.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    department: text("department"),
    modelId: text("model_id").notNull(),
    status: text("status").notNull(),
    channel: text("channel").notNull(),
    permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("agents_org_idx").on(table.organizationId)],
);

export const agentTools = pgTable(
  "agent_tools",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    enabled: boolean("enabled").notNull().default(true),
  },
  (table) => [uniqueIndex("agent_tools_unique_idx").on(table.agentId, table.name)],
);

export const workflows = pgTable("workflows", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  steps: jsonb("steps").$type<string[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const approvals = pgTable(
  "approvals",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    requestedBy: text("requested_by").references(() => user.id, { onDelete: "set null" }),
    decidedBy: text("decided_by").references(() => user.id, { onDelete: "set null" }),
    status: text("status").notNull(),
    note: text("note"),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("approvals_org_opportunity_idx").on(table.organizationId, table.opportunityId)],
);

export const agentRuns = pgTable(
  "agent_runs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    opportunityId: text("opportunity_id").references(() => opportunities.id, { onDelete: "set null" }),
    approvalId: text("approval_id").references(() => approvals.id, { onDelete: "set null" }),
    status: text("status").notNull(),
    verificationStatus: text("verification_status").notNull(),
    summary: text("summary"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [index("agent_runs_org_idx").on(table.organizationId)],
);

export const workflowExecutions = pgTable("workflow_executions", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  agentRunId: text("agent_run_id")
    .notNull()
    .references(() => agentRuns.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const executionLogs = pgTable(
  "execution_logs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    agentRunId: text("agent_run_id")
      .notNull()
      .references(() => agentRuns.id, { onDelete: "cascade" }),
    step: text("step").notNull(),
    level: text("level").notNull(),
    message: text("message").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    provenance: text("provenance").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("execution_logs_run_idx").on(table.agentRunId)],
);

export const impactMetrics = pgTable(
  "impact_metrics",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    metricKey: text("metric_key").notNull(),
    label: text("label").notNull(),
    value: doublePrecision("value").notNull(),
    unit: text("unit").notNull(),
    classification: text("classification").notNull(),
    synthetic: boolean("synthetic").notNull().default(false),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("impact_metrics_org_idx").on(table.organizationId, table.metricKey)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    kind: text("kind").notNull(),
    href: text("href"),
    readAt: timestamp("read_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("notifications_org_idx").on(table.organizationId, table.createdAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("audit_logs_org_idx").on(table.organizationId, table.createdAt)],
);

export const aiConfigurations = pgTable("ai_configurations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" })
    .unique(),
  reasoningModel: text("reasoning_model").notNull(),
  investigationModel: text("investigation_model").notNull(),
  transcribeModel: text("transcribe_model").notNull(),
  imageModel: text("image_model").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const aiUsageLogs = pgTable(
  "ai_usage_logs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    model: text("model").notNull(),
    endpoint: text("endpoint").notNull(),
    status: text("status").notNull(),
    latencyMs: integer("latency_ms"),
    error: text("error"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("ai_usage_logs_org_idx").on(table.organizationId, table.createdAt)],
);
