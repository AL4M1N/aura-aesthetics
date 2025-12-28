/**
 * PAGE: Booking, Payment & Location
 * PURPOSE: Seamless booking and payment experience
 * SECTIONS: Booking System, Payment Options, Location, Cancellation Policy
 */

import { useState } from 'react';
import { Calendar, Clock, MapPin, CreditCard, AlertTriangle, Phone, Mail, MessageCircle } from 'lucide-react';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function Booking() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentOption, setPaymentOption] = useState('deposit');

  const services = [
    { value: 'lip-05ml', label: '0.5ml Lip Filler - £120-£150', duration: '45 mins' },
    { value: 'lip-1ml', label: '1ml Lip Filler - £180-£250', duration: '60 mins' },
    { value: 'nasolabial', label: 'Nasolabial Lines - from £180', duration: '45 mins' },
    { value: 'marionette', label: 'Marionette Lines - from £180', duration: '45 mins' },
    { value: 'cheek', label: 'Cheek Enhancement - from £200', duration: '60 mins' },
    { value: 'consultation', label: 'Initial Consultation - Free/£20', duration: '30 mins' },
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <section className="bg-white border-b border-[var(--aura-stone)] py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Calendar className="mx-auto text-[var(--aura-gold)] mb-4" size={48} />
            <h1 className="font-['Playfair_Display'] text-5xl font-semibold text-[var(--aura-charcoal)] mb-4">
              Book Your Appointment
            </h1>
            <p className="font-['Montserrat'] text-lg text-[var(--aura-grey)]">
              Choose your preferred date, time, and treatment. We'll confirm your appointment within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Booking System */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Selection */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[var(--aura-charcoal)] mb-6">
                  Select Treatment
                </h2>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-full border-[var(--aura-stone)] focus:border-[var(--aura-gold)]">
                    <SelectValue placeholder="Choose your treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.value} value={service.value} className="font-['Montserrat']">
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Calendar Selection */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[var(--aura-charcoal)] mb-6">
                  Choose Date
                </h2>
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="mx-auto border border-[var(--aura-stone)] rounded-lg p-4"
                  disabled={(date) => date < new Date()}
                />
              </div>

              {/* Time Selection */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[var(--aura-charcoal)] mb-6">
                  Select Time
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-4 rounded-md border-2 font-['Montserrat'] font-medium transition-all ${
                        selectedTime === time
                          ? 'border-[var(--aura-gold)] bg-[var(--aura-gold)] text-[var(--aura-charcoal)]'
                          : 'border-[var(--aura-stone)] text-[var(--aura-charcoal)] hover:border-[var(--aura-gold)]'
                      }`}
                    >
                      <Clock size={16} className="inline mr-2" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Options */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-[var(--aura-charcoal)] mb-6">
                  Payment Method
                </h2>
                
                <div className="space-y-4 mb-6">
                  <label 
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentOption === 'deposit' 
                        ? 'border-[var(--aura-gold)] bg-[var(--aura-gold)]/5' 
                        : 'border-[var(--aura-stone)]'
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
                      <p className="font-['Montserrat'] font-semibold text-[var(--aura-charcoal)] mb-1">
                        Pay Deposit Now (Recommended)
                      </p>
                      <p className="font-['Lato'] text-sm text-[var(--aura-grey)]">
                        Secure your appointment with a £20 deposit, redeemable against treatment
                      </p>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentOption === 'clinic' 
                        ? 'border-[var(--aura-gold)] bg-[var(--aura-gold)]/5' 
                        : 'border-[var(--aura-stone)]'
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
                      <p className="font-['Montserrat'] font-semibold text-[var(--aura-charcoal)] mb-1">
                        Pay at Clinic
                      </p>
                      <p className="font-['Lato'] text-sm text-[var(--aura-grey)]">
                        Pay in full on the day of your appointment
                      </p>
                    </div>
                  </label>
                </div>

                {paymentOption === 'deposit' && (
                  <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <CreditCard className="text-[var(--aura-grey)]" size={24} />
                    <p className="font-['Lato'] text-sm text-[var(--aura-grey)]">
                      Secure payment powered by Stripe • All major cards accepted
                    </p>
                  </div>
                )}

                <button
                  className="w-full mt-6 bg-[var(--aura-gold)] text-[var(--aura-charcoal)] py-4 rounded-md font-['Montserrat'] font-medium hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {paymentOption === 'deposit' ? 'Proceed to Payment' : 'Confirm Booking'}
                </button>
              </div>
            </div>

            {/* Right Column - Summary & Info */}
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="font-['Playfair_Display'] text-xl font-semibold text-[var(--aura-charcoal)] mb-6">
                  Booking Summary
                </h3>
                
                <div className="space-y-4 pb-6 border-b border-[var(--aura-stone)]">
                  <div>
                    <p className="font-['Lato'] text-sm text-[var(--aura-grey)] mb-1">Service</p>
                    <p className="font-['Montserrat'] font-medium text-[var(--aura-charcoal)]">
                      {selectedService ? services.find(s => s.value === selectedService)?.label : 'Not selected'}
                    </p>
                  </div>

                  {selectedService && (
                    <div>
                      <p className="font-['Lato'] text-sm text-[var(--aura-grey)] mb-1">Duration</p>
                      <p className="font-['Montserrat'] font-medium text-[var(--aura-charcoal)]">
                        {services.find(s => s.value === selectedService)?.duration}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-['Lato'] text-sm text-[var(--aura-grey)] mb-1">Date</p>
                    <p className="font-['Montserrat'] font-medium text-[var(--aura-charcoal)]">
                      {date ? date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not selected'}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Lato'] text-sm text-[var(--aura-grey)] mb-1">Time</p>
                    <p className="font-['Montserrat'] font-medium text-[var(--aura-charcoal)]">
                      {selectedTime || 'Not selected'}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <p className="font-['Lato'] text-sm text-[var(--aura-grey)] mb-2">Next Steps:</p>
                  <ol className="font-['Lato'] text-sm text-[var(--aura-charcoal)] space-y-2 list-decimal list-inside">
                    <li>Complete booking</li>
                    <li>Receive confirmation email</li>
                    <li>Complete consent form</li>
                    <li>Attend your appointment</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-['Playfair_Display'] text-4xl font-semibold text-[var(--aura-charcoal)] mb-12 text-center">
              Find Us
            </h2>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Map */}
              <div className="bg-gray-200 rounded-lg overflow-hidden h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d39820.48484891649!2d0.04363!3d51.559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a7a4e6b6e12f%3A0x3c4c0f0f0f0f0f0f!2sIlford%2C%20UK!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Clinic Location"
                />
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-['Montserrat'] font-semibold text-xl text-[var(--aura-charcoal)] mb-4">
                    Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="text-[var(--aura-gold)] flex-shrink-0 mt-1" size={24} />
                      <div>
                        <p className="font-['Montserrat'] font-medium text-[var(--aura-charcoal)] mb-1">
                          Clinic Address
                        </p>
                        <p className="font-['Lato'] text-[var(--aura-grey)]">
                          Ilford, London<br />
                          United Kingdom
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Mail className="text-[var(--aura-gold)] flex-shrink-0 mt-1" size={24} />
                      <div>
                        <p className="font-['Montserrat'] font-medium text-[var(--aura-charcoal)] mb-1">
                          Email
                        </p>
                        <a 
                          href="mailto:info@auraaesthetics.co.uk"
                          className="font-['Lato'] text-[var(--aura-grey)] hover:text-[var(--aura-gold)] transition-colors"
                        >
                          info@auraaesthetics.co.uk
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone className="text-[var(--aura-gold)] flex-shrink-0 mt-1" size={24} />
                      <div>
                        <p className="font-['Montserrat'] font-medium text-[var(--aura-charcoal)] mb-1">
                          Phone
                        </p>
                        <a 
                          href="tel:+447XXX123456"
                          className="font-['Lato'] text-[var(--aura-grey)] hover:text-[var(--aura-gold)] transition-colors"
                        >
                          +44 7XXX 123456
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <MessageCircle className="text-[var(--aura-gold)] flex-shrink-0 mt-1" size={24} />
                      <div>
                        <p className="font-['Montserrat'] font-medium text-[var(--aura-charcoal)] mb-1">
                          WhatsApp
                        </p>
                        <a 
                          href="https://wa.me/447XXX123456"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-['Lato'] text-[var(--aura-grey)] hover:text-[var(--aura-gold)] transition-colors"
                        >
                          Message us on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cancellation Policy */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-l-4 border-[var(--aura-gold)] rounded-lg shadow-md p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-[var(--aura-gold)] flex-shrink-0 mt-1" size={32} />
                <div>
                  <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-[var(--aura-charcoal)] mb-4">
                    Cancellation Policy
                  </h3>
                  <div className="space-y-3 font-['Lato'] text-[var(--aura-grey)]">
                    <p>
                      <strong className="text-[var(--aura-charcoal)]">24-48 hours notice required for cancellations.</strong>
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
          </div>
        </div>
      </section>
    </div>
  );
}
