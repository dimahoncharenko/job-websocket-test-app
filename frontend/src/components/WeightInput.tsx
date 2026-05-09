"use client";

import { RefObject } from "react";

import { WeightUnit } from "../modules/onboarding/hooks/useWeightForm";

interface Props {
  rawValue: string;
  unit: WeightUnit;
  step: "current" | "goal";
  isValid: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
}

export const WeightInput = ({ rawValue, unit, step, isValid, inputRef, onChange }: Props) => {
  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={[
        "flex items-baseline justify-center gap-2 pt-[6px] pb-2 mx-auto w-fit min-w-[180px] cursor-text border-b",
        isValid ? "border-(--neutral-secondary)" : "border-(--critical-primary)",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        id="weight-input"
        inputMode="decimal"
        value={rawValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Weight"
        maxLength={3}
        aria-label={`${step === "goal" ? "Goal weight" : "Your weight"} in ${unit}`}
        aria-describedby="weight-hint"
        aria-invalid={rawValue !== "" && !isValid}
        autoComplete="off"
        style={{
          width: rawValue ? `${Math.max(1, rawValue.length)}ch` : "6ch",
        }}
        className="border-none outline-none bg-transparent text-[44px] text-(--blue-900) max-w-2/3 text-right p-0"
      />
      <span className="text-[44px] text-(--blue-900)">{unit}</span>
    </div>
  );
};
