"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Page from "@/modules/onboarding/pages/WeightPage";

const ALLOWED = ["weight", "job", "done"];

export default function WeightGuard() {
  const router = useRouter();
  // Safe: this component is never prerendered (parent uses dynamic ssr:false)
  const [step] = useState(() => sessionStorage.getItem("flow_step") ?? "");
  const ready = !!step && ALLOWED.includes(step);

  useEffect(() => {
    if (!ready) {
      window.alert("Your session was lost. You will be redirected to the beginning of the flow.");
      router.replace("/onboarding/wish");
    }
  }, [ready, router]);

  if (!ready) return null;

  return (
    <Page
      onContinue={() => {
        sessionStorage.setItem("flow_step", "job");
        router.push("/onboarding/job");
      }}
    />
  );
}
