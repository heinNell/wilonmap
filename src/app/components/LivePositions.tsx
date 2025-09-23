"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { apiGet } from "@/lib/client-fetch";
import SectionCard from "./SectionCard";
import ErrorBanner from "./ErrorBanner";
import StatusDot from "./StatusDot";
import FuelBar from "./FuelBar";

type Any = any;

export default function LivePositions({ initialIntervalMs = 8000 }: { initialIntervalMs?: number }) {
  const [data, setData] = useState<Any | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ts, setTs] = useState<number>(() => Date.now());
  const [mounted, setMounted] = useState(false); // hydration-safe timestamp
  const [intervalMs, setIntervalMs] = useState(initialIntervalMs);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const fetchNow = async () => {
    try {
      const json = await apiGet("/api/wialon?action=positionsNow");
      setData(json);
      setErr(null);
      setTs(Date.now());
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchNow();
  }, []);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(fetchNow, intervalMs);
    return () => { if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  const items: Any[] = Array.isArray(data?.items) ? data!.items : [];

  const rows = useMemo(() => items.map((u) => {
    const p = u?.pos || u?.lmsg?.pos;
    const io = u?.lmsg?.p ?? {};
    const lat = p?.y, lon = p?.x;
    const speed = p?.s ?? 0;
    const fuelA = io?.io_270 ?? null;
    const fuelB = io?.io_273 ?? null;
    return { u, p, io, lat, lon, speed, fuelA, fuelB };
  }), [items]);

  return (
    <SectionCard
      title="Live positions"
      toolbar={
        <div className="flex items-center gap-3">
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
          <button className="text-sm underline" onClick={fetchNow}>Refresh</button>
          <span className="text-xs text-gray-500" suppressHydrationWarning>
            Updated {mounted ? new Date(ts).toLocaleTimeString("en-ZA", { timeZone: "Africa/Johannesburg" }) : ""}
          </span>
        </div>
      }
    >
      {err && <ErrorBanner message={err} />}

      <div className="overflow-auto border rounded">
        <table className="min-w-[900px] text-sm">
          <thead className="sticky top-0 bg-white shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.06)]">
            <tr>
              <th className="text-left p-2">Unit</th>
              <th className="text-left p-2">Speed</th>
              <th className="text-left p-2">Coords</th>
              <th className="text-left p-2">Heading</th>
              <th className="text-left p-2">Fuel A/B</th>
              <th className="text-left p-2">Open</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(odd)]:bg-gray-50/50">
            {rows.map(({ u, p, lat, lon, speed, fuelA, fuelB }) => (
              <tr key={u?.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-2">{u?.nm ?? u?.name ?? u?.id}</td>
                <td className="p-2 flex items-center gap-2">
                  <StatusDot ok={(speed ?? 0) > 0} title={(speed ?? 0) > 0 ? "Moving" : "Idle"} />
                  {speed ?? 0} km/h
                </td>
                <td className="p-2">
                  {typeof lat === "number" && typeof lon === "number"
                    ? `${lat.toFixed(6)}, ${lon.toFixed(6)}`
                    : "—"}
                </td>
                <td className="p-2">{p?.c ?? "—"}</td>
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <FuelBar value={typeof fuelA === "number" ? fuelA : 0} />
                    <span className="text-xs text-gray-500">
                      {fuelA ?? "—"} / {fuelB ?? "—"}
                    </span>
                  </div>
                </td>
                <td className="p-2">
                  {typeof lat === "number" && typeof lon === "number" ? (
                    <a
                      className="underline"
                      href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      OSM
                    </a>
                  ) : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-2" colSpan={6}>No positions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
