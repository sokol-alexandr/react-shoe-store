import { Link } from 'react-router-dom';
// Import Product type from our new central domain model
import type { Product } from '../types';

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
};
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center hover:shadow-lg transition-shadow">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-40 object-cover rounded-md mb-4 bg-gray-200"
      />
      
      {/* Make the title a clickable link pointing to /product/:id */}
      <Link to={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
        <h3 className="font-semibold text-gray-800 text-center">{product.name}</h3>
      </Link>
      
      <p className="text-blue-600 font-bold mt-2 text-lg">{product.price} ₽</p>
      <button 
        onClick={() => onAddToCart(product)}
        className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
      >
        Add to cart
      </button>
    </div>
  );
}