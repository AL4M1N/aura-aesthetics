import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Award, Heart, Shield, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { pagesService } from '../../services/pagesService';
import { servicesService } from '../../services/servicesService';
import { resolveCmsAssetUrl } from '../../lib/asset';
import type { HomeFeature, Service, HomeCta, HomeTestimonial } from '../../lib/types';

interface HeroSlide {
  url: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaLink: string;
}

const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1600&q=80',
    title: 'Unlock Your Perfect Pout',
    subtitle: 'Expert Lip Enhancement',
    description: 'Achieve naturally plump, beautiful lips with our precision filler techniques',
    cta: 'Book Consultation',
    ctaLink: '/booking',
  },
  {
    url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1600&q=80',
    title: 'Turn Back Time',
    subtitle: 'Advanced Anti-Aging',
    description: 'Restore youthful radiance with our medical-grade dermal treatments',
    cta: 'Explore Services',
    ctaLink: '/services',
  },
  {
    url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600&q=80',
    title: 'Define Your Beauty',
    subtitle: 'Facial Contouring',
    description: 'Sculpt and enhance your natural features with expert precision',
    cta: 'Learn More',
    ctaLink: '/services',
  },
  {
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1600&q=80',
    title: 'Radiate Confidence',
    subtitle: 'Premium Aesthetics',
    description: 'CPD-certified treatments for subtle, natural-looking enhancement',
    cta: 'View Treatments',
    ctaLink: '/services',
  },
];

