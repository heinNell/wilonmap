import MapSection from "./components/MapSection";
import LivePositionsSection from "./components/LivePositionsSection";
import UnitsTableSection from "./components/UnitsTableSection";

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl p-6 space-y-8 animate-fade-in">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Wialon Dashboard
            </h1>
            <p className="text-slate-600 font-medium">Real-time fleet monitoring & tracking</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse-slow"></div>
          <span>Live</span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 animate-slide-up">
          <MapSection />
        </div>
        <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <LivePositionsSection />
        </div>
      </section>

      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <UnitsTableSection />
      </div>
    </main>
  );
}
