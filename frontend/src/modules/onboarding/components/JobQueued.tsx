export const JobQueued = () => {
  return (
    <div role="status" aria-label="Queued" className="text-center py-4">
      <div
        aria-hidden
        className="animate-spin size-12 rounded-full border-4 border-(--teal-400) border-t-transparent mx-auto mb-4"
      />
      <p className="text-sm text-(--gray-500)">Queued...</p>
    </div>
  );
};
