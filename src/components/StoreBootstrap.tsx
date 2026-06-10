import { useEffect, useRef } from "react";
import { isSessionValid } from "../extension/messages";
import { getAmazonSession, getCostcoSession, isExtensionContext } from "../extension/session";
import { useApp } from "../context/AppContext";

function isAmazonUrl(url: string): boolean {
  return /amazon\.com/i.test(url);
}

function isCostcoUrl(url: string): boolean {
  return /costco\.com/i.test(url);
}

export function StoreBootstrap() {
  const { state, amazonVisitFromTab, costcoVisitFromTab } = useApp();
  const lastAppliedKey = useRef("");
  const storeDetectionDismissedRef = useRef(state.storeDetectionDismissed);
  storeDetectionDismissedRef.current = state.storeDetectionDismissed;

  useEffect(() => {
    if (state.storeDetectionDismissed) {
      lastAppliedKey.current = "";
    }
  }, [state.storeDetectionDismissed]);

  useEffect(() => {
    if (!isExtensionContext()) return;
    if (!state.user || !state.preferences.notificaciones) return;
    if (state.storeDetectionDismissed) return;
    if (state.screen !== "login" && state.screen !== "dashboard") return;

    void (async () => {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = activeTab?.url ?? "";
      const onAmazon = isAmazonUrl(url);
      const onCostco = isCostcoUrl(url);

      if (onAmazon) {
        const session = await getAmazonSession();
        if (storeDetectionDismissedRef.current) return;
        if (!isSessionValid(session) || !session) return;
        const key = `amazon:${session.at}`;
        if (key === lastAppliedKey.current) return;
        lastAppliedKey.current = key;
        amazonVisitFromTab(session.product);
        return;
      }

      if (onCostco) {
        const session = await getCostcoSession();
        if (storeDetectionDismissedRef.current) return;
        if (!isSessionValid(session) || !session) return;
        const key = `costco:${session.at}`;
        if (key === lastAppliedKey.current) return;
        lastAppliedKey.current = key;
        costcoVisitFromTab(session.product);
      }
    })();
  }, [
    state.user,
    state.preferences.notificaciones,
    state.storeDetectionDismissed,
    state.screen,
    amazonVisitFromTab,
    costcoVisitFromTab,
  ]);

  return null;
}
