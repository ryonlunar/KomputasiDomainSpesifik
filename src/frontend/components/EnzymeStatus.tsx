"use client";

interface Props {
  hkInhibition: number;
  csInhibition: number;
}

function statusLabel(level: number) {
  if (level < 0.3) return "Aktif";
  if (level < 0.7) return "Parsial";
  return "Terhambat";
}

function statusColors(level: number) {
  if (level < 0.3) return { bar: "#10b981", badge: "text-emerald-400 bg-emerald-900/30" };
  if (level < 0.7) return { bar: "#f59e0b", badge: "text-amber-400 bg-amber-900/30" };
  return { bar: "#ef4444", badge: "text-red-400 bg-red-900/30" };
}

function EnzymeRow({ name, abbr, level }: { name: string; abbr: string; level: number }) {
  const { bar, badge } = statusColors(level);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-300">
          {name} <span className="text-zinc-500">({abbr})</span>
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge}`}>
          {statusLabel(level)}
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(level * 100, 100)}%`, backgroundColor: bar }}
        />
      </div>
      <div className="text-right text-xs text-zinc-600">{(level * 100).toFixed(0)}% inhibisi</div>
    </div>
  );
}

export function EnzymeStatus({ hkInhibition, csInhibition }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Status Enzim</h3>
      <EnzymeRow name="Heksokinase"    abbr="HK" level={hkInhibition} />
      <EnzymeRow name="Sitrat Sintase" abbr="CS" level={csInhibition} />
    </div>
  );
}
