import { useState } from "react";

export const useWishSelection = (onContinue: () => void) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
  };

  const handleContinue = () => {
    if (selected) onContinue();
  };

  return { selected, handleSelect, handleContinue };
};
