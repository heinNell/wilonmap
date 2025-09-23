"use client";

export default function StatusDot({ ok, title }: { ok: boolean; title?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex h-3 w-3 rounded-full ring-2 ring-white shadow-sm transition-all duration-200 ${
        ok 
          ? "bg-success-500 animate-pulse-slow" 
          : "bg-slate-300"
      }`}
    />
  );
}
