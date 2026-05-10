"use client";

import dynamic from "next/dynamic";

const JobGuard = dynamic(() => import("./_guard"), { ssr: false });

export default function JobPage() {
  return <JobGuard />;
}
