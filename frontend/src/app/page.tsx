"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (["/"].includes(pathname)) {
      router.replace("/onboarding/wish");
    } else {
      router.replace(pathname);
    }
  }, [router, pathname]);

  return null;
}
