import { useEffect, useRef } from "react";
import { isSessionValid } from "../extension/messages";
import { getAmazonSession } from "../extension/session";
import { useApp } from "../context/AppContext";

/** On popup open: apply Amazon tab session → store detection flow */
export function AmazonBootstrap() {
  const { state, amazonVisitFromTab } = useApp();
  const lastAppliedAt = useRef(0);

  useEffect(() => {
    if (!state.user || !state.preferences.notificaciones) return;
    if (state.storeDetectionDismissed) return;
    if (state.screen !== "login" && state.screen !== "dashboard") return;

    void (async () => {
      const session = await getAmazonSession();
      if (!isSessionValid(session) || !session) return;
      if (session.at <= lastAppliedAt.current) return;
      lastAppliedAt.current = session.at;
      amazonVisitFromTab(session.product);
    })();
  }, [
    state.user,
    state.preferences.notificaciones,
    state.storeDetectionDismissed,
    state.screen,
    amazonVisitFromTab,
  ]);

  return null;
}
