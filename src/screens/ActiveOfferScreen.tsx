import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { AMAZON_STORE, COSTCO_STORE, formatMXN } from "../mock/data";

export function ActiveOfferScreen() {
  const { state, navigate, dismissOffer, needsSimulation, checkEligibility } =
    useApp();

  const activeOffer = state.activeOffer;
  
  // Select the store dynamically based on active state
  const store = state.costcoActive ? COSTCO_STORE : AMAZON_STORE;

  const goNext = () => {
    if (needsSimulation) {
      navigate("simulation");
    } else {
      checkEligibility();
    }
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl p-4 text-white ${state.costcoActive ? "bg-blue-600" : "gradient-kueski"}`}>
        <p className="text-xs opacity-90">{store.nombre}</p>
        <h1 className="text-xl font-bold">
          Hasta {activeOffer.mesesSinInteres} meses sin intereses
        </h1>
        <p className="mt-1 text-sm opacity-90">
          En compras hasta {formatMXN(activeOffer.montoFinanciableMax)}
        </p>
      </div>

      <Card>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Monto financiable</dt>
            <dd className="font-semibold text-slate-900">
              {formatMXN(state.purchaseAmount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Interés estimado</dt>
            <dd className="font-semibold text-kueski-700">
              {activeOffer.tasaInteres}% (promo MSI)
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Vigencia</dt>
            <dd className="font-medium text-slate-800">
              Hasta {activeOffer.validoHasta}
            </dd>
          </div>
        </dl>
      </Card>

      <p className="text-xs text-slate-500">
        Aplicar promoción en {store.nombre}
      </p>

      <Button fullWidth onClick={goNext}>
        Continuar
      </Button>
      <Button fullWidth variant="ghost" onClick={dismissOffer}>
        Volver
      </Button>
    </div>
  );
}