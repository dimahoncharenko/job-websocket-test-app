"use client";

import { useRouter } from "next/navigation";

import Page from "@/modules/onboarding/pages/WishPage";

export default function WishPage() {
  const router = useRouter();

  return <Page onContinue={() => router.push("/onboarding/weight")} />;
}
