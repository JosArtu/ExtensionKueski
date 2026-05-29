import { useApp } from "../../context/AppContext";
import type { ScreenId } from "../../types";

const screens: { id: ScreenId; label: string }[] = [
  { id: "login", label: "Login" },
  { id: "dashboard", label: "Dashboard" },
  { id: "storeDetection", label: "Amazon" },
  { id: "activeOffer", label: "Oferta" },
  { id: "simulation", label: "Simulación" },
  { id: "eligibility", label: "Elegibilidad" },
  { id: "digitalCard", label: "Tarjeta" },
  { id: "confirmation", label: "Confirmación" },
  { id: "preferences", label: "Prefs" },
];

/** Demo panel for reviewers — jump between views */
export function FlowDevPanel() {
  const { state, navigate, simulateAmazonVisit, simulateAmazonExpensive } =
    useApp();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 max-w-[95vw] -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 shadow-lg">
      <p className="mb-1 text-[10px] font-semibold uppercase text-amber-800">
        Panel de flujos (solo dev)
      </p>
      <div className="flex flex-wrap justify-center gap-1">
        {screens.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => navigate(s.id)}
            className={`rounded px-2 py-0.5 text-[10px] ${
              state.screen === s.id
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-900"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {state.user && (
        <div className="mt-1 flex justify-center gap-1">
          <button
            type="button"
            onClick={simulateAmazonVisit}
            className="rounded bg-orange-100 px-2 py-0.5 text-[10px] text-orange-900"
          >
            Amazon (califica)
          </button>
          <button
            type="button"
            onClick={simulateAmazonExpensive}
            className="rounded bg-red-100 px-2 py-0.5 text-[10px] text-red-900"
          >
            Amazon (no califica)
          </button>
        </div>
      )}
    </div>
  );
}
