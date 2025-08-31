import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

interface ProviderPros {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function index({ children }: ProviderPros) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
