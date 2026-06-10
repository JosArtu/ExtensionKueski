import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { useApp } from "../context/AppContext";
import { CARD_MOCK } from "../mock/data";

export function DigitalCardScreen() {
  const { state, revealCard, completeCheckout, navigate, updateUserCredit } = useApp();
  const [localRevealed, setLocalRevealed] = useState(state.cardRevealed);

  const revealed = localRevealed || state.cardRevealed;

  const handleReveal = () => {
    setLocalRevealed(true);
    revealCard();
  };

  const handleConfirmCheckout = () => {
    const remaining = state.user!.creditoDisponible - state.purchaseAmount;
    updateUserCredit(remaining);
    completeCheckout();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Tarjeta digital temporal</h1>
        <p className="mt-1 text-sm text-slate-500">
          Úsala solo en el checkout de Amazon. Expira en 15 minutos.
        </p>
      </div>

      <motion.div
        className="relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl gradient-kueski p-5 text-white shadow-lg"
        layout
      >
        <div className="flex justify-between text-xs opacity-80">
          <span>Kueski Digital</span>
          <span>VISA</span>
        </div>
        <div className="mt-8">
          {revealed ? (
            <motion.p
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="font-mono text-lg tracking-widest"
            >
              {CARD_MOCK.numero}
            </motion.p>
          ) : (
            <p className="font-mono text-lg tracking-widest">•••• •••• •••• 7816</p>
          )}
        </div>
        <div className="mt-6 flex justify-between text-xs">
          <div>
            <p className="opacity-70">Titular</p>
            <p className="font-medium">{CARD_MOCK.titular}</p>
          </div>
          <div>
            <p className="opacity-70">Exp</p>
            <p className="font-medium">{CARD_MOCK.exp}</p>
          </div>
          <div>
            <p className="opacity-70">CVV</p>
            <p className="font-medium">{revealed ? CARD_MOCK.cvv : "•••"}</p>
          </div>
        </div>
      </motion.div>

      {!revealed ? (
        <Button fullWidth onClick={handleReveal}>
          Revelar datos de tarjeta
        </Button>
      ) : (
        <>
          <p className="text-center text-xs text-slate-500">
            Copia los datos en el método de pago de Amazon.
          </p>
          <Button fullWidth onClick={handleConfirmCheckout}>
            Confirmar uso en checkout
          </Button>
        </>
      )}

      <Button fullWidth variant="ghost" onClick={() => navigate("eligibility")}>
        Volver
      </Button>
    </div>
  );
}