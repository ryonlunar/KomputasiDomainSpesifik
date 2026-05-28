"use client";

interface Props {
  hkInhibition: number;
  csInhibition: number;
}

function nodeColor(level: number): string {
  if (level < 0.3) return "#10b981";
  if (level < 0.7) return "#f59e0b";
  return "#ef4444";
}

export function PathwayDiagram({ hkInhibition, csInhibition }: Props) {
  const hkColor = nodeColor(hkInhibition);
  const csColor = nodeColor(csInhibition);
  const CY = 52;

  return (
    <div className="w-full">
      <svg viewBox="0 0 560 110" className="w-full">
        <defs>
          <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#52525b" />
          </marker>
        </defs>

        {/* Glucose */}
        <rect x={4} y={CY - 14} width={64} height={28} rx={5} fill="#18181b" stroke="#10b981" strokeWidth={1.5} />
        <text x={36} y={CY + 5} textAnchor="middle" fill="#10b981" fontSize={10} fontWeight="600">Glucose</text>

        <line x1={68} y1={CY} x2={90} y2={CY} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#arr)" />

        {/* HK */}
        <circle cx={108} cy={CY} r={18} fill={hkColor} style={{ transition: "fill 0.4s ease" }} />
        <text x={108} y={CY + 4} textAnchor="middle" fill="white" fontSize={9} fontWeight="700">HK</text>

        <line x1={126} y1={CY} x2={148} y2={CY} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#arr)" />

        {/* Acetyl-CoA */}
        <rect x={148} y={CY - 14} width={72} height={28} rx={5} fill="#18181b" stroke="#52525b" strokeWidth={1.5} />
        <text x={184} y={CY + 5} textAnchor="middle" fill="#a1a1aa" fontSize={9}>Acetyl-CoA</text>

        <line x1={220} y1={CY} x2={242} y2={CY} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#arr)" />

        {/* CS */}
        <circle cx={260} cy={CY} r={18} fill={csColor} style={{ transition: "fill 0.4s ease" }} />
        <text x={260} y={CY + 4} textAnchor="middle" fill="white" fontSize={9} fontWeight="700">CS</text>

        <line x1={278} y1={CY} x2={300} y2={CY} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#arr)" />

        {/* NADH */}
        <rect x={300} y={CY - 14} width={56} height={28} rx={5} fill="#18181b" stroke="#f59e0b" strokeWidth={1.5} />
        <text x={328} y={CY + 5} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight="600">NADH</text>

        <line x1={356} y1={CY} x2={378} y2={CY} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#arr)" />

        {/* ATP Synthase */}
        <circle cx={396} cy={CY} r={18} fill="#8b5cf6" />
        <text x={396} y={CY - 1} textAnchor="middle" fill="white" fontSize={8} fontWeight="700">ATP</text>
        <text x={396} y={CY + 9} textAnchor="middle" fill="white" fontSize={7}>Syn</text>

        <line x1={414} y1={CY} x2={436} y2={CY} stroke="#52525b" strokeWidth={1.5} markerEnd="url(#arr)" />

        {/* ATP */}
        <rect x={436} y={CY - 14} width={50} height={28} rx={5} fill="#18181b" stroke="#3b82f6" strokeWidth={2} />
        <text x={461} y={CY + 5} textAnchor="middle" fill="#3b82f6" fontSize={11} fontWeight="700">ATP</text>

        {/* Feedback: ATP → HK (red dashed) */}
        <path
          d={`M 461 ${CY + 14} C 461 84, 108 84, 108 ${CY + 18}`}
          fill="none" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}
          markerEnd="url(#arr)"
        />

        {/* Feedback: NADH → CS (red dashed) */}
        <path
          d={`M 328 ${CY + 14} C 328 82, 260 82, 260 ${CY + 18}`}
          fill="none" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}
          markerEnd="url(#arr)"
        />

        {/* Legend */}
        <circle cx={8} cy={98} r={4} fill="#10b981" />
        <text x={16} y={101} fontSize={8} fill="#71717a">Aktif</text>
        <circle cx={50} cy={98} r={4} fill="#f59e0b" />
        <text x={58} y={101} fontSize={8} fill="#71717a">Parsial</text>
        <circle cx={100} cy={98} r={4} fill="#ef4444" />
        <text x={108} y={101} fontSize={8} fill="#71717a">Terhambat</text>
        <text x={170} y={101} fontSize={8} fill="#52525b">╌ feedback inhibition</text>
      </svg>
    </div>
  );
}