export function Home() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(FALLBACK_HERO_SLIDES);
  const [aboutContent, setAboutContent] = useState({
    kicker_text: 'CPD Accredited Practitioner',
    headline_primary: 'Elevate Your',
    headline_highlight: 'Natural Beauty',
    description: 'Experience the art of aesthetic enhancement with a CPD-accredited practitioner. We specialize in creating subtle, natural-looking results that enhance your unique features.',
    primary_cta_label: 'Book Consultation',
    primary_cta_link: '/booking',
    secondary_cta_label: 'View Services',
    secondary_cta_link: '/services',
    badge_title: 'CPD Certified',
    badge_subtitle: 'Trained by Rejuvenate',
    image_url: 'https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?w=800',
  });

  // Main Hero Slider
  const [heroEmblaRef, heroEmblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000 })]);
  const [heroCurrentIndex, setHeroCurrentIndex] = useState(0);

  const scrollHeroPrev = useCallback(() => heroEmblaApi?.scrollPrev(), [heroEmblaApi]);
  const scrollHeroNext = useCallback(() => heroEmblaApi?.scrollNext(), [heroEmblaApi]);

  const fetchHeroSlides = useCallback(async () => {
    try {
      const response = await pagesService.getPublicHomeSliders();
      if (response?.success && Array.isArray(response.data)) {
        const normalized = response.data
          .filter((slide) => slide.is_active)
          .sort(
            (a, b) =>
              (a.sort_order ?? a.order ?? a.id) - (b.sort_order ?? b.order ?? b.id),
          )
          .map((slide, index) => {
            const fallback = FALLBACK_HERO_SLIDES[index % FALLBACK_HERO_SLIDES.length];
            return {
              url: resolveCmsAssetUrl(slide.media_url) ?? fallback.url,
              title: slide.subtitle || slide.title || fallback.title,
              subtitle: slide.title || slide.subtitle || fallback.subtitle,
              description: slide.description || fallback.description,
              cta: slide.cta_label || fallback.cta,
              ctaLink: slide.cta_link || fallback.ctaLink,
            } satisfies HeroSlide;
          });

        if (normalized.length) {
          setHeroSlides(normalized);
        }
      } else {
        throw new Error(response?.message || 'Unable to load hero sliders');
      }
    } catch (error) {
      console.error('Public slider fetch failed:', error);
    }
  }, []);

  const fetchAboutContent = useCallback(async () => {
    try {
      const response = await pagesService.getPublicHomeAbout();
      if (response?.success && response.data?.about) {
        const about = response.data.about;
        setAboutContent({
          kicker_text: about.kicker_text ?? '',
          headline_primary: about.headline_primary ?? '',
          headline_highlight: about.headline_highlight ?? '',
          description: about.description ?? '',
          primary_cta_label: about.primary_cta_label ?? '',
          primary_cta_link: about.primary_cta_link ?? '',
          secondary_cta_label: about.secondary_cta_label ?? '',
          secondary_cta_link: about.secondary_cta_link ?? '',
          badge_title: about.badge_title ?? '',
          badge_subtitle: about.badge_subtitle ?? '',
          image_url: resolveCmsAssetUrl(about.image_url) ?? 'https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?w=800',
        });
      }
    } catch (error) {
      console.error('About content fetch failed:', error);
    }
  }, []);

  const fetchFeatures = useCallback(async () => {
    try {
      const response = await pagesService.getPublicHomeFeatures();
      if (response?.success && Array.isArray(response.data)) {
        const sortedFeatures = response.data
          .filter((f) => f.is_active)
          .sort((a, b) => a.sort_order - b.sort_order);
        setFeatures(sortedFeatures);
      }
    } catch (error) {
      console.error('Features fetch failed:', error);
    }
  }, []);

  const fetchFeaturedServices = useCallback(async () => {
    try {
      const response = await servicesService.getFeaturedServices();
      if (response?.success && Array.isArray(response.data)) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error fetching featured services:', error);
    }
  }, []);

  const fetchCtaContent = useCallback(async () => {
    try {
      const response = await pagesService.getPublicHomeCta();
      if (response?.success && response.data?.cta) {
        const cta = response.data.cta;
        if (cta.is_active) {
          setCtaContent({
            title: cta.title,
            subtitle: cta.subtitle ?? '',
            button_text: cta.button_text,
            button_link: cta.button_link,
            background_color: cta.background_color ?? '#2D1B1B',
            text_color: cta.text_color ?? '#FFFFFF',
          });
        }
      }
    } catch (error) {
      console.error('CTA fetch failed:', error);
    }
  }, []);

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await pagesService.getPublicHomeTestimonials();
      if (response?.success && Array.isArray(response.data)) {
        const activeTestimonials = response.data
          .filter((testimonial) => testimonial.is_active)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((testimonial) => ({
            ...testimonial,
            client_image: resolveCmsAssetUrl(testimonial.client_image) ?? testimonial.client_image,
          }));
        setTestimonials(activeTestimonials);
      }
    } catch (error) {
      console.error('Testimonials fetch failed:', error);
    }
  }, []);

  useEffect(() => {
    void fetchHeroSlides();
    void fetchAboutContent();
    void fetchFeatures();
    void fetchFeaturedServices();
    void fetchCtaContent();
    void fetchTestimonials();
  }, [fetchHeroSlides, fetchAboutContent, fetchFeatures, fetchFeaturedServices, fetchCtaContent, fetchTestimonials]);

  useEffect(() => {
    if (!heroEmblaApi) return;
    
    const onSelect = () => {
      setHeroCurrentIndex(heroEmblaApi.selectedScrollSnap());
    };
    
    heroEmblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      heroEmblaApi.off('select', onSelect);
    };
  }, [heroEmblaApi]);

  const [services, setServices] = useState<Service[]>([]);

  const [features, setFeatures] = useState<HomeFeature[]>([
    { id: 1, icon: 'award', title: 'CPD Certified', description: 'Accredited Excellence', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
    { id: 2, icon: 'shield', title: 'Medical Grade', description: 'Safety Standards', sort_order: 2, is_active: true, created_at: '', updated_at: '' },
    { id: 3, icon: 'heart', title: 'Client Focused', description: 'Personalized Care', sort_order: 3, is_active: true, created_at: '', updated_at: '' },
    { id: 4, icon: 'sparkles', title: 'Natural Results', description: 'Subtle Enhancement', sort_order: 4, is_active: true, created_at: '', updated_at: '' },
  ]);

  const [ctaContent, setCtaContent] = useState({
    title: 'Begin Your Beauty Journey',
    subtitle: 'Book your complimentary consultation today',
    button_text: 'Book Free Consultation',
    button_link: '/booking',
    background_color: '#2D1B1B',
    text_color: '#FFFFFF',
  });

  const [testimonials, setTestimonials] = useState<HomeTestimonial[]>([]);

  // Testimonials Carousel
  const [testimonialEmblaRef, testimonialEmblaApi] = useEmblaCarousel(
    { 
      loop: testimonials.length > 3,
      slidesToScroll: 1,
      align: 'center',
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  const [testimonialCurrentIndex, setTestimonialCurrentIndex] = useState(0);

  const scrollTestimonialPrev = useCallback(() => testimonialEmblaApi?.scrollPrev(), [testimonialEmblaApi]);
  const scrollTestimonialNext = useCallback(() => testimonialEmblaApi?.scrollNext(), [testimonialEmblaApi]);

  useEffect(() => {
    if (!testimonialEmblaApi) return;
    
    const onSelect = () => {
      setTestimonialCurrentIndex(testimonialEmblaApi.selectedScrollSnap());
    };
    
    testimonialEmblaApi.on('select', onSelect);
    return () => {
      testimonialEmblaApi.off('select', onSelect);
    };
  }, [testimonialEmblaApi]);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      award: Award,
      shield: Shield,
      heart: Heart,
      sparkles: Sparkles,
    };
    return iconMap[iconName] || Sparkles;
  };

  const trustBadges = features.map((feature) => ({
    icon: getIconComponent(feature.icon),
    text: feature.title,
    subtext: feature.description || '',
  }));

  return (
    <div className="min-h-screen bg-[var(--aura-cream)]">
      {/* Main Hero Slider - Full Width at Top */}
      <section className="relative h-screen overflow-hidden">
        <div className="overflow-hidden h-full" ref={heroEmblaRef}>
          <div className="flex h-full">
            {heroSlides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: heroCurrentIndex === index ? 1 : 0, y: heroCurrentIndex === index ? 0 : 30 }}
                      transition={{ duration: 0.8 }}
                      className="max-w-2xl"
                    >
                      {/* Subtitle */}
                      <span className="inline-block px-6 py-2 bg-[var(--aura-rose-gold)]/20 backdrop-blur-sm text-[var(--aura-rose-gold)] font-['Inter'] text-xs tracking-[0.3em] uppercase border border-[var(--aura-rose-gold)]/30 mb-6">
                        {slide.subtitle}
                      </span>

                      {/* Title */}
                      <h1 className="font-['Cormorant_Garamond'] text-5xl lg:text-7xl xl:text-8xl font-light text-white leading-[1.1] mb-6">
                        {slide.title}
                      </h1>

                      {/* Description */}
                      <p className="font-['Inter'] text-lg lg:text-xl text-white/90 leading-relaxed mb-10">
                        {slide.description}
                      </p>

                      {/* CTA Button */}
                      <Link
                        to={slide.ctaLink}
                        className="group inline-flex items-center gap-3 px-12 py-5 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-sm tracking-wider hover:bg-white hover:text-[var(--aura-deep-brown)] transition-all duration-300"
                      >
                        {slide.cta}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={scrollHeroPrev}
          className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-[var(--aura-rose-gold)] text-white transition-all duration-300 flex items-center justify-center group z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={scrollHeroNext}
          className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-[var(--aura-rose-gold)] text-white transition-all duration-300 flex items-center justify-center group z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => heroEmblaApi?.scrollTo(index)}
              className={`h-1 transition-all duration-300 ${
                index === heroCurrentIndex
                  ? 'w-12 bg-[var(--aura-rose-gold)]'
                  : 'w-8 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Original Hero Content Section - Now Below Slider */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--aura-nude)]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--aura-rose-gold)]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {aboutContent.kicker_text && (
                <div className="inline-block">
                  <span className="px-6 py-2 bg-white/80 backdrop-blur-sm text-[var(--aura-rose-gold)] font-['Inter'] text-xs tracking-[0.3em] uppercase border border-[var(--aura-rose-gold)]/20">
                    {aboutContent.kicker_text}
                  </span>
                </div>
              )}
              
              <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light text-[var(--aura-deep-brown)] leading-[1.1]">
                {aboutContent.headline_primary}
                {aboutContent.headline_highlight && (
                  <span className="block text-[var(--aura-rose-gold)] italic">{aboutContent.headline_highlight}</span>
                )}
              </h2>
              
              {aboutContent.description && (
                <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] leading-relaxed max-w-xl">
                  {aboutContent.description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                {aboutContent.primary_cta_label && aboutContent.primary_cta_link && (
                  <Link
                    to={aboutContent.primary_cta_link}
                    className="group relative px-10 py-5 bg-[var(--aura-deep-brown)] text-white font-['Inter'] text-sm tracking-wider overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {aboutContent.primary_cta_label}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-[var(--aura-rose-gold)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </Link>
                )}
                {aboutContent.secondary_cta_label && aboutContent.secondary_cta_link && (
                  <Link
                    to={aboutContent.secondary_cta_link}
                    className="group px-10 py-5 border-2 border-[var(--aura-deep-brown)] text-[var(--aura-deep-brown)] font-['Inter'] text-sm tracking-wider hover:bg-[var(--aura-deep-brown)] hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    {aboutContent.secondary_cta_label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={aboutContent.image_url}
                  alt={aboutContent.headline_primary || 'Professional Aesthetic Practitioner'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--aura-deep-brown)]/40 via-transparent to-transparent" />
                
                {/* Floating Badge */}
                {aboutContent.badge_title && (
                  <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6">
                    <div className="flex items-center gap-4">
                      <Award className="w-12 h-12 text-[var(--aura-rose-gold)]" />
                      <div>
                        <p className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)]">{aboutContent.badge_title}</p>
                        {aboutContent.badge_subtitle && (
                          <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">{aboutContent.badge_subtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Decorative Element */}
              <div className="absolute -z-10 -right-12 -bottom-12 w-72 h-72 bg-[var(--aura-rose-gold)]/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-[var(--aura-nude)] group-hover:bg-[var(--aura-rose-gold)] transition-all duration-500">
                    <Icon className="w-8 h-8 text-[var(--aura-rose-gold)] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="font-['Cormorant_Garamond'] text-xl font-medium text-[var(--aura-deep-brown)] mb-2">
                    {badge.text}
                  </h3>
                  <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">
                    {badge.subtext}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-32 bg-[var(--aura-cream)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="font-['Inter'] text-xs tracking-[0.3em] uppercase text-[var(--aura-rose-gold)] mb-4 block">
              Our Treatments
            </span>
            <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light text-[var(--aura-deep-brown)] mb-6">
              Signature Services
            </h2>
            <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] max-w-2xl mx-auto">
              Discover our curated selection of premium aesthetic treatments
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden bg-white"
              >
                {service.is_featured && (
                  <div className="absolute top-6 right-6 z-20 px-4 py-2 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-xs tracking-wider">
                    FEATURED
                  </div>
                )}
                
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={resolveCmsAssetUrl(service.featured_image) || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800'}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--aura-deep-brown)]/80 via-[var(--aura-deep-brown)]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                </div>

                <div className="p-8 lg:p-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-['Cormorant_Garamond'] text-3xl font-medium text-[var(--aura-deep-brown)]">
                      {service.title}
                    </h3>
                    <span className="font-['Inter'] text-sm text-[var(--aura-rose-gold)] whitespace-nowrap ml-4">
                      {service.price_range}
                    </span>
                  </div>
                  
                  <p className="font-['Inter'] text-[var(--aura-soft-taupe)] leading-relaxed mb-6">
                    {service.excerpt}
                  </p>
                  
                  <Link
                    to={`/services/${service.slug}`}
                    className="inline-flex items-center gap-2 font-['Inter'] text-sm tracking-wider text-[var(--aura-deep-brown)] group-hover:text-[var(--aura-rose-gold)] transition-colors duration-300"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/services"
              className="inline-block px-12 py-5 border-2 border-[var(--aura-deep-brown)] text-[var(--aura-deep-brown)] font-['Inter'] text-sm tracking-wider hover:bg-[var(--aura-deep-brown)] hover:text-white transition-all duration-300"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-32 relative overflow-hidden" 
        style={{ backgroundColor: ctaContent.background_color }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--aura-rose-gold)] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--aura-rose-gold)] rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light mb-8"
              style={{ color: ctaContent.text_color }}
            >
              {ctaContent.title}
            </h2>
            {ctaContent.subtitle && (
              <p 
                className="font-['Inter'] text-lg mb-12 max-w-2xl mx-auto"
                style={{ color: `${ctaContent.text_color}cc` }}
              >
                {ctaContent.subtitle}
              </p>
            )}
            <Link
              to={ctaContent.button_link}
              className="inline-block px-12 py-5 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-sm tracking-wider hover:bg-white hover:text-[var(--aura-deep-brown)] transition-all duration-300"
            >
              {ctaContent.button_text}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-32 bg-[var(--aura-cream)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <span className="font-['Inter'] text-xs tracking-[0.3em] uppercase text-[var(--aura-rose-gold)] mb-4 block">
                Client Stories
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light text-[var(--aura-deep-brown)] mb-6">
                Trusted by Our Clients
              </h2>
              <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] max-w-2xl mx-auto">
                Real experiences from those who've trusted us with their aesthetic journey
              </p>
            </motion.div>

            {/* Carousel Container */}
            <div className="relative">
              <div className="overflow-hidden" ref={testimonialEmblaRef}>
                <div className="flex gap-8">
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="flex-[0_0_calc(33.333%-1.33rem)] min-w-0"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-lg shadow-sm h-full"
                      >
                        <div className="flex items-center gap-4 mb-6">
                          {testimonial.client_image ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--aura-rose-gold)]/20 flex-shrink-0">
                              <img
                                src={resolveCmsAssetUrl(testimonial.client_image) || testimonial.client_image}
                                alt={testimonial.client_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-[var(--aura-rose-gold)]/10 flex items-center justify-center flex-shrink-0">
                              <span className="font-['Inter'] text-2xl font-semibold text-[var(--aura-rose-gold)]">
                                {testimonial.client_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-['Inter'] font-semibold text-[var(--aura-deep-brown)] truncate">
                              {testimonial.client_name}
                            </h3>
                            <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] truncate">
                              {testimonial.service_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < (testimonial.rating ?? 5) ? 'fill-[var(--aura-rose-gold)] text-[var(--aura-rose-gold)]' : 'text-gray-300'}
                            />
                          ))}
                        </div>

                        <p className="font-['Inter'] text-[var(--aura-soft-taupe)] leading-relaxed italic line-clamp-4">
                          "{testimonial.testimonial}"
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {testimonials.length > 3 && (
                <>
                  <button
                    onClick={scrollTestimonialPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 lg:translate-x-0 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={24} className="text-[var(--aura-deep-brown)]" />
                  </button>
                  <button
                    onClick={scrollTestimonialNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 lg:translate-x-0 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={24} className="text-[var(--aura-deep-brown)]" />
                  </button>
                </>
              )}

              {/* Dot Indicators */}
              {testimonials.length > 3 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.ceil(testimonials.length / 1) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => testimonialEmblaApi?.scrollTo(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === testimonialCurrentIndex
                          ? 'w-8 bg-[var(--aura-rose-gold)]'
                          : 'w-2 bg-[var(--aura-rose-gold)]/30'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
