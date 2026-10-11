// Adds descriptions to the Leads fields (Airtable API only allows name/description updates on existing fields).
// Usage: node scripts/improve-airtable.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const base = env.AIRTABLE_BASE_ID;
const headers = { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" };
const TABLE_ID = "tblav4pLmmOp5pAJY";

const descriptions = {
  Nombre: "Nombre de la persona interesada. Lo completa el formulario.",
  Email: "Correo de contacto. Lo completa el formulario.",
  WhatsApp: "Número de WhatsApp con código de país. Lo completa el formulario.",
  "País": "País de residencia. Lo completa el formulario.",
  "Marca de interés": "Marca por la que consulta: Entrelingo, SkillsPRO o AustraliaPRO. Define a qué equipo se avisa.",
  Mensaje: "Texto libre que escribe la persona. La IA lo lee para clasificar el lead.",
  "Fecha de registro": "Fecha y hora de creación del registro (automática). Es el campo que vigila Make.",
  Estado: "Seguimiento comercial: Nuevo, Contactado o Cerrado. Lo actualiza el equipo.",
  Prioridad: "Alta, Media o Baja. La asigna la IA vía Make; si la IA falla se usa Media.",
  "Resumen IA": "Resumen de una línea del mensaje, generado por la IA vía Make.",
};

const schemaRes = await fetch(`https://api.airtable.com/v0/meta/bases/${base}/tables`, { headers });
const schema = await schemaRes.json();
if (!schemaRes.ok) {
  console.error("Schema read failed", schemaRes.status, JSON.stringify(schema));
  process.exit(1);
}
const table = schema.tables.find((t) => t.id === TABLE_ID);

for (const field of table.fields) {
  const description = descriptions[field.name];
  if (!description || field.description === description) continue;
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${base}/tables/${TABLE_ID}/fields/${field.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ description }),
  });
  console.log(field.name, res.status);
}
