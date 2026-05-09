interface Props {
  goalText: string;
}

export const WeightGoalInsight = ({ goalText }: Props) => {
  return (
    <div className="w-full mt-5 bg-(--teal-100) border border-(--teal-200) rounded-2xl px-4 py-3 mb-4">
      <p className="text-xs font-semibold text-(--neutral-primary) mb-1">
        <span role="img" aria-label="target">
          🎯
        </span>{" "}
        Goal: {goalText}
      </p>
      <p className="text-xs text-(--neutral-secondary) leading-normal m-0 text-center">
        Even small, steady changes can make a meaningful difference. We&apos;ll support you with a
        balanced plan to help you feel lighter, healthier, and more confident over time.
      </p>
    </div>
  );
};
