"use client";

import { ThemeButton } from "@/components/ThemeButton";

import { WishList } from "../components/WishList";
import { useWishSelection } from "../hooks/useWishSelection";

interface WishScreenProps {
  onContinue: () => void;
}

export default function WishPage({ onContinue }: WishScreenProps) {
  const { selected, handleSelect, handleContinue } = useWishSelection(onContinue);

  return (
    <div className="pt-2 xl:pt-14 px-5 pb-0 xl:pb-6">
      <h1 className="text-4xl text-center mb-4 xl:mb-10 text-(--blue-900)">
        What is your main wish?
      </h1>
      <WishList selected={selected} onSelect={handleSelect} />
      {selected && (
        <ThemeButton className="mt-4" isValid onClick={handleContinue}>
          Continue
        </ThemeButton>
      )}
    </div>
  );
}
