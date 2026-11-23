import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getVisitorId(): string {
  let id = localStorage.getItem('visitorId');
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitorId', id);
  }
  return id;
}

export function getSessionId(): string {
  let id = sessionStorage.getItem('sessionId');
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', id);
  }
  return id;
}

export async function trackEvent(
  eventType: string,
  options?: { postId?: number; metadata?: Record<string, any> }
) {
  try {
    await axios.post(`${API_URL}/api/posts/analytics/track`, {
      event_type: eventType,
      post_id: options?.postId,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      metadata: options?.metadata,
    });
  } catch {
    // Silent fail
  }
}

// Auto-track page view on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    trackEvent('page_view');
  });
}