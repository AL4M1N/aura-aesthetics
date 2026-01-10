import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures every top-level navigation starts from the top of the viewport.
 * Using requestAnimationFrame avoids racing against React Router's paint cycle.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
