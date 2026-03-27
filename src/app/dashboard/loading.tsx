export default function DashboardLoading() {
  return (
    <div className="min-h-dvh bg-cream-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cream-200 animate-pulse" />
            <div className="w-16 h-7 rounded-lg bg-cream-200 animate-pulse" />
          </div>
          <div className="w-32 h-10 rounded-2xl bg-cream-200 animate-pulse" />
        </div>

        {/* Welcome skeleton */}
        <div className="mb-8 space-y-2">
          <div className="w-56 h-9 rounded-xl bg-cream-200 animate-pulse" />
          <div className="w-40 h-4 rounded-lg bg-cream-200 animate-pulse" />
        </div>

        {/* Actions skeleton */}
        <div className="flex gap-3 mb-8">
          <div className="w-32 h-10 rounded-xl bg-cream-200 animate-pulse" />
          <div className="w-40 h-10 rounded-xl bg-cream-200 animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-cream-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded-lg bg-cream-200 animate-pulse w-3/4" />
                  <div className="h-3 rounded-lg bg-cream-200 animate-pulse w-1/2" />
                </div>
              </div>
              <div className="h-3 rounded-lg bg-cream-200 animate-pulse w-full mb-2" />
              <div className="h-3 rounded-lg bg-cream-200 animate-pulse w-2/3" />
              <div className="mt-4 pt-3 border-t border-cream-200 flex gap-3">
                <div className="w-4 h-4 rounded bg-cream-200 animate-pulse" />
                <div className="w-4 h-4 rounded bg-cream-200 animate-pulse" />
                <div className="w-4 h-4 rounded bg-cream-200 animate-pulse" />
                <div className="ml-auto w-12 h-4 rounded bg-cream-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
