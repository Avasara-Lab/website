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
