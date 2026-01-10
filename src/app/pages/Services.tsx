import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Info, ArrowRight, Check, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'motion/react';
import { serviceCategoriesService } from '../../services/serviceCategoriesService';
import { servicesService } from '../../services/servicesService';
import { serviceInstructionsService } from '../../services/serviceInstructionsService';
import { resolveCmsAssetUrl } from '../../lib/asset';
import type { ServiceCategory, ServiceInstruction, Service } from '../../lib/types';
import { usePersistentCache } from '../../hooks/usePersistentCache';
import { ServicesSkeleton } from '../components/skeletons/PageSkeletons';

interface ServicesContentPayload {
  categories: ServiceCategory[];
  services: Service[];
  instructions: ServiceInstruction[];
}

const EMPTY_SERVICES_CONTENT: ServicesContentPayload = {
  categories: [],
  services: [],
  instructions: [],
};

const extractArrayPayload = <T,>(payload: unknown, nestedKeys: string[] = []): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    // Try nested keys first
    for (const key of nestedKeys) {
      const nestedValue = (payload as Record<string, unknown>)[key];
      if (Array.isArray(nestedValue)) {
        return nestedValue as T[];
      }
    }

    // Try common data fields
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) {
      return record.data as T[];
    }
    if (Array.isArray(record.items)) {
      return record.items as T[];
    }
    if (Array.isArray(record.results)) {
      return record.results as T[];
    }
  }

  return [];
};

