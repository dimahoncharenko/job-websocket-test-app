"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import Page from "@/modules/onboarding/pages/WeightPage";

const ALLOWED = ["weight", "job", "done"];
const noopSubscribe = () => () => {};
const getFlowStep = () => sessionStorage.getItem("flow_step") ?? "";

export default function WeightPage() {
  const router = useRouter();
  const step = useSyncExternalStore(noopSubscribe, getFlowStep, () => "");
  const ready = !!step && ALLOWED.includes(step);

  useEffect(() => {
    const currentStep = sessionStorage.getItem("flow_step") ?? "";
    if (!currentStep || !ALLOWED.includes(currentStep)) {
      window.alert("Your session was lost. You will be redirected to the beginning of the flow.");
      router.replace("/onboarding/wish");
    }
  }, [router]);

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
