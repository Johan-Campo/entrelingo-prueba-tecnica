// Creates the "Leads" table (with all required fields) in the Airtable base from .env.
// Usage: node scripts/create-airtable-schema.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const { AIRTABLE_TOKEN: token, AIRTABLE_BASE_ID: baseId } = loadEnv(join(root, ".env"));
if (!token || !baseId) {
  console.error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID in .env");
  process.exit(1);
}

const choices = (names) => ({ choices: names.map((name) => ({ name })) });

const buildFields = (dateField) => [
  { name: "Nombre", type: "singleLineText" },
  { name: "Email", type: "email" },
  { name: "WhatsApp", type: "phoneNumber" },
  { name: "País", type: "singleLineText" },
  {
    name: "Marca de interés",
    type: "singleSelect",
    options: choices(["Entrelingo", "SkillsPRO", "AustraliaPRO"]),
  },
  { name: "Mensaje", type: "multilineText" },
  dateField,
  { name: "Estado", type: "singleSelect", options: choices(["Nuevo", "Contactado", "Cerrado"]) },
  { name: "Prioridad", type: "singleSelect", options: choices(["Alta", "Media", "Baja"]) },
  { name: "Resumen IA", type: "multilineText" },
];

const dateVariants = [
  { name: "Fecha de registro", type: "createdTime", options: { result: { type: "dateTime", options: { dateFormat: { name: "iso" }, timeFormat: { name: "24hour" }, timeZone: "utc" } } } },
  { name: "Fecha de registro", type: "dateTime", options: { dateFormat: { name: "iso" }, timeFormat: { name: "24hour" }, timeZone: "utc" } },
];

async function createTable(dateField) {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Leads", description: "Leads de Entrelingo, SkillsPRO y AustraliaPRO", fields: buildFields(dateField) }),
  });
  return { status: res.status, body: await res.json() };
}

for (const dateField of dateVariants) {
  const { status, body } = await createTable(dateField);
  if (status === 200) {
    console.log(`Table created (date field type: ${dateField.type}). id=${body.id}`);
    for (const f of body.fields) console.log(` - ${f.name} (${f.type})`);
    process.exit(0);
  }
  console.error(`Attempt with "${dateField.type}" failed: HTTP ${status}`, JSON.stringify(body));
  if (status === 401 || status === 403 || status === 404) process.exit(1);
}
process.exit(1);
