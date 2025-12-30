import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Award, Heart, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export function Home() {
  // Main Hero Slider
  const [heroEmblaRef, heroEmblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000 })]);
  const [heroCurrentIndex, setHeroCurrentIndex] = useState(0);

  const scrollHeroPrev = useCallback(() => heroEmblaApi?.scrollPrev(), [heroEmblaApi]);
  const scrollHeroNext = useCallback(() => heroEmblaApi?.scrollNext(), [heroEmblaApi]);

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

  const heroSlides = [
    {
      url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1600&q=80',
      title: 'Unlock Your Perfect Pout',
      subtitle: 'Expert Lip Enhancement',
      description: 'Achieve naturally plump, beautiful lips with our precision filler techniques',
      cta: 'Book Consultation',
      ctaLink: '/booking'
    },
    {
      url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1600&q=80',
      title: 'Turn Back Time',
      subtitle: 'Advanced Anti-Aging',
      description: 'Restore youthful radiance with our medical-grade dermal treatments',
      cta: 'Explore Services',
      ctaLink: '/services'
    },
    {
      url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600&q=80',
      title: 'Define Your Beauty',
      subtitle: 'Facial Contouring',
      description: 'Sculpt and enhance your natural features with expert precision',
      cta: 'Learn More',
      ctaLink: '/services'
    },
    {
      url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1600&q=80',
      title: 'Radiate Confidence',
      subtitle: 'Premium Aesthetics',
      description: 'CPD-certified treatments for subtle, natural-looking enhancement',
      cta: 'View Treatments',
      ctaLink: '/services'
    }
  ];

  // Gallery Slider
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const sliderImages = [
    {
      url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1200',
      title: 'Natural Lip Enhancement',
      description: 'Subtle, beautiful results'
    },
    {
      url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200',
      title: 'Expert Care',
      description: 'CPD-certified treatments'
    },
    {
      url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200',
      title: 'Facial Contouring',
      description: 'Define your features'
    },
    {
      url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200',
      title: 'Anti-Aging Excellence',
      description: 'Turn back time naturally'
    }
  ];

  const services = [
    {
      id: 1,
      title: 'Lip Enhancement',
      description: 'Achieve perfectly sculpted, natural-looking lips with our precision filler techniques',
      price: 'from £120',
      image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800',
      popular: true,
    },
    {
      id: 2,
      title: 'Dermal Fillers',
      description: 'Restore volume and smooth fine lines for a refreshed, youthful appearance',
      price: 'from £180',
      image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800',
    },
    {
      id: 3,
      title: 'Facial Contouring',
      description: 'Define and enhance your natural features with expert facial sculpting',
      price: 'from £200',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
    },
    {
      id: 4,
      title: 'Anti-Aging Treatments',
      description: 'Combat signs of aging with our advanced rejuvenation therapies',
      price: 'Consultation',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    },
  ];

  const trustBadges = [
    { icon: Award, text: 'CPD Certified', subtext: 'Accredited Excellence' },
    { icon: Shield, text: 'Medical Grade', subtext: 'Safety Standards' },
    { icon: Heart, text: 'Client Focused', subtext: 'Personalized Care' },
    { icon: Sparkles, text: 'Natural Results', subtext: 'Subtle Enhancement' },
  ];

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

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-block">
                <span className="px-6 py-2 bg-white/80 backdrop-blur-sm text-[var(--aura-rose-gold)] font-['Inter'] text-xs tracking-[0.3em] uppercase border border-[var(--aura-rose-gold)]/20">
                  CPD Accredited Practitioner
                </span>
              </div>
              
              <h1 className="font-['Cormorant_Garamond'] text-6xl lg:text-7xl xl:text-8xl font-light text-[var(--aura-deep-brown)] leading-[1.1]">
                Elevate Your
                <span className="block text-[var(--aura-rose-gold)] italic">Natural Beauty</span>
              </h1>
              
              <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] leading-relaxed max-w-xl">
                Experience the art of aesthetic enhancement with a CPD-accredited practitioner. 
                We specialize in creating subtle, natural-looking results that enhance your unique features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Link
                  to="/booking"
                  className="group relative px-10 py-5 bg-[var(--aura-deep-brown)] text-white font-['Inter'] text-sm tracking-wider overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Book Consultation
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-[var(--aura-rose-gold)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Link>
                <Link
                  to="/services"
                  className="group px-10 py-5 border-2 border-[var(--aura-deep-brown)] text-[var(--aura-deep-brown)] font-['Inter'] text-sm tracking-wider hover:bg-[var(--aura-deep-brown)] hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
                >
                  View Services
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?w=800"
                  alt="Professional Aesthetic Practitioner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--aura-deep-brown)]/40 via-transparent to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6">
                  <div className="flex items-center gap-4">
                    <Award className="w-12 h-12 text-[var(--aura-rose-gold)]" />
                    <div>
                      <p className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)]">CPD Certified</p>
                      <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">Trained by Rejuvenate</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Element */}
              <div className="absolute -z-10 -right-12 -bottom-12 w-72 h-72 bg-[var(--aura-rose-gold)]/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
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
              <div className="inline-block">
                <span className="px-6 py-2 bg-white/80 backdrop-blur-sm text-[var(--aura-rose-gold)] font-['Inter'] text-xs tracking-[0.3em] uppercase border border-[var(--aura-rose-gold)]/20">
                  CPD Accredited Practitioner
                </span>
              </div>
              
              <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light text-[var(--aura-deep-brown)] leading-[1.1]">
                Elevate Your
                <span className="block text-[var(--aura-rose-gold)] italic">Natural Beauty</span>
              </h2>
              
              <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] leading-relaxed max-w-xl">
                Experience the art of aesthetic enhancement with a CPD-accredited practitioner. 
                We specialize in creating subtle, natural-looking results that enhance your unique features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Link
                  to="/booking"
                  className="group relative px-10 py-5 bg-[var(--aura-deep-brown)] text-white font-['Inter'] text-sm tracking-wider overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Book Consultation
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-[var(--aura-rose-gold)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Link>
                <Link
                  to="/services"
                  className="group px-10 py-5 border-2 border-[var(--aura-deep-brown)] text-[var(--aura-deep-brown)] font-['Inter'] text-sm tracking-wider hover:bg-[var(--aura-deep-brown)] hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
                >
                  View Services
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
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
                  src="https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?w=800"
                  alt="Professional Aesthetic Practitioner"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--aura-deep-brown)]/40 via-transparent to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6">
                  <div className="flex items-center gap-4">
                    <Award className="w-12 h-12 text-[var(--aura-rose-gold)]" />
                    <div>
                      <p className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)]">CPD Certified</p>
                      <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">Trained by Rejuvenate</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Element */}
              <div className="absolute -z-10 -right-12 -bottom-12 w-72 h-72 bg-[var(--aura-rose-gold)]/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Slider Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-['Inter'] text-xs tracking-[0.3em] uppercase text-[var(--aura-rose-gold)] mb-4 block">
              Experience Excellence
            </span>
            <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light text-[var(--aura-deep-brown)]">
              Our Artistry
            </h2>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {sliderImages.map((slide, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 relative">
                    <div className="relative aspect-[21/9] overflow-hidden">
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--aura-deep-brown)]/70 via-transparent to-transparent" />
                      
                      {/* Slide Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-16">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="max-w-2xl"
                        >
                          <h3 className="font-['Cormorant_Garamond'] text-4xl lg:text-5xl font-light text-white mb-4">
                            {slide.title}
                          </h3>
                          <p className="font-['Inter'] text-lg text-white/80">
                            {slide.description}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={scrollPrev}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-[var(--aura-rose-gold)] text-[var(--aura-deep-brown)] hover:text-white transition-all duration-300 flex items-center justify-center group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-[var(--aura-rose-gold)] text-[var(--aura-deep-brown)] hover:text-white transition-all duration-300 flex items-center justify-center group"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
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
              Discover our curated selection of premium aesthetic treatments, each designed to enhance your natural beauty
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
                {service.popular && (
                  <div className="absolute top-6 right-6 z-20 px-4 py-2 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-xs tracking-wider">
                    POPULAR
                  </div>
                )}
                
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
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
                      {service.price}
                    </span>
                  </div>
                  
                  <p className="font-['Inter'] text-[var(--aura-soft-taupe)] leading-relaxed mb-6">
                    {service.description}
                  </p>
                  
                  <Link
                    to="/services"
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

      {/* About Preview */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <span className="font-['Inter'] text-xs tracking-[0.3em] uppercase text-[var(--aura-rose-gold)] mb-4 block">
                About Me
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light text-[var(--aura-deep-brown)] mb-8">
                Your Trusted Aesthetic Partner
              </h2>
              
              <div className="space-y-6 font-['Inter'] text-lg text-[var(--aura-soft-taupe)] leading-relaxed">
                <p>
                  As a <strong className="text-[var(--aura-deep-brown)]">CPD-accredited aesthetic practitioner</strong> trained by Rejuvenate, 
                  I bring expertise, precision, and artistry to every treatment.
                </p>
                <p>
                  My philosophy centers on enhancing your natural beauty through subtle, sophisticated techniques. 
                  With a commitment to safety, ethics, and personalized care, I ensure every client feels confident 
                  and beautiful in their own skin.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--aura-nude)] flex items-center justify-center">
                    <Award className="w-6 h-6 text-[var(--aura-rose-gold)]" />
                  </div>
                  <div>
                    <p className="font-['Inter'] text-sm text-[var(--aura-deep-brown)] font-medium">CPD Certified</p>
                    <p className="font-['Inter'] text-xs text-[var(--aura-soft-taupe)]">Professional Excellence</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--aura-nude)] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[var(--aura-rose-gold)]" />
                  </div>
                  <div>
                    <p className="font-['Inter'] text-sm text-[var(--aura-deep-brown)] font-medium">Safety First</p>
                    <p className="font-['Inter'] text-xs text-[var(--aura-soft-taupe)]">Medical Standards</p>
                  </div>
                </div>
              </div>

              <Link
                to="/about"
                className="inline-flex items-center gap-3 mt-12 px-10 py-5 bg-[var(--aura-deep-brown)] text-white font-['Inter'] text-sm tracking-wider hover:bg-[var(--aura-rose-gold)] transition-colors duration-300"
              >
                Learn More About Me
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?w=800"
                  alt="Aesthetic Practitioner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--aura-rose-gold)]/10 to-transparent" />
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[var(--aura-nude)] -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[var(--aura-deep-brown)] relative overflow-hidden">
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
            <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light text-white mb-8">
              Begin Your Beauty Journey
            </h2>
            <p className="font-['Inter'] text-lg text-white/80 mb-12 max-w-2xl mx-auto">
              Book your complimentary consultation and discover how we can help you achieve your aesthetic goals with confidence
            </p>
            <Link
              to="/booking"
              className="inline-block px-12 py-5 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-sm tracking-wider hover:bg-white hover:text-[var(--aura-deep-brown)] transition-all duration-300"
            >
              Book Free Consultation
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
