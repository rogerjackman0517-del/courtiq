type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function CourtEmpty({ title, subtitle, className }: Props) {
  return (
    <div
      className={`floating-card no-jiggle rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden ${className ?? ""}`}
    >
      {/* Court illustration */}
      <div className="relative mx-auto mb-6 w-[220px] h-[140px] opacity-90">
        <svg
          viewBox="0 0 220 140"
          className="absolute inset-0 w-full h-full"
          fill="none"
          stroke="#D4B560"
          strokeOpacity="0.45"
          strokeWidth="1.25"
          strokeLinecap="round"
        >
          {/* Court outline */}
          <rect x="6" y="6" width="208" height="128" rx="4" />
          {/* Mid-court arc */}
          <path d="M6 70 L40 70 A22 22 0 0 0 40 70 Z" />
          <path d="M214 70 L180 70 A22 22 0 0 1 180 70 Z" />
          <line x1="110" y1="6" x2="110" y2="134" strokeDasharray="3 3" strokeOpacity="0.25" />
          <circle cx="110" cy="70" r="16" />
          {/* Left key + free throw arc */}
          <rect x="6" y="46" width="40" height="48" />
          <path d="M46 46 A24 24 0 0 1 46 94" />
          {/* Right key + free throw arc */}
          <rect x="174" y="46" width="40" height="48" />
          <path d="M174 46 A24 24 0 0 0 174 94" />
          {/* Hoops */}
          <circle cx="14" cy="70" r="4" stroke="#D4B560" strokeOpacity="0.8" />
          <circle cx="206" cy="70" r="4" stroke="#D4B560" strokeOpacity="0.8" />
          {/* 3pt arcs */}
          <path d="M6 22 Q 70 70 6 118" strokeOpacity="0.3" />
          <path d="M214 22 Q 150 70 214 118" strokeOpacity="0.3" />
        </svg>
        {/* Floating basketball */}
        <svg
          viewBox="0 0 24 24"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 opacity-95 court-empty-bounce"
        >
          <circle cx="12" cy="12" r="10" fill="#D4B560" />
          <path
            d="M2 12 H22 M12 2 V22 M4 5 Q12 12 4 19 M20 5 Q12 12 20 19"
            stroke="#0A0A0E"
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#D4B560] mb-2">
        Off the clock
      </p>
      <p className="text-xl lg:text-2xl font-[family-name:var(--font-barlow)] font-bold text-[#F5F5F7] mb-2 tracking-tight">
        {title}
      </p>
      {subtitle && (
        <p className="text-sm text-[#8A8A93] max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
