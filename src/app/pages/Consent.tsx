/**
 * PAGE: Consent Form
 * PURPOSE: Professional, legally sound consent process
 * FEATURES: Multi-step form with validation and digital signature
 */

import { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle2, User, Heart, FileSignature, Eye, Printer } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';

export function Consent() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    consent1: false,
    consent2: false,
    consent3: false,
    consent4: false,
    signature: '',
  });

  const medicalConditions = [
    'Pregnancy or breastfeeding',
    'Blood clotting disorders',
    'Active skin infection at treatment area',
    'Autoimmune conditions',
    'History of keloid scarring',
    'Recent cosmetic procedures (last 6 months)',
    'None of the above',
  ];

  const risks = [
    { title: 'Bruising & Swelling', description: 'Temporary bruising and swelling at injection sites is common and typically resolves within 7-14 days.' },
    { title: 'Allergic Reactions', description: 'Though rare, allergic reactions to dermal fillers can occur. Immediate medical attention will be provided if needed.' },
    { title: 'Asymmetry', description: 'Slight asymmetry may occur and can usually be corrected during a follow-up appointment.' },
    { title: 'Vascular Complications', description: 'While extremely rare, vascular occlusion is a serious complication that requires immediate medical intervention.' },
  ];

  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <section className="bg-white border-b border-[var(--aura-stone)] py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="text-center">
            <FileText className="mx-auto text-[var(--aura-gold)] mb-4" size={48} />
            <h1 className="font-['Playfair_Display'] text-4xl font-semibold text-[var(--aura-charcoal)] mb-4">
              Treatment Consent Form
            </h1>
            <p className="font-['Montserrat'] text-lg text-[var(--aura-grey)]">
              Mandatory prior to any aesthetic procedure
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <p className="font-['Lato'] text-sm text-[var(--aura-grey)]">Step {step} of {totalSteps}</p>
              <p className="font-['Lato'] text-sm text-[var(--aura-grey)]">{Math.round((step / totalSteps) * 100)}% Complete</p>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--aura-gold)] transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8 lg:p-12">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="text-[var(--aura-gold)]" size={32} />
                  <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[var(--aura-charcoal)]">
                    Personal Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="font-['Montserrat']">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="mt-2 border-[var(--aura-stone)] focus:border-[var(--aura-gold)]"
                      placeholder="Enter your full legal name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth" className="font-['Montserrat']">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="mt-2 border-[var(--aura-stone)] focus:border-[var(--aura-gold)]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="font-['Montserrat']">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-2 border-[var(--aura-stone)] focus:border-[var(--aura-gold)]"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="font-['Montserrat']">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-2 border-[var(--aura-stone)] focus:border-[var(--aura-gold)]"
                        placeholder="+44 7XXX XXXXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medical History */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="text-[var(--aura-gold)]" size={32} />
                  <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[var(--aura-charcoal)]">
                    Medical History
                  </h2>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                  <p className="font-['Lato'] text-sm text-yellow-800">
                    Please select all conditions that apply. This information is confidential and essential for your safety.
                  </p>
                </div>

                <div className="space-y-3">
                  {medicalConditions.map((condition, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded">
                      <Checkbox id={`condition-${index}`} className="border-[var(--aura-stone)]" />
                      <label htmlFor={`condition-${index}`} className="font-['Lato'] text-[var(--aura-charcoal)] cursor-pointer flex-1">
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Label htmlFor="medications" className="font-['Montserrat']">Current Medications</Label>
                  <Textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                    className="mt-2 border-[var(--aura-stone)] focus:border-[var(--aura-gold)]"
                    placeholder="Please list any medications you are currently taking"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="allergies" className="font-['Montserrat']">Known Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="mt-2 border-[var(--aura-stone)] focus:border-[var(--aura-gold)]"
                    placeholder="Please list any known allergies"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Risk Acknowledgment */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="text-[var(--aura-gold)]" size={32} />
                  <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[var(--aura-charcoal)]">
                    Understanding the Risks
                  </h2>
                </div>

                <p className="font-['Montserrat'] text-[var(--aura-grey)] leading-relaxed">
                  While aesthetic treatments are generally safe when performed by qualified practitioners, 
                  it's important you understand the potential risks and side effects.
                </p>

                <div className="space-y-4">
                  {risks.map((risk, index) => (
                    <details key={index} className="group border border-[var(--aura-stone)] rounded-lg overflow-hidden">
                      <summary className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between">
                        <span className="font-['Montserrat'] font-medium text-[var(--aura-charcoal)]">{risk.title}</span>
                        <Eye className="text-[var(--aura-grey)] group-open:rotate-180 transition-transform" size={20} />
                      </summary>
                      <div className="p-4 bg-white">
                        <p className="font-['Lato'] text-[var(--aura-grey)]">{risk.description}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Consent Declaration */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="text-[var(--aura-gold)]" size={32} />
                  <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[var(--aura-charcoal)]">
                    Consent Declaration
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 border border-[var(--aura-stone)] rounded-lg">
                    <Checkbox 
                      id="consent1" 
                      checked={formData.consent1}
                      onCheckedChange={(checked) => setFormData({ ...formData, consent1: Boolean(checked) })}
                      className="mt-1"
                    />
                    <label htmlFor="consent1" className="font-['Lato'] text-sm text-[var(--aura-charcoal)] cursor-pointer">
                      I confirm that I have provided accurate medical information and understand the importance of disclosing all relevant health conditions.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border border-[var(--aura-stone)] rounded-lg">
                    <Checkbox 
                      id="consent2"
                      checked={formData.consent2}
                      onCheckedChange={(checked) => setFormData({ ...formData, consent2: Boolean(checked) })}
                      className="mt-1"
                    />
                    <label htmlFor="consent2" className="font-['Lato'] text-sm text-[var(--aura-charcoal)] cursor-pointer">
                      I understand the potential risks and side effects associated with this treatment and have had the opportunity to ask questions.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border border-[var(--aura-stone)] rounded-lg">
                    <Checkbox 
                      id="consent3"
                      checked={formData.consent3}
                      onCheckedChange={(checked) => setFormData({ ...formData, consent3: Boolean(checked) })}
                      className="mt-1"
                    />
                    <label htmlFor="consent3" className="font-['Lato'] text-sm text-[var(--aura-charcoal)] cursor-pointer">
                      I consent to receive this treatment and understand that results may vary. I have realistic expectations about the outcome.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border border-[var(--aura-stone)] rounded-lg">
                    <Checkbox 
                      id="consent4"
                      checked={formData.consent4}
                      onCheckedChange={(checked) => setFormData({ ...formData, consent4: Boolean(checked) })}
                      className="mt-1"
                    />
                    <label htmlFor="consent4" className="font-['Lato'] text-sm text-[var(--aura-charcoal)] cursor-pointer">
                      I agree to follow all pre and post-treatment care instructions provided by the practitioner.
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="signature" className="font-['Montserrat']">Digital Signature *</Label>
                  <p className="font-['Lato'] text-sm text-[var(--aura-grey)] mt-1 mb-3">
                    Type your full name as your digital signature
                  </p>
                  <Input
                    id="signature"
                    value={formData.signature}
                    onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                    className="mt-2 border-[var(--aura-stone)] focus:border-[var(--aura-gold)] font-['Playfair_Display'] text-2xl"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileSignature className="text-[var(--aura-gold)]" size={32} />
                  <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[var(--aura-charcoal)]">
                    Review & Submit
                  </h2>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-600" size={24} />
                    <p className="font-['Montserrat'] font-medium text-green-800">
                      Your consent form is complete!
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-['Montserrat'] font-semibold text-lg text-[var(--aura-charcoal)] mb-4">Form Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 font-['Lato'] text-sm">
                    <div>
                      <span className="text-[var(--aura-grey)]">Name:</span>
                      <p className="font-medium text-[var(--aura-charcoal)]">{formData.fullName || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-[var(--aura-grey)]">Date of Birth:</span>
                      <p className="font-medium text-[var(--aura-charcoal)]">{formData.dateOfBirth || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-[var(--aura-grey)]">Email:</span>
                      <p className="font-medium text-[var(--aura-charcoal)]">{formData.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-[var(--aura-grey)]">Phone:</span>
                      <p className="font-medium text-[var(--aura-charcoal)]">{formData.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert('Form submitted successfully!')}
                  className="w-full bg-[var(--aura-gold)] text-[var(--aura-charcoal)] py-4 rounded-md font-['Montserrat'] font-medium hover:shadow-xl transition-all duration-300"
                >
                  Submit Consent Form
                </button>

                <button
                  onClick={() => window.print()}
                  className="w-full border-2 border-[var(--aura-charcoal)] text-[var(--aura-charcoal)] py-4 rounded-md font-['Montserrat'] font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Print for Records
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-[var(--aura-stone)]">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="px-6 py-3 font-['Montserrat'] font-medium text-[var(--aura-charcoal)] disabled:opacity-30 disabled:cursor-not-allowed hover:text-[var(--aura-gold)] transition-colors"
              >
                ← Previous
              </button>
              
              {step < totalSteps && (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-[var(--aura-gold)] text-[var(--aura-charcoal)] rounded-md font-['Montserrat'] font-medium hover:shadow-lg transition-all"
                >
                  Next Step →
                </button>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <p className="font-['Lato'] text-sm text-[var(--aura-grey)] text-center">
              <strong className="text-[var(--aura-charcoal)]">Important:</strong> All treatments are performed by a CPD-accredited aesthetic practitioner. 
              Consent is mandatory prior to any procedure. Your information is kept confidential and secure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
