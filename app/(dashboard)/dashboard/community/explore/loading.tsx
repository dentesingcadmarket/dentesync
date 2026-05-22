export default function ExploreLoading() {
  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5" />
        <div className="space-y-1.5">
          <div className="h-6 w-24 rounded-lg bg-white/5" />
          <div className="h-3.5 w-40 rounded bg-white/5" />
        </div>
      </div>

      {/* Trend tags */}
      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-white/5" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-white/5" />
          ))}
        </div>
      </div>

      {/* Suggested users */}
      <div className="space-y-3">
        <div className="h-4 w-36 rounded bg-white/5" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
            <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-white/5" />
              <div className="h-3 w-20 rounded bg-white/5" />
            </div>
            <div className="h-7 w-20 rounded-full bg-white/5" />
          </div>
        ))}
      </div>

      {/* Popular posts */}
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-white/5" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)] space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="h-3 w-24 rounded bg-white/5" />
                <div className="h-2.5 w-16 rounded bg-white/5" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-3/4 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
