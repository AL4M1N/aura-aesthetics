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
import { Badge } from '../../components/ui/badge';
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
  AdminBadgeSecondary,
  AdminDialogContent
} from '../../components/ui/admin';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { serviceCategoriesService } from '../../../services/serviceCategoriesService';
import type { ServiceCategory, ServiceCategoryPayload } from '../../../lib/types';

export default function ServiceCategoriesManagement() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ServiceCategoryPayload>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    void loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await serviceCategoriesService.getServiceCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await serviceCategoriesService.updateServiceCategory(editingId, formData);
      } else {
        await serviceCategoriesService.createServiceCategory(formData);
      }
      await loadCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleEdit = (category: ServiceCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      return;
    }

    try {
      await serviceCategoriesService.deleteServiceCategory(id);
      await loadCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(
        error?.response?.data?.message ||
        'Cannot delete category with existing services. Please reassign or delete services first.'
      );
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await serviceCategoriesService.toggleServiceCategoryStatus(id, !currentStatus);
      await loadCategories();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      sort_order: 0,
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1B1B]">Service Categories</h1>
          <p className="text-[#9B8B7E] mt-1">
            Manage service categories and organize your services
          </p>
        </div>
        <Button 
          onClick={handleOpenDialog}
          className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <AdminCard>
        <Table>
          <AdminTableHeader>
            <AdminTableRowHeader>
              <TableHead className="text-black font-semibold">Name</TableHead>
              <TableHead className="text-black font-semibold">Slug</TableHead>
              <TableHead className="text-black font-semibold">Icon</TableHead>
              <TableHead className="text-black font-semibold">Services</TableHead>
              <TableHead className="text-black font-semibold">Sort Order</TableHead>
              <TableHead className="text-black font-semibold">Status</TableHead>
              <TableHead className="text-right text-black font-semibold">Actions</TableHead>
            </AdminTableRowHeader>
          </AdminTableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <AdminTableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No categories found. Create your first category to get started.
                </TableCell>
              </AdminTableRow>
            ) : (
              categories.map((category) => (
                <AdminTableRow key={category.id}>
                  <TableCell className="font-medium text-[#2D1B1B]">{category.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-[#FFF8F3] text-[#9B8B7E] px-2 py-1 rounded border border-[#E6D4C3]">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    {category.icon ? (
                      <code className="text-xs bg-[#FFF8F3] text-[#9B8B7E] px-2 py-1 rounded border border-[#E6D4C3]">
                        {category.icon}
                      </code>
                    ) : (
                      <span className="text-[#9B8B7E] text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <AdminBadgeSecondary>
                      {category.services_count || 0} services
                    </AdminBadgeSecondary>
                  </TableCell>
                  <TableCell className="text-[#2D1B1B]">{category.sort_order}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(category.id, category.is_active)}
                      className="h-8 hover:bg-[#FFF8F3] transition-all duration-200"
                    >
                      {category.is_active ? (
                        <>
                          <Eye className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 mr-2 text-[#9B8B7E]" />
                          <span className="text-[#9B8B7E]">Inactive</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="hover:bg-[#FFF8F3] transition-all duration-200"
                    >
                      <Edit className="w-4 h-4 text-[#D4AF77]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </AdminTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminCard>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AdminDialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#2D1B1B]">
              {editingId ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D1B1B]">
                  Name <span className="text-red-600">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Dermal Fillers"
                  required
                  className="border-[#E6D4C3] focus:border-[#D4AF77] focus:ring-[#D4AF77]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D1B1B]">Slug</label>
                <Input
                  value={formData.slug || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="Auto-generated from name"
                  className="border-[#E6D4C3] focus:border-[#D4AF77] focus:ring-[#D4AF77]"
                />
                <p className="text-xs text-[#9B8B7E]">
                  Leave empty to auto-generate from name
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2D1B1B]">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this category..."
                rows={3}
                className="border-[#E6D4C3] focus:border-[#D4AF77] focus:ring-[#D4AF77]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D1B1B]">Icon</label>
                <Input
                  value={formData.icon || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="e.g., syringe, sparkles"
                  className="border-[#E6D4C3] focus:border-[#D4AF77] focus:ring-[#D4AF77]"
                />
                <p className="text-xs text-[#9B8B7E]">
                  Lucide icon name for UI display
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D1B1B]">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="border-[#E6D4C3] focus:border-[#D4AF77] focus:ring-[#D4AF77]"
                />
              </div>
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
                Active (visible to public)
              </label>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseDialog}
                className="border-[#E6D4C3] text-[#2D1B1B] hover:bg-[#FFF8F3] transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white hover:from-[#C9A58D] hover:to-[#B8957C] transition-all duration-200 shadow-sm"
              >
                {editingId ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </AdminDialogContent>
      </Dialog>
    </div>
  );
}
