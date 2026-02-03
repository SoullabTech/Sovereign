"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  checkForUpdate,
  startPeriodicChecks,
  stopPeriodicChecks,
  applyUpdate,
  syncVersionOnLoad,
  getCurrentVersionInfo,
  type UpdateCheckResult,
  type VersionInfo,
} from "@/lib/services/appUpdateService";
import { UpdateNotification } from "@/components/UpdateNotification";

interface UpdateContextValue {
  currentVersion: VersionInfo | null;
  checkForUpdate: () => Promise<UpdateCheckResult>;
  applyUpdate: (forced?: boolean) => void;
  isChecking: boolean;
  lastCheckResult: UpdateCheckResult | null;
}

const UpdateContext = createContext<UpdateContextValue | null>(null);

// Safe defaults for SSG/SSR when no provider is available
const defaultContextValue: UpdateContextValue = {
  currentVersion: null,
  checkForUpdate: async () => ({
    updateAvailable: false,
    forcedUpdate: false,
    currentVersion: 'unknown',
    currentCommit: 'unknown',
    serverVersion: 'unknown',
    serverCommit: 'unknown',
  }),
  applyUpdate: () => {},
  isChecking: false,
  lastCheckResult: null,
};

export function useUpdate() {
  const context = useContext(UpdateContext);
  // Return safe defaults for SSG/SSR instead of throwing
  return context ?? defaultContextValue;
}

interface UpdateProviderProps {
  children: React.ReactNode;
}

export function UpdateProvider({ children }: UpdateProviderProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<UpdateCheckResult | null>(null);
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null);

  // Sync version on initial load
  useEffect(() => {
    syncVersionOnLoad().then(() => {
      setCurrentVersion(getCurrentVersionInfo());
    });
  }, []);

  // Start periodic checks
  useEffect(() => {
    startPeriodicChecks((result) => {
      setLastCheckResult(result);

      if (result.updateAvailable && !dismissed) {
        setUpdateInfo(result);
      }

      // Force update for major versions - cannot dismiss
      if (result.forcedUpdate) {
        setUpdateInfo(result);
        setDismissed(false);
      }
    });

    return () => stopPeriodicChecks();
  }, [dismissed]);

  const handleCheckForUpdate = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkForUpdate();
      setLastCheckResult(result);
      if (result.updateAvailable) {
        setUpdateInfo(result);
        setDismissed(false);
      }
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setUpdateInfo(null);
  }, []);

  const handleApplyUpdate = useCallback((forced: boolean = false) => {
    applyUpdate(forced);
  }, []);

  const contextValue: UpdateContextValue = {
    currentVersion,
    checkForUpdate: handleCheckForUpdate,
    applyUpdate: handleApplyUpdate,
    isChecking,
    lastCheckResult,
  };

  return (
    <UpdateContext.Provider value={contextValue}>
      {children}
      {updateInfo && (
        <UpdateNotification
          updateInfo={updateInfo}
          onDismiss={handleDismiss}
          onUpdate={() => handleApplyUpdate(updateInfo.forcedUpdate)}
        />
      )}
    </UpdateContext.Provider>
  );
}
