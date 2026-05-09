import { ReactNode } from "react";

import { OnboardingShell } from "./components/OnboardingShell";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <OnboardingShell>{children}</OnboardingShell>;
}
