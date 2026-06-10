import { useEffect, useRef } from "react";
import { isSessionValid } from "../extension/messages";
import { getAmazonSession, isExtensionContext } from "../extension/session";
import { useApp } from "../context/AppContext";

export function AmazonBootstrap() {
  const { state, amazonVisitFromTab } = useApp();
  const lastAppliedAt = useRef(0);

  useEffect(() => {
    if (!isExtensionContext()) return;
    if (!state.user || !state.preferences.notificaciones) return;
    if (state.storeDetectionDismissed) return;
    if (state.screen !== "login" && state.screen !== "dashboard") return;

    void (async () => {
      const session = await getAmazonSession();
      // #region agent log
      fetch('http://127.0.0.1:7886/ingest/5ef5ffa8-2bf4-4ad7-84e0-911796d4af42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d50a65'},body:JSON.stringify({sessionId:'d50a65',location:'AmazonBootstrap.tsx:effect',message:'amazon session check',data:{hasSession:!!session,sessionAt:session?.at,lastAppliedAt:lastAppliedAt.current,screen:state.screen,willApply:!!(session&&isSessionValid(session)&&session.at>lastAppliedAt.current)},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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
