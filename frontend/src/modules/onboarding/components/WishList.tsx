import { WishOption } from "./WishOption";

const WISHES = [
  { id: "w1", emoji: "😴", label: "Sleep better" },
  { id: "w2", emoji: "🥗", label: "Eat healthier" },
  { id: "w3", emoji: "🧘", label: "Reduce stress" },
  { id: "w4", emoji: "💚", label: "Feel more confident" },
  { id: "w5", emoji: "🏃", label: "Move more" },
];

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
}

export const WishList = ({ selected, onSelect }: Props) => {
  return (
    <div role="radiogroup" className="flex flex-col gap-4 pb-4">
      {WISHES.map((w) => (
        <WishOption key={w.id} wish={w} selected={selected === w.id} onSelect={onSelect} />
      ))}
    </div>
  );
};
