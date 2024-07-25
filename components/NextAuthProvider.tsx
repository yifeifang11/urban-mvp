import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function NextAuthProvider(props: Props) {
  return <SessionProvider>{props.children}</SessionProvider>;
}
