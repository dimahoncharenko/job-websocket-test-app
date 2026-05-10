"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Page from "@/modules/onboarding/pages/JobPage";

const ALLOWED = ["job", "done"];

export default function JobGuard() {
  const router = useRouter();
  // Safe: this component is never prerendered (parent uses dynamic ssr:false)
  const [step] = useState(() => sessionStorage.getItem("flow_step") ?? "");
  const ready = !!step && ALLOWED.includes(step);
  const initialDone = step === "done";

  useEffect(() => {
    if (!ready) {
      window.alert("Your session was lost. You will be redirected to the beginning of the flow.");
      router.replace("/onboarding/wish");
    }
  }, [ready, router]);

  if (!ready) return null;

  return (
    <Page
      initialDone={initialDone}
      onReset={() => {
        sessionStorage.removeItem("flow_step");
        router.push("/onboarding/wish");
      }}
    />
  );
}
