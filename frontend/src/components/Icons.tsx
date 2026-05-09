export const ChevronLeftIcon = () => (
  <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 6l-6 6 6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CheckIcon = () => (
  <svg aria-hidden width="40" height="40" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke="var(--teal-400)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CheckCircleIcon = () => (
  <svg width="20" height="20" className="xl:w-7 xl:h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" fill="var(--teal-400)" />
    <path
      d="M7.5 12.5l3 3 6-6.5"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const WarningIcon = () => (
  <svg aria-hidden width="36" height="36" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3L2 21h20L12 3z"
      stroke="#E04545"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="12" y1="10" x2="12" y2="14" stroke="#E04545" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17.5" r="1" fill="#E04545" />
  </svg>
);

interface ProgressRingIconProps {
  dash: number;
  circumference: number;
  transition: string;
}

export const ProgressRingIcon = ({ dash, circumference, transition }: ProgressRingIconProps) => (
  <svg aria-hidden width="168" height="168" viewBox="0 0 168 168" className="-rotate-90">
    <circle cx="84" cy="84" r={70} stroke="var(--gray-100)" strokeWidth="6" fill="none" />
    <circle
      cx="84"
      cy="84"
      r={70}
      stroke="url(#ringGrad)"
      strokeWidth="6"
      strokeLinecap="round"
      strokeDasharray={`${dash} ${circumference}`}
      fill="none"
      style={{ transition }}
    />
    <defs>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--teal-400)" />
        <stop offset="100%" stopColor="var(--teal-600)" />
      </linearGradient>
    </defs>
  </svg>
);
