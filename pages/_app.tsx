import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

// MoralisProvider --> so we can do useMoralis()
// NotificationProvider --> so we can use notifications through onSuccess / onError

export default function App({ Component, pageProps }: AppProps) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <NotificationProvider>
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
    );
}
