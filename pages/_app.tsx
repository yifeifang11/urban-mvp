import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Web3Provider } from "../components/Web3Provider";
import UserLayout from "@/components/layout";
import NextAuthProvider from "@/components/NextAuthProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <NextAuthProvider>
        <UserLayout>
          <Component {...pageProps} />
        </UserLayout>
      </NextAuthProvider>
    </Web3Provider>
  );
}
