import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

// Define the props expected by this page
type CatalogPageProps = {
  products: Product[];
  onAddToCart: (p: Product) => void;
};

export function CatalogPage({ products, onAddToCart }: CatalogPageProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Catalog</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}