import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, RefreshCcw, Search, Trash2, Globe } from 'lucide-react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ImageUploadField } from '../../components/ImageUploadField';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { 
  AdminCard, 
  AdminTableHeader, 
  AdminTableRowHeader, 
  AdminTableRow, 
  AdminDialogContent,
  AdminBadgeSecondary 
} from '../../components/ui/admin';
import { seoService, type SEOData, type SEODataPayload } from '../../../services/seoService';
import { servicesService } from '../../../services/servicesService';
import type { Service } from '../../../lib/types';
import { resolveCmsAssetUrl } from '../../../lib/asset';

const PAGE_TYPES = [
  { value: 'home', label: 'Home Page' },
  { value: 'about', label: 'About Page' },
  { value: 'services', label: 'Services List Page' },
  { value: 'consent', label: 'Consent Page' },
  { value: 'booking', label: 'Booking Page' },
] as const;

const buildEmptySEOData = (): SEODataPayload => ({
  page_type: 'home',
  page_identifier: undefined,
  title: '',
  description: '',
  keywords: '',
  og_title: '',
  og_description: '',
  og_image: undefined,
});

export function SEOManagement() {
  const [seoData, setSeoData] = useState<SEOData[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<SEODataPayload>(buildEmptySEOData());
  const [selectedSEO, setSelectedSEO] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('general');

  const fetchSEOData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await seoService.getSEOData();
      console.log('SEO Data Response:', response); // Debug log
      if (response?.success && Array.isArray(response.data)) {
        const normalized = response.data.map((seo) => ({
          ...seo,
          og_image: seo.og_image ? resolveCmsAssetUrl(seo.og_image) || seo.og_image : undefined,
        }));
        setSeoData(normalized);
      } else {
        console.warn('Unexpected SEO response format:', response);
        throw new Error(response?.message || 'Unable to load SEO data');
      }
    } catch (error: any) {
      console.error('SEO data fetch failed:', error);
      toast.error(error?.message || 'Failed to load SEO data');
      setSeoData([]); // Set empty state on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const response = await servicesService.getServices();
      if (response?.success && Array.isArray(response.data)) {
        setServices(response.data);
      }
    } catch (error: any) {
      console.error('Services fetch failed', error);
    }
  }, []);

  // Initial fetch on mount only
  useEffect(() => {
    void fetchSEOData();
    void fetchServices();
  }, []); // Empty dependency array - fetch only once on mount

  const openCreateDialog = () => {
    setSelectedSEO(null);
    setFormData(buildEmptySEOData());
    setIsDialogOpen(true);
  };

  const openEditDialog = (seo: SEOData) => {
    setSelectedSEO(seo);
    setFormData({
      page_type: seo.page_type,
      page_identifier: seo.page_identifier,
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      og_title: seo.og_title,
      og_description: seo.og_description,
      og_image: seo.og_image,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    // Client-side uniqueness checks to give clearer feedback before hitting the API
    // - If creating a service-specific SEO while a general Services page SEO exists,
    //   many backends enforce uniqueness on page_type and will reject the request.
    // - Provide a clear error message so the admin knows to remove/edit the general entry first.
    if (!selectedSEO) {
      if (formData.page_type === 'services' && formData.page_identifier) {
        const generalExists = seoData.some(s => s.page_type === 'services' && !s.page_identifier);
        if (generalExists) {
          toast.error('A general Services page SEO already exists. Delete or edit it before creating per-service entries.');
          return;
        }

        const duplicate = seoData.find(s => s.page_type === 'services' && s.page_identifier === formData.page_identifier);
        if (duplicate) {
          toast.error('SEO for this specific service already exists. Edit the existing entry instead.');
          return;
        }
      } else if (!formData.page_identifier) {
        // For general pages, ensure a general entry for the same page_type doesn't already exist
        const duplicateGen = seoData.find(s => s.page_type === formData.page_type && !s.page_identifier);
        if (duplicateGen) {
          toast.error('SEO for this page type already exists. Edit the existing entry instead.');
          return;
        }
      }
    } else {
      // Editing: ensure we don't change to collide with another record
      if (formData.page_type === 'services' && formData.page_identifier) {
        const conflict = seoData.find(s => s.page_type === 'services' && s.page_identifier === formData.page_identifier && s.id !== selectedSEO.id);
        if (conflict) {
          toast.error('Another SEO entry already exists for that service. Please choose a different service or edit the existing entry.');
          return;
        }
      }
      if (!formData.page_identifier) {
        const conflictGen = seoData.find(s => s.page_type === formData.page_type && !s.page_identifier && s.id !== selectedSEO.id);
        if (conflictGen) {
          toast.error('Another general SEO entry already exists for this page type.');
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const response = selectedSEO
        ? await seoService.updateSEOData(selectedSEO.id, formData)
        : await seoService.createSEOData(formData);

      if (response?.success) {
        toast.success(selectedSEO ? 'SEO data updated successfully' : 'SEO data created successfully');
        setIsDialogOpen(false);
        await fetchSEOData();
      } else {
        throw new Error(response?.message || 'Failed to save SEO data');
      }
    } catch (error: any) {
      console.error('SEO data save failed', error);
      toast.error(error?.message || 'Failed to save SEO data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const response = await seoService.deleteSEOData(id);
      if (response?.success) {
        toast.success('SEO data deleted successfully');
        await fetchSEOData();
      } else {
        throw new Error(response?.message || 'Failed to delete SEO data');
      }
    } catch (error: any) {
      console.error('SEO data delete failed', error);
      toast.error(error?.message || 'Failed to delete SEO data');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSEOData = seoData.filter((seo) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      seo.title.toLowerCase().includes(searchLower) ||
      seo.page_type.toLowerCase().includes(searchLower) ||
      (seo.page_identifier && seo.page_identifier.toLowerCase().includes(searchLower))
    );
  });

  const generalPagesSEO = filteredSEOData.filter(seo => !seo.page_identifier);
  const servicesSEO = filteredSEOData.filter(seo => seo.page_identifier);

  const getPageTypeName = (pageType: string, pageIdentifier?: string) => {
    if (pageIdentifier) {
      const service = services.find(s => s.slug === pageIdentifier);
      return `${pageType.charAt(0).toUpperCase()}${pageType.slice(1)}: ${service?.title || pageIdentifier}`;
    }
    const pageTypeConfig = PAGE_TYPES.find(p => p.value === pageType);
    return pageTypeConfig?.label || pageType;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1B1B]">SEO Management</h1>
          <p className="text-[#9B8B7E] mt-1">Manage SEO metadata for all pages</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-[#D4AF77] hover:bg-[#C9A58D] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add SEO Data
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B8B7E]" />
          <Input
            placeholder="Search SEO data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-[#E6D4C3] focus:border-[#D4AF77]"
          />
        </div>
        <Button variant="outline" onClick={fetchSEOData} disabled={isLoading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <AdminCard>
        <CardHeader>
          <CardTitle className="text-[#2D1B1B] flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SEO Data
          </CardTitle>
          <CardDescription className="text-[#9B8B7E]">
            Manage meta tags, descriptions, and Open Graph data for all pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General Pages</TabsTrigger>
              <TabsTrigger value="services">Individual Services</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF77]" />
                </div>
              ) : (
                <Table>
                  <AdminTableHeader>
                    <AdminTableRowHeader>
                      <TableHead className="text-[#2D1B1B] font-medium">Page</TableHead>
                      <TableHead className="text-[#2D1B1B] font-medium">Title</TableHead>
                      <TableHead className="text-[#2D1B1B] font-medium">Description Preview</TableHead>
                      <TableHead className="text-[#2D1B1B] font-medium">Keywords</TableHead>
                      <TableHead className="text-[#2D1B1B] font-medium text-right">Actions</TableHead>
                    </AdminTableRowHeader>
                  </AdminTableHeader>
                  <TableBody>
                    {generalPagesSEO.map((seo) => (
                      <AdminTableRow key={seo.id}>
                        <TableCell>
                          <AdminBadgeSecondary>
                            {getPageTypeName(seo.page_type)}
                          </AdminBadgeSecondary>
                        </TableCell>
                        <TableCell className="font-medium text-[#2D1B1B] max-w-[200px]">
                          <div className="truncate" title={seo.title}>
                            {seo.title}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#9B8B7E] max-w-[300px]">
                          <div className="truncate" title={seo.description}>
                            {seo.description.length > 80 ? `${seo.description.substring(0, 80)}...` : seo.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#9B8B7E] max-w-[150px]">
                          <div className="truncate" title={seo.keywords}>
                            {seo.keywords}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(seo)}
                              className="text-[#D4AF77] hover:bg-[#FFF8F3] hover:text-[#C9A58D]"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(seo.id)}
                              disabled={deletingId === seo.id}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              {deletingId === seo.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </AdminTableRow>
                    ))}
                    {generalPagesSEO.length === 0 && (
                      <AdminTableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-[#9B8B7E]">
                          No SEO data found for general pages
                        </TableCell>
                      </AdminTableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="services">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF77]" />
                </div>
              ) : (
                <Table>
                  <AdminTableHeader>
                    <AdminTableRowHeader>
                      <TableHead className="text-[#2D1B1B] font-medium">Service</TableHead>
                      <TableHead className="text-[#2D1B1B] font-medium">Title</TableHead>
                      <TableHead className="text-[#2D1B1B] font-medium">Description Preview</TableHead>
                      <TableHead className="text-[#2D1B1B] font-medium">Keywords</TableHead>
                      <TableHead className="text-[#2D1B1B] font-medium text-right">Actions</TableHead>
                    </AdminTableRowHeader>
                  </AdminTableHeader>
                  <TableBody>
                    {servicesSEO.map((seo) => (
                      <AdminTableRow key={seo.id}>
                        <TableCell>
                          <AdminBadgeSecondary>
                            {getPageTypeName(seo.page_type, seo.page_identifier)}
                          </AdminBadgeSecondary>
                        </TableCell>
                        <TableCell className="font-medium text-[#2D1B1B] max-w-[200px]">
                          <div className="truncate" title={seo.title}>
                            {seo.title}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#9B8B7E] max-w-[300px]">
                          <div className="truncate" title={seo.description}>
                            {seo.description.length > 80 ? `${seo.description.substring(0, 80)}...` : seo.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#9B8B7E] max-w-[150px]">
                          <div className="truncate" title={seo.keywords}>
                            {seo.keywords}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(seo)}
                              className="text-[#D4AF77] hover:bg-[#FFF8F3] hover:text-[#C9A58D]"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(seo.id)}
                              disabled={deletingId === seo.id}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              {deletingId === seo.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </AdminTableRow>
                    ))}
                    {servicesSEO.length === 0 && (
                      <AdminTableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-[#9B8B7E]">
                          No SEO data found for services
                        </TableCell>
                      </AdminTableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </AdminCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AdminDialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#2D1B1B]">
              {selectedSEO ? 'Edit SEO Data' : 'Create SEO Data'}
            </DialogTitle>
            <DialogDescription className="text-[#9B8B7E]">
              Configure meta tags and Open Graph data for better search engine optimization
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="page_type" className="text-[#2D1B1B] font-medium">Page Type</Label>
                <select
                  id="page_type"
                  title="Select page type"
                  value={formData.page_type}
                  onChange={(e) => setFormData({ ...formData, page_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[#E6D4C3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF77] focus:border-[#D4AF77] text-[#2D1B1B] bg-white"
                  required
                >
                  {PAGE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              {formData.page_type === 'services' && (
                <div className="space-y-2">
                  <Label htmlFor="page_identifier" className="text-[#2D1B1B] font-medium">Service (Optional)</Label>
                  <select
                    id="page_identifier"
                    title="Select specific service"
                    value={formData.page_identifier || ''}
                    onChange={(e) => setFormData({ ...formData, page_identifier: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-[#E6D4C3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF77] focus:border-[#D4AF77] text-[#2D1B1B] bg-white"
                  >
                    <option value="">General Services Page</option>
                    {services.map(service => (
                      <option key={service.id} value={service.slug}>{service.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#2D1B1B] font-medium">Page Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter page title (recommended: 50-60 characters)"
                className="border-[#E6D4C3] focus:border-[#D4AF77]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#2D1B1B] font-medium">Meta Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter meta description (recommended: 150-160 characters)"
                rows={3}
                className="border-[#E6D4C3] focus:border-[#D4AF77] resize-none"
                required
              />
              <p className="text-xs text-[#9B8B7E]">
                {formData.description.length}/160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-[#2D1B1B] font-medium">Keywords</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Enter keywords separated by commas"
                className="border-[#E6D4C3] focus:border-[#D4AF77]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_title" className="text-[#2D1B1B] font-medium">Open Graph Title</Label>
              <Input
                id="og_title"
                value={formData.og_title}
                onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                placeholder="Title for social media sharing (defaults to page title)"
                className="border-[#E6D4C3] focus:border-[#D4AF77]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_description" className="text-[#2D1B1B] font-medium">Open Graph Description</Label>
              <Textarea
                id="og_description"
                value={formData.og_description}
                onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                placeholder="Description for social media sharing (defaults to meta description)"
                rows={2}
                className="border-[#E6D4C3] focus:border-[#D4AF77] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2D1B1B] font-medium">Open Graph Image</Label>
              <ImageUploadField
                label="Open Graph Image"
                description="Upload an image for social media sharing (recommended: 1200x630px)"
                value={typeof formData.og_image === 'string' ? formData.og_image : undefined}
                onChange={(file) => setFormData({ ...formData, og_image: file })}
                accept="image/*"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#E6D4C3] text-[#2D1B1B] hover:bg-[#FFF8F3]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#D4AF77] hover:bg-[#C9A58D] text-white"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {selectedSEO ? 'Update' : 'Create'} SEO Data
              </Button>
            </DialogFooter>
          </form>
        </AdminDialogContent>
      </Dialog>
    </div>
  );
}