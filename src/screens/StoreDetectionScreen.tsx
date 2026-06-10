import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { AMAZON_STORE, COSTCO_STORE, formatMXN } from "../mock/data";

export function StoreDetectionScreen() {
  const { state, dismissStoreDetection, navigate } = useApp();
  const { product } = state;

  const store = state.costcoActive ? COSTCO_STORE : AMAZON_STORE;
  const offerLabel = state.costcoActive ? "Ver oferta en Costco" : "Ver oferta en Amazon";
  const promoText = state.costcoActive
    ? "Tienes una promoción Kueski disponible en Costco. Puedes verla ahora o ignorarla."
    : "Tienes una promoción Kueski disponible en Amazon. Puedes verla ahora o ignorarla.";

  // Use actual scraped product data; show the name and price that was detected
  const productName = product.nombre || "Producto detectado";
  const productPrice = product.precio || 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
            {store.logo}
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-orange-700">
              Tienda detectada
            </p>
            <h1 className="text-lg font-bold text-slate-900">{store.nombre}</h1>
            <p className="text-xs text-slate-600">{store.dominio}</p>
          </div>
        </div>
      </div>

      <Card>
        <p className="text-xs text-slate-500">Producto en esta página</p>
        <p className="mt-1 text-sm font-medium text-slate-800 line-clamp-2">
          {productName}
        </p>
        {productPrice > 0 && (
          <p className="mt-2 text-lg font-bold text-kueski-800">
            {formatMXN(productPrice)}
          </p>
        )}
        {productPrice === 0 && (
          <p className="mt-2 text-xs text-slate-500">
            (Precio no disponible en esta página)
          </p>
        )}
      </Card>

      <p className="text-sm text-slate-600">{promoText}</p>

      <Button fullWidth onClick={() => navigate("activeOffer")}>
        {offerLabel}
      </Button>
      <Button fullWidth variant="ghost" onClick={dismissStoreDetection}>
        Ignorar por ahora
      </Button>
    </div>
  );
}
