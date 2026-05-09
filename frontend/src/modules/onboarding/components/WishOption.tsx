"use client";

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
        "flex items-center gap-3 py-4 xl:py-6 px-4 bg-white rounded-2xl cursor-pointer text-base xl:text-[22px]",
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
          <svg
            width="20"
            height="20"
            className="xl:w-7 xl:h-7"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" fill="var(--teal-400)" />
            <path
              d="M7.5 12.5l3 3 6-6.5"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
};
