export const JobProcessingHTTP = () => {
  return (
    <div className="text-center py-8">
      <p className="font-semibold text-(--blue-900) mb-5">Processing your plan...</p>
      <div
        role="progressbar"
        aria-label="Processing your plan"
        aria-valuetext="indeterminate"
        className="h-1.5 bg-(--gray-100) rounded-full overflow-hidden mx-4"
      >
        <div className="animate-indeterminate h-full w-1/3 bg-linear-to-r from-(--teal-400) to-(--teal-500) rounded-full" />
      </div>
      <p className="text-xs text-(--gray-500) mt-3">Fetching status via HTTP polling</p>
    </div>
  );
};
