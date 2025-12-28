import { Award, Heart, Shield, Target, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function About() {
  const qualifications = [
    {
      id: 1,
      title: 'CPD Certified Aesthetic Practitioner',
      description: 'Comprehensive training in aesthetic medicine and patient care excellence',
      icon: Award,
    },
    {
      id: 2,
      title: 'Advanced Dermal Fillers',
      description: 'Specialized techniques in facial contouring and volume restoration',
      icon: Sparkles,
    },
    {
      id: 3,
      title: 'Lip Enhancement Specialist',
      description: 'Expert training in natural lip augmentation procedures',
      icon: Heart,
    },
    {
      id: 4,
      title: 'Facial Aesthetic Treatments',
      description: 'Advanced knowledge in facial anatomy and aesthetic enhancements',
      icon: Target,
    },
  ];

  const values = [
    {
      title: 'Safety First',
      description: 'Medical-grade protocols and sterilization in every treatment',
      icon: Shield,
    },
    {
      title: 'Natural Results',
      description: 'Enhancing your features while maintaining authenticity',
      icon: Heart,
    },
    {
      title: 'Ethical Practice',
      description: 'Honest consultations with realistic expectations',
      icon: CheckCircle2,
    },
    {
      title: 'Continuous Learning',
      description: 'Staying current with the latest techniques and innovations',
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--aura-cream)]">
      {/* Hero Section */}
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
              About Me
            </span>
            <h1 className="font-['Cormorant_Garamond'] text-6xl lg:text-7xl font-light text-[var(--aura-deep-brown)] mb-6">
              Artistry Meets
              <span className="block text-[var(--aura-rose-gold)] italic">Medical Excellence</span>
            </h1>
            <p className="font-['Inter'] text-xl text-[var(--aura-soft-taupe)] leading-relaxed">
              Dedicated to helping you feel confident through safe, sophisticated aesthetic treatments
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-20 lg:py-32 bg-white">
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
                  src="https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?w=800"
                  alt="Aesthetic Practitioner"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[var(--aura-nude)] -z-10" />
              <div className="absolute -top-12 -left-12 w-64 h-64 border-2 border-[var(--aura-rose-gold)]/20 -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-4xl lg:text-5xl font-light text-[var(--aura-deep-brown)] mb-6">
                  Your Journey to Confidence
                </h2>
                <div className="space-y-6 font-['Inter'] text-lg text-[var(--aura-soft-taupe)] leading-relaxed">
                  <p>
                    As a <strong className="text-[var(--aura-deep-brown)]">CPD-accredited aesthetic practitioner</strong>, 
                    I've dedicated my career to the art and science of aesthetic enhancement. Trained by Rejuvenate, 
                    one of the UK's most prestigious aesthetic training providers, I bring both expertise and artistry to every treatment.
                  </p>
                  <p>
                    My approach is rooted in the belief that true beauty enhancement comes from understanding and celebrating 
                    each person's unique features. Rather than following trends, I focus on creating harmonious, natural-looking 
                    results that stand the test of time.
                  </p>
                  <p>
                    Every consultation begins with listening—understanding your goals, concerns, and expectations. 
                    Through open dialogue and honest advice, we create a personalized treatment plan that aligns with 
                    your vision while maintaining the highest safety standards.
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-[var(--aura-rose-gold)]/20">
                <div className="inline-flex items-center gap-4 bg-[var(--aura-nude)]/50 px-8 py-5">
                  <Award className="w-10 h-10 text-[var(--aura-rose-gold)]" />
                  <div>
                    <p className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)]">
                      CPD Accredited
                    </p>
                    <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">
                      Trained by Rejuvenate
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Qualifications */}
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
              const Icon = qual.icon;
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

      {/* Values */}
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
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
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

      {/* Certifications Gallery */}
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

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[var(--aura-rose-gold)] transition-all duration-500"
              >
                <div className="aspect-[3/4] p-8 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1638636241638-aef5120c5153?w=400"
                    alt={`Certificate ${i}`}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--aura-deep-brown)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
