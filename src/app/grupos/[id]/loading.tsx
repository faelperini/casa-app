export default function GroupLoading() {
  return (
    <div className="min-h-dvh bg-cream-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-cream-200 animate-pulse" />
          <div className="w-40 h-4 rounded-lg bg-cream-200 animate-pulse" />
        </div>

        {/* Group header card */}
        <div className="card p-6 mb-6">
          <div className="flex gap-4">
            <div className="w-[72px] h-[72px] rounded-2xl bg-cream-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-8 rounded-xl bg-cream-200 animate-pulse w-48" />
              <div className="h-4 rounded-lg bg-cream-200 animate-pulse w-64" />
              <div className="flex gap-3 pt-1">
                <div className="h-5 w-24 rounded-lg bg-cream-200 animate-pulse" />
                <div className="h-5 w-16 rounded-lg bg-cream-200 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cream-200 animate-pulse" />
                  <div className="w-28 h-5 rounded-lg bg-cream-200 animate-pulse" />
                </div>
                <div className="w-7 h-7 rounded-lg bg-cream-200 animate-pulse" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-9 rounded-xl bg-cream-200 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
