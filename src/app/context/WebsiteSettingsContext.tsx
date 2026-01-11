/**
 * WEBSITE SETTINGS CONTEXT
 * Provides public pages with branding/social/location data from Laravel CMS.
 */

import { resolveCmsAssetUrl } from '../../lib/asset';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { WebsiteSettings } from '../../lib/types';
import { siteSettingsService } from '../../services/siteSettingsService';
import { seoService } from '../../services/seoService';

const defaultSettings: WebsiteSettings = {
  branding: {
    site_title: 'Aura Aesthetics',
    site_subtitle: 'CPD-accredited aesthetic practitioner',
    header_cta_label: 'Book Now',
    header_cta_link: '/booking',
    footer_disclaimer: 'Medical disclaimer: results vary per individual. All treatments require consultation.',
    footer_subtext: 'CPD-accredited aesthetic practitioner specializing in natural-looking enhancements.',
    logo_url: '/logo.png',
  },
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
    whatsapp: '',
    youtube: '',
    threads: '',
  },
  location: {
    map_embed_url: '',
    address_notes: 'Ilford, London - United Kingdom',
    contact_email: 'info@auraaesthetics.co.uk',
    contact_phone: '+44 7XXX 123456',
    whatsapp_link: 'https://wa.me/447XXX123456',
    contact_hours: 'By Appointment Only',
  },
  meta: {},
};

const normalizeSettings = (payload?: Partial<WebsiteSettings>): WebsiteSettings => {
  const branding = { ...defaultSettings.branding, ...(payload?.branding ?? {}) };

  return {
    branding: {
      ...branding,
      logo_url: resolveCmsAssetUrl(branding.logo_url) ?? branding.logo_url,
    },
    social: { ...defaultSettings.social, ...(payload?.social ?? {}) },
    location: { ...defaultSettings.location, ...(payload?.location ?? {}) },
    meta: payload?.meta ? { ...payload.meta } : {},
  };
};

interface WebsiteSettingsContextValue {
  settings: WebsiteSettings;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const WebsiteSettingsContext = createContext<WebsiteSettingsContextValue>({
  settings: defaultSettings,
  isLoading: true,
  refresh: async () => undefined,
});

export const WebsiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await siteSettingsService.getPublicWebsiteSettings();
      if (response?.success && response.data) {
        setSettings(normalizeSettings(response.data));
        return;
      }
      throw new Error(response?.message || 'Failed to load website settings');
    } catch (error) {
      console.error('Website settings fetch error:', error);
      setSettings((prev) => normalizeSettings(prev));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchSettings();

      // Prefetch SEO data for common pages so SEOHead can read from cache immediately
      try {
        if (typeof window === 'undefined') return;
        const pageTypes: Array<{ page: string; identifier?: string }> = [
          { page: 'home' },
          { page: 'about' },
          { page: 'services' },
          { page: 'consent' },
          { page: 'booking' },
        ];

        // Helper to write to the same localStorage shape used by usePersistentCache
        const STORAGE_PREFIX = 'aura_cache_';
        const setCache = (key: string, data: unknown) => {
          try {
            const record = { data, timestamp: Date.now() };
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(record));
          } catch (err) {
            // ignore
          }
        };

        // Prefetch each core page
        await Promise.all(
          pageTypes.map(async (p) => {
            try {
              const res = await seoService.getPublicSEOData(p.page, p.identifier);
              if (res.success && res.data) {
                const key = `seo-${p.page}${p.identifier ? `-${p.identifier}` : ''}`;
                setCache(key, res.data);
              }
            } catch (err) {
              // ignore prefetch errors
            }
          })
        );
      } catch (err) {
        // ignore prefetch errors
      }
    })();
  }, [fetchSettings]);

  const value = useMemo<WebsiteSettingsContextValue>(
    () => ({ settings, isLoading, refresh: fetchSettings }),
    [settings, isLoading, fetchSettings]
  );

  return <WebsiteSettingsContext.Provider value={value}>{children}</WebsiteSettingsContext.Provider>;
};

export const useWebsiteSettings = () => useContext(WebsiteSettingsContext);
