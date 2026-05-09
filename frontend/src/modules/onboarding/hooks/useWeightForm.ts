import { useEffect, useRef, useState } from "react";

export type WeightUnit = "lbs" | "kg";

const RANGES: Record<WeightUnit, { min: number; max: number }> = {
  lbs: { min: 22, max: 485 },
  kg: { min: 10, max: 220 },
};

export const useWeightForm = (onContinue: () => void) => {
  const [unit, setUnit] = useState<WeightUnit>("lbs");
  const [rawValue, setRawValue] = useState("");
  const [step, setStep] = useState<"current" | "goal">("current");
  const [currentWeight, setCurrentWeight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const num = parseFloat(rawValue);
  const range = RANGES[unit];
  const isEmpty = !rawValue.trim().length;
  const isValid = isEmpty || (!isNaN(num) && num >= range.min && num <= range.max);
  const goalText =
    step === "goal" && !isEmpty && isValid ? computeGoalText(currentWeight, num) : null;

  const handleUnitChange = (newUnit: WeightUnit) => {
    setUnit(newUnit);
    setRawValue("");
  };

  const handleValueChange = (value: string) => {
    const normalized = value.replace(/[^0-9.]/g, "");
    if (normalized.length > 1 && normalized.startsWith("0")) {
      return;
    }

    setRawValue(normalized);
  };

  const handleContinue = () => {
    if (step === "current") {
      setCurrentWeight(num);
      setRawValue("");
      setStep("goal");
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      onContinue();
    }
  };

  return {
    unit,
    rawValue,
    step,
    range,
    isEmpty,
    isValid,
    goalText,
    inputRef,
    handleUnitChange,
    handleValueChange,
    handleContinue,
  };
};

const computeGoalText = (current: number, goal: number) => {
  const diff = current - goal;
  const percent = Math.round((Math.abs(diff) / current) * 100);
  if (percent === 0) return "Maintain your weight";
  if (diff > 0) return `Lose ${percent}% of your weight`;

  return `Gain ${percent}% of your weight`;
};
