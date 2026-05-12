import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit2, Plus, LogOut, Lock, Image, Loader, Check, X } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useToast } from '@/hooks/use-toast';
import { loginWithEmail, logoutUser, onAuthChange, getAdminEmail } from '@/services/authService';
import { AuthUser } from '@/services/authService';
import {
  saveBase64Image,
  generateImageId,
  isBase64Image,
} from '@/services/imageStorageService';

const AdminPanel = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');

  // ── Category edit state ──────────────────────────────────────────
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const navigate = useNavigate();
  const { categories, addProduct, deleteProduct, editProduct, addCategory, editCategory, deleteCategory } = useProducts();
  const { toast } = useToast();

  const generateCategoryId = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user && user.isAdmin) {
        setCurrentUser(user);
      } else if (user && !user.isAdmin) {
        logoutUser();
        toast({ title: 'Access Denied', description: 'Only admin account can access this panel', variant: 'destructive' });
      } else {
        setCurrentUser(null);
      }
      setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, [toast]);

  // Auto-select first category when categories load
  useEffect(() => {
    if (!selectedCategory && Object.keys(categories).length > 0) {
      setSelectedCategory(Object.keys(categories)[0]);
    }
  }, [categories, selectedCategory]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await loginWithEmail(email, password);
      setCurrentUser(user);
      toast({ title: 'Login successful', description: `Welcome ${user.email}!` });
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      toast({ title: 'Logged out', description: 'You have been logged out successfully' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Logout failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (imageId: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB per image)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please use an image smaller than 5MB',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64String = event.target?.result as string;
        
        // Generate unique image ID
        const imageId = generateImageId();
        
        // Save base64 to IndexedDB
        await saveBase64Image(imageId, base64String);
        
        // Pass the image ID to the callback (not the base64 data)
        callback(imageId);
        
        toast({
          title: 'Image uploaded',
          description: 'Image stored locally and ready to use',
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Upload failed',
          description: 'Could not save image. Please try again.',
          variant: 'destructive',
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: 'Error reading file',
        description: 'Could not read the image file',
        variant: 'destructive',
      });
    };
    reader.readAsDataURL(file);
    
    // Clear the input
    e.target.value = '';
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      toast({ title: 'Please enter a product name', variant: 'destructive' });
      return;
    }
    addProduct(selectedCategory, newProductName, newProductImage || undefined);
    toast({ title: 'Product added successfully' });
    setNewProductName('');
    setNewProductImage('');
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(selectedCategory, productId);
    toast({ title: 'Product deleted successfully' });
  };

  const handleEditProduct = (productId: string, currentName: string, currentImage?: string) => {
    setEditingId(productId);
    setEditName(currentName);
    setEditImage(currentImage || '');
  };

  const handleSaveEdit = (productId: string) => {
    if (!editName.trim()) {
      toast({ title: 'Product name cannot be empty', variant: 'destructive' });
      return;
    }
    editProduct(selectedCategory, productId, editName, editImage || undefined);
    toast({ title: 'Product updated successfully' });
    setEditingId(null);
    setEditName('');
    setEditImage('');
  };

  // ── Category edit handlers ────────────────────────────────────────
  const handleStartEditCategory = (id: string) => {
    setEditingCategoryId(id);
    setEditCategoryName(categories[id]?.name || '');
    setEditCategoryDescription(categories[id]?.description || '');
    setEditCategoryImage(categories[id]?.image || '');
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCategoryName('');
    setEditCategoryDescription('');
    setEditCategoryImage('');
  };

  const handleSaveEditCategory = async () => {
    if (!editCategoryName.trim()) {
      toast({ title: 'Category name cannot be empty', variant: 'destructive' });
      return;
    }
    setIsSavingCategory(true);
    try {
      await editCategory(
        editingCategoryId!,
        editCategoryName.trim(),
        editCategoryDescription || undefined,
        editCategoryImage || undefined
      );
      toast({ title: 'Category updated successfully' });
      handleCancelEditCategory();
    } catch (error: any) {
      toast({ title: 'Failed to update category', description: error.message, variant: 'destructive' });
    } finally {
      setIsSavingCategory(false);
    }
  };

  // ── Auth loading ──────────────────────────────────────────────────
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ── Login UI ──────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Lock size={32} className="text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Admin Panel</h1>
          <p className="text-muted-foreground text-center mb-2 text-sm">Firebase Authentication</p>
          <p className="text-muted-foreground text-center mb-6 text-xs">Admin Email: {getAdminEmail()}</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="animate-spin h-4 w-4" />}
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            💡 Uses Firebase Authentication for secure access
          </p>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/50">
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="container-main py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Logged in as: {currentUser.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      <div className="container-main py-8">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* ── Category Sidebar ─────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 shadow-card sticky top-4 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                <div className="space-y-2">
                  {Object.entries(categories).map(([id, cat]) => (
                    <div key={id} className="space-y-2">

                      {/* Category row */}
                      <div className="flex items-center gap-2 group">
                        <button
                          onClick={() => {
                            setSelectedCategory(id);
                            handleCancelEditCategory();
                          }}
                          className={`flex-1 text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                            selectedCategory === id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground hover:bg-muted/80'
                          }`}
                        >
                          {cat.name}
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() =>
                            editingCategoryId === id
                              ? handleCancelEditCategory()
                              : handleStartEditCategory(id)
                          }
                          className="p-2 rounded-lg bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit category"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat.name}"? All products in this category will be deleted.`)) {
                              deleteCategory(id);
                              if (selectedCategory === id) {
                                const remaining = Object.keys(categories).filter((k) => k !== id);
                                setSelectedCategory(remaining[0] || '');
                              }
                              if (editingCategoryId === id) handleCancelEditCategory();
                              toast({ title: 'Category deleted successfully' });
                            }
                          }}
                          className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Inline edit form — expands below the category row */}
                      {editingCategoryId === id && (
                        <div className="ml-1 p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 space-y-2">
                          <p className="text-xs font-semibold text-blue-600 mb-1">Edit Category</p>

                          <input
                            type="text"
                            placeholder="Category Name"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                          />

                          <textarea
                            placeholder="Category Description"
                            value={editCategoryDescription}
                            onChange={(e) => setEditCategoryDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
                            rows={2}
                          />

                          <div className="flex gap-2">
                            <label className="flex items-center justify-center px-3 py-2 rounded-lg border-2 border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                              <Image size={14} className="text-primary" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, setEditCategoryImage)}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              placeholder="Or paste image URL"
                              value={editCategoryImage}
                              onChange={(e) => setEditCategoryImage(e.target.value)}
                              className="flex-1 px-2 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                            />
                          </div>

                          {editCategoryImage && (
                            <div className="p-2 rounded-lg bg-muted">
                              <img
                                src={editCategoryImage}
                                alt="Preview"
                                className="h-12 w-12 object-cover rounded"
                              />
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleSaveEditCategory}
                              disabled={isSavingCategory}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {isSavingCategory
                                ? <Loader size={12} className="animate-spin" />
                                : <Check size={12} />}
                              {isSavingCategory ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEditCategory}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                            >
                              <X size={12} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {Object.keys(categories).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No categories yet. Add one below.
                    </p>
                  )}
                </div>
              </div>

              {/* ── Add Category Section ──────────────────────────── */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-3 text-sm">Add New Category</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCategoryName.trim()) {
                      toast({ title: 'Please enter a category name', variant: 'destructive' });
                      return;
                    }
                    const categoryId = generateCategoryId(newCategoryName);
                    if (categories[categoryId]) {
                      toast({ title: 'Category already exists', variant: 'destructive' });
                      return;
                    }
                    addCategory(categoryId, newCategoryName, newCategoryDescription || undefined, newCategoryImage || undefined);
                    toast({ title: 'Category added successfully' });
                    setNewCategoryName('');
                    setNewCategoryDescription('');
                    setNewCategoryImage('');
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                  <textarea
                    placeholder="Category Description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <label className="flex items-center justify-center px-3 py-2 rounded-lg border-2 border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                      <Image size={14} className="text-primary" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setNewCategoryImage)}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste URL"
                      value={newCategoryImage}
                      onChange={(e) => setNewCategoryImage(e.target.value)}
                      className="flex-1 px-2 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                    />
                  </div>
                  {newCategoryImage && (
                    <div className="p-2 rounded-lg bg-muted">
                      <img src={newCategoryImage} alt="Preview" className="h-12 w-12 object-cover rounded" />
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ── Main Content ──────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Add Product Form */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary" />
                Add New Product
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    Add
                  </button>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-3">Product Image (Optional)</p>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <Image size={20} className="text-primary" />
                        <span className="text-sm text-foreground">Upload Image</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setNewProductImage)}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={newProductImage}
                      onChange={(e) => setNewProductImage(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                    />
                  </div>
                  {newProductImage && (
                    <div className="mt-3 p-2 rounded-lg bg-muted">
                      <img src={newProductImage} alt="Preview" className="h-16 w-16 object-cover rounded" />
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Products List */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {categories[selectedCategory]?.name || 'Select a category'} Products
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Product Name</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories[selectedCategory]?.items.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          {editingId === product.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 w-full"
                                placeholder="Product name"
                              />
                              <div className="flex gap-2">
                                <label className="flex items-center justify-center px-2 py-2 rounded-lg border border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                                  <Image size={14} className="text-primary" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, setEditImage)}
                                    className="hidden"
                                  />
                                </label>
                                <input
                                  type="text"
                                  placeholder="Or paste URL"
                                  value={editImage}
                                  onChange={(e) => setEditImage(e.target.value)}
                                  className="flex-1 px-2 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-foreground">{product.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {editingId === product.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(product.id)}
                                  className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:opacity-90"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1 rounded-lg bg-muted text-foreground text-xs font-semibold hover:opacity-90"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditProduct(product.id, product.name, product.image)}
                                  className="p-2 rounded-lg bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!categories[selectedCategory] || categories[selectedCategory]?.items.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No products in this category yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
