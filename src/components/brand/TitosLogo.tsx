"use client";

interface TitosLogoProps {
  /** Width/height in pixels. Defaults to 40. */
  size?: number;
  /** Additional CSS classes. */
  className?: string;
  /** Whether to show the text next to the icon. */
  showText?: boolean;
  /** Text size class override (e.g. "text-lg"). */
  textClassName?: string;
}

/**
 * Reusable Tito's Courts logo component.
 * Renders the volleyball + stylised "T" icon, optionally with "Tito's" text.
 */
export function TitosLogo({
  size = 40,
  className = "",
  showText = false,
  textClassName = "text-sm font-bold",
}: TitosLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Tito's Courts logo"
      >
        {/* Volleyball circle */}
        <circle cx="42" cy="46" r="38" stroke="#2D2D2D" strokeWidth="4" fill="white" />

        {/* Volleyball lines */}
        <path
          d="M42 8 C42 8, 28 30, 42 46 C56 62, 42 84, 42 84"
          stroke="#2D2D2D"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M6 34 C6 34, 30 40, 42 46 C54 52, 78 58, 78 58"
          stroke="#2D2D2D"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M10 62 C10 62, 32 48, 42 46 C52 44, 74 30, 74 30"
          stroke="#2D2D2D"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Gold "T" shape with mushroom/hammer top */}
        <g>
          {/* T horizontal bar (rounded pill shape) */}
          <rect
            x="30"
            y="28"
            width="52"
            height="22"
            rx="11"
            fill="#F5A623"
            stroke="#2D2D2D"
            strokeWidth="3"
          />
          {/* T vertical stem */}
          <rect
            x="47"
            y="44"
            width="18"
            height="30"
            rx="4"
            fill="#F5A623"
            stroke="#2D2D2D"
            strokeWidth="3"
          />
          {/* Small face details on T — eyes */}
          <line x1="45" y1="40" x2="50" y2="40" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="40" x2="61" y2="40" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
          {/* Nose / mouth detail */}
          <path d="M53 52 L55 55 L57 52" stroke="#2D2D2D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>

      {showText && (
        <span className={textClassName}>
          Tito&apos;s Courts
        </span>
      )}
    </span>
  );
}
