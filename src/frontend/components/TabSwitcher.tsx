"use client";

export type SimulationTab = "single" | "compare";

interface Props {
  activeTab: SimulationTab;
  onChange: (tab: SimulationTab) => void;
}

const TABS: Array<{ id: SimulationTab; label: string }> = [
  { id: "single", label: "Single Scenario" },
  { id: "compare", label: "Compare All" },
];

export function TabSwitcher({ activeTab, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 w-full sm:w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            activeTab === tab.id ? "bg-blue-600 text-white shadow" : "text-zinc-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
