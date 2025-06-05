import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Layout } from "@/components/layout/layout";
import { HomePage } from "@/pages/home";
import { InventoryPage } from "@/pages/inventory";
import { ExplorePage } from "@/pages/explore";
import { TradingPage } from "@/pages/trades";
import { CreateTradePage } from "@/pages/create-trade";
import { TradeDetailsPage } from "@/pages/trade-details";
import "./App.css";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { http } from "wagmi";

const xsollaZkSepolia = {
  id: 555272,
  name: "Xsolla ZK Sepolia Testnet",
  network: "xsolla-zk-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://zkrpc.xsollazk.com/"],
    },
    public: {
      http: ["https://zkrpc.xsollazk.com/"],
    },
  },
  blockExplorers: {
    default: { name: "Xsolla ZK Explorer", url: "https://x.la/explorer" },
  },
  testnet: true,
} as const;

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, optimism, arbitrum, base, xsollaZkSepolia],
  transports: {
    // [mainnet.id]: http(),
    // [polygon.id]: http(),
    // [optimism.id]: http(),
    // [arbitrum.id]: http(),
    // [base.id]: http(),
    // [sepolia.id]: http(),
    // [lineaSepolia.id]: http(),
    [xsollaZkSepolia.id]: http(),
  },
  ssr: false,
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <ThemeProvider defaultTheme="system" storageKey="barter-nft-theme">
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="trades" element={<TradingPage />} />
                  <Route path="trade/create" element={<CreateTradePage />} />
                  <Route path="trade/:id" element={<TradeDetailsPage />} />
                </Route>
              </Routes>
            </Router>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
