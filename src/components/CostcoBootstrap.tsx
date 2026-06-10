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
    if (state.screen !== "login" && state.screen !== "dashboard") return;

    void (async () => {
      const session = await getCostcoSession();
      // #region agent log
      fetch('http://127.0.0.1:7886/ingest/5ef5ffa8-2bf4-4ad7-84e0-911796d4af42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d50a65'},body:JSON.stringify({sessionId:'d50a65',location:'CostcoBootstrap.tsx:effect',message:'costco session check',data:{hasSession:!!session,sessionAt:session?.at,lastAppliedAt:lastAppliedAt.current,screen:state.screen,willApply:!!(session&&isSessionValid(session)&&session.at>lastAppliedAt.current)},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      if (!isSessionValid(session) || !session) return;
      if (session.at <= lastAppliedAt.current) return;
      lastAppliedAt.current = session.at;
      costcoVisitFromTab(session.product);
    })();
  }, [
    state.user,
    state.preferences.notificaciones,
    state.storeDetectionDismissed,
    state.screen,
    costcoVisitFromTab,
  ]);

  return null;
}
