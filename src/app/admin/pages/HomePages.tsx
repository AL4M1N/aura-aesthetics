import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Pencil, 
  Plus, 
  RefreshCcw, 
  Search, 
  Trash2,
  Sparkles,
  Shield,
  Heart,
  Star,
  Zap,
  Crown,
  Award,
  CheckCircle2,
  TrendingUp,
  Edit,
  MessageSquare,
  User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AdminDialogContent, AdminTableHeader, AdminTableRowHeader, AdminTableRow } from '../../components/ui/admin';
import { ImageUploadField } from '../../components/ImageUploadField';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { pagesService } from '../../../services/pagesService';
import type { HomeSlider, HomeSliderPayload, HomeFeature, HomeFeaturePayload, HomeCta, HomeCtaPayload, HomeTestimonial, HomeTestimonialPayload } from '../../../lib/types';
import { resolveCmsAssetUrl } from '../../../lib/asset';

const tabs = [
  { label: 'Slider', value: 'slider' },
  { label: 'About', value: 'about' },
  { label: 'Features', value: 'features' },
  { label: 'CTA', value: 'cta' },
  { label: 'Testimonials', value: 'testimonials' },
];

const iconOptions = [
  { value: 'sparkles', label: 'Sparkles', Icon: Sparkles },
  { value: 'shield', label: 'Shield', Icon: Shield },
  { value: 'heart', label: 'Heart', Icon: Heart },
  { value: 'star', label: 'Star', Icon: Star },
  { value: 'zap', label: 'Zap', Icon: Zap },
  { value: 'crown', label: 'Crown', Icon: Crown },
  { value: 'award', label: 'Award', Icon: Award },
  { value: 'check-circle', label: 'Check Circle', Icon: CheckCircle2 },
  { value: 'trending-up', label: 'Trending Up', Icon: TrendingUp },
];

const getIconComponent = (iconName: string) => {
  const option = iconOptions.find((opt) => opt.value === iconName);
  return option?.Icon || Sparkles;
};

const buildEmptySlider = (order = 1): HomeSliderPayload => ({
  title: '',
  subtitle: '',
  description: '',
  cta_label: '',
  cta_link: '',
  media_url: undefined,
  order,
  is_active: true,
});

const buildEmptyFeature = (sortOrder = 1): HomeFeaturePayload => ({
  icon: 'sparkles',
  title: '',
  description: '',
  sort_order: sortOrder,
  is_active: true,
});

const buildEmptyTestimonial = (sortOrder = 1): HomeTestimonialPayload => ({
  client_name: '',
  client_image: undefined,
  service_name: '',
  testimonial: '',
  rating: 5,
  sort_order: sortOrder,
  is_active: true,
});

