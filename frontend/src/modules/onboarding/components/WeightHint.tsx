"use client";

import { useEffect, useRef, useState } from "react";

import { WeightUnit } from "../hooks/useWeightForm";

interface Props {
  range: { min: number; max: number };
  unit: WeightUnit;
  isValid: boolean;
}

export const WeightHint = ({ range, unit, isValid }: Props) => {
  const [announcement, setAnnouncement] = useState("");
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setAnnouncement(`Please enter a value from ${range.min} to ${range.max} ${unit}`);
  }, [unit, range.min, range.max]);

  return (
    <>
      <span id="weight-hint" aria-live="polite" className="sr-only">
        {announcement}
      </span>
      <p
        aria-hidden="true"
        className={[
          "text-center text-md mt-3",
          isValid ? "text-(--neutral-secondary)" : "text-(--critical-primary)",
        ].join(" ")}
      >
        Please enter a value from{" "}
        <strong className={isValid ? "text-(--blue-900)" : "text-(--critical-primary)"}>
          {range.min} {unit}
        </strong>{" "}
        to{" "}
        <strong className={isValid ? "text-(--blue-900)" : "text-(--critical-primary)"}>
          {range.max} {unit}
        </strong>
      </p>
    </>
  );
};
