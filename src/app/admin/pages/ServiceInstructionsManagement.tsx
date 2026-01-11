import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { 
  AdminCard,
  AdminTableHeader,
  AdminTableRowHeader,
  AdminTableRow,
  AdminDialogContent
} from '../../components/ui/admin';
import { Edit, CalendarCheck, Award } from 'lucide-react';
import { serviceInstructionsService } from '../../../services/serviceInstructionsService';
import type { ServiceInstruction, ServiceInstructionPayload } from '../../../lib/types';

export default function ServiceInstructionsManagement() {
  const [instructions, setInstructions] = useState<ServiceInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<ServiceInstruction | null>(null);
  const [formData, setFormData] = useState<ServiceInstructionPayload>({
    title: '',
    content: '',
    icon: '',
    is_active: true,
  });

  useEffect(() => {
    void loadInstructions();
  }, []);

  const loadInstructions = async () => {
    try {
      setLoading(true);
      const response = await serviceInstructionsService.getServiceInstructions();
      if (response.success) {
        setInstructions(response.data);
      }
    } catch (error) {
      console.error('Failed to load instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstruction) return;

    try {
      await serviceInstructionsService.updateServiceInstruction(
        editingInstruction.id,
        formData
      );
      await loadInstructions();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to update instruction:', error);
      alert('Failed to update instruction. Please try again.');
    }
  };

  const handleEdit = (instruction: ServiceInstruction) => {
    setEditingInstruction(instruction);
    setFormData({
      title: instruction.title,
      content: instruction.content,
      icon: instruction.icon || '',
      is_active: instruction.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInstruction(null);
    setFormData({
      title: '',
      content: '',
      icon: '',
      is_active: true,
    });
  };

  const getInstructionIcon = (type: string) => {
    switch (type) {
      case 'consultation_required':
        return <CalendarCheck className="w-5 h-5 text-blue-500" />;
      case 'professional_excellence':
        return <Award className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getInstructionLabel = (type: string) => {
    switch (type) {
      case 'consultation_required':
        return 'Consultation Required';
      case 'professional_excellence':
        return 'Professional Excellence';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#9B8B7E]">Loading instructions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2D1B1B]">Service Instructions</h1>
        <p className="text-[#9B8B7E] mt-1">
          Manage important notices displayed on all service pages
        </p>
        <div className="mt-4 p-4 bg-[#FFF8F3] rounded-lg border border-[#E6D4C3]">
          <p className="text-sm text-[#2D1B1B]">
            <strong>Note:</strong> These are global instructions shown on all service pages.
            There are only 2 instruction types by design. You can edit their content, but cannot add or delete them.
          </p>
        </div>
      </div>

      {/* Instructions Table */}
      <AdminCard>
        <Table>
          <AdminTableHeader>
            <AdminTableRowHeader>
              <TableHead className="w-12 text-black font-semibold"></TableHead>
              <TableHead className="text-black font-semibold">Type</TableHead>
              <TableHead className="text-black font-semibold">Title</TableHead>
              <TableHead className="text-black font-semibold">Content Preview</TableHead>
              <TableHead className="text-black font-semibold">Icon</TableHead>
              <TableHead className="text-black font-semibold">Status</TableHead>
              <TableHead className="text-right text-black font-semibold">Actions</TableHead>
            </AdminTableRowHeader>
          </AdminTableHeader>
          <TableBody>
            {instructions.map((instruction) => (
              <AdminTableRow key={instruction.id}>
                <TableCell>{getInstructionIcon(instruction.type)}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs bg-[#FFF8F3] text-[#9B8B7E] px-2 py-1 rounded border border-[#E6D4C3]">
                    {instruction.type}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-[#2D1B1B]">{instruction.title}</TableCell>
                <TableCell className="max-w-md">
                  <p className="text-sm text-[#9B8B7E]">
                    {instruction.content.split(' ').slice(0, 5).join(' ')}
                    {instruction.content.split(' ').length > 5 ? '...' : ''}
                  </p>
                </TableCell>
                <TableCell>
                  {instruction.icon ? (
                    <code className="text-xs bg-[#FFF8F3] text-[#9B8B7E] px-2 py-1 rounded border border-[#E6D4C3]">
                      {instruction.icon}
                    </code>
                  ) : (
                    <span className="text-[#9B8B7E] text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      instruction.is_active
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-[#FFF8F3] text-[#9B8B7E] border border-[#E6D4C3]'
                    }`}
                  >
                    {instruction.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(instruction)}
                    className="hover:bg-[#FFF8F3] transition-all duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2 text-[#D4AF77]" />
                    <span className="text-[#2D1B1B]">Edit</span>
                  </Button>
                </TableCell>
              </AdminTableRow>
            ))}
          </TableBody>
        </Table>
      </AdminCard>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AdminDialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#2D1B1B]">
              Edit {editingInstruction && getInstructionLabel(editingInstruction.type)}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {editingInstruction && (
              <div className="bg-[#FFF8F3] p-3 rounded-lg border border-[#E6D4C3]">
                <p className="text-sm font-medium text-[#2D1B1B]">
                  Instruction Type
                </p>
                <p className="font-mono text-sm mt-1 text-[#9B8B7E]">{editingInstruction.type}</p>
                <p className="text-xs text-[#9B8B7E] mt-1">
                  The type cannot be changed. Only title, content, icon, and status can be edited.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2D1B1B]">
                Title <span className="text-red-600">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Consultation Required"
                className="border-[#E6D4C3] focus:border-[#D4AF77]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2D1B1B]">
                Content <span className="text-red-600">*</span>
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Full instruction content..."
                className="border-[#E6D4C3] focus:border-[#D4AF77]"
                rows={5}
                required
              />
              <p className="text-xs text-[#9B8B7E]">
                This text will be displayed on all service pages
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2D1B1B]">Icon</label>
              <Input
                value={formData.icon || ''}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="e.g., calendar-check, award"
                className="border-[#E6D4C3] focus:border-[#D4AF77]"
              />
              <p className="text-xs text-[#9B8B7E]">
                Lucide icon name for UI display
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded border-[#E6D4C3] text-[#D4AF77] focus:ring-[#D4AF77]"
              />
              <label htmlFor="is_active" className="text-sm font-medium cursor-pointer text-[#2D1B1B]">
                Active (visible on service pages)
              </label>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseDialog}
                className="border-[#E6D4C3] hover:bg-[#FFF8F3] transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white hover:shadow-lg transition-all duration-200"
              >
                Update Instruction
              </Button>
            </DialogFooter>
          </form>
        </AdminDialogContent>
      </Dialog>
    </div>
  );
}
