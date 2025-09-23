"use client";
import dynamic from "next/dynamic";

const UnitsToolbar = dynamic(() => import("./UnitsToolbar"), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500">Loading toolbar…</div>,
});

export default UnitsToolbar;
