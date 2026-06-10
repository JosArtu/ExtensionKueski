import { useEffect, useRef } from "react";
import { isSessionValid } from "../extension/messages";
import { getCostcoSession, isExtensionContext } from "../extension/session";
import { useApp } from "../context/AppContext";

export function CostcoBootstrap() {
  const { state, costcoVisitFromTab } = useApp();
  const lastAppliedAt = useRef(0);

  useEffect(() => {
    if (!isExtensionContext()) return;
    if (!state.user || !state.preferences.notificaciones) return;
    if (state.storeDetectionDismissed) return;

    void (async () => {
      const session = await getCostcoSession();
      if (!isSessionValid(session) || !session) return;
      if (session.at <= lastAppliedAt.current) return;
      lastAppliedAt.current = session.at;
      costcoVisitFromTab(session.product);
    })();
  }, [
    state.user,
    state.preferences.notificaciones,
    state.storeDetectionDismissed,
    costcoVisitFromTab,
  ]);

  return null;
}
