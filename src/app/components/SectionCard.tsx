"use client";

export default function SectionCard({
  title,
  toolbar,
  children,
  className = "",
}: {
  title: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <div className="h-1.5 w-1.5 bg-primary-500 rounded-full"></div>
          {title}
        </h2>
        {toolbar && (
          <div className="flex items-center gap-3 text-sm">
            {toolbar}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
