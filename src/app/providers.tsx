import type { ReactNode } from "react";

import { ConvexProvider, ConvexReactClient } from "convex/react";

import { ToastProvider } from "@shared/components/ui";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL as string;
const convex = new ConvexReactClient(convexUrl);

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ConvexProvider client={convex}>
      <ToastProvider>{children}</ToastProvider>
    </ConvexProvider>
  );
};
