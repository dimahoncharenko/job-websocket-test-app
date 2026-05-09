import { ReactNode } from "react";
import type { Metadata } from "next";

import MainLayout from "@/modules/main/layout";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vitapath — Your Wellness Journey Starts Here",
  description:
    "Set your goals, track your progress, and let Vitapath craft a personalized plan built around you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
