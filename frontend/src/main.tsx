
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { WalletProvider } from '@demox-labs/miden-wallet-adapter-react';
  import { MidenWalletAdapter } from '@demox-labs/miden-wallet-adapter-wallets';

  const wallets = [
    new MidenWalletAdapter(),
  ];

  createRoot(document.getElementById("root")!).render(
    <WalletProvider wallets={wallets} autoConnect>
      <App />
    </WalletProvider>
  );
  