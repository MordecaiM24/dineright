import { LayoutGrid, UtensilsCrossed, ListChecks } from "lucide-react";

interface MobileNavProps {
  view: "halls" | "items" | "tracking";
  setView: (view: "halls" | "items" | "tracking") => void;
}

export default function MobileNav({ view, setView }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 z-10">
      <div className="flex items-center">
        <button
          onClick={() => setView("halls")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 ${
            view === "halls" ? "text-black dark:text-white" : "text-zinc-500"
          }`}
        >
          <LayoutGrid size={20} />
          <span className="text-xs">Halls</span>
        </button>
        <button
          onClick={() => setView("items")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 ${
            view === "items" ? "text-black dark:text-white" : "text-zinc-500"
          }`}
        >
          <UtensilsCrossed size={20} />
          <span className="text-xs">Items</span>
        </button>
        <button
          onClick={() => setView("tracking")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 ${
            view === "tracking" ? "text-black dark:text-white" : "text-zinc-500"
          }`}
        >
          <ListChecks size={20} />
          <span className="text-xs">Tracking</span>
        </button>
      </div>
    </div>
  );
}
