"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4 py-12">
      <h2 className="font-outfit font-bold text-xl text-ink">Something went wrong</h2>
      <p className="text-ink-soft text-[14px]">{error.message ?? "An unexpected error occurred."}</p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-accent text-paper font-outfit font-semibold text-[14px]"
      >
        Try again
      </button>
    </div>
  );
}
