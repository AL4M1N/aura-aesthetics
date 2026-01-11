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
import { AdminDialogContent } from '../../components/ui/admin';
import { ImageUploadField } from '../../components/ImageUploadField';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { pagesService } from '../../../services/pagesService';
import type { 
  AboutHero, AboutHeroPayload,
  AboutBio, AboutBioPayload,
  AboutQualification, AboutQualificationPayload,
  AboutValue, AboutValuePayload,
  AboutCertificate, AboutCertificatePayload
} from '../../../lib/types';
import { resolveCmsAssetUrl } from '../../../lib/asset';

const tabs = [
  { label: 'Hero', value: 'hero' },
  { label: 'Bio', value: 'bio' },
  { label: 'Qualifications', value: 'qualifications' },
  { label: 'Values', value: 'values' },
  { label: 'Certificates', value: 'certificates' },
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

// Initial states (similar to HomePages.tsx structure)
const buildEmptyQualification = (sortOrder = 1): AboutQualificationPayload => ({
  icon: 'award',
  title: '',
  description: '',
  sort_order: sortOrder,
  is_active: true,
});

const buildEmptyValue = (sortOrder = 1): AboutValuePayload => ({
  icon: 'heart',
  title: '',
  description: '',
  sort_order: sortOrder,
  is_active: true,
});

const buildEmptyCertificate = (sortOrder = 1): AboutCertificatePayload => ({
  title: '',
  issuer: '',
  issue_date: '',
  image_url: undefined,
  description: '',
  sort_order: sortOrder,
  is_active: true,
});

export function AboutPages() {
  const [activeTab, setActiveTab] = useState('hero');

  // Hero State
  const [aboutHero, setAboutHero] = useState<AboutHero | null>(null);
  const [isHeroLoading, setIsHeroLoading] = useState(false);
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [heroFormData, setHeroFormData] = useState<AboutHeroPayload>({
    kicker_text: '',
    headline_primary: '',
    headline_highlight: '',
    description: '',
    background_image: undefined,
    is_active: true,
  });

  // Bio State
  const [aboutBio, setAboutBio] = useState<AboutBio | null>(null);
  const [isBioLoading, setIsBioLoading] = useState(false);
  const [isBioSaving, setIsBioSaving] = useState(false);
  const [bioFormData, setBioFormData] = useState<AboutBioPayload>({
    title: '',
    content: '',
    image_url: '',
    badge_icon: 'award',
    badge_title: '',
    badge_subtitle: '',
    is_active: true,
  });

  // Qualifications State
  const [qualifications, setQualifications] = useState<AboutQualification[]>([]);
  const [isQualLoading, setIsQualLoading] = useState(false);
  const [isQualDialogOpen, setIsQualDialogOpen] = useState(false);
  const [qualFormData, setQualFormData] = useState<AboutQualificationPayload>(buildEmptyQualification());
  const [selectedQual, setSelectedQual] = useState<AboutQualification | null>(null);
  const [isQualSubmitting, setIsQualSubmitting] = useState(false);
  const [qualDeletingId, setQualDeletingId] = useState<number | null>(null);

  // Values State
  const [values, setValues] = useState<AboutValue[]>([]);
  const [isValuesLoading, setIsValuesLoading] = useState(false);
  const [isValuesDialogOpen, setIsValuesDialogOpen] = useState(false);
  const [valueFormData, setValueFormData] = useState<AboutValuePayload>(buildEmptyValue());
  const [selectedValue, setSelectedValue] = useState<AboutValue | null>(null);
  const [isValuesSubmitting, setIsValuesSubmitting] = useState(false);
  const [valueDeletingId, setValueDeletingId] = useState<number | null>(null);

  // certificates State
  const [certificates, setCertificates] = useState<AboutCertificate[]>([]);
  const [isCertLoading, setIsCertLoading] = useState(false);
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);
  const [certFormData, setCertFormData] = useState<AboutCertificatePayload>(buildEmptyCertificate());
  const [selectedCert, setSelectedCert] = useState<AboutCertificate | null>(null);
  const [isCertSubmitting, setIsCertSubmitting] = useState(false);
  const [certDeletingId, setCertDeletingId] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // Data Fetching
  // ------------------------------------------------------------------

  const fetchHero = useCallback(async () => {
    setIsHeroLoading(true);
    try {
      const response = await pagesService.getAboutHero();
      if (response.success && response.data.hero) {
        setAboutHero(response.data.hero);
        setHeroFormData({
          kicker_text: response.data.hero.kicker_text,
          headline_primary: response.data.hero.headline_primary,
          headline_highlight: response.data.hero.headline_highlight,
          description: response.data.hero.description,
          background_image: response.data.hero.background_image,
          is_active: response.data.hero.is_active,
        });
      }
    } catch (error) {
      console.error('Failed to fetch About Hero:', error);
      toast.error('Failed to load Hero section');
    } finally {
      setIsHeroLoading(false);
    }
  }, []);

  const fetchBio = useCallback(async () => {
    setIsBioLoading(true);
    try {
      const response = await pagesService.getAboutBio();
      if (response.success && response.data.bio) {
        setAboutBio(response.data.bio);
        setBioFormData({
          title: response.data.bio.title,
          content: response.data.bio.content,
          image_url: response.data.bio.image_url,
          badge_icon: response.data.bio.badge_icon,
          badge_title: response.data.bio.badge_title,
          badge_subtitle: response.data.bio.badge_subtitle,
          is_active: response.data.bio.is_active,
        });
      }
    } catch (error) {
      console.error('Failed to fetch About Bio:', error);
      toast.error('Failed to load Bio section');
    } finally {
      setIsBioLoading(false);
    }
  }, []);

  const fetchQualifications = useCallback(async () => {
    setIsQualLoading(true);
    try {
      const response = await pagesService.getAboutQualifications();
      if (response.success && Array.isArray(response.data)) {
        setQualifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Qualifications:', error);
      toast.error('Failed to load Qualifications');
    } finally {
      setIsQualLoading(false);
    }
  }, []);

  const fetchValues = useCallback(async () => {
    setIsValuesLoading(true);
    try {
      const response = await pagesService.getAboutValues();
      if (response.success && Array.isArray(response.data)) {
        setValues(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Values:', error);
      toast.error('Failed to load Values');
    } finally {
      setIsValuesLoading(false);
    }
  }, []);

  const fetchCertificates = useCallback(async () => {
    setIsCertLoading(true);
    try {
      const response = await pagesService.getAboutCertificates();
      if (response.success && Array.isArray(response.data)) {
        setCertificates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Certificates:', error);
      toast.error('Failed to load Certificates');
    } finally {
      setIsCertLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHero();
    void fetchBio();
    void fetchQualifications();
    void fetchValues();
    void fetchCertificates();
  }, [fetchHero, fetchBio, fetchQualifications, fetchValues, fetchCertificates]);

  // ------------------------------------------------------------------
  // Handlers - Hero
  // ------------------------------------------------------------------
  const handleHeroSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsHeroSaving(true);
    try {
      const response = await pagesService.updateAboutHero(heroFormData);
      if (response.success && response.data.hero) {
        setAboutHero(response.data.hero);
        toast.success('Hero section updated successfully');
      }
    } catch (error) {
      console.error('Update hero failed:', error);
      toast.error('Failed to update Hero section');
    } finally {
      setIsHeroSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // Handlers - Bio
  // ------------------------------------------------------------------
  const handleBioSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsBioSaving(true);
    try {
      const response = await pagesService.updateAboutBio(bioFormData);
      if (response.success && response.data.bio) {
        setAboutBio(response.data.bio);
        toast.success('Bio section updated successfully');
      }
    } catch (error) {
      console.error('Update bio failed:', error);
      toast.error('Failed to update Bio section');
    } finally {
      setIsBioSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // Handlers - Qualifications
  // ------------------------------------------------------------------
  const handleEditQual = (qual: AboutQualification) => {
    setSelectedQual(qual);
    setQualFormData({
      icon: qual.icon,
      title: qual.title,
      description: qual.description,
      sort_order: qual.sort_order,
      is_active: qual.is_active,
    });
    setIsQualDialogOpen(true);
  };

  const handleCreateQual = () => {
    setSelectedQual(null);
    const maxOrder = Math.max(...qualifications.map(q => q.sort_order), 0);
    setQualFormData(buildEmptyQualification(maxOrder + 1));
    setIsQualDialogOpen(true);
  };

  const handleQualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsQualSubmitting(true);
    try {
      if (selectedQual) {
        await pagesService.updateAboutQualification(selectedQual.id, qualFormData);
        toast.success('Qualification updated');
      } else {
        await pagesService.createAboutQualification(qualFormData);
        toast.success('Qualification created');
      }
      setIsQualDialogOpen(false);
      void fetchQualifications();
    } catch (error) {
      console.error('Qualification save failed:', error);
      toast.error('Failed to save qualification');
    } finally {
      setIsQualSubmitting(false);
    }
  };

  const handleDeleteQual = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this qualification?')) return;
    setQualDeletingId(id);
    try {
      await pagesService.deleteAboutQualification(id);
      toast.success('Qualification deleted');
      setQualifications(qualifications.filter(q => q.id !== id));
    } catch (error) {
      console.error('Delete qualification failed:', error);
      toast.error('Failed to delete qualification');
    } finally {
      setQualDeletingId(null);
    }
  };

  // ------------------------------------------------------------------
  // Handlers - Values
  // ------------------------------------------------------------------
  const handleEditValue = (val: AboutValue) => {
    setSelectedValue(val);
    setValueFormData({
      icon: val.icon,
      title: val.title,
      description: val.description,
      sort_order: val.sort_order,
      is_active: val.is_active,
    });
    setIsValuesDialogOpen(true);
  };

  const handleCreateValue = () => {
    setSelectedValue(null);
    const maxOrder = Math.max(...values.map(v => v.sort_order), 0);
    setValueFormData(buildEmptyValue(maxOrder + 1));
    setIsValuesDialogOpen(true);
  };

  const handleValueSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsValuesSubmitting(true);
    try {
      if (selectedValue) {
        await pagesService.updateAboutValue(selectedValue.id, valueFormData);
        toast.success('Value updated');
      } else {
        await pagesService.createAboutValue(valueFormData);
        toast.success('Value created');
      }
      setIsValuesDialogOpen(false);
      void fetchValues();
    } catch (error) {
      console.error('Value save failed:', error);
      toast.error('Failed to save value');
    } finally {
      setIsValuesSubmitting(false);
    }
  };

  const handleDeleteValue = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this value?')) return;
    setValueDeletingId(id);
    try {
      await pagesService.deleteAboutValue(id);
      toast.success('Value deleted');
      setValues(values.filter(v => v.id !== id));
    } catch (error) {
      console.error('Delete value failed:', error);
      toast.error('Failed to delete value');
    } finally {
      setValueDeletingId(null);
    }
  };

  // ------------------------------------------------------------------
  // Handlers - Certificates
  // ------------------------------------------------------------------
  const handleEditCert = (cert: AboutCertificate) => {
    setSelectedCert(cert);
    setCertFormData({
      title: cert.title,
      issuer: cert.issuer,
      issue_date: cert.issue_date,
      image_url: cert.image_url,
      description: cert.description,
      sort_order: cert.sort_order,
      is_active: cert.is_active,
    });
    setIsCertDialogOpen(true);
  };

  const handleCreateCert = () => {
    setSelectedCert(null);
    const maxOrder = Math.max(...certificates.map(c => c.sort_order), 0);
    setCertFormData(buildEmptyCertificate(maxOrder + 1));
    setIsCertDialogOpen(true);
  };

  const handleCertSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsCertSubmitting(true);
    try {
      if (selectedCert) {
        await pagesService.updateAboutCertificate(selectedCert.id, certFormData);
        toast.success('Certificate updated');
      } else {
        await pagesService.createAboutCertificate(certFormData);
        toast.success('Certificate created');
      }
      setIsCertDialogOpen(false);
      void fetchCertificates();
    } catch (error) {
      console.error('Certificate save failed:', error);
      toast.error('Failed to save certificate');
    } finally {
      setIsCertSubmitting(false);
    }
  };

  const handleDeleteCert = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    setCertDeletingId(id);
    try {
      await pagesService.deleteAboutCertificate(id);
      toast.success('Certificate deleted');
      setCertificates(certificates.filter(c => c.id !== id));
    } catch (error) {
      console.error('Delete certificate failed:', error);
      toast.error('Failed to delete certificate');
    } finally {
      setCertDeletingId(null);
    }
  };

  // ------------------------------------------------------------------
  // Renders
  // ------------------------------------------------------------------

  return (
    <div className="space-y-6 [&_input]:!text-[#2D1B1B] [&_textarea]:!text-[#2D1B1B] [&_select]:!text-[#2D1B1B] [&_td]:!text-[#2D1B1B] [&_th]:!text-[#2D1B1B] dark:[&_input]:!text-[#2D1B1B] dark:[&_textarea]:!text-[#2D1B1B] dark:[&_select]:!text-[#2D1B1B] dark:[&_td]:!text-[#2D1B1B] dark:[&_th]:!text-[#2D1B1B]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#2D1B1B]">About Page</h2>
          <p className="text-[#856B5A]">Manage your About page content and sections.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap justify-center gap-2 bg-[#FFF8F3] p-2 rounded-xl border border-[#E6D4C3]">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-[#D4AF77] data-[state=active]:text-white text-[#856B5A] data-[state=inactive]:text-[#856B5A]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ================= HERO TAB ================= */}
        <TabsContent value="hero" className="space-y-4">
          <Card className="bg-white border-[#E6D4C3] shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#2D1B1B]">Hero Section</CardTitle>
              <CardDescription className="text-[#856B5A]">
                Customize the hero banner of the About page
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isHeroLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF77]" />
                </div>
              ) : (
                <form onSubmit={handleHeroSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="hero-kicker">Kicker Text</Label>
                        <Input
                          id="hero-kicker"
                          value={heroFormData.kicker_text}
                          onChange={(e) => setHeroFormData({ ...heroFormData, kicker_text: e.target.value })}
                          placeholder="About Me"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-primary">Headline Primary</Label>
                        <Input
                          id="hero-primary"
                          value={heroFormData.headline_primary}
                          onChange={(e) => setHeroFormData({ ...heroFormData, headline_primary: e.target.value })}
                          placeholder="Artistry Meets"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-highlight">Headline Highlight</Label>
                        <Input
                          id="hero-highlight"
                          value={heroFormData.headline_highlight}
                          onChange={(e) => setHeroFormData({ ...heroFormData, headline_highlight: e.target.value })}
                          placeholder="Medical Excellence"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-description">Description</Label>
                        <Textarea
                          id="hero-description"
                          value={heroFormData.description}
                          onChange={(e) => setHeroFormData({ ...heroFormData, description: e.target.value })}
                          placeholder="Dedicated to helping you feel confident..."
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label>Background Image (Optional)</Label>
                      <ImageUploadField
                        value={heroFormData.background_image || undefined}
                        onChange={(url) => setHeroFormData({ ...heroFormData, background_image: url })}
                        label="Hero Background"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hero-active"
                        checked={heroFormData.is_active}
                        onCheckedChange={(checked) => setHeroFormData({ ...heroFormData, is_active: checked })}
                      />
                      <Label htmlFor="hero-active">Active</Label>
                    </div>
                    <Button type="submit" disabled={isHeroSaving} className="bg-[#D4AF77] hover:bg-[#C9A581] text-white">
                      {isHeroSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= BIO TAB ================= */}
        <TabsContent value="bio" className="space-y-4">
          <Card className="bg-white border-[#E6D4C3] shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#2D1B1B]">Bio Section</CardTitle>
              <CardDescription className="text-[#856B5A]">
                The main "Your Journey to Confidence" section with image and biography
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isBioLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF77]" />
                </div>
              ) : (
                <form onSubmit={handleBioSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                       <div className="space-y-2">
                        <Label htmlFor="bio-title">Section Title</Label>
                        <Input
                          id="bio-title"
                          value={bioFormData.title}
                          onChange={(e) => setBioFormData({ ...bioFormData, title: e.target.value })}
                          placeholder="Your Journey to Confidence"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio-content">Biography Content</Label>
                        <Textarea
                          id="bio-content"
                          value={bioFormData.content}
                          onChange={(e) => setBioFormData({ ...bioFormData, content: e.target.value })}
                          rows={14}
                          required
                          placeholder="Write the complete biography here..."
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label>Practitioner Image</Label>
                      <ImageUploadField
                        value={bioFormData.image_url || undefined}
                        onChange={(url) => setBioFormData({ ...bioFormData, image_url: url || '' })}
                        label="Bio Image"
                      />
                      <div className="border border-[#E6D4C3] rounded-lg p-4 bg-[#FFF8F3] mt-4">
                        <h4 className="text-sm font-medium text-[#2D1B1B] mb-3">Badge Information</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="badge-icon">Icon</Label>
                            <select
                              id="badge-icon"
                              value={bioFormData.badge_icon}
                              onChange={(e) => setBioFormData({ ...bioFormData, badge_icon: e.target.value })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              title="Select badge icon"
                            >
                              {iconOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="badge-title">Badge Title</Label>
                            <Input
                              id="badge-title"
                              value={bioFormData.badge_title}
                              onChange={(e) => setBioFormData({ ...bioFormData, badge_title: e.target.value })}
                              placeholder="CPD Accredited"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="badge-subtitle">Badge Subtitle</Label>
                            <Input
                              id="badge-subtitle"
                              value={bioFormData.badge_subtitle}
                              onChange={(e) => setBioFormData({ ...bioFormData, badge_subtitle: e.target.value })}
                              placeholder="Trained by Rejuvenate"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="bio-active"
                        checked={bioFormData.is_active}
                        onCheckedChange={(checked) => setBioFormData({ ...bioFormData, is_active: checked })}
                      />
                      <Label htmlFor="bio-active">Active</Label>
                    </div>
                    <Button type="submit" disabled={isBioSaving} className="bg-[#D4AF77] hover:bg-[#C9A581] text-white">
                      {isBioSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= QUALIFICATIONS TAB ================= */}
        <TabsContent value="qualifications" className="space-y-4">
          <Card className="bg-white border-[#E6D4C3] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#2D1B1B]">Qualifications</CardTitle>
                <CardDescription className="text-[#856B5A]">
                  List professional qualifications and expertise highlights
                </CardDescription>
              </div>
              <Button onClick={handleCreateQual} className="bg-[#D4AF77] hover:bg-[#C9A581] text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Qualification
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-[#E6D4C3]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E6D4C3] hover:bg-[#FFF8F3]">
                      <TableHead className="w-[100px] text-[#2D1B1B]">Icon</TableHead>
                      <TableHead className="text-[#2D1B1B]">Title</TableHead>
                      <TableHead className="text-[#2D1B1B]">Description</TableHead>
                      <TableHead className="w-[100px] text-[#2D1B1B]">Order</TableHead>
                      <TableHead className="w-[100px] text-[#2D1B1B]">Status</TableHead>
                      <TableHead className="w-[100px] text-right text-[#2D1B1B]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isQualLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-[#D4AF77]">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : qualifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-[#856B5A]">
                          No qualifications added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      qualifications
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((qual) => {
                          const IconComp = getIconComponent(qual.icon);
                          return (
                            <TableRow key={qual.id} className="border-[#E6D4C3] hover:bg-[#FFF8F3]">
                              <TableCell>
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#FFF8F3] border border-[#E6D4C3]">
                                  <IconComp className="h-4 w-4 text-[#D4AF77]" />
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-[#2D1B1B]">{qual.title}</TableCell>
                              <TableCell className="max-w-xs truncate text-[#856B5A]">{qual.description}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-[#FFF8F3] text-[#856B5A] border-[#E6D4C3]">
                                  {qual.sort_order}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {qual.is_active ? (
                                  <Badge className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]">Active</Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-[#F5F5F5] text-[#757575]">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditQual(qual)}
                                    className="h-8 w-8 text-[#856B5A] hover:bg-[#FFF8F3] hover:text-[#D4AF77]"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteQual(qual.id)}
                                    disabled={qualDeletingId === qual.id}
                                    className="h-8 w-8 text-[#856B5A] hover:bg-[#FFF0F0] hover:text-red-600"
                                  >
                                    {qualDeletingId === qual.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= VALUES TAB ================= */}
        <TabsContent value="values" className="space-y-4">
          <Card className="bg-white border-[#E6D4C3] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#2D1B1B]">Core Values</CardTitle>
                <CardDescription className="text-[#856B5A]">
                  Define the core values and philosophy
                </CardDescription>
              </div>
              <Button onClick={handleCreateValue} className="bg-[#D4AF77] hover:bg-[#C9A581] text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Value
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-[#E6D4C3]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E6D4C3] hover:bg-[#FFF8F3]">
                      <TableHead className="w-[100px] text-[#2D1B1B]">Icon</TableHead>
                      <TableHead className="text-[#2D1B1B]">Title</TableHead>
                      <TableHead className="text-[#2D1B1B]">Description</TableHead>
                      <TableHead className="w-[100px] text-[#2D1B1B]">Order</TableHead>
                      <TableHead className="w-[100px] text-[#2D1B1B]">Status</TableHead>
                      <TableHead className="w-[100px] text-right text-[#2D1B1B]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isValuesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-[#D4AF77]">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : values.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-[#856B5A]">
                          No values added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      values
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((val) => {
                          const IconComp = getIconComponent(val.icon);
                          return (
                            <TableRow key={val.id} className="border-[#E6D4C3] hover:bg-[#FFF8F3]">
                              <TableCell>
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#FFF8F3] border border-[#E6D4C3]">
                                  <IconComp className="h-4 w-4 text-[#D4AF77]" />
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-[#2D1B1B]">{val.title}</TableCell>
                              <TableCell className="max-w-xs truncate text-[#856B5A]">{val.description}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-[#FFF8F3] text-[#856B5A] border-[#E6D4C3]">
                                  {val.sort_order}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {val.is_active ? (
                                  <Badge className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]">Active</Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-[#F5F5F5] text-[#757575]">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditValue(val)}
                                    className="h-8 w-8 text-[#856B5A] hover:bg-[#FFF8F3] hover:text-[#D4AF77]"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteValue(val.id)}
                                    disabled={valueDeletingId === val.id}
                                    className="h-8 w-8 text-[#856B5A] hover:bg-[#FFF0F0] hover:text-red-600"
                                  >
                                    {valueDeletingId === val.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= CERTIFICATES TAB ================= */}
        <TabsContent value="certificates" className="space-y-4">
          <Card className="bg-white border-[#E6D4C3] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#2D1B1B]">Certificates</CardTitle>
                <CardDescription className="text-[#856B5A]">
                  Manage licenses and certifications
                </CardDescription>
              </div>
              <Button onClick={handleCreateCert} className="bg-[#D4AF77] hover:bg-[#C9A581] text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Certificate
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-[#E6D4C3]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E6D4C3] hover:bg-[#FFF8F3]">
                      <TableHead className="w-[80px] text-[#2D1B1B]">Image</TableHead>
                      <TableHead className="text-[#2D1B1B]">Title</TableHead>
                      <TableHead className="text-[#2D1B1B]">Issuer</TableHead>
                      <TableHead className="text-[#2D1B1B]">Date</TableHead>
                      <TableHead className="w-[100px] text-[#2D1B1B]">Order</TableHead>
                      <TableHead className="w-[100px] text-[#2D1B1B]">Status</TableHead>
                      <TableHead className="w-[100px] text-right text-[#2D1B1B]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isCertLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-[#D4AF77]">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : certificates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-[#856B5A]">
                          No certificates added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      certificates
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((cert) => (
                          <TableRow key={cert.id} className="border-[#E6D4C3] hover:bg-[#FFF8F3]">
                            <TableCell>
                              {cert.image_url ? (
                                <img
                                  src={resolveCmsAssetUrl(cert.image_url)}
                                  alt={cert.title}
                                  className="h-10 w-16 object-cover rounded border border-[#E6D4C3]"
                                />
                              ) : (
                                <div className="h-10 w-16 bg-[#FFF8F3] rounded border border-[#E6D4C3] flex items-center justify-center">
                                  <Award className="h-5 w-5 text-[#E6D4C3]" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-[#2D1B1B]">{cert.title}</TableCell>
                            <TableCell className="text-[#856B5A]">{cert.issuer}</TableCell>
                            <TableCell className="text-[#856B5A]">{cert.issue_date || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-[#FFF8F3] text-[#856B5A] border-[#E6D4C3]">
                                {cert.sort_order}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {cert.is_active ? (
                                <Badge className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]">Active</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-[#F5F5F5] text-[#757575]">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditCert(cert)}
                                  className="h-8 w-8 text-[#856B5A] hover:bg-[#FFF8F3] hover:text-[#D4AF77]"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCert(cert.id)}
                                  disabled={certDeletingId === cert.id}
                                  className="h-8 w-8 text-[#856B5A] hover:bg-[#FFF0F0] hover:text-red-600"
                                >
                                  {certDeletingId === cert.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================= DIALOGS ================= */}
      
      {/* Qualification Dialog */}
      <Dialog open={isQualDialogOpen} onOpenChange={setIsQualDialogOpen}>
        <AdminDialogContent className="max-w-lg">
          <div className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#2D1B1B]">
                {selectedQual ? 'Edit Qualification' : 'Add Qualification'}
              </DialogTitle>
              <DialogDescription className="text-[#856B5A]">
                Enter qualification details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleQualSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="qual-title">Title *</Label>
                <Input
                  id="qual-title"
                  value={qualFormData.title}
                  onChange={(e) => setQualFormData({ ...qualFormData, title: e.target.value })}
                  className="text-[#2D1B1B]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qual-desc">Description *</Label>
                <Textarea
                  id="qual-desc"
                  value={qualFormData.description}
                  onChange={(e) => setQualFormData({ ...qualFormData, description: e.target.value })}
                  className="text-[#2D1B1B]"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qual-icon">Icon</Label>
                  <select
                    id="qual-icon"
                    value={qualFormData.icon}
                    onChange={(e) => setQualFormData({ ...qualFormData, icon: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-[#E6D4C3] bg-white px-3 py-2 text-sm text-[#2D1B1B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF77]"
                    title="Select qualification icon"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qual-order">Sort Order</Label>
                  <Input
                    id="qual-order"
                    type="number"
                    value={qualFormData.sort_order}
                    onChange={(e) => setQualFormData({ ...qualFormData, sort_order: parseInt(e.target.value) || 0 })}
                    className="text-[#2D1B1B]"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="qual-active"
                  checked={qualFormData.is_active}
                  onCheckedChange={(checked) => setQualFormData({ ...qualFormData, is_active: checked })}
                />
                <Label htmlFor="qual-active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsQualDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isQualSubmitting} className="bg-[#D4AF77] hover:bg-[#C9A581] text-white">
                  {isQualSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (selectedQual ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </AdminDialogContent>
      </Dialog>

      {/* Value Dialog (Similar to Qualification) */}
      <Dialog open={isValuesDialogOpen} onOpenChange={setIsValuesDialogOpen}>
        <AdminDialogContent className="max-w-lg">
          <div className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#2D1B1B]">
                {selectedValue ? 'Edit Value' : 'Add Value'}
              </DialogTitle>
              <DialogDescription className="text-[#856B5A]">
                Enter core value details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleValueSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="val-title">Title *</Label>
                <Input
                  id="val-title"
                  value={valueFormData.title}
                  onChange={(e) => setValueFormData({ ...valueFormData, title: e.target.value })}
                  className="text-[#2D1B1B]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="val-desc">Description *</Label>
                <Textarea
                  id="val-desc"
                  value={valueFormData.description}
                  onChange={(e) => setValueFormData({ ...valueFormData, description: e.target.value })}
                  className="text-[#2D1B1B]"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="val-icon">Icon</Label>
                  <select
                    id="val-icon"
                    value={valueFormData.icon}
                    onChange={(e) => setValueFormData({ ...valueFormData, icon: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-[#E6D4C3] bg-white px-3 py-2 text-sm text-[#2D1B1B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF77]"
                    title="Select value icon"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="val-order">Sort Order</Label>
                  <Input
                    id="val-order"
                    type="number"
                    value={valueFormData.sort_order}
                    onChange={(e) => setValueFormData({ ...valueFormData, sort_order: parseInt(e.target.value) || 0 })}
                    className="text-[#2D1B1B]"
                  />
                </div>
              </div>
               <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="val-active"
                  checked={valueFormData.is_active}
                  onCheckedChange={(checked) => setValueFormData({ ...valueFormData, is_active: checked })}
                />
                <Label htmlFor="val-active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsValuesDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isValuesSubmitting} className="bg-[#D4AF77] hover:bg-[#C9A581] text-white">
                  {isValuesSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (selectedValue ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </AdminDialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
        <AdminDialogContent className="max-w-lg">
          <div className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#2D1B1B]">
                {selectedCert ? 'Edit Certificate' : 'Add Certificate'}
              </DialogTitle>
              <DialogDescription className="text-[#856B5A]">
                Enter certificate details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCertSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cert-title">Title *</Label>
                <Input
                  id="cert-title"
                  value={certFormData.title}
                  onChange={(e) => setCertFormData({ ...certFormData, title: e.target.value })}
                  placeholder="Certificate Name"
                  className="text-[#2D1B1B]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-issuer">Issuer *</Label>
                <Input
                  id="cert-issuer"
                  value={certFormData.issuer}
                  onChange={(e) => setCertFormData({ ...certFormData, issuer: e.target.value })}
                  placeholder="Issuing Organization"
                  className="text-[#2D1B1B]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="cert-date">Issue Date</Label>
                  <Input
                    id="cert-date"
                    value={certFormData.issue_date || ''}
                    onChange={(e) => setCertFormData({ ...certFormData, issue_date: e.target.value })}
                    placeholder="e.g. 2023"
                    className="text-[#2D1B1B]"
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="cert-order">Sort Order</Label>
                  <Input
                    id="cert-order"
                    type="number"
                    value={certFormData.sort_order}
                    onChange={(e) => setCertFormData({ ...certFormData, sort_order: parseInt(e.target.value) || 0 })}
                    className="text-[#2D1B1B]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Certificate Image</Label>
                <ImageUploadField
                   value={certFormData.image_url || undefined}
                   onChange={(url) => setCertFormData({ ...certFormData, image_url: url })}
                   label="Certificate Image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-desc">Description</Label>
                <Textarea
                  id="cert-desc"
                  value={certFormData.description || ''}
                  onChange={(e) => setCertFormData({ ...certFormData, description: e.target.value })}
                  className="text-[#2D1B1B]"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="cert-active"
                  checked={certFormData.is_active}
                  onCheckedChange={(checked) => setCertFormData({ ...certFormData, is_active: checked })}
                />
                <Label htmlFor="cert-active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCertDialogOpen(false)}>
                  Cancel
                </Button>
                 <Button type="submit" disabled={isCertSubmitting} className="bg-[#D4AF77] hover:bg-[#C9A581] text-white">
                  {isCertSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (selectedCert ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </AdminDialogContent>
      </Dialog>
    </div>
  );
}
