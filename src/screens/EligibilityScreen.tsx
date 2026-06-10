import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CreditAmount } from "../components/ui/CreditAmount";
import { useApp } from "../context/AppContext";
import { formatMXN } from "../mock/data";

export function EligibilityScreen() {
  const { state, navigate, checkEligibility, completeCheckout, updateUserCredit } = useApp();
  const user = state.user!;
  const notQualified = state.eligibility === "not_qualified";
  const pending = state.eligibility === "pending";

  const storeName = state.costcoActive ? "Costco" : "Amazon";

  if (pending) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-slate-900">Revisar compra</h1>
        <Card>
          <p className="text-sm text-slate-600">{state.product.nombre}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatMXN(state.purchaseAmount)}
          </p>
        </Card>
        <CreditAmount amount={user.creditoDisponible} size="md" />
        <Button fullWidth onClick={checkEligibility}>
          Verificar elegibilidad
        </Button>
        <Button fullWidth variant="ghost" onClick={() => navigate("activeOffer")}>
          Volver
        </Button>
      </div>
    );
  }

  if (notQualified) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-2xl">✕</p>
          <h1 className="mt-2 text-lg font-bold text-red-900">
            Compra no elegible
          </h1>
          <p className="mt-2 text-sm text-red-800">
            El monto ({formatMXN(state.purchaseAmount)}) supera tu crédito disponible (
            {formatMXN(user.creditoDisponible)}).
          </p>
        </div>
        <Card>
          <p className="text-sm text-slate-600">
            Prueba un producto de menor precio en {storeName} o espera a liberar línea de crédito.
          </p>
        </Card>
        <Button fullWidth onClick={() => navigate("dashboard")}>
          Ir al inicio
        </Button>
        <Button
          fullWidth
          variant="secondary"
          onClick={() => navigate("activeOffer")}
        >
          Ver otra oferta
        </Button>
      </div>
    );
  }

  // qualified
  const remainingCredit = user.creditoDisponible - state.purchaseAmount;

  // Amazon: skip digital card, confirm directly
  // Costco: go through digital card flow
  const handleConfirm = () => {
    if (state.amazonActive) {
      updateUserCredit(user.creditoDisponible - state.purchaseAmount);
      completeCheckout();
    } else {
      navigate("digitalCard");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-kueski-200 bg-kueski-50 p-4 text-center">
        <p className="text-2xl">✓</p>
        <h1 className="mt-2 text-lg font-bold text-kueski-900">
          Compra elegible
        </h1>
        <p className="mt-1 text-sm text-kueski-800">
          Puedes financiar esta compra en {storeName} con Kueski.
        </p>
      </div>

      <Card>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Monto</dt>
            <dd className="font-semibold">{formatMXN(state.purchaseAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Condiciones</dt>
            <dd className="font-medium text-kueski-800">
              {state.simulation
                ? `${state.simulation.numPagos} meses sin intereses · ${formatMXN(state.simulation.pagoMensual)}/mes`
                : `${state.activeOffer.mesesSinInteres} meses sin intereses`}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Crédito restante</dt>
            <dd className="font-semibold text-kueski-700">
              {formatMXN(remainingCredit)}
            </dd>
          </div>
        </dl>
      </Card>

      <Button fullWidth onClick={handleConfirm}>
        {state.amazonActive ? "Confirmar compra" : "Obtener tarjeta digital"}
      </Button>
    </div>
  );
}