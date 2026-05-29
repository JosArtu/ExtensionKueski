import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";

export function LoginScreen() {
  const { state, requestVerification, verifyCode, cancelVerification } = useApp();
  const [correo, setCorreo] = useState("usuario@email.com");
  const [codeInput, setCodeInput] = useState("");

  const onVerifyStep = state.pendingVerificationCode != null;

  const handleLogin = () => {
    const email = correo.trim() || "usuario@email.com";
    requestVerification(email);
    setCodeInput("");
  };

  const handleVerify = () => {
    verifyCode(codeInput.trim());
  };

  const handleBack = () => {
    cancelVerification();
    setCodeInput("");
  };

  if (onVerifyStep) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Verificación</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa el código de 6 dígitos enviado a{" "}
            <span className="font-medium text-slate-700">{state.pendingCorreo}</span>
          </p>
        </div>

        <Card className="border-kueski-200 bg-kueski-50/50">
          <p className="text-xs font-medium uppercase tracking-wide text-kueski-700">
            Prototipo — código de demostración
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-kueski-800">
            {state.pendingVerificationCode}
          </p>
        </Card>

        <div>
          <label htmlFor="verify-code" className="text-xs font-medium text-slate-600">
            Código de verificación
          </label>
          <input
            id="verify-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-center font-mono text-lg tracking-widest outline-none focus:border-kueski-500 focus:ring-2 focus:ring-kueski-200"
          />
          {state.verificationError && (
            <p className="mt-2 text-xs text-red-600">{state.verificationError}</p>
          )}
        </div>

        <Button fullWidth onClick={handleVerify} disabled={codeInput.length !== 6}>
          Verificar
        </Button>
        <Button fullWidth variant="ghost" onClick={handleBack}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-500">
          Accede a tu cuenta Kueski para financiar compras en Amazon.
        </p>
      </div>

      <div>
        <label htmlFor="login-email" className="text-xs font-medium text-slate-600">
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="tu@email.com"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-kueski-500 focus:ring-2 focus:ring-kueski-200"
        />
      </div>

      <Button fullWidth onClick={handleLogin}>
        Iniciar sesión
      </Button>

      <p className="text-center text-[11px] text-slate-400">
        Al continuar recibirás un código de verificación (simulado en este prototipo).
      </p>
    </div>
  );
}
