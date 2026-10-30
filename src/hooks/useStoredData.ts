"use client";

import { useEffect, useRef, useState } from "react";

type Status = "loading" | "ready" | "saving" | "error" | "conflict";

export function useStoredData<T>(key: string, migrate?: (value: T[]) => T[]) {
  const [value, setValue] = useState<T[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [loaded, setLoaded] = useState(false);
  const revision = useRef<number | null>(null);
  const saved = useRef<string | null>(null);
  const saving = useRef(false);

  useEffect(() => {
    if (loaded || status !== "loading") return;
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/data?key=${encodeURIComponent(key)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("load");
        const row = await response.json();
        const local = row === null ? localStorage.getItem(key) : null;
        const data = row === null ? (local !== null ? JSON.parse(local) : []) : row.data;
        if (!Array.isArray(data)) throw new Error("invalid data");
        const migrated = migrate ? migrate(data) : data;
        if (cancelled) return;
        revision.current = row?.revision ?? null;
        saved.current = row === null && local !== null ? null : JSON.stringify(migrated);
        setValue(migrated);
        setLoaded(true);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [key, migrate, loaded, status]);

  useEffect(() => {
    if (status === "loading" || status === "error" || status === "conflict" || saving.current) {
      return;
    }
    const snapshot = JSON.stringify(value);
    if (snapshot === saved.current) return;
    saving.current = true;
    setStatus("saving");
    async function save() {
      try {
        const response = await fetch("/api/data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, data: JSON.parse(snapshot), revision: revision.current }),
        });
        if (response.status === 409) {
          setStatus("conflict");
          return;
        }
        if (!response.ok) throw new Error("save");
        const result = await response.json();
        revision.current = result.revision;
        saved.current = snapshot;
        setStatus("ready");
      } catch {
        setStatus("error");
      } finally {
        saving.current = false;
      }
    }
    void save();
  }, [key, value, status]);

  const retry = () => {
    if (!loaded) {
      setStatus("loading");
    } else {
      setStatus("ready");
    }
  };

  return { value, setValue, status, retry, loaded };
}
