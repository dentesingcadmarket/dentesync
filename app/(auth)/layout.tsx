export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-ebony-canvas flex items-center justify-center p-4 overflow-hidden">
      {/* Morphic ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 52% 42% at 50% 28%, rgba(45,212,191,0.10) 0%, transparent 72%)',
        }}
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
