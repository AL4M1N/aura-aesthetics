/**
 * PAGE: Consent Form
 * PURPOSE: Professional, legally sound consent process
 * FEATURES: Multi-step form with validation and digital signature
 */

import { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle2, User, Heart, FileSignature, Eye, Printer, Loader, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../components/ui/input';
import DatePicker from '../components/DatePicker';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { consentService, type ConsentFormPayload } from '../../services/consentService';
import { SEOHead } from '../components/SEOHead';

export function Consent() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedFormId, setSubmittedFormId] = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    consentInformationAccuracy: false,
    consentTreatmentInformation: false,
    consentRisks: false,
    consentAuthorization: false,
    signature: '',
  });

  const medicalConditions = [
    'Pregnancy or breastfeeding',
    'Blood clotting disorders',
    'Active skin infection at treatment area',
    'Autoimmune conditions',
    'History of keloid scarring',
    'Recent cosmetic procedures (last 6 months)',
    'Diabetes',
    'Heart conditions',
    'Currently taking blood thinners',
    'None of the above',
  ];

  const risks = [
    { 
      title: 'Bruising & Swelling', 
      description: 'Temporary bruising and swelling at injection sites is common and typically resolves within 7-14 days. Cold compresses and arnica gel may help reduce symptoms.' 
    },
    { 
      title: 'Allergic Reactions', 
      description: 'Though rare, allergic reactions to dermal fillers or toxins can occur. Immediate medical attention will be provided if needed. Please inform us of any known allergies.' 
    },
    { 
      title: 'Asymmetry', 
      description: 'Slight asymmetry may occur due to natural facial structures or product settling. This can usually be corrected during a follow-up appointment.' 
    },
    { 
      title: 'Vascular Complications', 
      description: 'While extremely rare, vascular occlusion (blockage of blood vessels) is a serious complication that requires immediate medical intervention. This is why treatments are only performed by qualified practitioners.' 
    },
    { 
      title: 'Infection', 
      description: 'Any skin-breaking procedure carries a small risk of infection. Proper aftercare and following post-treatment instructions minimizes this risk.' 
    },
  ];

  const totalSteps = 5;

  const handleConditionToggle = (condition: string) => {
    setSelectedConditions(prev => {
      if (condition === 'None of the above') {
        return prev.includes(condition) ? [] : ['None of the above'];
      }
      const filtered = prev.filter(c => c !== 'None of the above');
      return filtered.includes(condition)
        ? filtered.filter(c => c !== condition)
        : [...filtered, condition];
    });
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.fullName && formData.dateOfBirth && formData.email && formData.phone);
      case 2:
        return selectedConditions.length > 0;
      case 3:
        return true; // Just review, no validation needed
      case 4:
        return !!(formData.consentInformationAccuracy && formData.consentTreatmentInformation && formData.consentRisks && formData.consentAuthorization && formData.signature);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step) && step < totalSteps) {
      setStep(step + 1);
    } else if (!validateStep(step)) {
      alert('Please complete all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      alert('Please complete all consent declarations and provide your signature.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare payload matching API interface
      const payload: ConsentFormPayload = {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        emergency_contact: formData.emergencyContact || undefined,
        emergency_phone: formData.emergencyPhone || undefined,
        medical_conditions: selectedConditions,
        medications: formData.medications || undefined,
        allergies: formData.allergies || undefined,
        medical_history: formData.medicalHistory || undefined,
        consent_information_accuracy: formData.consentInformationAccuracy,
        consent_treatment_information: formData.consentTreatmentInformation,
        consent_risks: formData.consentRisks,
        consent_authorization: formData.consentAuthorization,
        signature: formData.signature,
      };

      const response = await consentService.submitConsentForm(payload);
      
      // Store the form ID for PDF download
      if (response.data?.id) {
        setSubmittedFormId(response.data.id);
      }
      
      setSubmitted(true);
    } catch (error: any) {
      console.error('Failed to submit consent form:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit consent form. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!submittedFormId) {
      alert('Form ID not available. Please refresh and try again.');
      return;
    }

    try {
      setDownloadingPdf(true);
      const blob = await consentService.exportConsentFormPDF(submittedFormId);
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consent-form-${submittedFormId}-${formData.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download consent form. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--aura-cream)] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-12 text-center"
        >
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-deep-brown)] mb-4">
            Consent Form Submitted
          </h2>
          <p className="font-['Inter'] text-lg text-[var(--aura-soft-taupe)] mb-8">
            Thank you for completing the consent form. A copy has been sent to your email address.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-[var(--aura-deep-brown)] text-white rounded-md font-['Inter'] hover:bg-[var(--aura-rose-gold)] transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="px-8 py-3 border border-[var(--aura-deep-brown)] text-[var(--aura-deep-brown)] rounded-md font-['Inter'] hover:bg-[var(--aura-cream)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingPdf ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Printer size={20} />
                  Download Copy
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--aura-cream)]">
      <SEOHead 
        pageType="consent"
        fallbackTitle="Consent Form - Aura Aesthetics | Treatment Agreement"
        fallbackDescription="Complete your treatment consent form online. Secure and professional documentation for your aesthetic treatment journey with Aura Aesthetics."
        fallbackKeywords="consent form, treatment agreement, aesthetic consent, medical form, beauty treatment consent"
      />
      
  {/* Hero Section */}
  <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-visible">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white/50 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <FileText className="mx-auto text-[var(--aura-rose-gold)] mb-6" size={56} />
            <h1 className="font-['Cormorant_Garamond'] text-6xl lg:text-7xl font-light text-[var(--aura-deep-brown)] mb-6">
              Treatment Consent Form
            </h1>
            <p className="font-['Inter'] text-xl text-[var(--aura-soft-taupe)] leading-relaxed mb-8">
              Mandatory prior to any aesthetic procedure. Your safety is our priority.
            </p>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-3">
                <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">Step {step} of {totalSteps}</p>
                <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)]">{Math.round((step / totalSteps) * 100)}% Complete</p>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-[var(--aura-rose-gold)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg border border-[var(--aura-rose-gold)]/10 p-8 lg:p-12"
          >
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <User className="text-[var(--aura-rose-gold)]" size={32} />
                  <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-deep-brown)]">
                    Personal Details
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="fullName" className="font-['Inter'] text-[var(--aura-deep-brown)]">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="mt-2 border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']"
                      placeholder="Enter your full legal name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth" className="font-['Inter'] text-[var(--aura-deep-brown)]">Date of Birth *</Label>
                    <div className="mt-2">
                      <DatePicker
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
                        placeholder="YYYY-MM-DD"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="font-['Inter'] text-[var(--aura-deep-brown)]">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-2 border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="font-['Inter'] text-[var(--aura-deep-brown)]">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-2 border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']"
                        placeholder="+44 7XXX XXXXXX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="font-['Inter'] text-[var(--aura-deep-brown)]">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-2 border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']"
                      placeholder="Your full address"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="emergencyContact" className="font-['Inter'] text-[var(--aura-deep-brown)]">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="mt-2 border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']"
                        placeholder="Contact person name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="emergencyPhone" className="font-['Inter'] text-[var(--aura-deep-brown)]">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        className="mt-2 border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']"
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
                <div className="flex items-center gap-3 mb-8">
                  <Heart className="text-[var(--aura-rose-gold)]" size={32} />
                  <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-deep-brown)]">
                    Medical History
                  </h2>
                </div>

                <div className="bg-[var(--aura-rose-gold)]/10 border-l-4 border-[var(--aura-rose-gold)] p-6 mb-8">
                  <p className="font-['Inter'] text-sm text-[var(--aura-deep-brown)]">
                    <strong>Important:</strong> Please select all conditions that apply. This information is confidential and essential for your safety.
                  </p>
                </div>

                <div>
                  <Label className="font-['Inter'] text-[var(--aura-deep-brown)] mb-4 block">Medical Conditions *</Label>
                  <div className="space-y-3">
                    {medicalConditions.map((condition, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedConditions.includes(condition)
                            ? 'border-[var(--aura-rose-gold)] bg-[var(--aura-rose-gold)]/5'
                            : 'border-[var(--aura-rose-gold)]/20 hover:border-[var(--aura-rose-gold)]/40'
                        }`}
                        onClick={() => handleConditionToggle(condition)}
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded border-2 border-[var(--aura-rose-gold)]">
                          {selectedConditions.includes(condition) && (
                            <Check size={14} className="text-[var(--aura-rose-gold)]" />
                          )}
                        </div>
                        <label className="font-['Inter'] text-[var(--aura-deep-brown)] cursor-pointer flex-1">
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Label htmlFor="medications" className="font-['Inter'] text-[var(--aura-deep-brown)]">
                    Current Medications
                  </Label>
                  <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mt-1 mb-2">
                    Please list all medications you are currently taking
                  </p>
                  <Textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                    className="border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']"
                    placeholder="e.g., Aspirin 75mg daily, Metformin 500mg twice daily..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="allergies" className="font-['Inter'] text-[var(--aura-deep-brown)]">
                    Known Allergies
                  </Label>
                  <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mt-1 mb-2">
                    Include allergies to medications, foods, or substances
                  </p>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']"
                    placeholder="e.g., Penicillin, nuts, latex..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="medicalHistory" className="font-['Inter'] text-[var(--aura-deep-brown)]">
                    Additional Medical History
                  </Label>
                  <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mt-1 mb-2">
                    Any other relevant medical information
                  </p>
                  <Textarea
                    id="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    className="border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Inter']"
                    placeholder="Previous surgeries, chronic conditions, etc..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Risk Acknowledgment */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <AlertTriangle className="text-[var(--aura-rose-gold)]" size={32} />
                  <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-deep-brown)]">
                    Understanding the Risks
                  </h2>
                </div>

                <p className="font-['Inter'] text-[var(--aura-soft-taupe)] leading-relaxed text-lg">
                  While aesthetic treatments are generally safe when performed by qualified practitioners, 
                  it's important you understand the potential risks and side effects. Please review each risk carefully.
                </p>

                <div className="space-y-4 mt-8">
                  {risks.map((risk, index) => (
                    <details 
                      key={index} 
                      className="group border-2 border-[var(--aura-rose-gold)]/20 rounded-lg overflow-hidden hover:border-[var(--aura-rose-gold)]/40 transition-colors"
                    >
                      <summary className="cursor-pointer p-5 bg-white hover:bg-[var(--aura-cream)] transition-colors flex items-center justify-between">
                        <span className="font-['Inter'] font-semibold text-[var(--aura-deep-brown)]">{risk.title}</span>
                        <Eye className="text-[var(--aura-rose-gold)] group-open:rotate-180 transition-transform" size={20} />
                      </summary>
                      <div className="p-5 bg-[var(--aura-cream)] border-t border-[var(--aura-rose-gold)]/10">
                        <p className="font-['Inter'] text-[var(--aura-soft-taupe)] leading-relaxed">{risk.description}</p>
                      </div>
                    </details>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-[var(--aura-rose-gold)]/10 border-l-4 border-[var(--aura-rose-gold)] rounded-r-lg">
                  <p className="font-['Inter'] text-sm text-[var(--aura-deep-brown)] leading-relaxed">
                    <strong>Note:</strong> If you have any questions or concerns about these risks, please discuss them with your practitioner before proceeding. 
                    You have the right to decline treatment at any time.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Consent Declaration */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <CheckCircle2 className="text-[var(--aura-rose-gold)]" size={32} />
                  <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-deep-brown)]">
                    Consent Declaration
                  </h2>
                </div>

                <div className="space-y-4">
                  <div 
                    className={`flex items-start space-x-4 p-5 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.consentInformationAccuracy 
                        ? 'border-[var(--aura-rose-gold)] bg-[var(--aura-rose-gold)]/5' 
                        : 'border-[var(--aura-rose-gold)]/20'
                    }`}
                    onClick={() => setFormData({ ...formData, consentInformationAccuracy: !formData.consentInformationAccuracy })}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded border-2 border-[var(--aura-rose-gold)] mt-0.5">
                      {formData.consentInformationAccuracy && <Check size={14} className="text-[var(--aura-rose-gold)]" />}
                    </div>
                    <label className="font-['Inter'] text-[var(--aura-deep-brown)] cursor-pointer leading-relaxed">
                      I confirm that I have provided accurate medical information and understand the importance of disclosing all relevant health conditions.
                    </label>
                  </div>

                  <div 
                    className={`flex items-start space-x-4 p-5 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.consentTreatmentInformation 
                        ? 'border-[var(--aura-rose-gold)] bg-[var(--aura-rose-gold)]/5' 
                        : 'border-[var(--aura-rose-gold)]/20'
                    }`}
                    onClick={() => setFormData({ ...formData, consentTreatmentInformation: !formData.consentTreatmentInformation })}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded border-2 border-[var(--aura-rose-gold)] mt-0.5">
                      {formData.consentTreatmentInformation && <Check size={14} className="text-[var(--aura-rose-gold)]" />}
                    </div>
                    <label className="font-['Inter'] text-[var(--aura-deep-brown)] cursor-pointer leading-relaxed">
                      I understand the potential risks and side effects associated with this treatment and have had the opportunity to ask questions.
                    </label>
                  </div>

                  <div 
                    className={`flex items-start space-x-4 p-5 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.consentRisks 
                        ? 'border-[var(--aura-rose-gold)] bg-[var(--aura-rose-gold)]/5' 
                        : 'border-[var(--aura-rose-gold)]/20'
                    }`}
                    onClick={() => setFormData({ ...formData, consentRisks: !formData.consentRisks })}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded border-2 border-[var(--aura-rose-gold)] mt-0.5">
                      {formData.consentRisks && <Check size={14} className="text-[var(--aura-rose-gold)]" />}
                    </div>
                    <label className="font-['Inter'] text-[var(--aura-deep-brown)] cursor-pointer leading-relaxed">
                      I consent to receive this treatment and understand that results may vary. I have realistic expectations about the outcome.
                    </label>
                  </div>

                  <div 
                    className={`flex items-start space-x-4 p-5 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.consentAuthorization 
                        ? 'border-[var(--aura-rose-gold)] bg-[var(--aura-rose-gold)]/5' 
                        : 'border-[var(--aura-rose-gold)]/20'
                    }`}
                    onClick={() => setFormData({ ...formData, consentAuthorization: !formData.consentAuthorization })}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded border-2 border-[var(--aura-rose-gold)] mt-0.5">
                      {formData.consentAuthorization && <Check size={14} className="text-[var(--aura-rose-gold)]" />}
                    </div>
                    <label className="font-['Inter'] text-[var(--aura-deep-brown)] cursor-pointer leading-relaxed">
                      I agree to follow all pre and post-treatment care instructions provided by the practitioner.
                    </label>
                  </div>
                </div>

                <div className="mt-8">
                  <Label htmlFor="signature" className="font-['Inter'] text-[var(--aura-deep-brown)] text-lg">
                    Digital Signature *
                  </Label>
                  <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] mt-2 mb-4">
                    By typing your full name below, you are providing your legal signature and agreeing to all the declarations above.
                  </p>
                  <Input
                    id="signature"
                    value={formData.signature}
                    onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                    className="border-[var(--aura-rose-gold)]/20 focus:border-[var(--aura-rose-gold)] font-['Cormorant_Garamond'] text-3xl py-6"
                    placeholder="Type your full name"
                    required
                  />
                  <p className="font-['Inter'] text-xs text-[var(--aura-soft-taupe)] mt-2">
                    Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <FileSignature className="text-[var(--aura-rose-gold)]" size={32} />
                  <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[var(--aura-deep-brown)]">
                    Review & Submit
                  </h2>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-600" size={24} />
                    <p className="font-['Inter'] font-medium text-green-800">
                      Your consent form is complete and ready to submit!
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-[var(--aura-cream)] rounded-lg">
                    <h3 className="font-['Inter'] font-semibold text-lg text-[var(--aura-deep-brown)] mb-4">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4 font-['Inter'] text-sm">
                      <div>
                        <span className="text-[var(--aura-soft-taupe)]">Name:</span>
                        <p className="font-medium text-[var(--aura-deep-brown)]">{formData.fullName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-[var(--aura-soft-taupe)]">Date of Birth:</span>
                        <p className="font-medium text-[var(--aura-deep-brown)]">
                          {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-GB') : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[var(--aura-soft-taupe)]">Email:</span>
                        <p className="font-medium text-[var(--aura-deep-brown)]">{formData.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-[var(--aura-soft-taupe)]">Phone:</span>
                        <p className="font-medium text-[var(--aura-deep-brown)]">{formData.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[var(--aura-cream)] rounded-lg">
                    <h3 className="font-['Inter'] font-semibold text-lg text-[var(--aura-deep-brown)] mb-4">Medical Conditions</h3>
                    <p className="font-['Inter'] text-sm text-[var(--aura-deep-brown)]">
                      {selectedConditions.length > 0 ? selectedConditions.join(', ') : 'None selected'}
                    </p>
                  </div>

                  <div className="p-6 bg-[var(--aura-cream)] rounded-lg">
                    <h3 className="font-['Inter'] font-semibold text-lg text-[var(--aura-deep-brown)] mb-4">Digital Signature</h3>
                    <p className="font-['Cormorant_Garamond'] text-3xl text-[var(--aura-deep-brown)]">
                      {formData.signature || 'Not provided'}
                    </p>
                    <p className="font-['Inter'] text-xs text-[var(--aura-soft-taupe)] mt-2">
                      Signed on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-[var(--aura-deep-brown)] text-white py-5 rounded-md font-['Inter'] font-semibold text-lg hover:bg-[var(--aura-rose-gold)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Consent Form'
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className="w-full border-2 border-[var(--aura-deep-brown)] text-[var(--aura-deep-brown)] py-4 rounded-md font-['Inter'] font-medium hover:bg-[var(--aura-cream)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Print for Records
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-[var(--aura-rose-gold)]/10">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="px-8 py-3 font-['Inter'] font-medium text-[var(--aura-deep-brown)] disabled:opacity-30 disabled:cursor-not-allowed hover:text-[var(--aura-rose-gold)] transition-colors"
              >
                ← Previous
              </button>
              
              {step < totalSteps && (
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-[var(--aura-rose-gold)] text-white rounded-md font-['Inter'] font-medium hover:bg-[var(--aura-deep-brown)] transition-all shadow-md"
                >
                  Next Step →
                </button>
              )}
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-[var(--aura-rose-gold)]/10"
          >
            <p className="font-['Inter'] text-sm text-[var(--aura-soft-taupe)] text-center leading-relaxed">
              <strong className="text-[var(--aura-deep-brown)]">Important:</strong> All treatments are performed by a CPD-accredited aesthetic practitioner. 
              Consent is mandatory prior to any procedure. Your information is kept confidential and secure in accordance with GDPR regulations.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
