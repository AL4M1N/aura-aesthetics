/**
 * VISITOR TRACKING HOOK
 * Tracks page visits and sends data to backend
 * Backend generates and returns session_id for tracking future requests
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Track visitor session
let sessionId: string | null = null;
let sessionStartTime: number | null = null;
let lastPagePath: string | null = null;
let pageStartTime: number | null = null;

// Get stored session ID (backend-generated)
const getSessionId = (): string | null => {
    if (!sessionId) {
        sessionId = sessionStorage.getItem('visitor_session_id');
    }
    return sessionId;
};

// Store session ID from backend response
const setSessionId = (id: string): void => {
    sessionId = id;
    sessionStorage.setItem('visitor_session_id', id);
};

// Get device type
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

// Get browser info
const getBrowserInfo = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
};

// Get OS info
const getOSInfo = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
};

// Track visitor on landing page (don't send session_id - let backend generate it)
const trackVisitor = async (page: string) => {
    try {
        const visitorData = {
            page: page || '/',
            device: getDeviceType(),
            browser: getBrowserInfo(),
            os: getOSInfo(),
            referrer: document.referrer || 'Direct',
            duration_seconds: 0,
            pages_visited: [page],
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            timestamp: new Date().toISOString(),
        };

        console.log('📍 Tracking visitor:', visitorData);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/visitor-log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(visitorData),
        });

        if (response.ok) {
            const data = await response.json();
            // Backend should return generated session_id
            if (data.data?.session_id) {
                setSessionId(data.data.session_id);
                console.log('✅ Visitor tracked. Session ID:', data.data.session_id);
            }
        } else {
            console.warn('⚠️ Visitor tracking failed:', response.statusText);
        }
    } catch (error) {
        console.error('❌ Error tracking visitor:', error);
    }
};

// Track page view (when navigating to another page)
const trackPageView = async (page: string) => {
    try {
        const storedSessionId = getSessionId();

        if (!storedSessionId) {
            console.warn('⚠️ No session ID found. Reinitializing...');
            await trackVisitor(page);
            return;
        }

        const timeSpent = pageStartTime
            ? Math.floor((Date.now() - pageStartTime) / 1000)
            : 0;

        const pageData = {
            session_id: storedSessionId,
            page: page || '/',
            device: getDeviceType(),
            browser: getBrowserInfo(),
            os: getOSInfo(),
            duration_seconds: timeSpent,
            timestamp: new Date().toISOString(),
        };

        console.log('📄 Tracking page view:', pageData);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/visitor-log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(pageData),
        });

        if (!response.ok) {
            console.warn('⚠️ Page view tracking failed:', response.statusText);
            const errorData = await response.json();
            console.error('Error details:', errorData);
        } else {
            console.log('✅ Page view tracked');
        }

        // Reset page start time for next page
        pageStartTime = Date.now();
    } catch (error) {
        console.error('❌ Error tracking page view:', error);
    }
};

/**
 * Hook to track visitor page views
 * Use in App.tsx or main layout component
 */
export const useVisitorTracking = () => {
    const location = useLocation();
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Don't track admin pages
        if (location.pathname.startsWith('/admin')) {
            return;
        }

        // Track landing page on first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            pageStartTime = Date.now();
            sessionStartTime = Date.now();

            trackVisitor(location.pathname);
            lastPagePath = location.pathname;
            return;
        }

        // Track page change
        if (lastPagePath !== location.pathname) {
            trackPageView(location.pathname);
            lastPagePath = location.pathname;
        }

    }, [location.pathname]);

    // Track session end on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (lastPagePath && getSessionId()) {
                const timeSpent = pageStartTime
                    ? Math.floor((Date.now() - pageStartTime) / 1000)
                    : 0;

                const finalPageData = JSON.stringify({
                    session_id: getSessionId(),
                    page: lastPagePath,
                    duration_seconds: timeSpent,
                    timestamp: new Date().toISOString(),
                });

                // Use sendBeacon for reliable delivery on unload
                navigator.sendBeacon(
                    `${import.meta.env.VITE_API_URL}/visitor-log`,
                    finalPageData
                );

                console.log('👋 Session ended');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
};
