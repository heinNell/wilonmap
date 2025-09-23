"use client";
import dynamic from "next/dynamic";

const LivePositions = dynamic(() => import("./LivePositions"), {
  ssr: false,
  loading: () => (
    <section className="bg-white border rounded-xl shadow-sm p-4">
      <p className="text-sm text-gray-600">Loading live positions…</p>
    </section>
  ),
});

export default function LivePositionsSection() {
  return <LivePositions />;
}
