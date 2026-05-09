import { Fragment } from "react";

const MAX_STARS = 5;

type Props = {
  author: string;
  rating: number;
  comment: string;
};

export const Testimonial = ({ author, comment, rating }: Props) => {
  const safeRating = Math.max(0, Math.min(MAX_STARS, Math.round(rating)));

  return (
    <div className="bg-(--teal-100) border border-(--teal-200) rounded-xl py-3 px-3.5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-2xl" aria-label={`${safeRating} out of ${MAX_STARS} stars`}>
          <span aria-hidden className="text-[#F4B400]">
            {Array.from({ length: safeRating }).map((_, index) => (
              <Fragment key={`gold-star-${index}`}>★</Fragment>
            ))}
          </span>
          {safeRating >= MAX_STARS ? null : (
            <span aria-hidden className="text-(--gray-200)">
              {Array.from({ length: MAX_STARS - safeRating }).map((_, index) => (
                <Fragment key={`gray-star-${index}`}>★</Fragment>
              ))}
            </span>
          )}
        </p>
        <div className="text-xs font-semibold text-(--blue-600)">{author}</div>
      </div>
      <p className="m-0 text-sm text-left text-(--blue-600) leading-normal">{comment}</p>
    </div>
  );
};
