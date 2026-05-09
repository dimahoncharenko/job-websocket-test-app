import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type Props = {
  isValid?: boolean;
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const ThemeButton = ({ isValid, className, ...props }: Props) => {
  const isDisabled = !isValid || !!props.disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        "w-full px-5 py-4 rounded-xl border-none text-base font-semibold text-white tracking-wide",
        "transition-[background,box-shadow] duration-200 ease-in-out",
        !isDisabled
          ? "bg-linear-to-r from-[#1FA9C7] to-[#1BB97C] shadow-[0_6px_18px_rgba(15,138,117,0.28)] cursor-pointer"
          : "bg-[#BDE8DE] shadow-none cursor-default",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {props.children}
    </button>
  );
};
