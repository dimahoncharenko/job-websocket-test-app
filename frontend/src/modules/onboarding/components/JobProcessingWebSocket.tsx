import { Testimonial } from "@/components/Testimonial";

const R = 70;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface Props {
  progress: number;
}

export const JobProcessingWebSocket = ({ progress }: Props) => {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const dash = (safeProgress / 100) * CIRCUMFERENCE;

  return (
    <div className="text-center h-full flex flex-col pb-6">
      <div
        role="progressbar"
        aria-valuenow={safeProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Job progress"
        className="relative size-[168px] mx-auto mb-6"
      >
        <svg
          aria-hidden="true"
          width="168"
          height="168"
          viewBox="0 0 168 168"
          className="-rotate-90"
        >
          <circle cx="84" cy="84" r={R} stroke="var(--gray-100)" strokeWidth="6" fill="none" />
          <circle
            cx="84"
            cy="84"
            r={R}
            stroke="url(#ringGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
            fill="none"
            style={{ transition: "stroke-dasharray 80ms linear" }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--teal-400)" />
              <stop offset="100%" stopColor="var(--teal-600)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[34px] font-bold text-(--teal-400)">
          {safeProgress}%
        </div>
      </div>
      <p className="text-2xl text-(--neutral-primary) mb-2">Creating something good for you…</p>
      <p className="text-sm text-(--neutral-secondary) mx-auto mb-6 leading-normal">
        This will only take a moment — your item is almost ready.
      </p>
      <div className="mt-auto mb-4">
        <Testimonial
          author="John"
          rating={4}
          comment={'"I love this — it makes planning so easy and keeps me motivated!"'}
        />
      </div>
    </div>
  );
};
