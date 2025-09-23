"use client";

import dynamic from "next/dynamic";

// Client-only loader for Leaflet map
const UnitsMap = dynamic(() => import("./UnitsMap"), {
  ssr: false,
  loading: () => (
    <section className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-card p-6">
      <div className="h-[520px] w-full flex flex-col items-center justify-center text-slate-600 space-y-4">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Loading map...</p>
          <p className="text-xs text-slate-500 mt-1">Initializing Leaflet components</p>
        </div>
      </div>
    </section>
  ),
});

export default function MapSection() {
  return <UnitsMap />;
}
