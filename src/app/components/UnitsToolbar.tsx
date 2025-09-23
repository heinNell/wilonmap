"use client";

import { useState } from "react";

export default function UnitsToolbar({
  onQuery,
  onSort,
  refresh,
  intervalMs,
  setIntervalMs,
}: {
  onQuery: (q: string) => void;
  onSort: (k: "name" | "speed" | "fuel") => void;
  refresh?: () => void;
  intervalMs?: number;
  setIntervalMs?: (n: number) => void;
}) {
  const [q, setQ] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onQuery(e.target.value);
        }}
        placeholder="Search units…"
        className="w-64 border rounded px-2 py-1 text-sm"
      />
      <select
        className="text-sm border rounded px-2 py-1"
        onChange={(e) => onSort(e.target.value as any)}
        defaultValue="name"
      >
        <option value="name">Sort: Name</option>
        <option value="speed">Sort: Speed</option>
        <option value="fuel">Sort: Fuel</option>
      </select>

      {typeof intervalMs === "number" && setIntervalMs && (
        <select
          className="text-sm border rounded px-2 py-1"
          value={intervalMs}
          onChange={(e) => setIntervalMs(Number(e.target.value))}
          title="Refresh interval"
        >
          <option value={5000}>5s</option>
          <option value={10000}>10s</option>
          <option value={30000}>30s</option>
          <option value={60000}>60s</option>
        </select>
      )}

      {refresh && (
        <button
          className="text-sm underline"
          onClick={refresh}
          aria-label="Refresh"
          title="Refresh"
        >
          Refresh
        </button>
      )}
    </div>
  );
}
