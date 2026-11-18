import React from 'react';

export default function ScoreGauge({ score = 0, size = 160, strokeWidth = 12, label = "ATS Match Score" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  let strokeColor = '#EF4444'; // Red
  let tierText = 'Needs Improvement';
  let tierBg = 'bg-red-50 text-red-700 border-red-200';

  if (validScore >= 85) {
    strokeColor = '#10B981'; // Green
    tierText = 'Optimal (ATS Ready)';
    tierBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (validScore >= 70) {
    strokeColor = '#3B82F6'; // Blue
    tierText = 'Competitive';
    tierBg = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (validScore >= 50) {
    strokeColor = '#F59E0B'; // Amber
    tierText = 'Moderate Match';
    tierBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {Math.round(validScore)}
            <span className="text-sm font-semibold text-slate-500">/100</span>
          </span>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">
            {label}
          </span>
        </div>
      </div>
      <div className={`mt-3 px-3 py-1 text-xs font-semibold rounded-full border ${tierBg}`}>
        {tierText}
      </div>
    </div>
  );
}
