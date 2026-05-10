"use client";

import { useRouter } from "next/navigation";

import Page from "@/modules/onboarding/pages/WishPage";

export default function WishPage() {
  const router = useRouter();

  return (
    <Page
      onContinue={() => {
        sessionStorage.setItem("flow_step", "weight");
        router.push("/onboarding/weight");
      }}
    />
  );
}
