import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushOptIn() {
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setSubscribed(true);
    }
    if (localStorage.getItem('pushDismissed')) {
      setDismissed(true);
    }
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const visitorId = localStorage.getItem('visitorId') || 'anonymous';

      await axios.post(`${API_URL}/api/posts/push/subscribe`, {
        visitor_id: visitorId,
        subscription: subscription.toJSON(),
      });

      setSubscribed(true);
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  const dismiss = () => {
    localStorage.setItem('pushDismissed', 'true');
    setDismissed(true);
  };

  if (subscribed || dismissed) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 bg-parchment text-ink p-4 shadow-lg rounded max-w-sm">
      <button
        onClick={dismiss}
        className="absolute top-2 right-3 text-warmgray text-xl"
      >
        ×
      </button>
      <p className="font-serif text-lg mb-2">Stay Updated</p>
      <p className="text-sm text-warmgray mb-4">
        Get notified when we post news and opening updates.
      </p>
      <button
        onClick={subscribe}
        className="bg-gold text-white px-4 py-2 text-sm tracking-widest hover:bg-deepgold"
      >
        ENABLE NOTIFICATIONS
      </button>
    </div>
  );
}