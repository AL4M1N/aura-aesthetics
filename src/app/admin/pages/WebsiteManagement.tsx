/**
 * WEBSITE MANAGEMENT PAGE
 * Slim CMS form that only exposes header/footer basics plus social handles.
 */

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Loader2, MapPin, RefreshCcw, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { ImageUploadField } from '../../components/ImageUploadField';
import { siteSettingsService } from '../../../services/siteSettingsService';
import type { WebsiteSettings } from '../../../lib/types';
import { resolveCmsAssetUrl } from '../../../lib/asset';

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

const formatTimestamp = (value?: string) => {
  if (!value) return 'Not published yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const fieldClass =
  'rounded-lg border border-[#D4AF77]/40 bg-white text-[#2D1B1B] placeholder:text-[#B08A76] focus-visible:ring-2 focus-visible:ring-[#D4AF77] focus-visible:border-transparent aria-invalid:border-red-400 aria-invalid:ring-red-200';

export function WebsiteManagement() {
  const [settings, setSettings] = useState<WebsiteSettings>(() => normalizeSettings());
  const [remoteSettings, setRemoteSettings] = useState<WebsiteSettings>(() => normalizeSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(remoteSettings),
    [settings, remoteSettings]
  );

  const updateSetting = <Section extends keyof WebsiteSettings, Field extends keyof WebsiteSettings[Section]>(
    section: Section,
    field: Field,
    value: WebsiteSettings[Section][Field]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleChange = <Section extends keyof WebsiteSettings, Field extends keyof WebsiteSettings[Section]>(
    section: Section,
    field: Field
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateSetting(section, field, event.target.value as WebsiteSettings[Section][Field]);
  };

  const setFieldRef = <T extends HTMLElement = HTMLElement>(name: string) => (element: T | null) => {
    if (element) {
      fieldRefs.current[name] = element;
    } else {
      delete fieldRefs.current[name];
    }
  };

  const focusFirstError = (errors: Record<string, string>) => {
    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return;
    const element = fieldRefs.current[firstKey];
    if (!element) return;
    if (typeof (element as HTMLElement).focus === 'function') {
      (element as HTMLElement).focus({ preventScroll: false });
    } else {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const renderFieldError = (name: string) => {
    const message = fieldErrors[name];
    if (!message) return null;
    return <p className="text-sm text-red-600">{message}</p>;
  };

  const buildPayload = (
    data: WebsiteSettings,
    fallbackMeta?: WebsiteSettings['meta'],
  ): WebsiteSettings => {
    const metaSource = data.meta && Object.keys(data.meta).length ? data.meta : fallbackMeta;
    const sanitizedMeta = metaSource && Object.values(metaSource).some((value) => Boolean(value)) ? metaSource : undefined;
    return {
      branding: data.branding,
      social: data.social,
      location: data.location,
      ...(sanitizedMeta ? { meta: sanitizedMeta } : {}),
    };
  };

  const extractValidationErrors = (source: unknown): Record<string, string> | null => {
    if (!source || typeof source !== 'object') return null;
    const parsedEntries = Object.entries(source as Record<string, unknown>).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (Array.isArray(value) && value.length) {
          acc[key] = String(value[0]);
        } else if (typeof value === 'string') {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );
    return Object.keys(parsedEntries).length ? parsedEntries : null;
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await siteSettingsService.getWebsiteSettings();
      if (response?.success && response.data) {
        const normalized = normalizeSettings(response.data);
        setSettings(normalized);
        setRemoteSettings(normalized);
        setFieldErrors({});
        return;
      }
      throw new Error(response?.message || 'Failed to fetch website content');
    } catch (error: any) {
      console.error('Website settings fetch failed:', error);
      toast.error(error?.message || 'Unable to load website content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const payload = buildPayload(settings, remoteSettings.meta);

    try {
      const response = await siteSettingsService.updateWebsiteSettings(payload);
      if (response?.success !== false) {
        const normalized = normalizeSettings(response?.data ?? payload);
        setSettings(normalized);
        setRemoteSettings(normalized);
        setFieldErrors({});
        toast.success('Website content saved');
      } else {
        throw new Error(response?.message || 'Failed to save website content');
      }
    } catch (error: any) {
      console.error('Website settings save failed:', error);
      const validationErrors = extractValidationErrors(
        error?.response?.data?.errors ?? error?.errors ?? error?.response?.data?.data?.errors,
      );
      if (validationErrors) {
        setFieldErrors(validationErrors);
        focusFirstError(validationErrors);
        toast.error('Please fix the highlighted fields.');
      } else {
        toast.error(error?.message || 'Unable to save website content');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(remoteSettings);
    setFieldErrors({});
    toast.info('Reverted to last saved content');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-[#9B8B7E]">
        Loading website configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2D1B1B]">Website Management</h1>
        <p className="mt-1 max-w-2xl text-[#856B5A]">
          Manage the shared elements that every visitor sees — the primary logo, header labels, footer messaging, and
          social handles.
        </p>
        <div className="mt-4 flex flex-wrap gap-6 text-sm text-[#9B8B7E]">
          <span>
            Last updated: {formatTimestamp(settings.meta?.last_updated_at)}
            {settings.meta?.last_updated_by ? ` by ${settings.meta.last_updated_by}` : ''}
          </span>
          <span>Last published: {formatTimestamp(settings.meta?.last_published_at)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-[#E6D4C3] bg-white">
          <CardHeader className="border-b border-[#F0E4D9]">
            <CardTitle className="text-xl font-semibold text-[#2D1B1B]">Basic Site Info</CardTitle>
            <CardDescription className="text-sm text-[#9B8B7E]">
              Header title, CTA text, and footer copy live here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <ImageUploadField
              ref={setFieldRef<HTMLDivElement>('branding.logo_url')}
              label="Primary logo"
              description="Shown in the public header and footer. Uploading stores a base64 string until the backend persists it."
              value={settings.branding.logo_url}
              onChange={(value) => updateSetting('branding', 'logo_url', value ?? '')}
              error={fieldErrors['branding.logo_url']}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="site-title">Site title</Label>
                <Input
                  id="site-title"
                  className={fieldClass}
                  value={settings.branding.site_title ?? ''}
                  onChange={handleChange('branding', 'site_title')}
                  placeholder="Aura Aesthetics"
                  aria-invalid={Boolean(fieldErrors['branding.site_title'])}
                  ref={setFieldRef<HTMLInputElement>('branding.site_title')}
                />
                {renderFieldError('branding.site_title')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-subtitle">Site subtitle</Label>
                <Input
                  id="site-subtitle"
                  className={fieldClass}
                  value={settings.branding.site_subtitle ?? ''}
                  onChange={handleChange('branding', 'site_subtitle')}
                  placeholder="CPD-accredited aesthetic practitioner"
                  aria-invalid={Boolean(fieldErrors['branding.site_subtitle'])}
                  ref={setFieldRef<HTMLInputElement>('branding.site_subtitle')}
                />
                {renderFieldError('branding.site_subtitle')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="header-cta-label">Header CTA label</Label>
                <Input
                  id="header-cta-label"
                  className={fieldClass}
                  value={settings.branding.header_cta_label ?? ''}
                  onChange={handleChange('branding', 'header_cta_label')}
                  placeholder="Book Now"
                  aria-invalid={Boolean(fieldErrors['branding.header_cta_label'])}
                  ref={setFieldRef<HTMLInputElement>('branding.header_cta_label')}
                />
                {renderFieldError('branding.header_cta_label')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="header-cta-link">Header CTA link</Label>
                <Input
                  id="header-cta-link"
                  className={fieldClass}
                  value={settings.branding.header_cta_link ?? ''}
                  onChange={handleChange('branding', 'header_cta_link')}
                  placeholder="/booking"
                  aria-invalid={Boolean(fieldErrors['branding.header_cta_link'])}
                  ref={setFieldRef<HTMLInputElement>('branding.header_cta_link')}
                />
                {renderFieldError('branding.header_cta_link')}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="footer-disclaimer">Footer disclaimer</Label>
                <Textarea
                  id="footer-disclaimer"
                  rows={3}
                  className={fieldClass}
                  value={settings.branding.footer_disclaimer ?? ''}
                  onChange={handleChange('branding', 'footer_disclaimer')}
                  placeholder="Medical disclaimer text"
                  aria-invalid={Boolean(fieldErrors['branding.footer_disclaimer'])}
                  ref={setFieldRef<HTMLTextAreaElement>('branding.footer_disclaimer')}
                />
                {renderFieldError('branding.footer_disclaimer')}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="footer-subtext">Footer supporting text</Label>
                <Textarea
                  id="footer-subtext"
                  rows={2}
                  className={fieldClass}
                  value={settings.branding.footer_subtext ?? ''}
                  onChange={handleChange('branding', 'footer_subtext')}
                  placeholder="CPD-accredited aesthetic practitioner trained by Rejuvenate"
                  aria-invalid={Boolean(fieldErrors['branding.footer_subtext'])}
                  ref={setFieldRef<HTMLTextAreaElement>('branding.footer_subtext')}
                />
                {renderFieldError('branding.footer_subtext')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E6D4C3] bg-white">
          <CardHeader className="border-b border-[#F0E4D9]">
            <CardTitle className="text-xl font-semibold text-[#2D1B1B]">Social Links</CardTitle>
            <CardDescription className="text-sm text-[#9B8B7E]">
              These power the footer icons and contact prompts. Leave blank to hide.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {(
                [
                  ['instagram', 'Instagram URL'],
                  ['facebook', 'Facebook URL'],
                  ['tiktok', 'TikTok URL'],
                  ['whatsapp', 'WhatsApp Link'],
                  ['youtube', 'YouTube URL'],
                  ['threads', 'Threads URL'],
                ] as Array<[keyof WebsiteSettings['social'], string]>
              ).map(([key, label]) => {
                const fieldPath = `social.${String(key)}`;
                return (
                  <div key={key as string} className="space-y-2">
                    <Label htmlFor={`social-${key}`}>{label}</Label>
                    <Input
                      id={`social-${key}`}
                      className={fieldClass}
                      value={settings.social[key] ?? ''}
                      onChange={(event) => updateSetting('social', key, event.target.value)}
                      placeholder={`https://${key}.com/auraaesthetics`}
                      aria-invalid={Boolean(fieldErrors[fieldPath])}
                      ref={setFieldRef<HTMLInputElement>(fieldPath)}
                    />
                    {renderFieldError(fieldPath)}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E6D4C3] bg-white">
          <CardHeader className="border-b border-[#F0E4D9]">
            <CardTitle className="text-xl font-semibold text-[#2D1B1B]">Map & Location</CardTitle>
            <CardDescription className="text-sm text-[#9B8B7E]">
              Control the Google Maps embed plus supporting notes shown near contact sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="map-embed">Google Maps embed URL</Label>
                <Textarea
                  id="map-embed"
                  rows={3}
                  className={fieldClass}
                  value={settings.location.map_embed_url ?? ''}
                  onChange={handleChange('location', 'map_embed_url')}
                  placeholder="https://www.google.com/maps/embed?..."
                  aria-invalid={Boolean(fieldErrors['location.map_embed_url'])}
                  ref={setFieldRef<HTMLTextAreaElement>('location.map_embed_url')}
                />
                <p className="flex flex-wrap items-center gap-1 text-xs text-[#9B8B7E]">
                  <span>In Google Maps choose</span>
                  <strong>Share</strong>
                  <span>-</span>
                  <strong>Embed a map</strong>
                  <span>and copy just the</span>
                  <code>src</code>
                  <span>value.</span>
                </p>
                {renderFieldError('location.map_embed_url')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-notes">Address notes</Label>
                <Textarea
                  id="address-notes"
                  rows={3}
                  className={fieldClass}
                  value={settings.location.address_notes ?? ''}
                  onChange={handleChange('location', 'address_notes')}
                  placeholder="Ilford, London - United Kingdom"
                  aria-invalid={Boolean(fieldErrors['location.address_notes'])}
                  ref={setFieldRef<HTMLTextAreaElement>('location.address_notes')}
                />
                {renderFieldError('location.address_notes')}
              </div>
            </div>
            <div className="rounded-2xl border border-[#E6D4C3] bg-[#FFF8F3] p-6">
              <div className="mb-4 flex items-center gap-3 text-[#2D1B1B]">
                <MapPin className="text-[#D4AF77]" size={20} />
                <div>
                  <p className="text-sm font-semibold">Live Map Preview</p>
                  <p className="text-xs text-[#9B8B7E]">Updates as soon as you save new settings</p>
                </div>
              </div>
              {settings.location.map_embed_url ? (
                <iframe
                  title="Location preview"
                  src={settings.location.map_embed_url}
                  className="h-64 w-full rounded-xl border border-[#E6D4C3]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[#D4AF77]/70 text-sm text-[#9B8B7E]">
                  Add a Google Maps embed URL to preview your location.
                </div>
              )}
              <p className="mt-4 text-sm text-[#2D1B1B]">
                {settings.location.address_notes || 'No address notes provided'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasUnsavedChanges || isSaving}
            className="border-[#D4AF77] text-[#2D1B1B] hover:bg-[#FFF4EA]"
          >
            <RefreshCcw size={16} /> Reset
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white hover:opacity-90"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
