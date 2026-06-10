import { useEffect, useState, type ReactNode } from 'react';
import { settingsApi } from '../api/endpoints';

interface Props {
  children: ReactNode;
}

export default function MaintenanceGate({ children }: Props) {
  const [checked, setChecked] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    settingsApi
      .getPublic()
      .then((res) => {
        setMaintenance(!!res.data?.maintenanceMode);
        setMessage(res.data?.maintenanceMessage ?? '');
      })
      .catch(() => {
        // Fail open — if settings can't be reached, show the site
        setMaintenance(false);
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (maintenance) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #0b1120 0%, #1e293b 100%)' }}
      >
        <img
          src="/logo-square.jpg"
          alt="Sky Post News"
          className="h-24 w-24 object-cover rounded-xl shadow-lg mb-8"
        />
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
          Under Maintenance
        </h1>
        <p className="text-gray-300 max-w-md text-sm sm:text-base leading-relaxed">
          {message || 'We are performing scheduled maintenance. Please check back soon.'}
        </p>
        <div className="mt-10 flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          Sky Post News
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
