"use client";

import { clampInhibitionLevel, inhibitionBadgeClass, inhibitionColor, inhibitionLabel } from "../utils/inhibition";

interface Props {
  hkInhibition: number;
  csInhibition: number;
}

function EnzymeRow({ name, abbr, level }: { name: string; abbr: string; level: number }) {
  const clampedLevel = clampInhibitionLevel(level);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-300">
          {name} <span className="text-zinc-500">({abbr})</span>
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${inhibitionBadgeClass(clampedLevel)}`}>
          {inhibitionLabel(clampedLevel)}
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${clampedLevel * 100}%`, backgroundColor: inhibitionColor(clampedLevel) }}
        />
      </div>
      <div className="text-right text-xs text-zinc-600">{(clampedLevel * 100).toFixed(0)}% inhibisi</div>
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
