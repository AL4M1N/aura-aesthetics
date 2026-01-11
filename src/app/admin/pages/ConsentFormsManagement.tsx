/**
 * ADMIN PAGE: Consent Forms Management
 * PURPOSE: Manage all customer consent forms
 * FEATURES: View, approve, download PDF, link to bookings
 */

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { consentService, type ConsentForm } from '../../../services/consentService';
import { Link } from 'react-router-dom';

export function ConsentFormsManagement() {
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([]);
  const [filteredForms, setFilteredForms] = useState<ConsentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedForm, setSelectedForm] = useState<ConsentForm | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    total_forms: 0,
    pending: 0,
    approved: 0,
    expired: 0,
    completion_rate: 0,
  });

  useEffect(() => {
    fetchConsentForms();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [consentForms, searchTerm, statusFilter]);

  const fetchConsentForms = async () => {
    try {
      setLoading(true);
      const response = await consentService.getAllConsentForms();
      setConsentForms(response.data);
    } catch (error) {
      console.error('Failed to fetch consent forms:', error);
      alert('Failed to load consent forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await consentService.getConsentFormStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...consentForms];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(form => form.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        form =>
          form.full_name.toLowerCase().includes(term) ||
          form.email.toLowerCase().includes(term) ||
          form.phone.includes(term) ||
          form.id.toString().includes(term)
      );
    }

    setFilteredForms(filtered);
  };

  const handleViewDetails = async (form: ConsentForm) => {
    try {
      // Fetch full details
      const response = await consentService.getConsentForm(form.id);
      setSelectedForm(response.data);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Failed to fetch form details:', error);
      alert('Failed to load form details');
    }
  };

  const handleUpdateStatus = async (id: number, status: 'pending' | 'approved' | 'expired') => {
    try {
      await consentService.updateConsentFormStatus(id, status);
      alert('Status updated successfully');
      fetchConsentForms();
      fetchStats();
      setShowDetailsDialog(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleDownloadPDF = async (id: number, fullName: string) => {
    try {
      const blob = await consentService.exportConsentFormPDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consent-form-${id}-${fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await consentService.deleteConsentForm(deletingId);
      alert('Consent form deleted successfully');
      fetchConsentForms();
      fetchStats();
      setShowDeleteDialog(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete consent form:', error);
      alert('Failed to delete consent form');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending Review' },
      approved: { variant: 'default' as const, icon: CheckCircle, text: 'Approved' },
      expired: { variant: 'destructive' as const, icon: XCircle, text: 'Expired' },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--aura-rose-gold)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#2D1B1B] mb-2">
          Consent Forms Management
        </h1>
        <p className="font-['Inter'] text-[#9B8B7E]">
          Review and manage customer consent forms for medical treatments
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white border-[#E6D4C3]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-['Inter'] text-[#9B8B7E]">
              Total Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-['Cormorant_Garamond'] font-bold text-[#2D1B1B]">
              {stats.total_forms}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E6D4C3]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-['Inter'] text-[#9B8B7E]">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-['Cormorant_Garamond'] font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E6D4C3]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-['Inter'] text-[#9B8B7E]">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-['Cormorant_Garamond'] font-bold text-green-600">
              {stats.approved}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E6D4C3]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-['Inter'] text-[#9B8B7E]">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-['Cormorant_Garamond'] font-bold text-red-600">
              {stats.expired}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E6D4C3]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-['Inter'] text-[#9B8B7E]">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-['Cormorant_Garamond'] font-bold text-[#D4AF77]">
              {stats.completion_rate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-[#E6D4C3] bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9B8B7E]" />
              <Input
                type="text"
                placeholder="Search by name, email, phone, or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 font-['Inter']"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 font-['Inter']">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consent Forms Table */}
      <Card className="border-[#E6D4C3] bg-white">
        <CardContent className="pt-6">
          {filteredForms.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-[#9B8B7E] mx-auto mb-4" />
              <p className="font-['Inter'] text-[#9B8B7E]">
                No consent forms found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E6D4C3]">
                    <th className="text-left py-3 px-4 font-['Inter'] text-sm font-medium text-[var(--aura-deep-brown)]">
                      Form ID
                    </th>
                    <th className="text-left py-3 px-4 font-['Inter'] text-sm font-medium text-[var(--aura-deep-brown)]">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-['Inter'] text-sm font-medium text-[var(--aura-deep-brown)]">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 font-['Inter'] text-sm font-medium text-[var(--aura-deep-brown)]">
                      Date Signed
                    </th>
                    <th className="text-left py-3 px-4 font-['Inter'] text-sm font-medium text-[var(--aura-deep-brown)]">
                      Booking
                    </th>
                    <th className="text-left py-3 px-4 font-['Inter'] text-sm font-medium text-[var(--aura-deep-brown)]">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-['Inter'] text-sm font-medium text-[var(--aura-deep-brown)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.map(form => (
                    <motion.tr
                      key={form.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[#E6D4C3] hover:bg-[#FFF8F3] transition-colors"
                    >
                      <td className="py-3 px-4 font-['Inter'] text-sm text-[#2D1B1B] font-medium">
                        #{form.id}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-['Inter'] text-sm font-medium text-[#2D1B1B]">
                            {form.full_name}
                          </div>
                          <div className="font-['Inter'] text-xs text-[#9B8B7E]">
                            DOB: {new Date(form.date_of_birth).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs font-['Inter'] text-[#9B8B7E]">
                            <Mail className="h-3 w-3" />
                            {form.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-['Inter'] text-[#9B8B7E]">
                            <Phone className="h-3 w-3" />
                            {form.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm font-['Inter'] text-[#9B8B7E]">
                          <Calendar className="h-3 w-3" />
                          {formatDate(form.date_signed)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {form.booking_id ? (
                          <Link
                            to={`/admin/bookings?id=${form.booking_id}`}
                            className="flex items-center gap-1 text-sm font-['Inter'] text-[#D4AF77] hover:underline"
                          >
                            #{form.booking_id}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-sm font-['Inter'] text-[#9B8B7E]">
                            No booking
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(form.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(form)}
                            className="font-['Inter']"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(form.id, form.full_name)}
                            className="font-['Inter']"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingId(form.id);
                              setShowDeleteDialog(true);
                            }}
                            className="font-['Inter'] text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-[#E6D4C3] text-[#2D1B1B]">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-3xl font-light text-[#2D1B1B]">
              Consent Form Details #{selectedForm?.id}
            </DialogTitle>
            <DialogDescription className="font-['Inter'] text-[#9B8B7E]">
              Review complete consent form information
            </DialogDescription>
          </DialogHeader>

          {selectedForm && (
            <div className="space-y-6 font-['Inter']">
              {/* Status Actions */}
              <div className="flex items-center justify-between p-4 bg-[#FFF8F3] rounded-lg border border-[#E6D4C3]">
                <div>
                  <div className="text-sm text-[#9B8B7E] mb-1">Current Status</div>
                  {getStatusBadge(selectedForm.status)}
                </div>
                <div className="flex gap-2">
                  {selectedForm.status !== 'approved' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedForm.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 font-['Inter']"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {selectedForm.status !== 'expired' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedForm.id, 'expired')}
                      variant="destructive"
                      className="font-['Inter']"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark Expired
                    </Button>
                  )}
                  {selectedForm.status !== 'pending' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedForm.id, 'pending')}
                      variant="outline"
                      className="font-['Inter']"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Set Pending
                    </Button>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#2D1B1B] mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-[#9B8B7E]">Full Name</div>
                    <div className="font-medium">{selectedForm.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#9B8B7E]">Date of Birth</div>
                    <div className="font-medium">
                      {new Date(selectedForm.date_of_birth).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#9B8B7E]">Email</div>
                    <div className="font-medium">{selectedForm.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#9B8B7E]">Phone</div>
                    <div className="font-medium">{selectedForm.phone}</div>
                  </div>
                  {selectedForm.address && (
                    <div className="col-span-2">
                      <div className="text-sm text-[#9B8B7E]">Address</div>
                      <div className="font-medium">{selectedForm.address}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {(selectedForm.emergency_contact || selectedForm.emergency_phone) && (
                <div>
                  <h3 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#2D1B1B] mb-3">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedForm.emergency_contact && (
                      <div>
                        <div className="text-sm text-[#9B8B7E]">Name</div>
                        <div className="font-medium">{selectedForm.emergency_contact}</div>
                      </div>
                    )}
                    {selectedForm.emergency_phone && (
                      <div>
                        <div className="text-sm text-[#9B8B7E]">Phone</div>
                        <div className="font-medium">{selectedForm.emergency_phone}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical History */}
              <div>
                <h3 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#2D1B1B] mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Medical History
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-[#9B8B7E] mb-2">Medical Conditions</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedForm.medical_conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="font-['Inter'] bg-[#FFF8F3] border-[#E6D4C3] text-[#9B8B7E]">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedForm.medications && (
                    <div>
                      <div className="text-sm text-[#9B8B7E]">Current Medications</div>
                      <div className="font-medium">{selectedForm.medications}</div>
                    </div>
                  )}

                  {selectedForm.allergies && (
                    <div>
                      <div className="text-sm text-[#9B8B7E]">Allergies</div>
                      <div className="font-medium text-red-600">{selectedForm.allergies}</div>
                    </div>
                  )}

                  {selectedForm.medical_history && (
                    <div>
                      <div className="text-sm text-[#9B8B7E]">Additional Medical History</div>
                      <div className="font-medium">{selectedForm.medical_history}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Consent Declarations */}
              <div>
                <h3 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#2D1B1B] mb-3">
                  Consent Declarations
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    {selectedForm.consent_information_accuracy ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[#9B8B7E] mt-0.5" />
                    )}
                    <span className="text-sm text-[#2D1B1B]">
                      Confirmed all information is accurate and complete
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    {selectedForm.consent_treatment_information ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[#9B8B7E] mt-0.5" />
                    )}
                    <span className="text-sm text-[#2D1B1B]">
                      Informed about treatment, risks, and alternatives
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    {selectedForm.consent_risks ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[#9B8B7E] mt-0.5" />
                    )}
                    <span className="text-sm text-[#2D1B1B]">
                      Understands and accepts treatment risks
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    {selectedForm.consent_authorization ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[#9B8B7E] mt-0.5" />
                    )}
                    <span className="text-sm text-[#2D1B1B]">
                      Authorizes Aura Aesthetics to perform treatment
                    </span>
                  </div>
                </div>
              </div>

              {/* Digital Signature */}
              <div>
                <h3 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[var(--aura-deep-brown)] mb-3">
                  Digital Signature
                </h3>
                <div className="p-6 bg-[#FFF8F3] rounded-lg border-2 border-[#E6D4C3]">
                  <div className="font-['Cormorant_Garamond'] text-4xl text-[var(--aura-deep-brown)] mb-4">
                    {selectedForm.signature}
                  </div>
                  <div className="text-sm text-[var(--aura-soft-taupe)] space-y-1">
                    <div>Signed on: {formatDate(selectedForm.date_signed)}</div>
                    {selectedForm.ip_address && (
                      <div>IP Address: {selectedForm.ip_address}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Link */}
              {selectedForm.booking_id && (
                <div className="p-4 bg-[#FFF8F3] rounded-lg border border-[#E6D4C3]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[var(--aura-soft-taupe)]">Linked Booking</div>
                      <div className="font-medium">Booking #{selectedForm.booking_id}</div>
                    </div>
                    <Link to={`/admin/bookings?id=${selectedForm.booking_id}`}>
                      <Button variant="outline" size="sm" className="font-['Inter']">
                        View Booking
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => selectedForm && handleDownloadPDF(selectedForm.id, selectedForm.full_name)}
              className="bg-[var(--aura-rose-gold)] hover:bg-[var(--aura-rose-gold)]/90 font-['Inter']"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
              className="font-['Inter']"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white border-[#E6D4C3]">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light text-[var(--aura-deep-brown)]">
              Delete Consent Form
            </DialogTitle>
            <DialogDescription className="font-['Inter']">
              Are you sure you want to delete this consent form? This action cannot be undone and may
              have legal implications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingId(null);
              }}
              className="font-['Inter']"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="font-['Inter']"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
