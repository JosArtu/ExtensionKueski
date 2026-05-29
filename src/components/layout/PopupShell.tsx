import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useApp } from "../../context/AppContext";
import { isExtensionContext } from "../../extension/session";
import type { ScreenId } from "../../types";

const screenTitles: Partial<Record<ScreenId, string>> = {
  login: "Kueski Pay",
  dashboard: "Inicio",
  storeDetection: "Amazon detectada",
  activeOffer: "Oferta activa",
  simulation: "Simular pagos",
  eligibility: "Elegibilidad",
  digitalCard: "Tarjeta digital",
  confirmation: "Confirmación",
  preferences: "Preferencias",
};

export function PopupShell({
  children,
  screen,
  showBack = false,
  onBack,
  showSettings = false,
}: {
  children: ReactNode;
  screen: ScreenId;
  showBack?: boolean;
  onBack?: () => void;
  showSettings?: boolean;
}) {
  const { navigate, state } = useApp();
  const title = screenTitles[screen] ?? "Kueski Pay";
  const isExtension = isExtensionContext();

  const shell = (
    <div
      className={
        isExtension
          ? "flex h-full w-full flex-col overflow-hidden bg-white"
          : "overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-popup"
      }
    >
      <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          {showBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Volver"
            >
              ←
            </button>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-kueski text-sm font-bold text-white">
            K
          </div>
          <span className="text-sm font-semibold text-slate-800">{title}</span>
        </div>
        {showSettings && state.user && (
          <button
            type="button"
            onClick={() => navigate("preferences")}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Preferencias"
          >
            ⚙
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={screen}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className={
            isExtension
              ? "min-h-0 flex-1 overflow-y-auto p-4"
              : "max-h-[min(640px,75vh)] overflow-y-auto p-4"
          }
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );

  if (isExtension) {
    return shell;
  }

  return (
    <div className="flex min-h-screen items-start justify-center p-4 pt-8 md:items-center md:p-8">
      <div className="w-full max-w-[400px]">
        <p className="mb-3 text-center text-xs text-slate-500">
          Prototipo — ventana de extensión Chrome (400px)
        </p>
        {shell}
        {state.user && (
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Sesión: {state.user.nombre} {state.user.apellidos}
          </p>
        )}
      </div>
    </div>
  );
}