export function HomePages() {
  const [activeTab, setActiveTab] = useState('slider');
  const [sliders, setSliders] = useState<HomeSlider[]>([]);
  const [formData, setFormData] = useState<HomeSliderPayload>(() => buildEmptySlider());
  const [selectedSlider, setSelectedSlider] = useState<HomeSlider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // About section state
  const [aboutFormData, setAboutFormData] = useState({
    kicker_text: '',
    headline_primary: '',
    headline_highlight: '',
    description: '',
    primary_cta_label: '',
    primary_cta_link: '',
    secondary_cta_label: '',
    secondary_cta_link: '',
    badge_title: '',
    badge_subtitle: '',
    image_url: undefined as string | undefined,
    is_active: true,
  });
  const [aboutSubmitting, setAboutSubmitting] = useState(false);
  const [aboutLoading, setAboutLoading] = useState(false);

  // Features section state
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [featureFormData, setFeatureFormData] = useState<HomeFeaturePayload>(() => buildEmptyFeature());
  const [selectedFeature, setSelectedFeature] = useState<HomeFeature | null>(null);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featureSubmitting, setFeatureSubmitting] = useState(false);
  const [featureDeletingId, setFeatureDeletingId] = useState<number | null>(null);
  const [featureTogglingId, setFeatureTogglingId] = useState<number | null>(null);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [featureSearchTerm, setFeatureSearchTerm] = useState('');

  // CTA section state
  const [ctaFormData, setCtaFormData] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    background_color: '#2D1B1B',
    text_color: '#FFFFFF',
    is_active: true,
  });
  const [ctaSubmitting, setCtaSubmitting] = useState(false);
  const [ctaLoading, setCtaLoading] = useState(false);

  // Testimonials State
  const [testimonials, setTestimonials] = useState<HomeTestimonial[]>([]);
  const [testimonialFormData, setTestimonialFormData] = useState<HomeTestimonialPayload>(() => buildEmptyTestimonial());
  const [selectedTestimonial, setSelectedTestimonial] = useState<HomeTestimonial | null>(null);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialSubmitting, setTestimonialSubmitting] = useState(false);
  const [testimonialDeletingId, setTestimonialDeletingId] = useState<number | null>(null);
  const [testimonialTogglingId, setTestimonialTogglingId] = useState<number | null>(null);
  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [testimonialSearchTerm, setTestimonialSearchTerm] = useState('');

  const orderedSliders = useMemo(
    () =>
      [...sliders].sort(
        (a, b) => (a.sort_order ?? a.order ?? 0) - (b.sort_order ?? b.order ?? 0),
      ),
    [sliders],
  );

  const filteredSliders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return orderedSliders;
    }

    return orderedSliders.filter((slider) => {
      const haystack = [slider.title, slider.subtitle, slider.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [orderedSliders, searchTerm]);

  const resetForm = useCallback(() => {
    setSelectedSlider(null);
    setFormData(buildEmptySlider(sliders.length ? sliders.length + 1 : 1));
  }, [sliders.length]);

  const fetchSliders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await pagesService.getHomeSliders();
      if (response?.success && Array.isArray(response.data)) {
        const normalized = response.data.map((slider) => ({
          ...slider,
          media_url: resolveCmsAssetUrl(slider.media_url) ?? slider.media_url,
        }));
        setSliders(normalized);
      } else {
        throw new Error(response?.message || 'Unable to load sliders');
      }
    } catch (error: any) {
      console.error('Slider fetch failed', error);
      toast.error(error?.message || 'Failed to load sliders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSliders();
  }, [fetchSliders]);

  useEffect(() => {
    if (selectedSlider) {
      setFormData({
        title: selectedSlider.title || '',
        subtitle: selectedSlider.subtitle || '',
        description: selectedSlider.description || '',
        cta_label: selectedSlider.cta_label || '',
        cta_link: selectedSlider.cta_link || '',
        media_url: selectedSlider.media_url || undefined,
        order: selectedSlider.order ?? 1,
        is_active: selectedSlider.is_active ?? true,
      });
    }
  }, [selectedSlider]);

  const handleFieldChange = (field: keyof HomeSliderPayload, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const payload: HomeSliderPayload = {
      ...formData,
      order: Number(formData.order) || 1,
    };

    try {
      const response = selectedSlider
        ? await pagesService.updateHomeSlider(selectedSlider.id, payload)
        : await pagesService.createHomeSlider(payload);

      if (response?.success !== false) {
        toast.success(selectedSlider ? 'Slider updated' : 'Slider created');
        await fetchSliders();
        resetForm();
        setIsDialogOpen(false);
      } else {
        throw new Error(response?.message || 'Unable to save slider');
      }
    } catch (error: any) {
      console.error('Slider save failed', error);
      toast.error(error?.message || 'Unable to save slider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (slider: HomeSlider) => {
    setSelectedSlider(slider);
    setIsDialogOpen(true);
  };

  const handleDelete = async (slider: HomeSlider) => {
    if (!window.confirm(`Delete slider "${slider.title}"?`)) return;
    setDeletingId(slider.id);
    try {
      const response = await pagesService.deleteHomeSlider(slider.id);
      if (response?.success !== false) {
        toast.success('Slider removed');
        if (selectedSlider?.id === slider.id) {
          resetForm();
        }
        await fetchSliders();
      } else {
        throw new Error(response?.message || 'Unable to delete slider');
      }
    } catch (error: any) {
      console.error('Slider delete failed', error);
      toast.error(error?.message || 'Unable to delete slider');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusToggle = async (slider: HomeSlider) => {
    const nextStatus = !(slider.is_active ?? true);
    setTogglingId(slider.id);
    try {
      const response = await pagesService.toggleHomeSliderStatus(slider.id, nextStatus);
      if (response?.success !== false) {
        toast.success(nextStatus ? 'Slider is now visible' : 'Slider hidden');
        await fetchSliders();
      } else {
        throw new Error(response?.message || 'Unable to update slider status');
      }
    } catch (error: any) {
      console.error('Slider status toggle failed', error);
      toast.error(error?.message || 'Unable to update slider status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleCreateClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleAboutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAboutSubmitting(true);
    try {
      const response = await pagesService.updateHomeAbout(aboutFormData);
      if (response?.success !== false) {
        toast.success('About section saved successfully');
        await fetchAboutContent();
      } else {
        throw new Error(response?.message || 'Unable to save about section');
      }
    } catch (error: any) {
      console.error('About save failed', error);
      toast.error(error?.message || 'Unable to save about section');
    } finally {
      setAboutSubmitting(false);
    }
  };

  const fetchAboutContent = useCallback(async () => {
    setAboutLoading(true);
    try {
      const response = await pagesService.getHomeAbout();
      if (response?.success && response.data?.about) {
        setAboutFormData({
          kicker_text: response.data.about.kicker_text ?? '',
          headline_primary: response.data.about.headline_primary ?? '',
          headline_highlight: response.data.about.headline_highlight ?? '',
          description: response.data.about.description ?? '',
          primary_cta_label: response.data.about.primary_cta_label ?? '',
          primary_cta_link: response.data.about.primary_cta_link ?? '',
          secondary_cta_label: response.data.about.secondary_cta_label ?? '',
          secondary_cta_link: response.data.about.secondary_cta_link ?? '',
          badge_title: response.data.about.badge_title ?? '',
          badge_subtitle: response.data.about.badge_subtitle ?? '',
          image_url: response.data.about.image_url ?? undefined,
          is_active: response.data.about.is_active ?? true,
        });
      } else {
        throw new Error(response?.message || 'Unable to load about content');
      }
    } catch (error: any) {
      console.error('About fetch failed', error);
      toast.error(error?.message || 'Failed to load about section');
    } finally {
      setAboutLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAboutContent();
  }, [fetchAboutContent]);

  // CTA handlers
  const handleCtaSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCtaSubmitting(true);
    try {
      const response = await pagesService.updateHomeCta(ctaFormData);
      if (response?.success !== false) {
        toast.success('CTA section saved successfully');
        await fetchCtaContent();
      } else {
        throw new Error(response?.message || 'Unable to save CTA section');
      }
    } catch (error: any) {
      console.error('CTA save failed', error);
      toast.error(error?.message || 'Unable to save CTA section');
    } finally {
      setCtaSubmitting(false);
    }
  };

  const fetchCtaContent = useCallback(async () => {
    setCtaLoading(true);
    try {
      const response = await pagesService.getHomeCta();
      if (response?.success && response.data?.cta) {
        setCtaFormData({
          title: response.data.cta.title ?? '',
          subtitle: response.data.cta.subtitle ?? '',
          button_text: response.data.cta.button_text ?? '',
          button_link: response.data.cta.button_link ?? '',
          background_color: response.data.cta.background_color ?? '#2D1B1B',
          text_color: response.data.cta.text_color ?? '#FFFFFF',
          is_active: response.data.cta.is_active ?? true,
        });
      }
    } catch (error: any) {
      console.error('CTA fetch failed', error);
      toast.error(error?.message || 'Failed to load CTA section');
    } finally {
      setCtaLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCtaContent();
  }, [fetchCtaContent]);

  // Features handlers
  const orderedFeatures = useMemo(
    () => [...features].sort((a, b) => a.sort_order - b.sort_order),
    [features],
  );

  const filteredFeatures = useMemo(() => {
    const query = featureSearchTerm.trim().toLowerCase();
    if (!query) return orderedFeatures;
    return orderedFeatures.filter((feature) =>
      [feature.title, feature.description].filter(Boolean).join(' ').toLowerCase().includes(query),
    );
  }, [orderedFeatures, featureSearchTerm]);

  const resetFeatureForm = useCallback(() => {
    setSelectedFeature(null);
    setFeatureFormData(buildEmptyFeature(features.length ? features.length + 1 : 1));
  }, [features.length]);

  const fetchFeatures = useCallback(async () => {
    setFeaturesLoading(true);
    try {
      const response = await pagesService.getHomeFeatures();
      if (response?.success && Array.isArray(response.data)) {
        setFeatures(response.data);
      } else {
        throw new Error(response?.message || 'Unable to load features');
      }
    } catch (error: any) {
      console.error('Features fetch failed', error);
      toast.error(error?.message || 'Failed to load features');
    } finally {
      setFeaturesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'features') {
      void fetchFeatures();
    }
  }, [activeTab, fetchFeatures]);

  const handleFeatureDialogChange = (open: boolean) => {
    setIsFeatureDialogOpen(open);
    if (!open) {
      resetFeatureForm();
    }
  };

  const handleEditFeature = (feature: HomeFeature) => {
    setSelectedFeature(feature);
    setFeatureFormData({
      icon: feature.icon,
      title: feature.title,
      description: feature.description ?? '',
      sort_order: feature.sort_order,
      is_active: feature.is_active,
    });
    setIsFeatureDialogOpen(true);
  };

  const handleFeatureFieldChange = <K extends keyof HomeFeaturePayload>(
    field: K,
    value: HomeFeaturePayload[K],
  ) => {
    setFeatureFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!featureFormData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setFeatureSubmitting(true);
    try {
      const payload: HomeFeaturePayload = {
        ...featureFormData,
        title: featureFormData.title.trim(),
      };

      if (selectedFeature) {
        await pagesService.updateHomeFeature(selectedFeature.id, payload);
        toast.success('Feature updated successfully');
      } else {
        await pagesService.createHomeFeature(payload);
        toast.success('Feature created successfully');
      }

      await fetchFeatures();
      handleFeatureDialogChange(false);
    } catch (error: any) {
      console.error('Feature save failed', error);
      toast.error(error?.message || 'Unable to save feature');
    } finally {
      setFeatureSubmitting(false);
    }
  };

  const handleDeleteFeature = async (featureId: number) => {
    if (!window.confirm('Are you sure you want to delete this feature?')) return;

    setFeatureDeletingId(featureId);
    try {
      await pagesService.deleteHomeFeature(featureId);
      toast.success('Feature deleted');
      await fetchFeatures();
    } catch (error: any) {
      console.error('Feature delete failed', error);
      toast.error(error?.message || 'Unable to delete feature');
    } finally {
      setFeatureDeletingId(null);
    }
  };

  const handleToggleFeatureStatus = async (feature: HomeFeature) => {
    setFeatureTogglingId(feature.id);
    try {
      await pagesService.toggleHomeFeatureStatus(feature.id, !feature.is_active);
      toast.success(`Feature ${!feature.is_active ? 'enabled' : 'disabled'}`);
      await fetchFeatures();
    } catch (error: any) {
      console.error('Feature toggle failed', error);
      toast.error(error?.message || 'Unable to toggle feature');
    } finally {
      setFeatureTogglingId(null);
    }
  };

  // Testimonials useMemo
  const orderedTestimonials = useMemo(
    () => [...testimonials].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [testimonials],
  );

  const filteredTestimonials = useMemo(() => {
    const query = testimonialSearchTerm.toLowerCase().trim();
    if (!query) {
      return orderedTestimonials;
    }
    return orderedTestimonials.filter((testimonial) => {
      const haystack = [testimonial.client_name, testimonial.service_name, testimonial.testimonial]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [orderedTestimonials, testimonialSearchTerm]);

  // Testimonials handlers
  const fetchTestimonials = useCallback(async () => {
    setTestimonialsLoading(true);
    try {
      const response = await pagesService.getHomeTestimonials();
      if (response?.success && Array.isArray(response.data)) {
        const normalized = response.data.map((testimonial) => ({
          ...testimonial,
          client_image: resolveCmsAssetUrl(testimonial.client_image) ?? testimonial.client_image,
        }));
        setTestimonials(normalized);
      } else {
        throw new Error(response?.message || 'Unable to load testimonials');
      }
    } catch (error: any) {
      console.error('Testimonials fetch failed', error);
      toast.error(error?.message || 'Failed to load testimonials');
    } finally {
      setTestimonialsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTestimonials();
  }, [fetchTestimonials]);

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialSubmitting(true);
    try {
      if (selectedTestimonial) {
        await pagesService.updateHomeTestimonial(selectedTestimonial.id, testimonialFormData);
        toast.success('Testimonial updated successfully');
      } else {
        await pagesService.createHomeTestimonial(testimonialFormData);
        toast.success('Testimonial created successfully');
      }
      setIsTestimonialDialogOpen(false);
      setSelectedTestimonial(null);
      setTestimonialFormData(buildEmptyTestimonial(testimonials.length + 1));
      await fetchTestimonials();
    } catch (error: any) {
      console.error('Testimonial submit failed', error);
      toast.error(error?.message || 'Unable to save testimonial');
    } finally {
      setTestimonialSubmitting(false);
    }
  };

  const handleEditTestimonial = (testimonial: HomeTestimonial) => {
    setSelectedTestimonial(testimonial);
    setIsTestimonialDialogOpen(true);
  };

  const handleDeleteTestimonial = async (testimonial: HomeTestimonial) => {
    if (!window.confirm(`Are you sure you want to delete this testimonial from ${testimonial.client_name}?`)) {
      return;
    }
    setTestimonialDeletingId(testimonial.id);
    try {
      await pagesService.deleteHomeTestimonial(testimonial.id);
      toast.success('Testimonial deleted successfully');
      await fetchTestimonials();
    } catch (error: any) {
      console.error('Testimonial delete failed', error);
      toast.error(error?.message || 'Unable to delete testimonial');
    } finally {
      setTestimonialDeletingId(null);
    }
  };

  const handleToggleTestimonialStatus = async (testimonial: HomeTestimonial) => {
    setTestimonialTogglingId(testimonial.id);
    try {
      await pagesService.toggleHomeTestimonialStatus(testimonial.id, !testimonial.is_active);
      toast.success(`Testimonial ${!testimonial.is_active ? 'enabled' : 'disabled'}`);
      await fetchTestimonials();
    } catch (error: any) {
      console.error('Testimonial toggle failed', error);
      toast.error(error?.message || 'Unable to toggle testimonial');
    } finally {
      setTestimonialTogglingId(null);
    }
  };

  // Sync testimonialFormData with selectedTestimonial
  useEffect(() => {
    if (selectedTestimonial) {
      setTestimonialFormData({
        client_name: selectedTestimonial.client_name ?? '',
        client_image: selectedTestimonial.client_image,
        service_name: selectedTestimonial.service_name ?? '',
        testimonial: selectedTestimonial.testimonial ?? '',
        rating: selectedTestimonial.rating ?? 5,
        sort_order: selectedTestimonial.sort_order ?? 1,
        is_active: selectedTestimonial.is_active ?? true,
      });
    } else {
      setTestimonialFormData(buildEmptyTestimonial(testimonials.length + 1));
    }
  }, [selectedTestimonial, testimonials.length]);

  const renderPlaceholderTab = (label: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{label} section</CardTitle>
        <CardDescription>We will wire this section after the slider workflow is approved.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#6B4F41]">
          Design the slider first, then we will unlock additional sections like {label.toLowerCase()}.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2D1B1B]">Pages</h1>
        <p className="mt-1 text-[#856B5A]">Centralize homepage content so marketing has a predictable workflow.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap justify-center gap-2 bg-[#FFF8F3] p-2 rounded-xl">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-white">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="slider" className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-[#F0E4D9] bg-white/80 p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B08A76]">Hero Slider</p>
              <h3 className="text-2xl font-semibold text-[#2D1B1B]">Homepage hero library</h3>
              <p className="text-sm text-[#856B5A]">
                Manage the carousel above the fold. Entries publish immediately once saved.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B08A76]" size={16} />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title, subtitle, or CTA"
                  className="pl-9"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => void fetchSliders()} disabled={isLoading}>
                  <RefreshCcw size={16} /> Refresh
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateClick}
                  className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white hover:opacity-90"
                >
                  <Plus size={16} /> Add slide
                </Button>
              </div>
            </div>
          </div>

          <Card className="border-[#E6D4C3] bg-white">
            <CardHeader className="border-b border-[#F0E4D9]">
              <CardTitle>Slider library</CardTitle>
              <CardDescription>
                Review, edit, or hide slides that power the first fold of the public homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center gap-2 text-[#9B8B7E]">
                  <Loader2 className="animate-spin" size={18} /> Loading sliders...
                </div>
              ) : filteredSliders.length === 0 ? (
                <p className="text-sm text-[#9B8B7E]">
                  {searchTerm
                    ? 'No slides match your search. Try a different keyword.'
                    : 'No sliders yet. Start by adding your first hero row.'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <AdminTableHeader>
                      <AdminTableRowHeader>
                        <TableHead className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#6B4F41]">
                          Preview
                        </TableHead>
                        <TableHead className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#6B4F41]">
                          Text
                        </TableHead>
                        <TableHead className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#6B4F41]">
                          CTA
                        </TableHead>
                        <TableHead className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#6B4F41]">
                          Order
                        </TableHead>
                        <TableHead className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#6B4F41]">
                          Status
                        </TableHead>
                        <TableHead className="text-right text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#6B4F41]">
                          Actions
                        </TableHead>
                      </AdminTableRowHeader>
                    </AdminTableHeader>
                    <TableBody>
                      {filteredSliders.map((slider) => (
                        <AdminTableRow key={slider.id}>
                          <TableCell>
                            {slider.media_url ? (
                              <img
                                src={slider.media_url}
                                alt={slider.title}
                                className="h-16 w-28 rounded-lg object-cover border border-[#E6D4C3]"
                              />
                            ) : (
                              <div className="h-16 w-28 rounded-lg border border-dashed border-[#E6D4C3] flex items-center justify-center text-xs text-[#9B8B7E]">
                                No image
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-[#2D1B1B]">{slider.title}</p>
                            <p className="text-sm text-[#9B8B7E]">{slider.subtitle}</p>
                          </TableCell>
                          <TableCell>
                            {slider.cta_label ? (
                              <span className="text-sm text-[#2D1B1B]">
                                {slider.cta_label}
                                {slider.cta_link ? (
                                  <span className="block text-xs text-[#9B8B7E]">{slider.cta_link}</span>
                                ) : null}
                              </span>
                            ) : (
                              <span className="text-xs text-[#9B8B7E]">—</span>
                            )}
                          </TableCell>
                          <TableCell>{slider.sort_order ?? slider.order ?? '—'}</TableCell>
                          <TableCell>
                            <Badge variant={slider.is_active ? 'default' : 'outline'}>
                              {slider.is_active ? 'Visible' : 'Hidden'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(slider)}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusToggle(slider)}
                                disabled={togglingId === slider.id}
                                className={slider.is_active ? 'text-[#25664B]' : 'text-[#9B8B7E]'}
                              >
                                {togglingId === slider.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : slider.is_active ? (
                                  <>
                                    <Eye size={14} /> Hide
                                  </>
                                ) : (
                                  <>
                                    <EyeOff size={14} /> Show
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(slider)}
                                disabled={deletingId === slider.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                {deletingId === slider.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </AdminTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <AdminDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#2D1B1B]">{selectedSlider ? 'Edit slide' : 'Add slide'}</DialogTitle>
                <DialogDescription className="text-[#9B8B7E]">
                  Hero carousel rows power the first fold of the public homepage.
                </DialogDescription>
              </DialogHeader>
              <form id="slider-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slider-title">Title *</Label>
                    <Input
                      id="slider-title"
                      value={formData.title}
                      onChange={(event) => handleFieldChange('title', event.target.value)}
                      placeholder="Elevate your glow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slider-subtitle">Subtitle</Label>
                    <Input
                      id="slider-subtitle"
                      value={formData.subtitle ?? ''}
                      onChange={(event) => handleFieldChange('subtitle', event.target.value)}
                      placeholder="Personalized skin rituals"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="slider-description">Description</Label>
                    <Textarea
                      id="slider-description"
                      rows={3}
                      value={formData.description ?? ''}
                      onChange={(event) => handleFieldChange('description', event.target.value)}
                      placeholder="Outline your top promise in two sentences"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slider-cta-label">CTA label</Label>
                    <Input
                      id="slider-cta-label"
                      value={formData.cta_label ?? ''}
                      onChange={(event) => handleFieldChange('cta_label', event.target.value)}
                      placeholder="Book now"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slider-cta-link">CTA link</Label>
                    <Input
                      id="slider-cta-link"
                      value={formData.cta_link ?? ''}
                      onChange={(event) => handleFieldChange('cta_link', event.target.value)}
                      placeholder="/booking"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slider-order">Order</Label>
                    <Input
                      id="slider-order"
                      type="number"
                      min={1}
                      value={formData.order ?? 1}
                      onChange={(event) => handleFieldChange('order', Number(event.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display</Label>
                    <div className="flex items-center gap-3 rounded-lg border border-[#E6D4C3] px-3 py-2">
                      <Switch
                        id="slider-visible"
                        checked={formData.is_active ?? true}
                        onCheckedChange={(checked) => handleFieldChange('is_active', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium text-[#2D1B1B]">Show on website</p>
                        <p className="text-xs text-[#9B8B7E]">Toggle visibility without deleting content.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <ImageUploadField
                  label="Slider image"
                  description="Recommended 1440x900px JPG/PNG under 1MB for best quality."
                  value={formData.media_url || ''}
                  onChange={(value) => handleFieldChange('media_url', value)}
                />
              </form>
              <DialogFooter className="flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="slider-form"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {selectedSlider ? 'Update slider' : 'Add slider'}
                </Button>
              </DialogFooter>
            </AdminDialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-[#F0E4D9] bg-white/80 p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B08A76]">About Section</p>
              <h3 className="text-2xl font-semibold text-[#2D1B1B]">About the practice</h3>
              <p className="text-sm text-[#856B5A]">
                Manage the About section that appears below the hero slider on the homepage.
              </p>
            </div>
          </div>

          <Card className="border-[#E6D4C3] bg-white">
            <CardHeader className="border-b border-[#F0E4D9]">
              <CardTitle>About content</CardTitle>
              <CardDescription>
                Control the headline, description, CTA buttons, and featured image for the About section.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAboutSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="about-kicker">Kicker text</Label>
                    <Input
                      id="about-kicker"
                      value={aboutFormData.kicker_text ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, kicker_text: e.target.value })}
                      placeholder="CPD Accredited Practitioner"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-primary-headline">Primary headline *</Label>
                    <Input
                      id="about-primary-headline"
                      value={aboutFormData.headline_primary ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, headline_primary: e.target.value })}
                      placeholder="Elevate Your"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-highlight-headline">Highlight headline *</Label>
                    <Input
                      id="about-highlight-headline"
                      value={aboutFormData.headline_highlight ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, headline_highlight: e.target.value })}
                      placeholder="Natural Beauty"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="about-description">Description</Label>
                    <Textarea
                      id="about-description"
                      rows={4}
                      value={aboutFormData.description ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, description: e.target.value })}
                      placeholder="Experience the art of aesthetic enhancement with a CPD-accredited practitioner..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-primary-cta-label">Primary CTA label</Label>
                    <Input
                      id="about-primary-cta-label"
                      value={aboutFormData.primary_cta_label ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, primary_cta_label: e.target.value })}
                      placeholder="Book Consultation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-primary-cta-link">Primary CTA link</Label>
                    <Input
                      id="about-primary-cta-link"
                      value={aboutFormData.primary_cta_link ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, primary_cta_link: e.target.value })}
                      placeholder="/booking"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-secondary-cta-label">Secondary CTA label</Label>
                    <Input
                      id="about-secondary-cta-label"
                      value={aboutFormData.secondary_cta_label ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, secondary_cta_label: e.target.value })}
                      placeholder="View Services"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-secondary-cta-link">Secondary CTA link</Label>
                    <Input
                      id="about-secondary-cta-link"
                      value={aboutFormData.secondary_cta_link ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, secondary_cta_link: e.target.value })}
                      placeholder="/services"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-badge-title">Badge title</Label>
                    <Input
                      id="about-badge-title"
                      value={aboutFormData.badge_title ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, badge_title: e.target.value })}
                      placeholder="CPD Certified"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-badge-subtitle">Badge subtitle</Label>
                    <Input
                      id="about-badge-subtitle"
                      value={aboutFormData.badge_subtitle ?? ''}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, badge_subtitle: e.target.value })}
                      placeholder="Trained by Rejuvenate"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Display</Label>
                    <div className="flex items-center gap-3 rounded-lg border border-[#E6D4C3] px-3 py-2">
                      <Switch
                        id="about-visible"
                        checked={aboutFormData.is_active ?? true}
                        onCheckedChange={(checked) => setAboutFormData({ ...aboutFormData, is_active: checked })}
                      />
                      <div>
                        <p className="text-sm font-medium text-[#2D1B1B]">Show on website</p>
                        <p className="text-xs text-[#9B8B7E]">Toggle visibility without losing content.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <ImageUploadField
                  label="About section image"
                  description="Recommended 4:5 aspect ratio (e.g., 800x1000px) JPG/PNG under 1MB for best quality."
                  value={aboutFormData.image_url || ''}
                  onChange={(value) => setAboutFormData({ ...aboutFormData, image_url: value })}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={aboutSubmitting}
                    className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white hover:opacity-90"
                  >
                    {aboutSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                    Save about section
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-[#F0E4D9] bg-white/80 p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B08A76]">Features Section</p>
              <h3 className="text-2xl font-semibold text-[#2D1B1B]">Homepage features</h3>
              <p className="text-sm text-[#856B5A]">
                Manage key features displayed on the homepage to highlight your services and benefits.
              </p>
            </div>
          </div>

          <Card className="border-[#E6D4C3] bg-white">
            <CardHeader className="border-b border-[#F0E4D9]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>All features</CardTitle>
                  <CardDescription>Create, edit, or remove homepage features</CardDescription>
                </div>
                <Button
                  onClick={() => handleFeatureDialogChange(true)}
                  className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white"
                >
                  <Plus size={16} /> Add feature
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B8B7E]" />
                  <Input
                    placeholder="Search features..."
                    value={featureSearchTerm}
                    onChange={(e) => setFeatureSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={fetchFeatures} disabled={featuresLoading}>
                  <RefreshCcw size={16} className={featuresLoading ? 'animate-spin' : ''} />
                </Button>
              </div>

              {featuresLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF77]" />
                </div>
              ) : filteredFeatures.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#E6D4C3] bg-[#FFF8F3] p-12 text-center">
                  <p className="text-sm text-[#9B8B7E]">
                    {featureSearchTerm ? 'No features match your search.' : 'No features yet. Click "Add feature" to get started.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-[#E6D4C3]">
                  <Table>
                    <TableHeader className="bg-[#FFF8F3]">
                      <TableRow className="border-b border-[#E6D4C3]">
                        <TableHead className="text-black font-semibold">Icon</TableHead>
                        <TableHead className="text-black font-semibold">Title</TableHead>
                        <TableHead className="text-black font-semibold">Description</TableHead>
                        <TableHead className="text-center text-black font-semibold">Order</TableHead>
                        <TableHead className="text-center text-black font-semibold">Status</TableHead>
                        <TableHead className="text-right text-black font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeatures.map((feature) => {
                        const FeatureIcon = getIconComponent(feature.icon);
                        return (
                          <TableRow key={feature.id} className="border-b border-[#F0E4D9] hover:bg-[#FFF8F3]/50">
                            <TableCell className="text-black">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF8F3]">
                                <FeatureIcon className="h-5 w-5 text-[#D4AF77]" />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-black">{feature.title}</TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate text-sm text-black">
                                {feature.description || '—'}
                              </p>
                            </TableCell>
                            <TableCell className="text-center text-black">
                              <Badge variant="outline" className="text-black border-black">{feature.sort_order}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFeatureStatus(feature)}
                                disabled={featureTogglingId === feature.id}
                              >
                                {featureTogglingId === feature.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : feature.is_active ? (
                                  <Eye size={16} className="text-green-600" />
                                ) : (
                                  <EyeOff size={16} className="text-[#9B8B7E]" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditFeature(feature)}
                                >
                                  <Pencil size={16} className="text-black" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFeature(feature.id)}
                                  disabled={featureDeletingId === feature.id}
                                >
                                  {featureDeletingId === feature.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={16} className="text-red-600" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feature Add/Edit Dialog */}
          <Dialog open={isFeatureDialogOpen} onOpenChange={handleFeatureDialogChange}>
            <AdminDialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedFeature ? 'Edit feature' : 'Add new feature'}</DialogTitle>
                <DialogDescription>
                  {selectedFeature
                    ? 'Update the feature details below.'
                    : 'Fill in the details for the new homepage feature.'}
                </DialogDescription>
              </DialogHeader>
              <form id="feature-form" onSubmit={handleFeatureSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="feature-icon">Icon *</Label>
                    <select
                      id="feature-icon"
                      value={featureFormData.icon}
                      onChange={(e) => handleFeatureFieldChange('icon', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      title="Select an icon for the feature"
                      required
                    >
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 rounded-lg border border-[#E6D4C3] bg-[#FFF8F3] p-3">
                      {(() => {
                        const SelectedIcon = getIconComponent(featureFormData.icon);
                        return (
                          <>
                            <SelectedIcon className="h-5 w-5 text-[#D4AF77]" />
                            <span className="text-sm text-[#856B5A]">Preview</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feature-title">Title *</Label>
                    <Input
                      id="feature-title"
                      value={featureFormData.title}
                      onChange={(e) => handleFeatureFieldChange('title', e.target.value)}
                      placeholder="Professional Treatment"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="feature-description">Description</Label>
                    <Textarea
                      id="feature-description"
                      rows={3}
                      value={featureFormData.description ?? ''}
                      onChange={(e) => handleFeatureFieldChange('description', e.target.value)}
                      placeholder="Brief description of this feature..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feature-order">Sort order</Label>
                    <Input
                      id="feature-order"
                      type="number"
                      min={1}
                      value={featureFormData.sort_order ?? 1}
                      onChange={(e) => handleFeatureFieldChange('sort_order', Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Display</Label>
                    <div className="flex items-center gap-3 rounded-lg border border-[#E6D4C3] px-3 py-2">
                      <Switch
                        id="feature-visible"
                        checked={featureFormData.is_active ?? true}
                        onCheckedChange={(checked) => handleFeatureFieldChange('is_active', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium text-[#2D1B1B]">Show on website</p>
                        <p className="text-xs text-[#9B8B7E]">Toggle visibility without deleting.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <DialogFooter className="flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => handleFeatureDialogChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="feature-form"
                  disabled={featureSubmitting}
                  className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white"
                >
                  {featureSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {selectedFeature ? 'Update feature' : 'Add feature'}
                </Button>
              </DialogFooter>
            </AdminDialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="cta">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#2D1B1B]">Call to Action Section</CardTitle>
              <CardDescription>
                Configure the main CTA section that appears on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ctaLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#C9A581]" />
                </div>
              ) : (
                <form id="cta-form" onSubmit={handleCtaSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cta-title">Title *</Label>
                      <Input
                        id="cta-title"
                        value={ctaFormData.title}
                        onChange={(e) => setCtaFormData({ ...ctaFormData, title: e.target.value })}
                        placeholder="Begin Your Beauty Journey"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta-subtitle">Subtitle</Label>
                      <Input
                        id="cta-subtitle"
                        value={ctaFormData.subtitle}
                        onChange={(e) => setCtaFormData({ ...ctaFormData, subtitle: e.target.value })}
                        placeholder="Book your complimentary consultation today"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cta-button-text">Button Text *</Label>
                      <Input
                        id="cta-button-text"
                        value={ctaFormData.button_text}
                        onChange={(e) => setCtaFormData({ ...ctaFormData, button_text: e.target.value })}
                        placeholder="Book Free Consultation"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta-button-link">Button Link *</Label>
                      <Input
                        id="cta-button-link"
                        value={ctaFormData.button_link}
                        onChange={(e) => setCtaFormData({ ...ctaFormData, button_link: e.target.value })}
                        placeholder="/booking"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cta-bg-color">Background Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="cta-bg-color"
                          type="color"
                          value={ctaFormData.background_color}
                          onChange={(e) => setCtaFormData({ ...ctaFormData, background_color: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={ctaFormData.background_color}
                          onChange={(e) => setCtaFormData({ ...ctaFormData, background_color: e.target.value })}
                          placeholder="#2D1B1B"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta-text-color">Text Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="cta-text-color"
                          type="color"
                          value={ctaFormData.text_color}
                          onChange={(e) => setCtaFormData({ ...ctaFormData, text_color: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={ctaFormData.text_color}
                          onChange={(e) => setCtaFormData({ ...ctaFormData, text_color: e.target.value })}
                          placeholder="#FFFFFF"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Display</Label>
                    <div className="flex items-center gap-3 rounded-lg border border-[#E6D4C3] px-3 py-2 bg-[#FFF8F3]">
                      <Switch
                        id="cta-active"
                        checked={ctaFormData.is_active}
                        onCheckedChange={(checked) => setCtaFormData({ ...ctaFormData, is_active: checked })}
                      />
                      <div>
                        <p className="text-sm font-medium text-[#2D1B1B]">Show on website</p>
                        <p className="text-xs text-[#9B8B7E]">Toggle visibility without removing content</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E6D4C3]">
                    <Button
                      type="submit"
                      disabled={ctaSubmitting}
                      className="bg-[#C9A581] text-white hover:bg-[#B8936F]"
                    >
                      {ctaSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save CTA Section
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-[#F0E4D9] bg-white/80 p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B08A76]">Client Testimonials</p>
              <h3 className="text-2xl font-semibold text-[#2D1B1B]">Customer Reviews</h3>
              <p className="text-sm text-[#856B5A]">
                Manage client testimonials with ratings and service feedback
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B08A76]" size={16} />
                <Input
                  value={testimonialSearchTerm}
                  onChange={(event) => setTestimonialSearchTerm(event.target.value)}
                  placeholder="Search by client or service name"
                  className="pl-9"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => void fetchTestimonials()} disabled={testimonialsLoading}>
                  <RefreshCcw size={16} /> Refresh
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedTestimonial(null);
                    setTestimonialFormData(buildEmptyTestimonial(testimonials.length + 1));
                    setIsTestimonialDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white hover:opacity-90"
                >
                  <Plus size={16} /> Add testimonial
                </Button>
              </div>
            </div>

            {testimonialsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#C9A581]" />
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-[#E6D4C3] bg-[#FFFBF8] px-6 py-12 text-center">
                <MessageSquare className="mx-auto mb-3 text-[#C9A581]" size={40} />
                <p className="text-lg font-medium text-[#2D1B1B]">No testimonials yet</p>
                <p className="text-sm text-[#9B8B7E]">Create your first testimonial to showcase client experiences</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#E6D4C3] bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FFF8F3] hover:bg-[#FFF8F3]">
                      <TableHead className="text-[#2D1B1B] font-semibold">Client</TableHead>
                      <TableHead className="text-[#2D1B1B] font-semibold">Service</TableHead>
                      <TableHead className="text-[#2D1B1B] font-semibold">Testimonial</TableHead>
                      <TableHead className="text-[#2D1B1B] font-semibold text-center">Rating</TableHead>
                      <TableHead className="text-[#2D1B1B] font-semibold text-center">Order</TableHead>
                      <TableHead className="text-[#2D1B1B] font-semibold text-center">Status</TableHead>
                      <TableHead className="text-[#2D1B1B] font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestimonials.map((testimonial) => (
                      <TableRow key={testimonial.id} className="hover:bg-[#FFFBF8]">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {testimonial.client_image ? (
                              <img
                                src={testimonial.client_image}
                                alt={testimonial.client_name}
                                className="h-10 w-10 rounded-full object-cover border-2 border-[#E6D4C3]"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#F0E4D9] flex items-center justify-center">
                                <User size={20} className="text-[#B08A76]" />
                              </div>
                            )}
                            <span className="font-medium text-[#2D1B1B]">{testimonial.client_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#6B4F41]">{testimonial.service_name}</TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-[#6B4F41]">
                            {testimonial.testimonial.split(' ').slice(0, 5).join(' ')}
                            {testimonial.testimonial.split(' ').length > 5 ? '...' : ''}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < (testimonial.rating ?? 5) ? 'fill-[#D4AF77] text-[#D4AF77]' : 'text-[#E6D4C3]'}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="border-[#C9A581] text-[#C9A581]">
                            {testimonial.sort_order}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleTestimonialStatus(testimonial)}
                            disabled={testimonialTogglingId === testimonial.id}
                            className="h-7 px-2"
                          >
                            {testimonialTogglingId === testimonial.id ? (
                              <Loader2 size={16} className="animate-spin text-[#C9A581]" />
                            ) : testimonial.is_active ? (
                              <Eye size={16} className="text-green-600" />
                            ) : (
                              <EyeOff size={16} className="text-gray-400" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditTestimonial(testimonial)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit size={16} className="text-[#C9A581]" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTestimonial(testimonial)}
                              disabled={testimonialDeletingId === testimonial.id}
                              className="h-8 w-8 p-0"
                            >
                              {testimonialDeletingId === testimonial.id ? (
                                <Loader2 size={16} className="animate-spin text-red-500" />
                              ) : (
                                <Trash2 size={16} className="text-red-500" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <Dialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen}>
            <AdminDialogContent className="max-w-2xl">
              <div className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#2D1B1B]">
                    {selectedTestimonial ? 'Edit testimonial' : 'Create testimonial'}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    {selectedTestimonial ? 'Edit the testimonial details' : 'Create a new client testimonial'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTestimonialSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="testimonial-client-name">Client Name *</Label>
                    <Input
                      id="testimonial-client-name"
                      value={testimonialFormData.client_name}
                      onChange={(e) => setTestimonialFormData({ ...testimonialFormData, client_name: e.target.value })}
                      placeholder="Jane Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testimonial-service-name">Service Name *</Label>
                    <Input
                      id="testimonial-service-name"
                      value={testimonialFormData.service_name}
                      onChange={(e) => setTestimonialFormData({ ...testimonialFormData, service_name: e.target.value })}
                      placeholder="e.g., Facial, Massage"
                      required
                      className="text-[#2D1B1B]"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="Client Image"
                  value={testimonialFormData.client_image ?? undefined}
                  onChange={(file) => setTestimonialFormData({ ...testimonialFormData, client_image: file })}
                  accept="image/*"
                />

                <div className="space-y-2">
                  <Label htmlFor="testimonial-text">Testimonial *</Label>
                  <Textarea
                    id="testimonial-text"
                    value={testimonialFormData.testimonial}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, testimonial: e.target.value })}
                    placeholder="Share your experience with our services..."
                    rows={5}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="testimonial-rating">Rating *</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="testimonial-rating"
                        type="number"
                        min="1"
                        max="5"
                        value={testimonialFormData.rating ?? 5}
                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, rating: parseInt(e.target.value) || 5 })}
                        className="w-20"
                        required
                      />
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={i < (testimonialFormData.rating ?? 5) ? 'fill-[#D4AF77] text-[#D4AF77]' : 'text-[#E6D4C3]'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testimonial-sort">Display Order</Label>
                    <Input
                      id="testimonial-sort"
                      type="number"
                      min="1"
                      value={testimonialFormData.sort_order}
                      onChange={(e) => setTestimonialFormData({ ...testimonialFormData, sort_order: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Display</Label>
                  <div className="flex items-center gap-3 rounded-lg border border-[#E6D4C3] px-3 py-2 bg-[#FFF8F3]">
                    <Switch
                      id="testimonial-active"
                      checked={testimonialFormData.is_active}
                      onCheckedChange={(checked) => setTestimonialFormData({ ...testimonialFormData, is_active: checked })}
                    />
                    <div>
                      <p className="text-sm font-medium text-[#2D1B1B]">Show on website</p>
                      <p className="text-xs text-[#9B8B7E]">Toggle visibility without removing content</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsTestimonialDialogOpen(false);
                      setSelectedTestimonial(null);
                      setTestimonialFormData(buildEmptyTestimonial(testimonials.length + 1));
                    }}
                    disabled={testimonialSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={testimonialSubmitting}
                    className="bg-[#C9A581] text-white hover:bg-[#B8936F]"
                  >
                    {testimonialSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {selectedTestimonial ? 'Update' : 'Create'} testimonial
                  </Button>
                </DialogFooter>
              </form>
              </div>
            </AdminDialogContent>
          </Dialog>
        </TabsContent>
```
      </Tabs>
    </div>
  );
}

export default HomePages;
