export const Testimonial = () => {
  return (
    <div className="bg-(--teal-100) border border-(--teal-200) rounded-xl py-3 px-3.5">
      <div className="flex items-center justify-between mb-1">
        <span
          role="img"
          aria-label="5 out of 5 stars"
          className="text-[#F4B400] text-sm tracking-[1px]"
        >
          ★★★★★
        </span>
        <div className="text-xs font-semibold text-(--blue-600)">John</div>
      </div>
      <p className="m-0 text-xs text-(--blue-600) leading-normal">
        &ldquo;I love this — it makes planning so easy and keeps me motivated!&rdquo;
      </p>
    </div>
  );
};
