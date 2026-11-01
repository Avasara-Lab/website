import { SUPPORT_TOOLS, type MemoryEventInput, stringAttr } from "@/server/domain";

export type SupportCluster = {
  intent: string;
  count: number;
  eventIds: string[];
  approvedAnswer: string | null;
  skipReason: string | null;
};

export type SupportSend = {
  intent: string;
  body: string;
  eventIds: string[];
  channel: "simulated_support_inbox";
};

const ALLOWED = new Set<string>(SUPPORT_TOOLS.map((tool) => tool.name));

export function assertAgentTools(toolNames: string[]) {
  const unknown = toolNames.filter((name) => !ALLOWED.has(name));
  if (unknown.length) {
    throw new Error(`Agent tools are outside the support allowlist: ${unknown.join(", ")}.`);
  }
  for (const required of ["read_support_evidence", "propose_reply", "simulated_send"]) {
    if (!toolNames.includes(required)) {
      throw new Error(`The support agent is missing the ${required} tool.`);
    }
  }
}

export function planSupportExecution(events: MemoryEventInput[]) {
  const groups = new Map<string, MemoryEventInput[]>();
  for (const event of events) {
    if (event.type !== "support_conversation") continue;
    const intent = stringAttr(event.attributes, "intent");
    if (!intent) continue;
    const list = groups.get(intent) ?? [];
    list.push(event);
    groups.set(intent, list);
  }

  const clusters: SupportCluster[] = [];
  const sends: SupportSend[] = [];
  for (const [intent, members] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const counts = new Map<string, number>();
    for (const event of members) {
      const answer = stringAttr(event.attributes, "approvedAnswer");
      if (!answer) continue;
      counts.set(answer, (counts.get(answer) ?? 0) + 1);
    }
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const top = ranked[0];
    const second = ranked[1];
    let approvedAnswer: string | null = null;
    let skipReason: string | null = null;
    if (!top) skipReason = "No observed approved answer is stored on these conversations.";
    else if (second && second[1] === top[1]) skipReason = "Observed approved answers disagree, so none was selected.";
    else approvedAnswer = top[0];

    clusters.push({
      intent,
      count: members.length,
      eventIds: members.map((event) => event.id),
      approvedAnswer,
      skipReason,
    });
    if (approvedAnswer) {
      sends.push({
        intent,
        body: approvedAnswer,
        eventIds: members.map((event) => event.id),
        channel: "simulated_support_inbox",
      });
    }
  }
  return { clusters, sends };
}

export function verifySupportSends(plan: ReturnType<typeof planSupportExecution>, sends: SupportSend[]) {
  const failures: string[] = [];
  if (!sends.length) failures.push("No simulated reply was produced.");
  for (const send of sends) {
    if (send.channel !== "simulated_support_inbox") failures.push(`Reply for ${send.intent} left the simulated channel.`);
    const cluster = plan.clusters.find((item) => item.intent === send.intent);
    if (!cluster?.approvedAnswer) failures.push(`Reply for ${send.intent} has no observed approved answer.`);
    else if (send.body !== cluster.approvedAnswer) failures.push(`Reply for ${send.intent} does not match the observed approved answer.`);
  }
  return { verified: failures.length === 0, failures };
}
