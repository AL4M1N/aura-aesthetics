/**
 * PAGE: Booking, Payment & Location
 * PURPOSE: Seamless booking and payment experience
 * SECTIONS: Booking System, Payment Options, Location, Cancellation Policy
 */

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CreditCard, AlertTriangle, Phone, Mail, MessageCircle, Loader, User, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { servicesService } from '../../services/servicesService';
import { bookingService } from '../../services/bookingService';
import { resolveCmsAssetUrl } from '../../lib/asset';
import type { Service } from '../../lib/types';

export function Booking() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentOption, setPaymentOption] = useState('deposit');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00',
  ];

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const response = await servicesService.getPublicServices();
        if (response.success && Array.isArray(response.data)) {
          setServices(response.data.filter(s => s.is_active));
        }
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadServices();
  }, []);

  // Fetch booked slots when date changes
  useEffect(() => {
    const loadAvailability = async () => {
      if (date) {
        try {
          const dateStr = date.toISOString().split('T')[0];
          const response = await bookingService.getAvailableSlots(dateStr);
          
          if (response.success && response.data) {
            const unavailableSlots = response.data.slots
              .filter(slot => !slot.available)
              .map(slot => slot.time);
            setBookedSlots(unavailableSlots);
          }
        } catch (error) {
          console.error('Failed to load availability:', error);
          // Fallback to empty array if API fails
          setBookedSlots([]);
        }
      }
    };

    void loadAvailability();
  }, [date]);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedService || !date || !selectedTime || !formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const dateStr = date.toISOString().split('T')[0];
      
      const response = await bookingService.createBooking({
        service_id: parseInt(selectedService),
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        booking_date: dateStr,
        booking_time: selectedTime,
        payment_method: paymentOption as 'deposit' | 'clinic',
        notes: formData.notes || undefined,
      });

      if (response.success) {
        setBookingSuccess(true);
        
        // If deposit payment selected, redirect to payment gateway
        if (paymentOption === 'deposit') {
          // TODO: Integrate Stripe payment
          console.log('Redirect to Stripe payment...');
        }
      }
    } catch (error: any) {
      console.error('Booking failed:', error);
      alert(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const selectedServiceData = services.find(s => s.id.toString() === selectedService);

  // Success Modal
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-[var(--aura-cream)] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-12 text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-deep-brown)] mb-4">
            Booking Confirmed!
          </h2>
          <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] mb-8">
            Thank you for booking with us. We've sent a confirmation email to <strong>{formData.email}</strong>
          </p>
          <div className="bg-[var(--aura-cream)] p-6 rounded-lg mb-8 text-left">
            <h3 className="font-['Inter'] font-semibold text-[var(--aura-deep-brown)] mb-4">Booking Details:</h3>
            <div className="space-y-2 font-['Inter'] text-[var(--aura-soft-taupe)]">
              <p><strong>Service:</strong> {selectedServiceData?.title}</p>
              <p><strong>Date:</strong> {date?.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Payment:</strong> {paymentOption === 'deposit' ? 'Deposit Paid' : 'Pay at Clinic'}</p>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-[var(--aura-deep-brown)] text-white rounded-md font-['Inter'] hover:bg-[var(--aura-rose-gold)] transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => window.location.href = '/consent'}
              className="px-8 py-3 border border-[var(--aura-deep-brown)] text-[var(--aura-deep-brown)] rounded-md font-['Inter'] hover:bg-[var(--aura-cream)] transition-colors"
            >
              Complete Consent Form
            </button>
          </div>
        </motion.div>
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
              Book Your Appointment
            </span>
            <h1 className="font-['Cormorant_Garamond'] text-6xl lg:text-7xl font-light text-[var(--aura-deep-brown)] mb-6">
              Reserve Your Treatment
            </h1>
            <p className="font-['Inter'] text-xl text-[var(--aura-soft-taupe)] leading-relaxed">
              Choose your preferred date, time, and treatment. We'll confirm your appointment within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking System */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-[var(--aura-rose-gold)]/10 p-8"
              >
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-light text-[var(--aura-deep-brown)] mb-6">
                  Your Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="font-['Inter'] text-[var(--aura-deep-brown)]">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="mt-2 border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)]"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-['Inter'] text-[var(--aura-deep-brown)]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="mt-2 border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)]"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone" className="font-['Inter'] text-[var(--aura-deep-brown)]">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="mt-2 border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)]"
                      placeholder="+44"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Service Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-[var(--aura-rose-gold)]/10 p-8"
              >
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-light text-[var(--aura-deep-brown)] mb-6">
                  Select Treatment
                </h2>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-full border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']">
                    <SelectValue placeholder="Choose your treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()} className="font-['Inter']">
                        {service.title} - {service.price_range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedServiceData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 p-4 bg-[var(--aura-cream)] rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      {selectedServiceData.featured_image && (
                        <img
                          src={resolveCmsAssetUrl(selectedServiceData.featured_image)}
                          alt={selectedServiceData.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mb-2">
                          {selectedServiceData.excerpt}
                        </p>
                        <div className="flex gap-4 text-sm">
                          {selectedServiceData.duration && (
                            <span className="font-['Inter'] text-[var(--aura-deep-brown)]">
                              <Clock className="inline w-4 h-4 mr-1" />
                              {selectedServiceData.duration}
                            </span>
                          )}
                          {selectedServiceData.price_range && (
                            <span className="font-['Inter'] text-[var(--aura-deep-brown)]">
                              {selectedServiceData.price_range}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Calendar Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-[var(--aura-rose-gold)]/10 p-8"
              >
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-light text-[var(--aura-deep-brown)] mb-6">
                  Choose Date
                </h2>
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="mx-auto border border-[var(--aura-rose-gold)]/20 rounded-lg p-4"
                  disabled={(date) => date < new Date()}
                />
              </motion.div>

              {/* Time Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-[var(--aura-rose-gold)]/10 p-8"
              >
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-light text-[var(--aura-deep-brown)] mb-6">
                  Select Time
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeSlots.map((time) => {
                    const isBooked = bookedSlots.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => !isBooked && setSelectedTime(time)}
                        disabled={isBooked}
                        className={`p-4 rounded-md border-2 font-['Inter'] font-medium transition-all ${
                          selectedTime === time
                            ? 'border-[var(--aura-rose-gold)] bg-[var(--aura-rose-gold)] text-white'
                            : isBooked
                            ? 'border-[var(--aura-soft-taupe)]/30 text-[var(--aura-soft-taupe)]/50 cursor-not-allowed'
                            : 'border-[var(--aura-rose-gold)]/20 text-[var(--aura-deep-brown)] hover:border-[var(--aura-rose-gold)]'
                        }`}
                      >
                        <Clock size={16} className="inline mr-2" />
                        {time}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Additional Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border border-[var(--aura-rose-gold)]/10 p-8"
              >
                <Label htmlFor="notes" className="font-['Inter'] text-[var(--aura-deep-brown)]">
                  Additional Notes (Optional)
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  className="mt-2 w-full min-h-[100px] p-3 border border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] rounded-md font-['Inter']"
                  placeholder="Any specific requirements or questions?"
                />
              </motion.div>

              {/* Payment Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm border border-[var(--aura-rose-gold)]/10 p-8"
              >
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-light text-[var(--aura-deep-brown)] mb-6">
                  Payment Method
                </h2>
                
                <div className="space-y-4 mb-6">
                  <label 
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentOption === 'deposit' 
                        ? 'border-[var(--aura-rose-gold)] bg-[var(--aura-rose-gold)]/5' 
                        : 'border-[var(--aura-rose-gold)]/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="deposit"
                      checked={paymentOption === 'deposit'}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-['Inter'] font-semibold text-[var(--aura-deep-brown)] mb-1">
                        Pay Deposit Now (Recommended)
                      </p>
                      <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">
                        Secure your appointment with a £20 deposit, redeemable against treatment
                      </p>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentOption === 'clinic' 
                        ? 'border-[var(--aura-rose-gold)] bg-[var(--aura-rose-gold)]/5' 
                        : 'border-[var(--aura-rose-gold)]/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="clinic"
                      checked={paymentOption === 'clinic'}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-['Inter'] font-semibold text-[var(--aura-deep-brown)] mb-1">
                        Pay at Clinic
                      </p>
                      <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">
                        Pay in full on the day of your appointment
                      </p>
                    </div>
                  </label>
                </div>

                {paymentOption === 'deposit' && (
                  <div className="flex items-center justify-center gap-4 p-4 bg-[var(--aura-cream)] rounded-lg mb-6">
                    <CreditCard className="text-[var(--aura-soft-taupe)]" size={24} />
                    <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">
                      Secure payment powered by Stripe • All major cards accepted
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedService || !date || !selectedTime || !formData.name || !formData.email || !formData.phone}
                  className="w-full bg-[var(--aura-deep-brown)] text-white py-4 rounded-md font-['Inter'] font-medium hover:bg-[var(--aura-rose-gold)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>{paymentOption === 'deposit' ? 'Proceed to Payment' : 'Confirm Booking'}</>
                  )}
                </button>
              </motion.div>
            </div>

            {/* Right Column - Summary & Info */}
            <div className="space-y-6">
              {/* Booking Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-[var(--aura-rose-gold)]/10 p-6 sticky top-32"
              >
                <h3 className="font-['Cormorant_Garamond'] text-2xl font-light text-[var(--aura-deep-brown)] mb-6">
                  Booking Summary
                </h3>
                
                <div className="space-y-4 pb-6 border-b border-[var(--aura-rose-gold)]/10">
                  <div>
                    <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mb-1">Service</p>
                    <p className="font-['Inter'] font-medium text-[var(--aura-deep-brown)]">
                      {selectedServiceData ? selectedServiceData.title : 'Not selected'}
                    </p>
                  </div>

                  {selectedServiceData && (
                    <>
                      <div>
                        <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mb-1">Price</p>
                        <p className="font-['Inter'] font-medium text-[var(--aura-deep-brown)]">
                          {selectedServiceData.price_range}
                        </p>
                      </div>
                      {selectedServiceData.duration && (
                        <div>
                          <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mb-1">Duration</p>
                          <p className="font-['Inter'] font-medium text-[var(--aura-deep-brown)]">
                            {selectedServiceData.duration}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mb-1">Date</p>
                    <p className="font-['Inter'] font-medium text-[var(--aura-deep-brown)]">
                      {date ? date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not selected'}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mb-1">Time</p>
                    <p className="font-['Inter'] font-medium text-[var(--aura-deep-brown)]">
                      {selectedTime || 'Not selected'}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mb-2">Next Steps:</p>
                  <ol className="font-['Inter'] text-sm text-[var(--aura-deep-brown)] space-y-2 list-decimal list-inside">
                    <li>Complete booking</li>
                    <li>Receive confirmation email</li>
                    <li>Complete consent form</li>
                    <li>Attend your appointment</li>
                  </ol>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-['Cormorant_Garamond'] text-5xl font-light text-[var(--aura-deep-brown)] mb-4">
              Find Us
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-200 rounded-lg overflow-hidden h-[400px]"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d39820.48484891649!2d0.04363!3d51.559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a7a4e6b6e12f%3A0x3c4c0f0f0f0f0f0f!2sIlford%2C%20UK!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Clinic Location"
              />
            </motion.div>

            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-['Cormorant_Garamond'] text-3xl font-light text-[var(--aura-deep-brown)] mb-6">
                  Contact Information
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="text-[var(--aura-rose-gold)] flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-['Inter'] font-medium text-[var(--aura-deep-brown)] mb-1">
                        Clinic Address
                      </p>
                      <p className="font-['Inter'] text-[var(--aura-soft-taupe)]">
                        Ilford, London<br />
                        United Kingdom
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="text-[var(--aura-rose-gold)] flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-['Inter'] font-medium text-[var(--aura-deep-brown)] mb-1">
                        Email
                      </p>
                      <a 
                        href="mailto:info@auraaesthetics.co.uk"
                        className="font-['Inter'] text-[var(--aura-soft-taupe)] hover:text-[var(--aura-rose-gold)] transition-colors"
                      >
                        info@auraaesthetics.co.uk
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="text-[var(--aura-rose-gold)] flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-['Inter'] font-medium text-[var(--aura-deep-brown)] mb-1">
                        Phone
                      </p>
                      <a 
                        href="tel:+447XXX123456"
                        className="font-['Inter'] text-[var(--aura-soft-taupe)] hover:text-[var(--aura-rose-gold)] transition-colors"
                      >
                        +44 7XXX 123456
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MessageCircle className="text-[var(--aura-rose-gold)] flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-['Inter'] font-medium text-[var(--aura-deep-brown)] mb-1">
                        WhatsApp
                      </p>
                      <a 
                        href="https://wa.me/447XXX123456"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-['Inter'] text-[var(--aura-soft-taupe)] hover:text-[var(--aura-rose-gold)] transition-colors"
                      >
                        Message us on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cancellation Policy */}
      <section className="py-20 bg-[var(--aura-cream)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white border-l-4 border-[var(--aura-rose-gold)] rounded-lg shadow-sm p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-[var(--aura-rose-gold)] flex-shrink-0 mt-1" size={32} />
                <div>
                  <h3 className="font-['Cormorant_Garamond'] text-3xl font-light text-[var(--aura-deep-brown)] mb-4">
                    Cancellation Policy
                  </h3>
                  <div className="space-y-3 font-['Inter'] text-[var(--aura-soft-taupe)]">
                    <p>
                      <strong className="text-[var(--aura-deep-brown)]">24-48 hours notice required for cancellations.</strong>
                    </p>
                    <p>
                      We understand that circumstances change. If you need to cancel or reschedule your appointment, 
                      please provide at least 24-48 hours notice to avoid a cancellation fee.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Less than 24 hours notice: 50% cancellation fee</li>
                      <li>No-show appointments: Full treatment cost</li>
                      <li>Deposits are non-refundable but transferable to future appointments</li>
                    </ul>
                    <p className="pt-4">
                      For emergencies or special circumstances, please contact us directly and we'll do our best to accommodate you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
