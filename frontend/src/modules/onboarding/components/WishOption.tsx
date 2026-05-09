"use client";

import { CheckCircleIcon } from "@/components/Icons";

interface Wish {
  id: string;
  emoji: string;
  label: string;
}

interface Props {
  wish: Wish;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const WishOption = ({ wish, selected, onSelect }: Props) => {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(wish.id)}
      className={[
        "flex items-center gap-3 py-4 xl:py-6 px-4 bg-white rounded-2xl cursor-pointer xl:text-[22px]",
        "leading-tight text-(--blue-900) font-medium border-[1.5px] transition-all duration-180 ease-in-out",
        selected
          ? "border-(--teal-400) shadow-[0_0_14px_var(--teal-800)]"
          : "border-(--gray-200) shadow-[0_1px_2px_var(--blue-800)]",
      ].join(" ")}
    >
      <span role="img" aria-hidden>
        {wish.emoji}
      </span>
      <span>{wish.label}</span>

      {selected && (
        <span aria-hidden className="ml-auto flex">
          <CheckCircleIcon />
        </span>
      )}
    </button>
  );
};
