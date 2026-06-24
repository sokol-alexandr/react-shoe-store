import { useParams } from 'react-router-dom';
import type { Product } from '../types';

// Define the props expected by this page
type ProductDetailsPageProps = {
  products: Product[];
  onAddToCart: (p: Product) => void;
};

export function ProductDetailsPage({ products, onAddToCart }: ProductDetailsPageProps) {
  // Extract the product ID from the URL
  const { id } = useParams(); 
  const product = products.find(p => p.id === Number(id));

  // Handle the case where a user types a wrong ID in the URL
  if (!product) {
    return <p className="text-red-500 font-bold">Product not found!</p>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full md:w-1/2 object-cover rounded-lg shadow-sm" 
      />
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h2>
        <p className="text-2xl text-blue-600 font-bold mb-8">{product.price} ₽</p>
        <button 
          onClick={() => onAddToCart(product)}
          className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}