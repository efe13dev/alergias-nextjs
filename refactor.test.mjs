import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

import ts from "typescript";

function handler(file, name, scope) {
  const source = ts.createSourceFile(
    file,
    readFileSync(new URL(file, import.meta.url), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let initializer;

  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) {
      initializer = node.initializer.getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(initializer, `${name} no encontrado`);

  return runInNewContext(
    ts.transpile(`(${initializer})`, { target: ts.ScriptTarget.ES2022 }),
    scope,
  );
}

test("seleccionar año conserva el mes o usa el primero disponible", () => {
  const months = Array.from({ length: 18 }, (_, i) => new Date(2025, 3 + i, 1));
  const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
  const monthsByYear = {
    2025: months.filter((month) => month.getFullYear() === 2025),
    2026: months.filter((month) => month.getFullYear() === 2026),
  };

  for (const selected of months) {
    for (const year of [2025, 2026, 2027]) {
      let selectedTab = getMonthKey(selected);
      let selectedYear;

      handler("./src/app/page.tsx", "handleYearSelect", {
        months,
        monthsByYear,
        getMonthKey,
        selectedTab,
        setSelectedYear: (value) => {
          selectedYear = value;
        },
        setSelectedTab: (value) => {
          selectedTab = value;
        },
      })(year);
      const available = monthsByYear[year];
      const expected =
        available?.find((month) => month.getMonth() === selected.getMonth()) ??
        available?.[0] ??
        selected;

      assert.equal(selectedYear, year);
      assert.equal(selectedTab, getMonthKey(expected));
    }
  }
});

test("el rango de meses empieza en abril 2025 y llega 3 meses por delante de hoy", () => {
  const months = handler("./src/app/page.tsx", "months", {});
  const now = new Date();
  const key = (date) => `${date.getFullYear()}-${date.getMonth()}`;

  assert.equal(key(months[0]), key(new Date(2025, 3, 1)));
  assert.equal(key(months.at(-1)), key(new Date(now.getFullYear(), now.getMonth() + 3, 1)));
  assert.ok(months.some((month) => key(month) === key(now)));
});

test("el resumen del mes solo cuenta los días de ese mes", () => {
  const dayData = [
    { date: "2026-09-10T12:00:00.000Z", symptomLevel: "green", medications: ["Bilaxten"] },
    { date: "2026-09-20T12:00:00.000Z", symptomLevel: "orange", medications: [] },
    { date: "2026-10-15T12:00:00.000Z", symptomLevel: "green", medications: ["Ventolin"] },
  ];
  const entries = handler("./src/components/MonthSummary.tsx", "entries", {
    dayData,
    month: new Date(2026, 8, 1),
  });

  assert.equal(entries.length, 2);
  assert.ok(entries.every((entry) => new Date(entry.date).getMonth() === 8));
});

test("editar cita sustituye el día duplicado sin cambiar identidad ni orden", () => {
  const appointments = [1, 2, 3].map((day) => ({
    id: String(day),
    date: `2026-06-0${day}`,
    description: "Original",
    status: "pendiente",
  }));

  for (const editingIndex of [null, 0, 1, 2]) {
    for (const day of [1, 2, 3, 4]) {
      const form = {
        ...appointments[editingIndex ?? 0],
        date: `2026-06-0${day}`,
        description: "Editada",
      };
      const emptyAppointment = {};
      const updates = [];

      handler("./src/components/AppointmentManager.tsx", "handleSave", {
        appointments,
        editingIndex,
        form,
        emptyAppointment,
        isSameDay: (a, b) => new Date(a).toDateString() === new Date(b).toDateString(),
        setAppointments: (value) => updates.push(value),
        setEditingIndex: (value) => updates.push(value),
        setForm: (value) => updates.push(value),
      })();
      const expected = appointments
        .map((appointment, index) => (index === editingIndex ? form : appointment))
        .filter((appointment, index) => index === editingIndex || appointment.date !== form.date);

      assert.equal(
        JSON.stringify(updates),
        JSON.stringify(editingIndex === null ? [] : [expected, null, emptyAppointment]),
      );
      assert.ok(appointments.every((appointment) => appointment.description === "Original"));
    }
  }
});

test("migra Relvar y Dymista desde el 29 de septiembre de 2026 sin alterar días previos", () => {
  const TREATMENT_CHANGE_DATE = new Date(2026, 8, 29);
  const migrate = handler("./src/hooks/useDayData.ts", "migrateDayData", {
    TREATMENT_CHANGE_DATE,
  });

  const result = migrate([
    {
      date: new Date(2026, 8, 28).toISOString(),
      symptomLevel: "green",
      medications: ["Relvar", "Dymista"],
    },
    {
      date: new Date(2026, 8, 29).toISOString(),
      symptomLevel: "yellow",
      medications: ["Bilaxten", "Relvar", "Dymista"],
    },
  ]);

  assert.equal(
    JSON.stringify(result.map((r) => r.medications)),
    JSON.stringify([
      ["Relvar 184", "Dymista"],
      ["Bilaxten", "Relvar 92", "Rinoduo"],
    ]),
  );
});

test("la API protege los datos y rechaza escrituras antiguas o inválidas", async () => {
  const password = "a".repeat(32);
  const globals = { crypto: webcrypto, TextEncoder, atob, Request, Response, URL };
  const loadModule = (file, require) => {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    const code = ts.transpile(source, {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    });
    const exports = {};
    runInNewContext(code, {
      ...globals,
      exports,
      require,
      process: { env: { APP_PASSWORD: password, DATABASE_URL: "postgres://test" } },
    });
    return exports;
  };
  const auth = loadModule("./src/lib/auth.ts", () => {});
  const rows = new Map();
  const sql = async (strings, ...params) => {
    const query = strings.join("?");
    if (query.includes("SELECT")) {
      const row = rows.get(params[0]);
      return row ? [row] : [];
    }
    if (query.includes("INSERT")) {
      const [key, data] = params;
      if (rows.has(key)) return [];
      rows.set(key, { data: JSON.parse(data), revision: 1 });
      return [{ revision: 1 }];
    }
    const [data, key, revision] = params;
    const row = rows.get(key);
    if (!row || row.revision !== revision) return [];
    rows.set(key, { data: JSON.parse(data), revision: revision + 1 });
    return [{ revision: revision + 1 }];
  };
  const api = loadModule("./src/app/api/data/route.ts", (name) =>
    name === "@/lib/auth" ? auth : { neon: () => sql },
  );
  const authorization = `Basic ${btoa(`usuario:${password}`)}`;
  const key = "pendingAppointments";
  const data = [{ id: "1", date: "2026-10-30", description: "Cita", status: "pendiente" }];
  const get = (header = authorization) =>
    api.GET(
      new Request(`https://example.com/api/data?key=${key}`, {
        headers: { authorization: header },
      }),
    );
  const put = (body, origin = "https://example.com") =>
    api.PUT(
      new Request("https://example.com/api/data", {
        method: "PUT",
        headers: { authorization, origin },
        body: JSON.stringify(body),
      }),
    );

  assert.equal((await get("Basic invalid")).status, 401);
  assert.equal(await (await get()).json(), null);
  assert.equal((await put({ key, data, revision: null }, "https://other.example")).status, 403);
  assert.equal((await put({ key, data: [{}], revision: null })).status, 400);
  assert.equal((await put({ key, data, revision: null })).status, 200);
  assert.equal((await put({ key, data, revision: null })).status, 409);
  assert.equal((await put({ key, data, revision: 1 })).status, 200);
  assert.equal((await put({ key, data: [], revision: 1 })).status, 409);
  const stored = await (await get()).json();
  assert.equal(stored.revision, 2);
  assert.equal(stored.data[0].description, "Cita");
});

test("solo importa localStorage cuando no hay datos en Neon", async () => {
  const file = "./src/hooks/useStoredData.ts";
  const source = ts.createSourceFile(
    file,
    readFileSync(new URL(file, import.meta.url), "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  let declaration;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === "load") {
      declaration = node.getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(declaration);

  for (const [row, local] of [
    [null, JSON.stringify([{ id: "local" }])],
    [{ data: [{ id: "remoto" }], revision: 2 }, JSON.stringify([{ id: "local" }])],
    [null, ""],
  ]) {
    const revision = { current: null };
    const saved = { current: null };
    let result;
    let status;
    let reads = 0;
    const load = runInNewContext(
      ts.transpile(`(${declaration})`, { target: ts.ScriptTarget.ES2022 }),
      {
        key: "pendingAppointments",
        cancelled: false,
        migrate: undefined,
        fetch: async () => ({ ok: true, json: async () => row }),
        localStorage: {
          getItem: () => {
            reads++;
            return local;
          },
        },
        revision,
        saved,
        setValue: (value) => {
          result = value;
        },
        setLoaded: () => {},
        setStatus: (value) => {
          status = value;
        },
      },
    );
    await load();
    if (local === "") {
      assert.equal(result, undefined);
      assert.equal(status, "error");
      continue;
    }
    assert.equal(result[0].id, row ? "remoto" : "local");
    assert.equal(reads, row ? 0 : 1);
    assert.equal(saved.current, row ? JSON.stringify(row.data) : null);
    assert.equal(revision.current, row?.revision ?? null);
    assert.equal(status, "ready");
  }
});
