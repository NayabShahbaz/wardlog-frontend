import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const config = {
  sm: { icon: 32, text: 14, gap: 3, height: 32 },
  md: { icon: 38, text: 17, gap: 4, height: 38 },
  lg: { icon: 48, text: 22, gap: 5, height: 48 },
};

const Logo: React.FC<LogoProps> = ({ size = "md", showText = true }) => {
  const c = config[size];
  const totalWidth = showText ? c.icon + c.gap + c.text * 5.2 : c.icon;
  const r = c.icon * 0.2;
  const wSize = c.icon * 0.42;
  const plusSize = c.icon * 0.2;
  const cx = c.icon / 2; // true center of icon

  return (
    <svg
      width={totalWidth}
      height={c.height}
      viewBox={`0 0 ${totalWidth} ${c.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon box */}
      <rect
        x="1.5"
        y="1.5"
        width={c.icon - 3}
        height={c.icon - 3}
        rx={r}
        fill="#1a5276"
      />

      {/* W centered-left */}
      <text
        x={cx - plusSize * 0.4}
        y={cx}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize={wSize}
      >
        W
      </text>

      {/* + to the right of W, slightly raised */}
      <text
        x={cx + wSize * 0.45}
        y={cx}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize={plusSize}
      >
        +
      </text>

      {/* Wordmark */}
      {showText && (
        <text
          x={c.icon + c.gap}
          y={c.height * 0.56}
          dominantBaseline="central"
          fill="#1a5276"
          fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontSize={c.text}
          letterSpacing="-0.3"
        >
          WardLog
        </text>
      )}
    </svg>
  );
};

export default Logo;
