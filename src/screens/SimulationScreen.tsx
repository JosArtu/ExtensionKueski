import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import {
  AMAZON_STORE,
  COSTCO_STORE,
  calculateSimulation,
  formatMXN,
} from "../mock/data";

const PAYMENT_OPTIONS = [3, 6, 9, 12];

export function SimulationScreen() {
  const { state, runSimulation, navigate, checkEligibility } = useApp();
  
  // Determinar la tienda activa dinámicamente
  const store = state.costcoActive ? COSTCO_STORE : AMAZON_STORE;
  
  const activeOffer = state.activeOffer;

  const [selected, setSelected] = useState(3);

  const isInterestFree = (n: number) => n <= activeOffer.mesesSinInteres;
  const sinInteres = isInterestFree(selected);
  
  const { pagoMensual, total } = calculateSimulation(
    state.purchaseAmount,
    selected,
    sinInteres,
    activeOffer
  );

  const apply = () => {
    runSimulation(selected, pagoMensual, total);
    checkEligibility();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">
          Simular pago en {store.nombre}
        </h1>
        <p className="text-sm text-slate-500">
          Elige el plazo que mejor se adapte a tus necesidades.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PAYMENT_OPTIONS.map((n) => {
          const free = isInterestFree(n);
          return (
            <button
              key={n}
              onClick={() => setSelected(n)}
              className={`flex flex-col items-center justify-center rounded-xl border py-2.5 text-sm font-semibold transition ${
                selected === n
                  ? "border-kueski-500 bg-kueski-50 text-kueski-800"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              <span className="block">{n}</span>
              <span className={`block text-[10px] font-medium mt-0.5 ${
                free ? "text-kueski-600" : "text-slate-400"
              }`}>
                {free ? "0%" : "c/int"}
              </span>
            </button>
          );
        })}
      </div>

      <Card>
        <p className="text-xs text-slate-500">Pago mensual estimado</p>
        <p className="text-2xl font-bold text-kueski-800">
          {formatMXN(pagoMensual)}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Total a pagar: {formatMXN(total)}
          {sinInteres ? (
            <span className="ml-1 font-medium text-kueski-600">
              · {selected} meses sin intereses
            </span>
          ) : (
            <span className="ml-1 text-slate-400">
              · incluye intereses
            </span>
          )}
        </p>
      </Card>

      <Button fullWidth onClick={apply}>
        Continuar con {selected} meses
      </Button>
      <Button fullWidth variant="ghost" onClick={() => navigate("activeOffer")}>
        Volver
      </Button>
    </div>
  );
}