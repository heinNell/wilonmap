"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";
import { apiGet } from "@/lib/client-fetch";
import SectionCard from "./SectionCard";
import ErrorBanner from "./ErrorBanner";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon paths
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
});
(L.Marker.prototype as any).options.icon = DefaultIcon;

type Any = any;

function FitToMarkers({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  const didFit = useRef(false);
  useEffect(() => {
    if (didFit.current || coords.length === 0) return;
    const bounds = L.latLngBounds(
      coords.map(([lat, lon]) => L.latLng(lat, lon))
    );
    map.fitBounds(bounds.pad(0.15));
    didFit.current = true;
  }, [coords, map]);
  return null;
}

export default function UnitsMap({
  initialIntervalMs = 10000,
}: {
  initialIntervalMs?: number;
}) {
  const [data, setData] = useState<Any | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ts, setTs] = useState<number>(() => Date.now());
  const [intervalMs, setIntervalMs] = useState(initialIntervalMs);

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
    fetchNow();
  }, []);

  useEffect(() => {
    const id = setInterval(fetchNow, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  const items: Any[] = Array.isArray(data?.items) ? data!.items : [];
  const markers = useMemo(() => {
    return items
      .map((u) => {
        const p = u?.pos || u?.lmsg?.pos;
        const lat = p?.y,
          lon = p?.x;
        if (typeof lat !== "number" || typeof lon !== "number") return null;
        return {
          id: u?.id,
          name: u?.nm ?? u?.name ?? String(u?.id),
          lat,
          lon,
          speed: p?.s ?? 0,
          heading: p?.c ?? null,
          fuelA: u?.lmsg?.p?.io_270 ?? null,
          fuelB: u?.lmsg?.p?.io_273 ?? null,
        };
      })
      .filter(Boolean) as {
      id: number;
      name: string;
      lat: number;
      lon: number;
      speed: number;
      heading: number | null;
      fuelA: number | null;
      fuelB: number | null;
    }[];
  }, [items]);

  const center: [number, number] = markers.length
    ? [markers[0].lat, markers[0].lon]
    : [-24.0, 28.0];
  const bounds: LatLngBoundsExpression | undefined =
    markers.length > 0
      ? (markers.map((m) => [m.lat, m.lon]) as [number, number][])
      : undefined;

  return (
    <SectionCard
      title="Fleet map"
      toolbar={
        <div className="flex items-center gap-3">
          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            title="Refresh interval"
          >
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>60s</option>
          </select>
          <button
            className="text-sm text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2 transition-colors duration-200"
            onClick={fetchNow}
          >
            Refresh
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
            <span>
              Updated{" "}
              {new Date(ts).toLocaleTimeString("en-ZA", {
                timeZone: "Africa/Johannesburg",
              })}
            </span>
          </div>
        </div>
      }
    >
      {err && <ErrorBanner message={err} />}

      <div className="h-[520px] w-full border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50">
        <MapContainer
          center={center}
          zoom={6}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {bounds && <FitToMarkers coords={bounds as [number, number][]} />}
          {markers.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lon]}>
              <Tooltip>{m.name}</Tooltip>
              <Popup>
                <div className="text-sm space-y-3 min-w-[250px]">
                  <div className="font-semibold text-slate-800 text-base border-b border-slate-200 pb-2">
                    {m.name}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Coordinates:</span>
                      <span className="font-mono text-xs">
                        {m.lat.toFixed(6)}, {m.lon.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Speed:</span>
                      <span className="font-semibold">{m.speed} km/h</span>
                    </div>
                    {m.heading != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Heading:</span>
                        <span>{m.heading}°</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Fuel A/B:</span>
                      <span>
                        {m.fuelA ?? "—"} / {m.fuelB ?? "—"}
                      </span>
                    </div>
                  </div>
                  <a
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 underline underline-offset-2 text-xs font-medium"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.openstreetmap.org/?mlat=${m.lat}&mlon=${m.lon}#map=12/${m.lat}/${m.lon}`}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Open in OpenStreetMap
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </SectionCard>
  );
}
