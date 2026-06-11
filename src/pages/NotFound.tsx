import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="bg-white rounded shadow-sm p-16 text-center">
      <h1 className="text-7xl font-black text-sky-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-6">
        The page you requested does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
