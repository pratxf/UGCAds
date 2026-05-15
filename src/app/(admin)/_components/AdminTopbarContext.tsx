"use client";
import { createContext, useContext, type ReactNode } from "react";

export const AdminTopbarCtx = createContext<(node: ReactNode) => void>(() => {});
export const useSetTopbarRight = () => useContext(AdminTopbarCtx);
