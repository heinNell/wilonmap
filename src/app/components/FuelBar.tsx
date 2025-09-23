"use client";

export default function FuelBar({ value, max = 4000 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  
  const getColorClass = (percentage: number) => {
    if (percentage >= 70) return "bg-gradient-to-r from-success-400 to-success-500";
    if (percentage >= 30) return "bg-gradient-to-r from-warning-400 to-warning-500";
    return "bg-gradient-to-r from-danger-400 to-danger-500";
  };

  return (
    <div className="w-28 h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
      <div 
        className={`h-full rounded-full transition-all duration-500 ease-out ${getColorClass(pct)}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
