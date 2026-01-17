'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

// Define the type for a category based on the database schema
type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch and subscribe to real-time changes
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (data) {
        setCategories(data);
      }
      if (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();

    const channel = supabase
      .channel('realtime categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCategories((prev) => [...prev, payload.new as Category]);
          }
          if (payload.eventType === 'UPDATE') {
            setCategories((prev) =>
              prev.map((cat) => (cat.id === payload.new.id ? (payload.new as Category) : cat))
            );
          }
          if (payload.eventType === 'DELETE') {
            setCategories((prev) =>
              prev.filter((cat) => cat.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Open modal for adding
  const openAddModal = () => {
    setModalMode('add');
    setCurrentCategory({ name: '', slug: '', is_active: true, icon: '' });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (category: Category) => {
    setModalMode('edit');
    setCurrentCategory({ ...category });
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentCategory((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle switch change for is_active
  const handleActiveChange = (checked: boolean) => {
    setCurrentCategory((prev) => ({ ...prev, is_active: checked }));
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let error;
      if (modalMode === 'add') {
        const { error: err } = await supabase.from('categories').insert({
          name: currentCategory.name,
          slug: currentCategory.slug,
          icon: currentCategory.icon || null,
          is_active: currentCategory.is_active ?? true,
        });
        error = err;
      } else {
        const { error: err } = await supabase
          .from('categories')
          .update({
            name: currentCategory.name,
            slug: currentCategory.slug,
            icon: currentCategory.icon || null,
            is_active: currentCategory.is_active ?? true,
          })
          .eq('id', currentCategory.id!);
        error = err;
      }

      if (error) {
        console.error(`Error ${modalMode === 'add' ? 'adding' : 'updating'} category:`, error.message);
        alert(`Failed to ${modalMode === 'add' ? 'add' : 'update'} category.`);
      } else {
        setIsModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler (kept as before)
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.error('Error deleting category:', error.message);
        alert('Failed to delete category.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A list of all the categories for places. This data is updated in real-time.
          </p>
        </div>
        <Button
          variant="default"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-md shadow-sm"
          onClick={openAddModal}
        >
          Add Category
        </Button>
      </div>

      {/* Main Card */}
      <Card className="border-none shadow-lg rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Categories</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Manage and view all place categories here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="border-collapse border-t border-gray-200">
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="py-3 px-4 text-left font-medium text-gray-700">Name</TableHead>
                <TableHead className="py-3 px-4 text-left font-medium text-gray-700">Slug</TableHead>
                <TableHead className="py-3 px-4 text-left font-medium text-gray-700">Is Active</TableHead>
                <TableHead className="py-3 px-4 text-left font-medium text-gray-700">Created at</TableHead>
                <TableHead className="py-3 px-4 text-left font-medium text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="py-3 px-4 font-medium">{category.name}</TableCell>
                  <TableCell className="py-3 px-4 text-gray-600">{category.slug}</TableCell>
                  <TableCell className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.is_active ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="pt-4 border-t border-gray-200">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{categories?.length}</strong> of{' '}
            <strong>{categories?.length || 0}</strong> categories
          </div>
        </CardFooter>
      </Card>

      {/* Modal for Add/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={currentCategory.name || ''}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                value={currentCategory.slug || ''}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon (URL)
              </Label>
              <Input
                id="icon"
                name="icon"
                value={currentCategory.icon || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="is_active"
                  checked={currentCategory.is_active ?? true}
                  onCheckedChange={handleActiveChange}
                />
                <span className="ml-2 text-sm">
                  {currentCategory.is_active ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : modalMode === 'add' ? 'Add' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}