"use client";

import { ThemeButton } from "@/components/ThemeButton";
import { WeightInput } from "@/components/WeightInput";

import { WeightGoalInsight } from "../components/WeightGoalInsight";
import { WeightHint } from "../components/WeightHint";
import { WeightUnitToggle } from "../components/WeightUnitToggle";
import { useWeightForm } from "../hooks/useWeightForm";

interface WeightScreenProps {
  onContinue: () => void;
}

export default function WeightPage({ onContinue }: WeightScreenProps) {
  const {
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
  } = useWeightForm(onContinue);

  return (
    <div className="flex h-[85vh] max-h-[800px] flex-col items-center pt-6 xl:pt-14 px-5 pb-4 xl:pb-6">
      <h1 className="text-3xl xl:text-4xl text-center mb-4 xl:mb-16 text-(--blue-900)">
        {step === "current" ? (
          "What is your weight?"
        ) : (
          <>
            What is your <span className="text-(--teal-400)">goal</span> weight?
          </>
        )}
      </h1>

      <WeightUnitToggle unit={unit} onChange={handleUnitChange} />
      <WeightInput
        rawValue={rawValue}
        unit={unit}
        step={step}
        isValid={isValid}
        inputRef={inputRef}
        onChange={handleValueChange}
      />
      <WeightHint range={range} unit={unit} isValid={isValid} />

      {goalText && <WeightGoalInsight goalText={goalText} />}

      <ThemeButton
        className="xl:max-w-48 mt-auto"
        isValid={isValid && !isEmpty}
        onClick={handleContinue}
      >
        Continue
      </ThemeButton>
    </div>
  );
}
