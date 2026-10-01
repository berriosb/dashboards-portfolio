import React, { useId } from 'react';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export function MiniSparkline({
  data,
  color = '#2563eb',
  height = 26,
  className = '',
}: MiniSparklineProps) {
  const gradientId = useId();

  if (!data || data.length < 2) {
    return <div className={`h-[${height}px]`} style={{ height }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = 120;
  const paddingY = 3;
  const usableHeight = height - paddingY * 2;

  // Generar puntos SVG normalizados
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * usableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        {/* Relleno con gradiente bajo la curva */}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        {/* Línea principal del sparkline */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dot terminal en el último punto */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r={2.2}
            fill={color}
          />
        )}
      </svg>
    </div>
  );
}
