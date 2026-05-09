"use client";

import { useRouter } from "next/navigation";

import Page from "@/modules/onboarding/pages/JobPage";

export default function JobPage() {
  const router = useRouter();

  return <Page onReset={() => router.push("/onboarding/wish")} />;
}
