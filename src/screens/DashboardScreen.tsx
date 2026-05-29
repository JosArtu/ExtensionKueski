import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CreditAmount } from "../components/ui/CreditAmount";
import { useApp } from "../context/AppContext";
import {
  AMAZON_STORE,
  COMPATIBLE_STORES,
  formatMXN,
  PROMOTIONS,
} from "../mock/data";

export function DashboardScreen() {
  const {
    state,
    navigate,
    simulateAmazonVisit,
    simulateAmazonExpensive,
    resetAmazonFlow,
  } = useApp();
  const user = state.user!;

  return (
    <div className="space-y-4">
      <CreditAmount amount={user.creditoDisponible} />

      <Card className="gradient-kueski border-0 !p-3 text-white">
        <p className="text-xs opacity-90">Tarjeta digital</p>
        <p className="text-sm font-semibold">Lista para usar en checkout</p>
        <p className="mt-1 text-xs opacity-80">Se genera al confirmar una compra</p>
      </Card>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Promociones activas
        </h2>
        <div className="space-y-2">
          {PROMOTIONS.map((p) => (
            <Card key={p.id} className="!py-3">
              <p className="text-sm font-medium text-slate-800">{p.titulo}</p>
              <p className="text-xs text-kueski-700">{p.tienda}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Tiendas compatibles
        </h2>
        <div className="flex flex-wrap gap-2">
          {COMPATIBLE_STORES.map((s) => (
            <span
              key={s.dominio}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                s.activa
                  ? "bg-kueski-100 text-kueski-800"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {s.nombre}
              {!s.activa && " (próx.)"}
            </span>
          ))}
        </div>
      </div>

      <Card className="border-kueski-200 bg-kueski-50/40">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{AMAZON_STORE.logo}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">
              Detección automática en Amazon
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              En {AMAZON_STORE.dominio} la extensión detecta la tienda al abrir el popup.
              Usa los botones si pruebas fuera de Chrome.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <Button fullWidth onClick={simulateAmazonVisit}>
            Visitar Amazon — producto {formatMXN(1299)}
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={simulateAmazonExpensive}
          >
            Amazon — producto {formatMXN(38999)} (no califica)
          </Button>
        </div>
      </Card>

      {state.amazonActive && (
        <Button fullWidth variant="ghost" onClick={resetAmazonFlow}>
          Reiniciar flujo Amazon
        </Button>
      )}

      <Button fullWidth variant="secondary" onClick={() => navigate("preferences")}>
        Preferencias
      </Button>
    </div>
  );
}
