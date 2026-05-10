"use client";

import dynamic from "next/dynamic";

const WeightGuard = dynamic(() => import("./_guard"), { ssr: false });

export default function WeightPage() {
  return <WeightGuard />;
}
