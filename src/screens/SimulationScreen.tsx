import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import {
  ACTIVE_OFFER,
  calculateSimulation,
  formatMXN,
} from "../mock/data";

const PAYMENT_OPTIONS = [3, 6, 9, 12];

export function SimulationScreen() {
  const { state, runSimulation, navigate, checkEligibility } = useApp();
  const [selected, setSelected] = useState(3);
  const sinInteres = selected <= ACTIVE_OFFER.mesesSinInteres;
  const { pagoMensual, total } = calculateSimulation(
    state.purchaseAmount,
    selected,
    sinInteres
  );

  const apply = () => {
    runSimulation(selected, pagoMensual, total);
    checkEligibility();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Simular pagos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compra en Amazon: {formatMXN(state.purchaseAmount)}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PAYMENT_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setSelected(n)}
            className={`rounded-xl border py-2 text-sm font-semibold transition ${
              selected === n
                ? "border-kueski-500 bg-kueski-50 text-kueski-800"
                : "border-slate-200 text-slate-600"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <Card>
        <p className="text-xs text-slate-500">Pago mensual estimado</p>
        <p className="text-2xl font-bold text-kueski-800">
          {formatMXN(pagoMensual)}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Total a pagar: {formatMXN(total)}
          {sinInteres && (
            <span className="ml-1 font-medium text-kueski-600">
              · {ACTIVE_OFFER.titulo}
            </span>
          )}
        </p>
      </Card>

      <Button fullWidth onClick={apply}>
        Continuar a elegibilidad
      </Button>
      <Button fullWidth variant="ghost" onClick={() => navigate("activeOffer")}>
        Volver a la oferta
      </Button>
    </div>
  );
}
