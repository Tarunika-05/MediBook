import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">404 - Page Not Found</h1>
      <p className="text-slate-500 max-w-md mb-8">
        We couldn't find the page you were looking for. The link might be broken or the page may have been moved.
      </p>
      <Link
        to="/"
        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}
