import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Pencil, Plus, RefreshCcw, Search, Trash2, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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
import { servicesService } from '../../../services/servicesService';
import { serviceCategoriesService } from '../../../services/serviceCategoriesService';
import type { Service, ServicePayload, ServiceCategory } from '../../../lib/types';
import { resolveCmsAssetUrl } from '../../../lib/asset';

const buildEmptyService = (): ServicePayload => ({
  title: '',
  slug: '',
  excerpt: '',
  detail_content: '',
  featured_image: undefined,
  price_range: '',
  duration: '',
  benefits: [],
  process_steps: [],
  gallery_images: [],
  before_after_images: [],
  is_featured: false,
  is_active: true,
  sort_order: 1,
  category_id: undefined,
});

export function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [formData, setFormData] = useState<ServicePayload>(buildEmptyService());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Benefits management
  const [newBenefit, setNewBenefit] = useState('');

  // Process steps management
  const [newProcessStep, setNewProcessStep] = useState({ step: 1, title: '', description: '' });

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await servicesService.getServices();
      if (response?.success && Array.isArray(response.data)) {
        const normalized = response.data.map((service) => ({
          ...service,
          featured_image: service.featured_image ? resolveCmsAssetUrl(service.featured_image) || service.featured_image : null,
        }));
        setServices(normalized);
      } else {
        throw new Error(response?.message || 'Unable to load services');
      }
    } catch (error: any) {
      console.error('Services fetch failed', error);
      toast.error(error?.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await serviceCategoriesService.getServiceCategories();
      if (response?.success && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error: any) {
      console.error('Categories fetch failed', error);
      toast.error(error?.message || 'Failed to load categories');
    }
  }, []);

  useEffect(() => {
    void fetchServices();
    void fetchCategories();
  }, [fetchServices, fetchCategories]);

  // Sync formData with selectedService (like slider component does)
  useEffect(() => {
    if (selectedService) {
      setFormData({
        title: selectedService.title,
        slug: selectedService.slug,
        excerpt: selectedService.excerpt ?? '',
        detail_content: selectedService.detail_content ?? '',
        featured_image: selectedService.featured_image || undefined,
        price_range: selectedService.price_range ?? '',
        duration: selectedService.duration ?? '',
        benefits: selectedService.benefits ?? [],
        process_steps: selectedService.process_steps ?? [],
        gallery_images: selectedService.gallery_images ?? [],
        before_after_images: selectedService.before_after_images ?? [],
        is_featured: selectedService.is_featured,
        is_active: selectedService.is_active,
        sort_order: selectedService.sort_order,
        category_id: selectedService.category_id ?? undefined,
      });
    }
  }, [selectedService]);

  const resetForm = useCallback(() => {
    setSelectedService(null);
    setFormData(buildEmptyService());
    setNewBenefit('');
    setNewProcessStep({ step: 1, title: '', description: '' });
  }, []);

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleFieldChange = <K extends keyof ServicePayload>(
    field: K,
    value: ServicePayload[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...(prev.benefits || []), newBenefit.trim()],
      }));
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: (prev.benefits || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddProcessStep = () => {
    if (newProcessStep.title.trim() && newProcessStep.description.trim()) {
      setFormData((prev) => ({
        ...prev,
        process_steps: [...(prev.process_steps || []), { ...newProcessStep }],
      }));
      setNewProcessStep({
        step: (formData.process_steps?.length || 0) + 2,
        title: '',
        description: '',
      });
    }
  };

  const handleRemoveProcessStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      process_steps: (prev.process_steps || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ServicePayload = {
        ...formData,
        title: formData.title.trim(),
        slug: formData.slug?.trim() || undefined,
      };

      if (selectedService) {
        await servicesService.updateService(selectedService.id, payload);
        toast.success('Service updated successfully');
      } else {
        await servicesService.createService(payload);
        toast.success('Service created successfully');
      }

      await fetchServices();
      handleDialogChange(false);
    } catch (error: any) {
      console.error('Service save failed', error);
      toast.error(error?.message || 'Unable to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    setDeletingId(id);
    try {
      await servicesService.deleteService(id);
      toast.success('Service deleted');
      await fetchServices();
    } catch (error: any) {
      console.error('Service delete failed', error);
      toast.error(error?.message || 'Unable to delete service');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    setTogglingId(service.id);
    try {
      await servicesService.toggleServiceStatus(service.id, !service.is_active);
      toast.success(`Service ${!service.is_active ? 'enabled' : 'disabled'}`);
      await fetchServices();
    } catch (error: any) {
      console.error('Service toggle failed', error);
      toast.error(error?.message || 'Unable to toggle service');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredServices = services.filter((service) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [service.title, service.excerpt, service.slug]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2D1B1B]">Services</h1>
        <p className="mt-1 text-[#856B5A]">Manage your services catalog with detailed descriptions and images.</p>
      </div>

      <Card className="border-[#E6D4C3] bg-white">
        <CardHeader className="border-b border-[#F0E4D9]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All services</CardTitle>
              <CardDescription>Create, edit, or remove services</CardDescription>
            </div>
            <Button
              onClick={() => handleDialogChange(true)}
              className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white"
            >
              <Plus size={16} /> Add service
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B8B7E]" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={fetchServices} disabled={isLoading}>
              <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF77]" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#E6D4C3] bg-[#FFF8F3] p-12 text-center">
              <p className="text-sm text-[#9B8B7E]">
                {searchTerm ? 'No services match your search.' : 'No services yet. Click "Add service" to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#E6D4C3]">
              <Table>
                <TableHeader className="bg-[#FFF8F3]">
                  <TableRow className="border-b border-[#E6D4C3]">
                    <TableHead className="text-black font-semibold">Image</TableHead>
                    <TableHead className="text-black font-semibold">Title</TableHead>
                    <TableHead className="text-black font-semibold">Category</TableHead>
                    <TableHead className="text-black font-semibold">Slug</TableHead>
                    <TableHead className="text-black font-semibold">Price</TableHead>
                    <TableHead className="text-center text-black font-semibold">Featured</TableHead>
                    <TableHead className="text-center text-black font-semibold">Status</TableHead>
                    <TableHead className="text-right text-black font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id} className="border-b border-[#F0E4D9] hover:bg-[#FFF8F3]/50">
                      <TableCell>
                        {service.featured_image ? (
                          <img
                            src={service.featured_image}
                            alt={service.title}
                            className="h-12 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-16 rounded bg-[#FFF8F3] flex items-center justify-center text-xs text-[#9B8B7E]">
                            No image
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-black">{service.title}</TableCell>
                      <TableCell className="text-sm text-black">
                        {service.category ? (
                          <Badge variant="outline" className="bg-[#FFF8F3]">
                            {service.category.name}
                          </Badge>
                        ) : (
                          <span className="text-[#9B8B7E]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-black">{service.slug}</TableCell>
                      <TableCell className="text-sm text-black">{service.price_range || '—'}</TableCell>
                      <TableCell className="text-center">
                        {service.is_featured && (
                          <Star size={16} className="inline-block text-[#D4AF77] fill-[#D4AF77]" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(service)}
                          disabled={togglingId === service.id}
                        >
                          {togglingId === service.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : service.is_active ? (
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
                            onClick={() => handleEditService(service)}
                          >
                            <Pencil size={16} className="text-black" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                            disabled={deletingId === service.id}
                          >
                            {deletingId === service.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} className="text-red-600" />
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

      {/* Service Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{selectedService ? 'Edit service' : 'Add new service'}</DialogTitle>
            <DialogDescription>
              {selectedService
                ? 'Update the service details below.'
                : 'Fill in the details for the new service.'}
            </DialogDescription>
          </DialogHeader>
          <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service-title">Title *</Label>
                <Input
                  id="service-title"
                  value={formData.title ?? ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="Dermal Fillers"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-slug">Slug *</Label>
                <Input
                  id="service-slug"
                  value={formData.slug ?? ''}
                  onChange={(e) => handleFieldChange('slug', e.target.value)}
                  placeholder="dermal-fillers"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-category">Category *</Label>
                <select
                  id="service-category"
                  title="Service Category"
                  value={formData.category_id ?? ''}
                  onChange={(e) => handleFieldChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-price">Price range</Label>
                <Input
                  id="service-price"
                  value={formData.price_range ?? ''}
                  onChange={(e) => handleFieldChange('price_range', e.target.value)}
                  placeholder="from £150"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-duration">Duration</Label>
                <Input
                  id="service-duration"
                  value={formData.duration ?? ''}
                  onChange={(e) => handleFieldChange('duration', e.target.value)}
                  placeholder="45-60 minutes"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="service-excerpt">Excerpt</Label>
                <Textarea
                  id="service-excerpt"
                  rows={2}
                  value={formData.excerpt ?? ''}
                  onChange={(e) => handleFieldChange('excerpt', e.target.value)}
                  placeholder="Short description for cards and listings..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="service-detail">Detailed content</Label>
                <Textarea
                  id="service-detail"
                  rows={6}
                  value={formData.detail_content ?? ''}
                  onChange={(e) => handleFieldChange('detail_content', e.target.value)}
                  placeholder="Full service description with all details..."
                />
              </div>

              {/* Benefits */}
              <div className="space-y-2 md:col-span-2">
                <Label>Benefits</Label>
                <div className="space-y-2">
                  {(formData.benefits || []).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={benefit} readOnly className="flex-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBenefit(index)}
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="Add a benefit..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                    />
                    <Button type="button" onClick={handleAddBenefit}>
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Process Steps */}
              <div className="space-y-2 md:col-span-2">
                <Label>Process steps</Label>
                <div className="space-y-3">
                  {(formData.process_steps || []).map((step, index) => (
                    <div key={index} className="rounded-lg border border-[#E6D4C3] bg-[#FFF8F3] p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#2D1B1B]">Step {step.step}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProcessStep(index)}
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-black">{step.title}</p>
                      <p className="text-xs text-black">{step.description}</p>
                    </div>
                  ))}
                  <div className="space-y-2 rounded-lg border border-dashed border-[#D4AF77] p-3">
                    <Input
                      value={newProcessStep.title}
                      onChange={(e) => setNewProcessStep((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Step title..."
                    />
                    <Input
                      value={newProcessStep.description}
                      onChange={(e) => setNewProcessStep((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Step description..."
                    />
                    <Button type="button" onClick={handleAddProcessStep} size="sm">
                      <Plus size={16} /> Add step
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Featured service</Label>
                <div className="flex items-center gap-3 rounded-lg border border-[#E6D4C3] px-3 py-2">
                  <Switch
                    id="service-featured"
                    checked={formData.is_featured ?? false}
                    onCheckedChange={(checked) => handleFieldChange('is_featured', checked)}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#2D1B1B]">Show as featured</p>
                    <p className="text-xs text-[#9B8B7E]">Highlight this service on homepage</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Display</Label>
                <div className="flex items-center gap-3 rounded-lg border border-[#E6D4C3] px-3 py-2">
                  <Switch
                    id="service-active"
                    checked={formData.is_active ?? true}
                    onCheckedChange={(checked) => handleFieldChange('is_active', checked)}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#2D1B1B]">Show on website</p>
                    <p className="text-xs text-[#9B8B7E]">Toggle visibility without deleting</p>
                  </div>
                </div>
              </div>
            </div>

            <ImageUploadField
              label="Featured image"
              description="Main service image (recommended 800x600px)"
              value={formData.featured_image || ''}
              onChange={(value) => handleFieldChange('featured_image', value)}
            />
          </form>
          <DialogFooter className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="service-form"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {selectedService ? 'Update service' : 'Add service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ServicesManagement;
