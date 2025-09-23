"use client";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 text-sm text-danger-700 bg-gradient-to-r from-danger-50 to-danger-100 border border-danger-200 p-4 rounded-xl animate-slide-up">
      <svg className="h-5 w-5 text-danger-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p className="font-medium">Error occurred</p>
        <p className="text-danger-600 mt-1">{message}</p>
      </div>
    </div>
  );
}
