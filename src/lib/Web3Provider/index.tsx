// Imports
import React, { ReactNode } from "react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { State, WagmiProvider } from "wagmi";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";
import { polygon } from "wagmi/chains";

// Project ID from environment variable
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) throw new Error("Project ID is not defined");

// Metadata for Web3Modal
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "http://localhost:3000", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Define chains and create config
const chains = [polygon] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

// Create query client
const queryClient = new QueryClient();

// Initialize Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
  tokens: {
    1: {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", //PME
    },
    2: {
      address: "0x3b7A389DF11A0F71739b1632dcAaf89D2E6c3116", //USDT
    },
  },
});

// Web3Provider component
export default function Web3Provider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
