"use client";

import { useRouter } from "next/navigation";

import Page from "@/modules/onboarding/pages/WeightPage";

export default function WeightPage() {
  const router = useRouter();

  return <Page onContinue={() => router.push("/onboarding/job")} />;
}
