interface MacroPieChartProps {
  protein: number;
  carbs: number;
  fat: number;
  showLabels?: boolean;
}

export default function MacroPieChart({
  protein,
  carbs,
  fat,
  showLabels = false,
}: MacroPieChartProps) {
  // Calculate percentages ensuring they add up to 100
  const total = protein + carbs + fat;
  const proteinPct = total > 0 ? (protein / total) * 100 : 0;
  const carbsPct = total > 0 ? (carbs / total) * 100 : 0;
  const fatPct = total > 0 ? (fat / total) * 100 : 0;

  // Create SVG paths for the pie chart
  const createPieSegment = (
    startPercent: number,
    endPercent: number,
    color: string
  ) => {
    const start = startPercent / 100;
    const end = endPercent / 100;

    const x1 = Math.cos(2 * Math.PI * start - Math.PI / 2);
    const y1 = Math.sin(2 * Math.PI * start - Math.PI / 2);
    const x2 = Math.cos(2 * Math.PI * end - Math.PI / 2);
    const y2 = Math.sin(2 * Math.PI * end - Math.PI / 2);

    const largeArcFlag = end - start > 0.5 ? 1 : 0;

    return (
      <path
        d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
        fill={color}
        transform="translate(50, 50) scale(40)"
      />
    );
  };

  // Calculate segment positions
  const carbsStart = 0;
  const carbsEnd = carbsPct;
  const proteinStart = carbsEnd;
  const proteinEnd = carbsEnd + proteinPct;
  const fatStart = proteinEnd;
  const fatEnd = 100;

  return (
    <div className="relative h-full w-full flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-full h-full max-h-24">
        {carbsPct > 0 && createPieSegment(carbsStart, carbsEnd, "#60a5fa")}
        {proteinPct > 0 &&
          createPieSegment(proteinStart, proteinEnd, "#34d399")}
        {fatPct > 0 && createPieSegment(fatStart, fatEnd, "#f87171")}
      </svg>

      {showLabels && (
        <div className="flex justify-center gap-4 text-xs mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Carbs: {Math.round(carbsPct)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <span>Protein: {Math.round(proteinPct)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Fat: {Math.round(fatPct)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
