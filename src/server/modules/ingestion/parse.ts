import ExcelJS from "exceljs";
import { EVENT_TYPES, type EventType, type NormalizedRecord } from "@/server/domain";

const MAX_RECORDS = 5000;

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

const HEADER_MAP: Record<string, string> = {
  type: "type",
  record_type: "type",
  recordtype: "type",
  occurred_at: "occurredAt",
  occurredat: "occurredAt",
  timestamp: "occurredAt",
  date: "occurredAt",
  title: "title",
  subject: "title",
  body: "body",
  message: "body",
  text: "body",
  transcript: "body",
  notes: "notes",
  external_id: "externalId",
  externalid: "externalId",
  id: "externalId",
  customer: "customer",
  department: "department",
  intent: "intent",
  approved_answer: "approvedAnswer",
  approvedanswer: "approvedAnswer",
  deal_id: "dealId",
  dealid: "dealId",
  activity_type: "activityType",
  activitytype: "activityType",
  process: "process",
  manual: "manual",
  owner: "owner",
  minutes: "minutes",
  employee: "employee",
  project: "project",
  mentions_manual_reporting: "mentionsManualReporting",
};

function normalizeKey(key: string) {
  const trimmed = key.trim().replace(/\s+/g, "_");
  const direct = HEADER_MAP[trimmed.toLowerCase()];
  if (direct) return direct;
  const snake = trimmed.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
  return HEADER_MAP[snake] ?? null;
}

function isEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}

function cellString(value: unknown) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value && "text" in value && typeof value.text === "string") return value.text;
  if (typeof value === "object" && value && "result" in value) return cellString(value.result);
  return String(value).trim();
}

function parseOccurredAt(value: string | undefined) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new ParseError(`Could not read a date from “${value}”.`);
  return date.toISOString();
}

function recordFromRow(row: Record<string, string>, index: number): NormalizedRecord {
  const typeValue = row.type || "document";
  if (!isEventType(typeValue)) {
    throw new ParseError(`Row ${index} has an unknown type “${typeValue}”.`);
  }
  const body = row.body || row.notes;
  if (!body) throw new ParseError(`Row ${index} needs a body, message, transcript, or notes column.`);
  const attributes: Record<string, unknown> = {};
  for (const key of [
    "customer",
    "department",
    "intent",
    "approvedAnswer",
    "dealId",
    "activityType",
    "process",
    "owner",
    "employee",
    "project",
  ] as const) {
    if (row[key]) attributes[key] = row[key];
  }
  if (row.manual) attributes.manual = row.manual === "true" || row.manual === "1" || row.manual === "yes";
  if (row.mentionsManualReporting) {
    attributes.mentionsManualReporting =
      row.mentionsManualReporting === "true" || row.mentionsManualReporting === "1" || row.mentionsManualReporting === "yes";
  }
  if (row.minutes && Number.isFinite(Number(row.minutes))) attributes.minutes = Number(row.minutes);
  return {
    type: typeValue,
    occurredAt: parseOccurredAt(row.occurredAt),
    title: row.title || body.slice(0, 80),
    body,
    externalId: row.externalId || undefined,
    attributes,
  };
}

export function parseCsv(text: string): NormalizedRecord[] {
  const rows = parseCsvRows(text).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) throw new ParseError("The CSV needs a header row and at least one record.");
  const headers = rows[0].map((header) => normalizeKey(header));
  if (!headers.some(Boolean)) throw new ParseError("The CSV header does not include a recognized column.");
  return rows.slice(1, MAX_RECORDS + 1).map((cells, index) => {
    const row: Record<string, string> = {};
    headers.forEach((header, cellIndex) => {
      if (header) row[header] = cells[cellIndex]?.trim() ?? "";
    });
    return recordFromRow(row, index + 2);
  });
}

export function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += char;
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);
}

/** Copy known fields onto a row. Nested objects, including `attributes`, are flattened so their known keys survive. */
function fillRow(source: Record<string, unknown>, row: Record<string, string>) {
  for (const [key, value] of Object.entries(source)) {
    if (value == null || isPlainObject(value)) continue;
    const mapped = normalizeKey(key);
    if (!mapped || row[mapped]) continue;
    row[mapped] = cellString(value);
  }
  for (const value of Object.values(source)) {
    if (isPlainObject(value)) fillRow(value, row);
  }
}

export function parseJsonRecords(text: string): NormalizedRecord[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ParseError("The JSON file could not be parsed.");
  }
  const list = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && Array.isArray((parsed as { records?: unknown }).records)
    ? (parsed as { records: unknown[] }).records
    : null;
  if (!list) throw new ParseError("JSON must be an array of records or an object with a records array.");
  return list.slice(0, MAX_RECORDS).map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new ParseError(`JSON record ${index + 1} is not an object.`);
    const row: Record<string, string> = {};
    fillRow(item as Record<string, unknown>, row);
    return recordFromRow(row, index + 1);
  });
}

export function parseTextRecords(text: string, fallbackType: EventType = "document"): NormalizedRecord[] {
  const chunks = text
    .split(/\n---\n|\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (!chunks.length) throw new ParseError("The text file is empty.");
  return chunks.slice(0, MAX_RECORDS).map((chunk, index) => {
    const typeLine = chunk.match(/^type:\s*(\w+)/i);
    const type = typeLine && isEventType(typeLine[1]) ? typeLine[1] : fallbackType;
    const body = typeLine ? chunk.slice(typeLine[0].length).trim() : chunk;
    return {
      type,
      occurredAt: new Date().toISOString(),
      title: body.split("\n")[0]?.slice(0, 80) || `Note ${index + 1}`,
      body: body || chunk,
      attributes: {},
    };
  });
}

export async function parseXlsx(bytes: Buffer): Promise<NormalizedRecord[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes as unknown as ExcelJS.Buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new ParseError("The workbook has no worksheet.");
  const headerRow = sheet.getRow(1);
  const headers: (string | null)[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, column) => {
    headers[column - 1] = normalizeKey(cellString(cell.value));
  });
  if (!headers.some(Boolean)) throw new ParseError("The worksheet header does not include a recognized column.");
  const records: NormalizedRecord[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1 || records.length >= MAX_RECORDS) return;
    const mapped: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (!header) return;
      mapped[header] = cellString(row.getCell(index + 1).value);
    });
    if (Object.values(mapped).every((value) => !value)) return;
    records.push(recordFromRow(mapped, rowNumber));
  });
  if (!records.length) throw new ParseError("The worksheet has no records under the header.");
  return records;
}

export async function extractPdfText(bytes: Buffer) {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const result = await extractText(pdf, { mergePages: true });
  const text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
  return text.trim();
}
