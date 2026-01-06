import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, DollarSign, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { servicesService } from '../../services/servicesService';
import type { Service } from '../../lib/types';
import { resolveCmsAssetUrl } from '../../lib/asset';

export function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchService = async () => {
      setLoading(true);
      try {
        const response = await servicesService.getPublicServiceBySlug(slug);
        if (response?.success && response.data) {
          const serviceData = response.data;
          setService({
            ...serviceData,
            featured_image: serviceData.featured_image 
              ? resolveCmsAssetUrl(serviceData.featured_image) || serviceData.featured_image 
              : null,
            gallery_images: serviceData.gallery_images?.map((img) => resolveCmsAssetUrl(img) || img) || [],
            before_after_images: serviceData.before_after_images?.map((item) => ({
              ...item,
              before: resolveCmsAssetUrl(item.before) || item.before,
              after: resolveCmsAssetUrl(item.after) || item.after,
            })) || [],
          });
        } else {
          navigate('/services');
        }
      } catch (error) {
        console.error('Failed to load service:', error);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    void fetchService();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--aura-cream)]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[var(--aura-rose-gold)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-['Inter'] text-sm tracking-wider text-[var(--aura-soft-taupe)]">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--aura-cream)]">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {service.featured_image && (
          <div className="absolute inset-0">
            <img
              src={service.featured_image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/80" />
          </div>
        )}

        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-[var(--aura-deep-brown)]/70 hover:text-[var(--aura-deep-brown)] mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-['Inter'] tracking-wider">Back to Services</span>
              </Link>

              <h1 className="font-['Cormorant_Garamond'] text-5xl lg:text-7xl font-light text-[var(--aura-deep-brown)] leading-[1.1] mb-6">
                {service.title}
              </h1>

              {service.excerpt && (
                <p className="font-['Inter'] text-lg lg:text-xl text-[var(--aura-soft-taupe)] leading-relaxed mb-8">
                  {service.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-[var(--aura-soft-taupe)] text-sm font-['Inter']">
                {service.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[var(--aura-rose-gold)]" />
                    <span>{service.duration}</span>
                  </div>
                )}
                {service.price_range && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[var(--aura-rose-gold)]" />
                    <span>{service.price_range}</span>
                  </div>
                )}
              </div>

              <Link
                to="/booking"
                className="inline-flex items-center gap-3 px-12 py-5 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-sm tracking-wider hover:bg-[var(--aura-deep-brown)] hover:text-white transition-all duration-300 mt-8"
              >
                Book Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detail Content */}
      {service.detail_content && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-['Cormorant_Garamond'] text-4xl lg:text-5xl font-light text-[var(--aura-deep-brown)] mb-8">
                About This Treatment
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] leading-relaxed whitespace-pre-wrap">
                  {service.detail_content}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Benefits */}
      {service.benefits && service.benefits.length > 0 && (
        <section className="py-20 bg-[var(--aura-cream)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-['Cormorant_Garamond'] text-4xl lg:text-5xl font-light text-[var(--aura-deep-brown)] mb-4">
                Key Benefits
              </h2>
              <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)]">
                What you can expect from this treatment
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {service.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex gap-4 p-6 bg-white rounded-lg"
                >
                  <CheckCircle2 className="w-6 h-6 text-[var(--aura-rose-gold)] flex-shrink-0 mt-1" />
                  <p className="font-['Inter'] text-[var(--aura-deep-brown)]">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Steps */}
      {service.process_steps && service.process_steps.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-['Cormorant_Garamond'] text-4xl lg:text-5xl font-light text-[var(--aura-deep-brown)] mb-4">
                The Process
              </h2>
              <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)]">
                What happens during your treatment
              </p>
            </motion.div>

            <div className="space-y-8">
              {service.process_steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--aura-rose-gold)] flex items-center justify-center text-white font-['Cormorant_Garamond'] text-xl font-semibold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)] mb-2">
                      {step.title}
                    </h3>
                    <p className="font-['Inter'] text-[var(--aura-soft-taupe)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {service.gallery_images && service.gallery_images.length > 0 && (
        <section className="py-20 bg-[var(--aura-cream)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-['Cormorant_Garamond'] text-4xl lg:text-5xl font-light text-[var(--aura-deep-brown)]">
                Gallery
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.gallery_images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={image}
                    alt={`${service.title} ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-32 bg-[var(--aura-deep-brown)] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Cormorant_Garamond'] text-4xl lg:text-5xl font-light mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="font-['Inter'] text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Book your consultation today and discover how we can help you achieve your aesthetic goals.
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center gap-3 px-12 py-5 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-sm tracking-wider hover:bg-white hover:text-[var(--aura-deep-brown)] transition-all duration-300"
            >
              Book Consultation
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default ServiceDetail;
