import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CreditAmount } from "../components/ui/CreditAmount";
import { useApp } from "../context/AppContext";
import {
  AMAZON_STORE,
  COMPATIBLE_STORES,
  COSTCO_STORE,
  formatMXN,
  PROMOTIONS,
} from "../mock/data";

// Icono y etiqueta según tipo_usuario
function UserTypeBadge({ tipo }: { tipo?: string }) {
  const isPremium = tipo === "premium";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isPremium
          ? "bg-kueski-100 text-kueski-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {isPremium ? "✦ Premium" : "● Estándar"}
    </span>
  );
}

export function DashboardScreen() {
  const {
    state,
    navigate,
    simulateAmazonVisit,
    simulateAmazonExpensive,
    simulateCostcoVisit,
    resetAmazonFlow,
  } = useApp();
  const user = state.user!;

  const handleStoreClick = (url: string) => {
    // En contexto de extensión abre en nueva pestaña; fuera abre normalmente
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-4">
      {/* Nombre + tipo de usuario */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Bienvenido</p>
          <p className="text-base font-bold text-slate-900">
            {user.nombre} {user.apellidos}
          </p>
        </div>
        <UserTypeBadge tipo={user.tipo_usuario} />
      </div>

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

      {/* Tiendas compatibles — cada una abre la tienda en nueva pestaña */}
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Tiendas compatibles
        </h2>
        <div className="flex flex-wrap gap-2">
          {COMPATIBLE_STORES.map((s) => (
            <button
              key={s.dominio}
              type="button"
              onClick={() => handleStoreClick(s.url)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 ${
                s.activa
                  ? "bg-kueski-100 text-kueski-800"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {s.nombre}
              {!s.activa && " (próx.)"}
            </button>
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

      <Card className="border-blue-200 bg-blue-50/40">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{COSTCO_STORE.logo}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">
              Detección automática en Costco
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              En {COSTCO_STORE.dominio} la extensión detecta la tienda y genera tarjeta digital.
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Button fullWidth onClick={simulateCostcoVisit}>
            Visitar Costco — producto {formatMXN(1299)}
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