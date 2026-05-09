"use client";

interface Props {
  onClick: () => void;
  title: string;
  subtitle: string;
  variant: "primary" | "secondary";
}

const variantClass: Record<"primary" | "secondary", string> = {
  primary: "shadow-[0_4px_16px_var(--teal-800)]",
  secondary: "border-[1.5px] border-(--gray-200) shadow-[0_1px_2px_var(--blue-800)]",
};

export const JobLaunchOption = ({ onClick, title, subtitle, variant }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3.5 px-4 rounded-2xl bg-white cursor-pointer text-left transition-all duration-180 ease-in-out ${variantClass[variant]}`}
    >
      <div className="font-semibold text-(--blue-900)">{title}</div>
      <div className="text-xs text-(--gray-500) mt-0.5">{subtitle}</div>
    </button>
  );
};
