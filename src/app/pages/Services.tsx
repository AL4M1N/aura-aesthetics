import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Info, ArrowRight, Check, Loader, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'motion/react';
import { serviceCategoriesService } from '../../services/serviceCategoriesService';
import { serviceInstructionsService } from '../../services/serviceInstructionsService';
import { resolveCmsAssetUrl } from '../../lib/asset';
import type { ServiceCategory, ServiceInstruction, Service } from '../../lib/types';

export function Services() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [instructions, setInstructions] = useState<ServiceInstruction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, instructionsRes] = await Promise.all([
          serviceCategoriesService.getPublicServiceCategories(),
          serviceInstructionsService.getPublicServiceInstructions(),
        ]);

        if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data);
          if (categoriesRes.data.length > 0) {
            setActiveCategory(categoriesRes.data[0].slug);
          }
        }

        if (instructionsRes.success && Array.isArray(instructionsRes.data)) {
          setInstructions(instructionsRes.data);
        }
      } catch (error) {
        console.error('Failed to load services data:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--aura-cream)] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[var(--aura-rose-gold)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--aura-soft-taupe)]">Loading services...</p>
        </div>
      </div>
    );
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
          {categories.length > 0 && (
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full gap-0 h-auto bg-transparent border border-[var(--aura-rose-gold)]/20 p-0 mb-16"
                style={{ gridTemplateColumns: `repeat(${Math.min(categories.length + 1, 5)}, 1fr)` }}
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

              {/* Category Services */}
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.slug} className="mt-0">
                  <ServiceCategoryContent
                    services={category.services || []}
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
                    Schedule Consultation
                  </Link>
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
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
}

function ServiceCategoryContent({ services }: ServiceCategoryContentProps) {
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
