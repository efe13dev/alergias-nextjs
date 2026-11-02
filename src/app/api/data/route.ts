import { neon } from "@neondatabase/serverless";

import { isAuthorized } from "@/lib/auth";

import devData from "./dev-data.json";

export const dynamic = "force-dynamic";

const keys = ["allergyTrackerData", "pendingAppointments"];
const developmentData: Record<string, { data: unknown[]; revision: number }> = Object.fromEntries(
  Object.entries(devData).map(([key, data]) => [key, { data, revision: 1 }]),
);

function validData(key: string, data: unknown[]): boolean {
  return data.every((item) => {
    if (!item || typeof item !== "object") return false;
    const entry = item as Record<string, unknown>;
    if (typeof entry.date !== "string" || Number.isNaN(Date.parse(entry.date))) return false;
    if (key === "allergyTrackerData") {
      return (
        [null, "green", "yellow", "orange"].includes(entry.symptomLevel as string | null) &&
        Array.isArray(entry.medications) &&
        entry.medications.every((medication: unknown) => typeof medication === "string") &&
        (entry.notes === undefined || typeof entry.notes === "string")
      );
    }
    return (
      typeof entry.id === "string" &&
      typeof entry.description === "string" &&
      ["pendiente", "completada"].includes(entry.status as string)
    );
  });
}

async function authorized(request: Request) {
  return isAuthorized(request.headers.get("authorization"), process.env.APP_PASSWORD);
}

export async function GET(request: Request) {
  if (!(await authorized(request))) return new Response("No autorizado", { status: 401 });
  const key = new URL(request.url).searchParams.get("key");
  if (!key || !keys.includes(key)) return new Response("Clave inválida", { status: 400 });
  if (process.env.NODE_ENV === "development") {
    return Response.json(developmentData[key], { headers: { "Cache-Control": "no-store" } });
  }
  if (!process.env.DATABASE_URL) return new Response("Falta DATABASE_URL", { status: 503 });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT data, revision FROM allergy_data WHERE key = ${key}`;
    return Response.json(rows[0] ?? null, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response("No se pudo leer la base de datos", { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!(await authorized(request))) return new Response("No autorizado", { status: 401 });
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  if (
    origin !== url.origin &&
    !(
      process.env.NODE_ENV === "development" &&
      url.hostname === "localhost" &&
      origin === url.origin.replace("://localhost", "://127.0.0.1")
    )
  ) {
    return new Response("Origen inválido", { status: 403 });
  }
  if (process.env.NODE_ENV !== "development" && !process.env.DATABASE_URL) {
    return new Response("Falta DATABASE_URL", { status: 503 });
  }

  let body: { key?: unknown; data?: unknown; revision?: unknown };
  try {
    const text = await request.text();
    if (text.length > 2_000_000) return new Response("Datos demasiado grandes", { status: 413 });
    body = JSON.parse(text);
    if (
      !body ||
      typeof body.key !== "string" ||
      !keys.includes(body.key) ||
      !Array.isArray(body.data) ||
      !validData(body.key, body.data) ||
      !(body.revision === null || (Number.isInteger(body.revision) && Number(body.revision) > 0))
    ) {
      return new Response("Datos inválidos", { status: 400 });
    }
  } catch {
    return new Response("Datos inválidos", { status: 400 });
  }

  if (process.env.NODE_ENV === "development") {
    const row = developmentData[body.key as string];
    if (row.revision !== body.revision) {
      return new Response("Los datos han cambiado en otro dispositivo", { status: 409 });
    }
    row.data = body.data as unknown[];
    row.revision += 1;
    return Response.json({ revision: row.revision }, { headers: { "Cache-Control": "no-store" } });
  }
  if (!process.env.DATABASE_URL) return new Response("Falta DATABASE_URL", { status: 503 });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const data = JSON.stringify(body.data);
    const rows =
      body.revision === null
        ? await sql`
            INSERT INTO allergy_data (key, data) VALUES (${body.key}, ${data}::jsonb)
            ON CONFLICT (key) DO NOTHING RETURNING revision
          `
        : await sql`
            UPDATE allergy_data SET data = ${data}::jsonb, revision = revision + 1
            WHERE key = ${body.key} AND revision = ${body.revision} RETURNING revision
          `;
    if (!rows.length)
      return new Response("Los datos han cambiado en otro dispositivo", { status: 409 });
    return Response.json(rows[0], { headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response("No se pudo guardar en la base de datos", { status: 503 });
  }
}
