"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Permission } from "@/types/demo";

type BusinessUiValue = {
  branchId: string;
  setBranchId: (id: string) => void;
  can: (permission: Permission) => boolean;
  notify: (message: string, kind?: "success" | "error") => void;
};

const BusinessUiContext = createContext<BusinessUiValue | null>(null);

export function BusinessUiProvider({ value, children }: { value: BusinessUiValue; children: ReactNode }) {
  return <BusinessUiContext.Provider value={value}>{children}</BusinessUiContext.Provider>;
}

export function useBusinessUi() {
  const value = useContext(BusinessUiContext);
  if (!value) throw new Error("useBusinessUi must be used inside BusinessUiProvider");
  return value;
}
