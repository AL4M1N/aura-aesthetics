import { useState } from 'react';
import { Award, Heart, Shield, Target, CheckCircle2, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';
import { pagesService } from '../../services/pagesService';
import { resolveCmsAssetUrl } from '../../lib/asset';
import type {
  AboutHero,
  AboutBio,
  AboutQualification,
  AboutValue,
  AboutCertificate,
} from '../../lib/types';
import { usePersistentCache } from '../../hooks/usePersistentCache';
import { AboutSkeleton } from '../components/skeletons/PageSkeletons';
import { SEOHead } from '../components/SEOHead';

const iconMap: Record<string, React.ComponentType<any>> = {
  award: Award,
  heart: Heart,
  shield: Shield,
  target: Target,
  'check-circle': CheckCircle2,
  sparkles: Sparkles,
};

interface AboutContentPayload {
  hero: AboutHero | null;
  bio: AboutBio | null;
  qualifications: AboutQualification[];
  values: AboutValue[];
  certificates: AboutCertificate[];
}

const EMPTY_ABOUT_CONTENT: AboutContentPayload = {
  hero: null,
  bio: null,
  qualifications: [],
  values: [],
  certificates: [],
};

const sortByOrder = <T extends { sort_order: number }>(items: T[]) =>
  [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

const fetchAboutContent = async (): Promise<AboutContentPayload> => {
  const [heroRes, bioRes, qualRes, valRes, certRes] = await Promise.allSettled([
    pagesService.getPublicAboutHero(),
    pagesService.getPublicAboutBio(),
    pagesService.getPublicAboutQualifications(),
    pagesService.getPublicAboutValues(),
    pagesService.getPublicAboutCertificates(),
  ]);

  const hero =
    heroRes.status === 'fulfilled' && heroRes.value?.success && heroRes.value.data?.hero?.is_active !== false
      ? heroRes.value.data.hero
      : null;

  const bio =
    bioRes.status === 'fulfilled' && bioRes.value?.success && bioRes.value.data?.bio?.is_active !== false
      ? bioRes.value.data.bio
      : null;

  const qualifications =
    qualRes.status === 'fulfilled' && qualRes.value?.success && Array.isArray(qualRes.value.data)
      ? sortByOrder(qualRes.value.data.filter((qual) => qual.is_active))
      : [];

  const values =
    valRes.status === 'fulfilled' && valRes.value?.success && Array.isArray(valRes.value.data)
      ? sortByOrder(valRes.value.data.filter((value) => value.is_active))
      : [];

  const certificates =
    certRes.status === 'fulfilled' && certRes.value?.success && Array.isArray(certRes.value.data)
      ? sortByOrder(certRes.value.data.filter((cert) => cert.is_active))
      : [];

  return {
    hero,
    bio,
    qualifications,
    values,
    certificates,
  } satisfies AboutContentPayload;
};

export function About() {
  const { data: aboutContent, loading } = usePersistentCache<AboutContentPayload>('about-page-content', fetchAboutContent, {
    fallbackData: EMPTY_ABOUT_CONTENT,
    ttl: 10 * 60 * 1000,
    revalidateInterval: 15 * 60 * 1000,
  });
  const hero = aboutContent?.hero ?? null;
  const bio = aboutContent?.bio ?? null;
  const qualifications = aboutContent?.qualifications ?? [];
  const values = aboutContent?.values ?? [];
  const certificates = aboutContent?.certificates ?? [];
  const [selectedCert, setSelectedCert] = useState<AboutCertificate | null>(null);

  const hasContent = Boolean(hero || bio || qualifications.length || values.length || certificates.length);

  if (loading && !hasContent) {
    return <AboutSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[var(--aura-cream)]">
      <SEOHead 
        pageType="about"
        fallbackTitle="About Us - Aura Aesthetics | Expert Beauty & Wellness Team"
        fallbackDescription="Meet our experienced team of aesthetic professionals. Learn about our qualifications, values, and commitment to delivering exceptional beauty and wellness services."
        fallbackKeywords="about aura aesthetics, beauty professionals, aesthetic team, qualifications, experience, wellness experts"
      />
      
      {/* Hero Section */}
      {hero && (
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--aura-nude)]/30 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="font-['Inter'] text-xs tracking-[0.3em] uppercase text-[var(--aura-rose-gold)] mb-4 block">
                {hero.kicker_text}
              </span>
              <h1 className="font-['Cormorant_Garamond'] text-6xl lg:text-7xl font-light text-[var(--aura-deep-brown)] mb-6">
                {hero.headline_primary}
                <span className="block text-[var(--aura-rose-gold)] italic">
                  {hero.headline_highlight}
                </span>
              </h1>
              <p className="font-['Inter'] text-xl text-[var(--aura-soft-taupe)] leading-relaxed">
                {hero.description}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Bio Section */}
      {bio && (
        <section className="py-20 lg:py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={resolveCmsAssetUrl(bio.image_url)}
                    alt="Aesthetic Practitioner"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[var(--aura-nude)] -z-10 hidden lg:block" />
                <div className="absolute -top-12 -left-12 w-64 h-64 border-2 border-[var(--aura-rose-gold)]/20 -z-10 hidden lg:block" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-['Cormorant_Garamond'] text-4xl lg:text-5xl font-light text-[var(--aura-deep-brown)] mb-6">
                    {bio.title}
                  </h2>
                  <div className="space-y-6 font-['Inter'] text-lg text-[var(--aura-soft-taupe)] leading-relaxed">
                    {bio.content.split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-[var(--aura-rose-gold)]/20">
                  <div className="inline-flex items-center gap-4 bg-[var(--aura-nude)]/50 px-8 py-5">
                    {(() => {
                      const Icon = iconMap[bio.badge_icon] || Award;
                      return (
                        <>
                          <Icon className="w-10 h-10 text-[var(--aura-rose-gold)]" />
                          <div>
                            <p className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)]">
                              {bio.badge_title}
                            </p>
                            <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">
                              {bio.badge_subtitle}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Qualifications */}
      {qualifications.length > 0 && (
        <section className="py-20 lg:py-32 bg-[var(--aura-cream)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="font-['Inter'] text-xs tracking-[0.3em] uppercase text-[var(--aura-rose-gold)] mb-4 block">
                Credentials
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light text-[var(--aura-deep-brown)]">
                Professional Qualifications
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {qualifications.map((qual, index) => {
                  const Icon = iconMap[qual.icon] || Award;
                  return (
                    <motion.div
                      key={qual.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-white p-10 group hover:bg-[var(--aura-deep-brown)] transition-all duration-500"
                    >
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-[var(--aura-nude)] group-hover:bg-[var(--aura-rose-gold)] flex items-center justify-center flex-shrink-0 transition-colors duration-500">
                          <Icon className="w-8 h-8 text-[var(--aura-rose-gold)] group-hover:text-white transition-colors duration-500" />
                        </div>
                        <div>
                          <h3 className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)] group-hover:text-white mb-3 transition-colors duration-500">
                            {qual.title}
                          </h3>
                          <p className="font-['Inter'] text-[var(--aura-soft-taupe)] group-hover:text-white/80 transition-colors duration-500">
                            {qual.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      {values.length > 0 && (
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="font-['Inter'] text-xs tracking-[0.3em] uppercase text-[var(--aura-rose-gold)] mb-4 block">
                My Philosophy
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light text-[var(--aura-deep-brown)] mb-6">
                Core Values
              </h2>
              <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] max-w-2xl mx-auto">
                The principles that guide every treatment and consultation
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                  const Icon = iconMap[value.icon] || Heart;
                  return (
                    <motion.div
                      key={value.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="text-center group"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--aura-nude)] group-hover:bg-[var(--aura-rose-gold)] mb-6 transition-all duration-500">
                        <Icon className="w-10 h-10 text-[var(--aura-rose-gold)] group-hover:text-white transition-colors duration-500" />
                      </div>
                      <h3 className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)] mb-3">
                        {value.title}
                      </h3>
                      <p className="font-['Inter'] text-[var(--aura-soft-taupe)]">
                        {value.description}
                      </p>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Certifications Gallery */}
      {certificates.length > 0 && (
        <section className="py-20 lg:py-32 bg-[var(--aura-deep-brown)] text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="font-['Inter'] text-xs tracking-[0.3em] uppercase text-[var(--aura-rose-gold)] mb-4 block">
                Certifications
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light mb-6">
                Certified Excellence
              </h2>
              <p className="font-['Inter'] text-lg text-white/70 max-w-2xl mx-auto">
                Continuously updating skills to bring you the latest in aesthetic medicine
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 justify-items-center">
              {certificates.map((cert, index) => (
                  <motion.button
                    key={cert.id}
                    onClick={() => setSelectedCert(cert)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[var(--aura-rose-gold)] transition-all duration-500 text-left cursor-pointer w-full max-w-sm"
                  >
                    <div className="aspect-[3/4] p-8 flex items-center justify-center overflow-hidden">
                      {cert.image_url && (
                        <img
                          src={resolveCmsAssetUrl(cert.image_url)}
                          alt={cert.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--aura-deep-brown)] via-[var(--aura-deep-brown)]/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="font-['Cormorant_Garamond'] text-sm text-white mb-1">
                        {cert.issuer}
                      </p>
                      <p className="font-['Inter'] text-xs text-white/70">
                        {cert.issue_date && new Date(cert.issue_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>
                  </motion.button>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Certificate Overlay Modal */}
      {selectedCert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCert(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full"
          >
            <button
              onClick={() => setSelectedCert(null)}
              aria-label="Close certificate modal"
              className="absolute -top-12 right-0 text-white hover:text-[var(--aura-rose-gold)] transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="bg-white relative">
              <div className="aspect-[3/4] overflow-hidden">
                {selectedCert.image_url && (
                  <img
                    src={resolveCmsAssetUrl(selectedCert.image_url)}
                    alt={selectedCert.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--aura-deep-brown)] to-transparent p-6">
                <p className="font-['Cormorant_Garamond'] text-2xl font-medium text-white mb-2">
                  {selectedCert.issuer}
                </p>
                <p className="font-['Inter'] text-sm text-white/80">
                  {selectedCert.issue_date && new Date(selectedCert.issue_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {selectedCert.description && (
              <div className="p-6 bg-[var(--aura-cream)]">
                <p className="font-['Inter'] text-[var(--aura-deep-brown)]">
                  {selectedCert.description}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
