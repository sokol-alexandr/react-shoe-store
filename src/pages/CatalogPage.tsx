import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { toast } from 'react-hot-toast';

type CatalogPageProps = {
  products: Product[];
  onAddToCart: (product: Product) => void;
};

export function CatalogPage({ products, onAddToCart }: CatalogPageProps) {
  const { user } = useAuth();
  const { deleteProduct, updateProduct } = useDatabase();
  const isAdmin = user?.role === 'EMPLOYEE';

  // Modal control states for CRUD Editing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Trigger modal setup with existing item data values
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setNewImageFile(null); // Reset file picker state
  };

  // Handle saving the updated fields
  const handleUpdateSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsUpdating(true);
    try {
      let finalImageUrl = editingProduct.imageUrl;

      // Check if admin uploaded a replacement image file
      if (newImageFile) {
        // 1. Upload new image asset to bucket
        const fileExtension = newImageFile.name.split('.').pop();
        const uniqueFileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExtension}`;
        const filePath = `shoes/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, newImageFile);

        if (uploadError) throw uploadError;

        // 2. Grab new image public cloud URL address
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        // 3. Clear old outdated asset out of storage bucket to save space
        const oldStoragePath = editingProduct.imageUrl.split('product-images/').pop();
        if (oldStoragePath) {
          await supabase.storage.from('product-images').remove([oldStoragePath]);
        }

        finalImageUrl = publicUrl;
      }

      // 4. Update core records inside PostgreSQL product tables
      await updateProduct(editingProduct.id, editName, Number(editPrice), finalImageUrl);
      setEditingProduct(null); // Terminate modal viewport
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to completely remove "${product.name}"?`)) {
      try {
        await deleteProduct(product.id, product.imageUrl);
      } catch (error: any) {
        toast.error(`Delete failed: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Catalog</h2>
      
      {products.length === 0 ? (
        <p className="text-gray-500 italic">The store catalog is currently empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              
              <Link to={`/product/${product.id}`} className="cursor-pointer block">
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-lg truncate">{product.name}</h3>
                  <p className="text-blue-600 font-extrabold text-xl mt-1">{product.price} ₽</p>
                </div>
              </Link>

              <div className="p-4 pt-0 mt-auto">
                {/* ADMIN INTERFACE MANAGEMENT OVERLAYS */}
                {isAdmin ? (
                  <div className="grid grid-cols-2 gap-2 mt-2 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => openEditModal(product)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded transition-colors"
                    >
                      Edit Product
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  /* CLIENT CUSTOMER INTERFACE BUTTONS */
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors shadow-sm"
                  >
                    Add to Cart
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CRUD UPDATE MODAL WINDOW POPUP */}
      {editingProduct && (
        /* FIX: Changed legacy bg-opacity to modern slash syntax and added a smooth blur effect */
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Product Details</h3>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Price (Base ₽)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Replace Image File (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty to keep the current image profile asset.</p>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-md text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 rounded-md text-sm transition-colors shadow-sm"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}