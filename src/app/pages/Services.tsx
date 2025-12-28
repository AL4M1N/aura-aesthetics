import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Info, Calendar, ArrowRight, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'motion/react';

export function Services() {
  const [activeTab, setActiveTab] = useState('lip-fillers');

  const lipFillers = [
    { 
      id: 1, 
      title: '0.5ml Lip Enhancement', 
      price: '£120 – £150', 
      description: 'Perfect for first-timers seeking subtle, natural-looking fullness',
      features: ['Natural volume', 'Defined shape', 'Hydrated appearance'],
      duration: '45 mins',
    },
    { 
      id: 2, 
      title: '1ml Lip Enhancement', 
      price: '£180 – £250', 
      description: 'Ideal for achieving fuller, more dramatic results with balanced proportions',
      features: ['Enhanced volume', 'Refined contour', 'Long-lasting results'],
      duration: '60 mins',
    },
  ];

  const dermalFillers = [
    { 
      id: 1, 
      title: 'Nasolabial Folds', 
      price: 'from £180', 
      description: 'Smooth and soften smile lines for a more youthful appearance',
      features: ['Reduced lines', 'Natural movement', 'Instant results'],
      duration: '45 mins',
    },
    { 
      id: 2, 
      title: 'Marionette Lines', 
      price: 'from £180', 
      description: 'Lift and restore volume to the lower face and jawline',
      features: ['Lifted appearance', 'Defined jaw', 'Subtle enhancement'],
      duration: '45 mins',
    },
    { 
      id: 3, 
      title: 'Cheek Enhancement', 
      price: 'from £200', 
      description: 'Add dimension and definition to restore youthful contours',
      features: ['Enhanced structure', 'Natural lift', 'Balanced proportions'],
      duration: '60 mins',
    },
  ];

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto bg-transparent border border-[var(--aura-rose-gold)]/20 p-0 mb-16">
              {['lip-fillers', 'dermal-fillers', 'consultation'].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab}
                  className="font-['Inter'] text-sm tracking-wider py-5 data-[state=active]:bg-[var(--aura-deep-brown)] data-[state=active]:text-white transition-all duration-300 rounded-none border-r border-[var(--aura-rose-gold)]/20 last:border-r-0"
                >
                  {tab === 'lip-fillers' ? 'Lip Enhancement' : tab === 'dermal-fillers' ? 'Dermal Fillers' : 'Consultation'}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Lip Fillers */}
            <TabsContent value="lip-fillers" className="mt-0">
              <div className="grid md:grid-cols-2 gap-8">
                {lipFillers.map((treatment, index) => (
                  <motion.div
                    key={treatment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-[var(--aura-cream)] p-10 hover:bg-[var(--aura-deep-brown)] transition-all duration-500"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-['Cormorant_Garamond'] text-3xl font-medium text-[var(--aura-deep-brown)] group-hover:text-white transition-colors duration-500">
                        {treatment.title}
                      </h3>
                      <span className="font-['Inter'] text-sm text-[var(--aura-rose-gold)] whitespace-nowrap ml-4">
                        {treatment.duration}
                      </span>
                    </div>
                    
                    <p className="font-['Inter'] text-[var(--aura-soft-taupe)] group-hover:text-white/80 mb-6 transition-colors duration-500">
                      {treatment.description}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {treatment.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 font-['Inter'] text-sm text-[var(--aura-deep-brown)] group-hover:text-white transition-colors duration-500">
                          <Check className="w-4 h-4 text-[var(--aura-rose-gold)]" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-end justify-between pt-6 border-t border-[var(--aura-rose-gold)]/20">
                      <span className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-rose-gold)]">
                        {treatment.price}
                      </span>
                      <Link
                        to="/booking"
                        className="inline-flex items-center gap-2 font-['Inter'] text-sm text-[var(--aura-deep-brown)] group-hover:text-white transition-colors duration-500"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Dermal Fillers */}
            <TabsContent value="dermal-fillers" className="mt-0">
              <div className="grid md:grid-cols-2 gap-8">
                {dermalFillers.map((treatment, index) => (
                  <motion.div
                    key={treatment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-[var(--aura-cream)] p-10 hover:bg-[var(--aura-deep-brown)] transition-all duration-500"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-['Cormorant_Garamond'] text-3xl font-medium text-[var(--aura-deep-brown)] group-hover:text-white transition-colors duration-500">
                        {treatment.title}
                      </h3>
                      <span className="font-['Inter'] text-sm text-[var(--aura-rose-gold)] whitespace-nowrap ml-4">
                        {treatment.duration}
                      </span>
                    </div>
                    
                    <p className="font-['Inter'] text-[var(--aura-soft-taupe)] group-hover:text-white/80 mb-6 transition-colors duration-500">
                      {treatment.description}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {treatment.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 font-['Inter'] text-sm text-[var(--aura-deep-brown)] group-hover:text-white transition-colors duration-500">
                          <Check className="w-4 h-4 text-[var(--aura-rose-gold)]" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-end justify-between pt-6 border-t border-[var(--aura-rose-gold)]/20">
                      <span className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-rose-gold)]">
                        {treatment.price}
                      </span>
                      <Link
                        to="/booking"
                        className="inline-flex items-center gap-2 font-['Inter'] text-sm text-[var(--aura-deep-brown)] group-hover:text-white transition-colors duration-500"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Consultation */}
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
                <div className="inline-block bg-[var(--aura-nude)]/30 px-12 py-8 mb-8">
                  <p className="font-['Cormorant_Garamond'] text-5xl font-light text-[var(--aura-rose-gold)] mb-2">
                    Complimentary
                  </p>
                  <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">
                    or £20 redeemable against treatment
                  </p>
                </div>
                <Link
                  to="/booking"
                  className="inline-block px-12 py-5 bg-[var(--aura-deep-brown)] text-white font-['Inter'] text-sm tracking-wider hover:bg-[var(--aura-rose-gold)] transition-colors duration-300"
                >
                  Schedule Consultation
                </Link>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Important Information */}
      <section className="py-20 bg-[var(--aura-cream)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 border-l-4 border-[var(--aura-rose-gold)]"
            >
              <div className="flex items-start gap-6">
                <AlertCircle className="w-6 h-6 text-[var(--aura-rose-gold)] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)] mb-3">
                    Consultation Required
                  </h3>
                  <p className="font-['Inter'] text-[var(--aura-soft-taupe)]">
                    All treatments require an initial consultation to ensure suitability and discuss realistic expectations. 
                    Your safety and satisfaction are our highest priorities.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 border-l-4 border-[var(--aura-deep-brown)]"
            >
              <div className="flex items-start gap-6">
                <Info className="w-6 h-6 text-[var(--aura-deep-brown)] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-['Cormorant_Garamond'] text-2xl font-medium text-[var(--aura-deep-brown)] mb-3">
                    Professional Excellence
                  </h3>
                  <p className="font-['Inter'] text-[var(--aura-soft-taupe)]">
                    All treatments performed by a CPD-accredited aesthetic practitioner using premium, 
                    medical-grade products in a safe, professional environment.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-[var(--aura-deep-brown)] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-['Cormorant_Garamond'] text-5xl lg:text-6xl font-light mb-8">
              Ready to Begin?
            </h2>
            <p className="font-['Inter'] text-lg text-white/70 mb-12 max-w-2xl mx-auto">
              Book your complimentary consultation and discover which treatment is perfect for you
            </p>
            <Link
              to="/booking"
              className="inline-block px-12 py-5 bg-[var(--aura-rose-gold)] text-white font-['Inter'] text-sm tracking-wider hover:bg-white hover:text-[var(--aura-deep-brown)] transition-all duration-300"
            >
              Book Consultation
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
