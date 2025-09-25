"use client";

import dynamic from "next/dynamic";

const UnitsTable = dynamic(() => import("./UnitsTable"), {
  ssr: false,
  loading: () => (
    <section className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <div className="h-1.5 w-1.5 bg-primary-500 rounded-full"></div>
          Units
        </h2>
        <div className="flex items-center gap-3 text-sm">
          <div className="text-sm text-gray-500">Loading toolbar…</div>
        </div>
      </div>
      <p>Loading…</p>
    </section>
  ),
});

export default function UnitsTableSection() {
  return <UnitsTable />;
}