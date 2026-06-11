export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4" />
      <p>{text}</p>
    </div>
  );
}