const buildCategories = (data: ServiceCategory[] | undefined) =>
  (data ?? [])
    // Public API already returns only active categories, and payload
    // may not include an explicit is_active flag. Treat undefined as active.
    .filter((category) => category.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

const buildServicesList = (data: Service[] | undefined) =>
  (data ?? [])
    // Treat missing is_active as active for public endpoints
    .filter((service) => service.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((service) => {
      const baseCategoryId = service.category_id ?? service.category?.id ?? null;
      let normalizedCategoryId: number | null = baseCategoryId ?? null;

      if (typeof baseCategoryId === 'string') {
        const parsed = Number.parseInt(baseCategoryId, 10);
        normalizedCategoryId = Number.isNaN(parsed) ? null : parsed;
      }

      return {
        ...service,
        category_id: normalizedCategoryId,
        featured_image: service.featured_image ? resolveCmsAssetUrl(service.featured_image) ?? service.featured_image : null,
      };
    });

const buildInstructions = (data: ServiceInstruction[] | undefined) =>
  (data ?? []).filter((instruction) => instruction.is_active !== false);

const fetchServicesContent = async (): Promise<ServicesContentPayload> => {
  const [categoriesRes, servicesRes, instructionsRes] = await Promise.allSettled([
    serviceCategoriesService.getPublicServiceCategories(),
    servicesService.getPublicServices(),
    serviceInstructionsService.getPublicServiceInstructions(),
  ]);

  // Extract categories
  let categoryPayload: ServiceCategory[] = [];
  if (categoriesRes.status === 'fulfilled') {
    if (categoriesRes.value?.success) {
      categoryPayload = extractArrayPayload<ServiceCategory>(categoriesRes.value.data as unknown, ['categories']);
    }
  } else {
    console.error('Failed to fetch categories:', categoriesRes.reason);
  }

  // Extract services
  let servicePayload: Service[] = [];
  if (servicesRes.status === 'fulfilled') {
    if (servicesRes.value?.success) {
      servicePayload = extractArrayPayload<Service>(servicesRes.value.data as unknown, ['services']);
    }
  } else {
    console.error('Failed to fetch services:', servicesRes.reason);
  }

  // Extract instructions
  let instructionPayload: ServiceInstruction[] = [];
  if (instructionsRes.status === 'fulfilled') {
    if (instructionsRes.value?.success) {
      instructionPayload = extractArrayPayload<ServiceInstruction>(instructionsRes.value.data as unknown, ['instructions']);
    }
  } else {
    console.error('Failed to fetch instructions:', instructionsRes.reason);
  }

  const categories = buildCategories(categoryPayload);
  const services = buildServicesList(servicePayload);
  const instructions = buildInstructions(instructionPayload);

  return {
    categories,
    services,
    instructions,
  } satisfies ServicesContentPayload;
};

export function Services() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: servicesContent, loading } = usePersistentCache<ServicesContentPayload>('services-page-content', fetchServicesContent, {
    fallbackData: EMPTY_SERVICES_CONTENT,
    ttl: 5 * 60 * 1000,
  });

  const categories = useMemo(() => servicesContent?.categories ?? [], [servicesContent]);
  const services = useMemo(() => servicesContent?.services ?? [], [servicesContent]);
  const instructions = useMemo(() => servicesContent?.instructions ?? [], [servicesContent]);

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return sessionStorage.getItem('services-active-tab') ?? '';
  });
  const hasAppliedNavState = useRef(false);
  const hasInitializedFromCategories = useRef(false);

  // Debug logging
  useEffect(() => {
    console.log('Services Page Data:', {
      categories: categories.length,
      services: services.length,
      instructions: instructions.length,
      activeCategory,
      loading,
    });
  }, [categories, services, instructions, activeCategory, loading]);

  // Log per-category service counts to help debug mapping issues
  useEffect(() => {
    if (!categories.length) return;
    const counts = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      matchedServices: services.filter((s) => {
        if (s.category_id != null) return s.category_id === cat.id;
        if (s.category?.id) return s.category.id === cat.id;
        if (s.category?.slug) return s.category.slug === cat.slug;
        return false;
      }).length,
    }));
    console.log('Services per category:', counts);
  }, [categories, services]);

  useEffect(() => {
    const navState = (location.state as { activeCategory?: string } | null) ?? null;
    if (navState?.activeCategory && !hasAppliedNavState.current) {
      setActiveCategory(navState.activeCategory);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('services-active-tab', navState.activeCategory);
      }
      hasAppliedNavState.current = true;
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!activeCategory) {
      return;
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('services-active-tab', activeCategory);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (!categories.length || hasInitializedFromCategories.current) {
      return;
    }

    const storedTab = sessionStorage.getItem('services-active-tab');
    if (storedTab) {
      const hasMatch = categories.some((category) => category.slug === storedTab);
      if (hasMatch) {
        setActiveCategory(storedTab);
        hasInitializedFromCategories.current = true;
        return;
      }
    }

    setActiveCategory(categories[0].slug);
    hasInitializedFromCategories.current = true;
  }, [categories]);

  const hasCachedData = categories.length > 0 || services.length > 0 || instructions.length > 0;
  if (loading && !hasCachedData) {
    return <ServicesSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[var(--aura-cream)]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white/50 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="font-['Inter'] text-xs tracking-[0.3em] uppercase text-[var(--aura-rose-gold)] mb-4 block">
              Our Treatments
            </span>
            <h1 className="font-['Cormorant_Garamond'] text-6xl lg:text-7xl font-light text-[var(--aura-deep-brown)] mb-6">
              Services & Investment
            </h1>
            <p className="font-['Inter'] text-xl text-[var(--aura-soft-taupe)] leading-relaxed">
              Transparent pricing for premium aesthetic treatments. Every journey begins with a personalized consultation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Tabs */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          {categories.length === 0 && !loading ? (
            <div className="text-center py-20">
              <p className="text-xl text-[var(--aura-soft-taupe)] mb-8">
                No service categories available at the moment.
              </p>
              <Link
                to="/booking"
                className="inline-block px-12 py-5 bg-[var(--aura-deep-brown)] text-white font-['Inter'] text-sm tracking-wider hover:bg-[var(--aura-rose-gold)] transition-colors duration-300"
              >
                Book Consultation
              </Link>
            </div>
          ) : categories.length > 0 ? (
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <div className="overflow-x-hidden">
                <TabsList 
                  className="grid w-full gap-0 h-auto bg-transparent border border-[var(--aura-rose-gold)]/20 p-0 mb-16"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
                >
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.slug}
                    className="font-['Inter'] text-sm tracking-wider py-5 data-[state=active]:bg-[var(--aura-deep-brown)] data-[state=active]:text-white transition-all duration-300 rounded-none border-r border-[var(--aura-rose-gold)]/20 last:border-r-0"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
                <TabsTrigger
                  value="consultation"
                  className="font-['Inter'] text-sm tracking-wider py-5 data-[state=active]:bg-[var(--aura-deep-brown)] data-[state=active]:text-white transition-all duration-300 rounded-none"
                >
                  Consultation
                </TabsTrigger>
              </TabsList>
              </div>

              {/* Category Services */}
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.slug} className="mt-0">
                  <ServiceCategoryContent
                    services={services.filter((service) => {
                      if (service.category_id != null) {
                        return service.category_id === category.id;
                      }

                      if (service.category?.id) {
                        return service.category.id === category.id;
                      }

                      if (service.category?.slug) {
                        return service.category.slug === category.slug;
                      }

                      return false;
                    })}
                    activeCategory={category.slug}
                  />
                </TabsContent>
              ))}

              {/* Consultation Tab */}
              <TabsContent value="consultation" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-3xl mx-auto text-center bg-white border-2 border-[var(--aura-rose-gold)]/20 p-16"
                >
                  <Calendar className="w-16 h-16 text-[var(--aura-rose-gold)] mx-auto mb-8" />
                  <h3 className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-deep-brown)] mb-6">
                    Personalized Consultation
                  </h3>
                  <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] mb-8 leading-relaxed">
                    Every aesthetic journey begins with understanding your unique goals. 
                    During your consultation, we'll discuss your concerns, assess suitability, 
                    and create a customized treatment plan.
                  </p>
                  <Link
                    to="/booking"
                    className="inline-block px-12 py-5 bg-[var(--aura-deep-brown)] text-white font-['Inter'] text-sm tracking-wider hover:bg-[var(--aura-rose-gold)] transition-colors duration-300"
                  >
                  </Link>
                </motion.div>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </section>

      {/* Service Instructions */}
      {instructions.length > 0 && (
        <section className="py-20 bg-[var(--aura-deep-brown)] text-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12"
            >
              {instructions.map((instruction) => (
                <div key={instruction.id} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[var(--aura-rose-gold)]/20 text-[var(--aura-rose-gold)]">
                      <Info className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-['Cormorant_Garamond'] text-2xl font-medium mb-3">
                      {instruction.title}
                    </h3>
                    <p className="font-['Inter'] text-white/80 leading-relaxed">
                      {instruction.content}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

interface ServiceCategoryContentProps {
  services: Service[];
  activeCategory: string;
}

function ServiceCategoryContent({ services, activeCategory }: ServiceCategoryContentProps) {
  if (services.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[var(--aura-soft-taupe)]">No services available in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-8 border-b border-[var(--aura-rose-gold)]/10 pb-8 last:border-b-0"
        >
          {/* Featured Image */}
          {service.featured_image && (
            <div className="relative overflow-hidden rounded-lg h-64 lg:h-80">
              <img
                src={resolveCmsAssetUrl(service.featured_image)}
                alt={service.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {/* Service Content */}
          <div className={service.featured_image ? '' : 'lg:col-span-2'}>
            <h3 className="font-['Cormorant_Garamond'] text-3xl font-medium text-[var(--aura-deep-brown)] mb-3">
              {service.title}
            </h3>

            {service.excerpt && (
              <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] mb-6 leading-relaxed">
                {service.excerpt}
              </p>
            )}

            {/* Price and Duration */}
            <div className="flex flex-wrap gap-6 mb-6">
              {service.price_range && (
                <div>
                  <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mb-1">Price</p>
                  <p className="font-['Cormorant_Garamond'] text-xl font-medium text-[var(--aura-deep-brown)]">
                    {service.price_range}
                  </p>
                </div>
              )}
              {service.duration && (
                <div>
                  <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mb-1">Duration</p>
                  <p className="font-['Cormorant_Garamond'] text-xl font-medium text-[var(--aura-deep-brown)]">
                    {service.duration}
                  </p>
                </div>
              )}
            </div>

            {/* Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <div className="mb-8">
                <h4 className="font-['Inter'] font-semibold text-[var(--aura-deep-brown)] mb-4">
                  Benefits
                </h4>
                <ul className="space-y-2">
                  {service.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 font-['Inter'] text-[var(--aura-soft-taupe)]">
                      <Check className="w-5 h-5 text-[var(--aura-rose-gold)] flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--aura-deep-brown)] text-white hover:bg-[var(--aura-deep-brown)]/90 transition-colors duration-300 font-['Inter'] font-medium"
              >
                Book Now
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={`/services/${service.slug}`}
                state={{ activeCategory }}
                className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--aura-deep-brown)] text-[var(--aura-deep-brown)] hover:bg-[var(--aura-cream)] transition-colors duration-300 font-['Inter'] font-medium"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
