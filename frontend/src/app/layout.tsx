import { ReactNode } from "react";

import MainLayout from "@/modules/main/layout";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
