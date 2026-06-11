export default function Alert({ type = "info", message, onClose }) {
  if (!message) return null;

  const styles = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    error: "bg-red-50 text-red-800 border-red-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  return (
    <div className={`mb-4 p-4 rounded-lg border flex justify-between items-center ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-lg leading-none opacity-60 hover:opacity-100">
          &times;
        </button>
      )}
    </div>
  );
}
