"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/client-fetch";
import SectionCard from "./SectionCard";
import ErrorBanner from "./ErrorBanner";
// IMPORTANT: use the client-only wrapper to avoid hydration issues
import UnitsToolbar from "./UnitsToolbarSection";

type Any = any;

export default function UnitsTable() {
  const [data, setData] = useState<Any | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "speed" | "fuel">("name");

  const fetchNow = async () => {
    try {
      const json = await apiGet("/api/wialon?action=positionsNow");
      setData(json);
      setErr(null);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNow();
  }, []);

  const items = useMemo(() => {
    const raw: Any[] = Array.isArray(data?.items) ? data!.items : [];
    const base = raw.map((u) => {
      const p = u?.pos || u?.lmsg?.pos;
      const io = u?.lmsg?.p ?? {};
      const name = u?.nm ?? u?.name ?? "";
      const speed = p?.s ?? 0;
      const fuel = (io?.io_270 ?? 0) + (io?.io_273 ?? 0);
      return { u, name, speed, fuel };
    });

    const filtered = query
      ? base.filter((x) => x.name.toLowerCase().includes(query.toLowerCase()))
      : base;

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "speed") return (b.speed ?? 0) - (a.speed ?? 0);
      return (b.fuel ?? 0) - (a.fuel ?? 0);
    });

    return sorted;
  }, [data, query, sortKey]);

  return (
    <SectionCard
      title="Units"
      toolbar={
        <UnitsToolbar
          onQuery={setQuery}
          onSort={setSortKey}
          refresh={fetchNow}
        />
      }
    >
      {loading && <p>Loading…</p>}
      {err && <ErrorBanner message={err} />}

      {!loading && !err && (
        <div className="overflow-auto border rounded">
          <table className="min-w-[760px] text-sm">
            <thead className="sticky top-0 bg-white shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.06)]">
              <tr>
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Speed</th>
                <th className="text-left p-2">Fuel (sum)</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(odd)]:bg-gray-50/50">
              {items.map((row, i) => (
                <tr key={row.u?.id ?? i} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{row.name || "(no name)"}</td>
                  <td className="p-2">{row.u?.id ?? "—"}</td>
                  <td className="p-2">{row.speed ?? 0} km/h</td>
                  <td className="p-2">{row.fuel ?? 0}</td>
                  <td className="p-2">
                    <UnitDetailsButton unitId={row.u?.id} />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="p-2" colSpan={6}>No units</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

function UnitDetailsButton({ unitId }: { unitId?: number }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="border px-2 py-1 rounded"
      disabled={!unitId || busy}
      onClick={async () => {
        try {
          setBusy(true);
          const detail = await apiGet(`/api/wialon?action=unitById&unitId=${unitId}`);
          alert(`Unit ${unitId} details:\n${JSON.stringify(detail, null, 2).slice(0, 2000)}`);
        } catch (e: any) {
          alert(`Failed: ${e.message || String(e)}`);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Loading…" : "Details"}
    </button>
  );
}
