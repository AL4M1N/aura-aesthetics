/**
 * ADMIN PAGE: Booking Management
 * Manage customer bookings - view, confirm, cancel, reschedule
 */

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Check, X, Edit, Trash2, Loader, Filter, Search } from 'lucide-react';
import { bookingService, type Booking } from '../../../services/bookingService';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
} from '../../components/ui/table';
import {
    AdminCard,
    AdminTableHeader,
    AdminTableRowHeader,
    AdminTableRow,
    AdminDialogContent,
} from '../../components/ui/admin';

export function BookingManagement() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [actionType, setActionType] = useState<'confirm' | 'cancel' | 'delete' | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');

    useEffect(() => {
        loadBookings();
    }, [statusFilter]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
            const response = await bookingService.getAllBookings(filters);
            
            if (response.success && Array.isArray(response.data)) {
                setBookings(response.data);
            }
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId: number, newStatus: Booking['status']) => {
        try {
            await bookingService.updateBookingStatus(bookingId, newStatus);
            await loadBookings();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update booking status');
        }
    };

    const handleConfirm = async () => {
        if (!selectedBooking) return;

        try {
            await bookingService.updateBookingStatus(selectedBooking.id, 'confirmed');
            setShowDialog(false);
            setSelectedBooking(null);
            await loadBookings();
        } catch (error) {
            console.error('Failed to confirm booking:', error);
            alert('Failed to confirm booking');
        }
    };

    const handleCancel = async () => {
        if (!selectedBooking) return;

        try {
            await bookingService.cancelBooking(selectedBooking.id, cancellationReason);
            setShowDialog(false);
            setSelectedBooking(null);
            setCancellationReason('');
            await loadBookings();
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            alert('Failed to cancel booking');
        }
    };

    const handleDelete = async () => {
        if (!selectedBooking) return;

        try {
            await bookingService.deleteBooking(selectedBooking.id);
            setShowDialog(false);
            setSelectedBooking(null);
            await loadBookings();
        } catch (error) {
            console.error('Failed to delete booking:', error);
            alert('Failed to delete booking');
        }
    };

    const openDialog = (booking: Booking, action: 'confirm' | 'cancel' | 'delete') => {
        setSelectedBooking(booking);
        setActionType(action);
        setShowDialog(true);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            confirmed: 'default',
            cancelled: 'destructive',
            completed: 'outline',
        };

        return (
            <Badge variant={variants[status] || 'default'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPaymentBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            unpaid: 'destructive',
            deposit_paid: 'secondary',
            paid: 'default',
        };

        return (
            <Badge variant={variants[status] || 'outline'}>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            </Badge>
        );
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = 
            booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customer_phone.includes(searchTerm);
        
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D1B1B]">Booking Management</h1>
                    <p className="text-[#9B8B7E] mt-1">Manage customer appointments and reservations</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <AdminCard className="p-6">
                    <p className="text-sm text-[#9B8B7E]">Total Bookings</p>
                    <p className="text-3xl font-bold mt-2 text-[#2D1B1B]">{bookings.length}</p>
                </AdminCard>
                <AdminCard className="p-6">
                    <p className="text-sm text-[#9B8B7E]">Pending</p>
                    <p className="text-3xl font-bold mt-2 text-[#D4AF77]">
                        {bookings.filter(b => b.status === 'pending').length}
                    </p>
                </AdminCard>
                <AdminCard className="p-6">
                    <p className="text-sm text-[#9B8B7E]">Confirmed</p>
                    <p className="text-3xl font-bold mt-2 text-green-600">
                        {bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                </AdminCard>
                <AdminCard className="p-6">
                    <p className="text-sm text-[#9B8B7E]">Completed</p>
                    <p className="text-3xl font-bold mt-2 text-[#2D1B1B]">
                        {bookings.filter(b => b.status === 'completed').length}
                    </p>
                </AdminCard>
            </div>

            {/* Filters */}
            <AdminCard className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B8B7E]" size={20} />
                        <Input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <Filter className="mr-2" size={16} />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </AdminCard>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow border">
                <Table>
                    <AdminTableHeader>
                        <AdminTableRowHeader>
                            <TableHead>Customer</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Actions</TableHead>
                        </AdminTableRowHeader>
                    </AdminTableHeader>
                    <TableBody>
                        {filteredBookings.length === 0 ? (
                            <AdminTableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-[#9B8B7E]">
                                    No bookings found
                                </TableCell>
                            </AdminTableRow>
                        ) : (
                            filteredBookings.map((booking) => (
                                <AdminTableRow key={booking.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                <User size={16} />
                                                <span className="text-[#2D1B1B]">{booking.customer_name}</span>
                                            </div>
                                            <div className="text-sm text-[#9B8B7E] flex items-center gap-2 mt-1">
                                                <Mail size={14} />
                                                {booking.customer_email}
                                            </div>
                                            <div className="text-sm text-[#9B8B7E] flex items-center gap-2 mt-1">
                                                <Phone size={14} />
                                                {booking.customer_phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-[#2D1B1B]">
                                            {booking.service?.title || 'N/A'}
                                        </div>
                                        {booking.service?.price_range && (
                                            <div className="text-sm text-[#9B8B7E]">
                                                {booking.service.price_range}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span className="text-[#2D1B1B]">{new Date(booking.booking_date).toLocaleDateString('en-GB')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-[#9B8B7E]">
                                            <Clock size={14} />
                                            {booking.booking_time}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                    <TableCell>{getPaymentBadge(booking.payment_status)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {booking.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => openDialog(booking, 'confirm')}
                                                    title="Confirm booking"
                                                >
                                                    <Check size={16} />
                                                </Button>
                                            )}
                                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => openDialog(booking, 'cancel')}
                                                    title="Cancel booking"
                                                >
                                                    <X size={16} />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDialog(booking, 'delete')}
                                                title="Delete booking"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </AdminTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Action Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <AdminDialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-[#2D1B1B]">
                            {actionType === 'confirm' && 'Confirm Booking'}
                            {actionType === 'cancel' && 'Cancel Booking'}
                            {actionType === 'delete' && 'Delete Booking'}
                        </DialogTitle>
                        <DialogDescription className="text-[#9B8B7E]">
                            {actionType === 'confirm' && 
                                'Are you sure you want to confirm this booking? The customer will receive a confirmation email.'}
                            {actionType === 'cancel' && 
                                'Are you sure you want to cancel this booking? The customer will be notified.'}
                            {actionType === 'delete' && 
                                'Are you sure you want to permanently delete this booking? This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === 'cancel' && (
                        <div className="py-4">
                            <label className="text-sm font-medium mb-2 block">
                                Cancellation Reason (Optional)
                            </label>
                            <textarea
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                placeholder="Enter reason for cancellation..."
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={actionType === 'delete' || actionType === 'cancel' ? 'destructive' : 'default'}
                            onClick={() => {
                                if (actionType === 'confirm') handleConfirm();
                                else if (actionType === 'cancel') handleCancel();
                                else if (actionType === 'delete') handleDelete();
                            }}
                        >
                            {actionType === 'confirm' && 'Confirm'}
                            {actionType === 'cancel' && 'Cancel Booking'}
                            {actionType === 'delete' && 'Delete'}
                        </Button>
                    </DialogFooter>
                </AdminDialogContent>
            </Dialog>
        </div>
    );
}
