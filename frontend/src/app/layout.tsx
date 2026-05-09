import { ReactNode } from "react";
import type { Metadata } from "next";

import MainLayout from "@/modules/main/layout";

import "./globals.css";

export const metadata: Metadata = {
  title: "Wellness Platform",
  description: "Personalized wellness planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
