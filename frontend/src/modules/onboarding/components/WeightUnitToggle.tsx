"use client";

import { WeightUnit } from "../hooks/useWeightForm";

interface Props {
  unit: WeightUnit;
  onChange: (unit: WeightUnit) => void;
}

export const WeightUnitToggle = ({ unit, onChange }: Props) => {
  return (
    <div className="flex justify-center mb-5">
      <div
        role="tablist"
        aria-label="Weight unit"
        className="inline-flex bg-[#F1F3F5] p-1 rounded-full border border-(--gray-200)"
      >
        {(["lbs", "kg"] as const).map((u) => {
          const active = unit === u;
          return (
            <button
              key={u}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(u)}
              className={[
                "px-[18px] py-[6px] rounded-full border-none text-md font-semibold cursor-pointer min-w-[44px] transition-all duration-200 ease-in-out",
                active
                  ? "bg-linear-to-b from-(--teal-400) to-(--teal-600) text-white shadow-[0_2px_6px_rgba(15,138,117,0.25)]"
                  : "bg-transparent text-[#5C6166] shadow-none",
              ].join(" ")}
            >
              {u}
            </button>
          );
        })}
      </div>
    </div>
  );
};
