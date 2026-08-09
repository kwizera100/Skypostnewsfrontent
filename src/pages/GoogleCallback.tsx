import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
      setStatus('error');
      return;
    }

    // Exchange code via backend (if available) or just store the intent
    // For now, we use the Google Identity Services token client approach
    // The backend would need a Google OAuth exchange endpoint
    // As a fallback, we store the subscription intent
    fetch(`${import.meta.env.VITE_API_URL || 'https://api.skypostnews.com'}/api/subscribers/google/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri: window.location.origin + '/auth/google/callback' }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setTimeout(() => navigate('/'), 3000);
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Completing Google signup...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Subscribed!</h1>
          <p className="text-gray-500">You will be notified when new articles are published.</p>
          <p className="text-gray-400 text-sm mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Signup Failed</h1>
        <p className="text-gray-500 mb-4">Something went wrong with Google signup.</p>
        <a href="/" className="inline-block bg-sky-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-sky-700">Go Home</a>
      </div>
    </div>
  );
}
