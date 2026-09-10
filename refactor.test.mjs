import assert from "node:assert/strict";
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
