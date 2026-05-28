"use client";

interface Props {
  onReset: () => void;
}

export function AppHeader({ onReset }: Props) {
  return (
    <header className="border-b border-zinc-800 px-4 py-3 sm:px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
      <div>
        <h1 className="text-base font-bold tracking-tight">
          SimuCell<span className="text-blue-400">-Allosteric</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Simulasi Regulasi Alosterik Enzim - Respirasi Seluler &amp; Produksi ATP
        </p>
      </div>
      <button
        onClick={onReset}
        className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
      >
        Reset
      </button>
    </header>
  );
}
