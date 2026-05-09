"use client";

export const JobActionButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 px-5 rounded-full font-semibold text-white cursor-pointer bg-linear-to-b from-(--teal-400) to-(--teal-600) shadow-[0_6px_18px_rgba(15,138,117,0.28)]"
    >
      {children}
    </button>
  );
};
