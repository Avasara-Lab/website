import assert from "node:assert/strict";
import { test } from "node:test";
import ExcelJS from "exceljs";
import { parseCsv, parseJsonRecords, parseTextRecords, parseXlsx } from "@/server/modules/ingestion/parse";

test("parsers read csv, json, and text without inventing a type", () => {
  const csv = parseCsv('type,occurred_at,title,body,customer\nsupport_conversation,2026-05-01T00:00:00.000Z,Reset,"Password, please",Northwind\n');
  assert.equal(csv[0]?.type, "support_conversation");
  assert.equal(csv[0]?.attributes.customer, "Northwind");
  assert.equal(csv[0]?.body, "Password, please");
  const json = parseJsonRecords(JSON.stringify({ records: [{ type: "document", body: "Notes", occurred_at: "2026-05-02T00:00:00.000Z" }] }));
  assert.equal(json.length, 1);
  const text = parseTextRecords("First note\n\nSecond note");
  assert.equal(text.length, 2);
  assert.equal(text[0]?.type, "document");
});

test("json nested attributes flatten onto the record", () => {
  const records = parseJsonRecords(JSON.stringify([
    {
      type: "support_conversation",
      occurredAt: "2026-05-01T00:00:00.000Z",
      title: "Reset",
      body: "Password please",
      intent: "top_level_wins",
      attributes: {
        intent: "password_reset",
        approvedAnswer: "Use the account recovery page.",
        customer: "Northwind",
        department: "Customer Support",
        mentionsManualReporting: true,
      },
      details: {
        employee: "Priya Shah",
        project: "Workspace Cloud",
      },
    },
    {
      type: "sales_activity",
      body: "Follow up",
      occurred_at: "2026-05-03T00:00:00.000Z",
      attributes: { deal_id: "deal-9", activity_type: "call", approved_answer: "Call the buyer." },
    },
  ]));
  assert.equal(records[0]?.attributes.intent, "top_level_wins");
  assert.equal(records[0]?.attributes.approvedAnswer, "Use the account recovery page.");
  assert.equal(records[0]?.attributes.customer, "Northwind");
  assert.equal(records[0]?.attributes.department, "Customer Support");
  assert.equal(records[0]?.attributes.mentionsManualReporting, true);
  assert.equal(records[0]?.attributes.employee, "Priya Shah");
  assert.equal(records[0]?.attributes.project, "Workspace Cloud");
  assert.equal(records[1]?.attributes.dealId, "deal-9");
  assert.equal(records[1]?.attributes.activityType, "call");
  assert.equal(records[1]?.attributes.approvedAnswer, "Call the buyer.");
  assert.deepEqual(parseJsonRecords(JSON.stringify({ records: [{ type: "document", body: "Notes", attributes: {} }] }))[0]?.attributes, {});
});

test("xlsx uses the same columns as csv", async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Records");
  sheet.addRow(["type", "occurred_at", "title", "body"]);
  sheet.addRow(["operational_record", "2026-05-01T00:00:00.000Z", "Report", "Manual report"]);
  const bytes = Buffer.from(await workbook.xlsx.writeBuffer());
  const records = await parseXlsx(bytes);
  assert.equal(records[0]?.type, "operational_record");
  assert.equal(records[0]?.title, "Report");
});
