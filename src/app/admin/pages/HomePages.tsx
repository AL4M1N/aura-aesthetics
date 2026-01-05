import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Pencil, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ImageUploadField } from '../../components/ImageUploadField';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { pagesService } from '../../../services/pagesService';
import type { HomeSlider, HomeSliderPayload } from '../../../lib/types';
import { resolveCmsAssetUrl } from '../../../lib/asset';

const tabs = [
  { label: 'Slider', value: 'slider' },
  { label: 'About', value: 'about' },
  { label: 'Features', value: 'features' },
  { label: 'CTA', value: 'cta' },
  { label: 'Testimonials', value: 'testimonials' },
];

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
        <TabsList className="flex flex-wrap gap-2 bg-[#FFF8F3] p-2 rounded-xl">
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
                    <TableHeader>
                      <TableRow>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSliders.map((slider) => (
                        <TableRow key={slider.id}>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogContent className="max-w-3xl gap-6">
              <DialogHeader>
                <DialogTitle>{selectedSlider ? 'Edit slide' : 'Add slide'}</DialogTitle>
                <DialogDescription>
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
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="about">{renderPlaceholderTab('About')}</TabsContent>
        <TabsContent value="features">{renderPlaceholderTab('Features')}</TabsContent>
        <TabsContent value="cta">{renderPlaceholderTab('CTA')}</TabsContent>
        <TabsContent value="testimonials">{renderPlaceholderTab('Testimonials')}</TabsContent>
      </Tabs>
    </div>
  );
}

export default HomePages;
