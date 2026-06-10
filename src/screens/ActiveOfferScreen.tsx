import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { AMAZON_STORE, formatMXN } from "../mock/data";

export function ActiveOfferScreen() {
  const { state, navigate, dismissOffer, needsSimulation, checkEligibility } =
    useApp();

  const activeOffer = state.activeOffer;

  const goNext = () => {
    if (needsSimulation) {
      navigate("simulation");
    } else {
      checkEligibility();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl gradient-kueski p-4 text-white">
        <p className="text-xs opacity-90">{AMAZON_STORE.nombre}</p>
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

      <p className="text-xs text-slate-500">{state.product.nombre}</p>

      <Button fullWidth onClick={goNext}>
        {needsSimulation ? "Simular pagos" : "Revisar elegibilidad"}
      </Button>
      <Button fullWidth variant="ghost" onClick={dismissOffer}>
        Cerrar oferta
      </Button>
    </div>
  );
}