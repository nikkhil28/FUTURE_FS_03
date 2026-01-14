'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Smartphone, Laptop, Tablet, Watch, ShoppingCart, X, Minus, Plus } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(null);

  useEffect(() => {
    fetchProducts();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('pineappleCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('pineappleCart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const seedProducts = async () => {
    try {
      const response = await fetch('/api/products/seed', {
        method: 'POST',
      });
      const data = await response.json();
      console.log('Seeded:', data);
      fetchProducts();
    } catch (error) {
      console.error('Error seeding products:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All Products', icon: null },
    { id: 'phone', name: 'Phones', icon: Smartphone },
    { id: 'laptop', name: 'Laptops', icon: Laptop },
    { id: 'tablet', name: 'Tablets', icon: Tablet },
    { id: 'watch', name: 'Watches', icon: Watch },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const featuredProduct = products.find(p => p.name.includes('Pro'));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-12">
              <h1 className="text-2xl font-semibold">🍍 Pineapple</h1>
              <div className="hidden md:flex space-x-8 text-sm">
                <a href="#products" className="hover:text-gray-300 transition">Products</a>
                <a href="#phones" className="hover:text-gray-300 transition">Phones</a>
                <a href="#laptops" className="hover:text-gray-300 transition">Laptops</a>
                <a href="#tablets" className="hover:text-gray-300 transition">Tablets</a>
                <a href="#watches" className="hover:text-gray-300 transition">Watches</a>
              </div>
            </div>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Support
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {featuredProduct ? (
            <div className="text-center py-20">
              <h2 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                {featuredProduct.name}
              </h2>
              <p className="text-2xl text-gray-400 mb-8">Premium. Powerful. Pineapple.</p>
              <div className="flex justify-center gap-4 mb-12">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                  Buy Now
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Learn More <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="relative max-w-4xl mx-auto">
                <img
                  src={featuredProduct.image}
                  alt={featuredProduct.name}
                  className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Welcome to Pineapple
              </h2>
              <p className="text-2xl text-gray-400 mb-8">Innovation at its finest</p>
              {products.length === 0 && !loading && (
                <Button onClick={seedProducts} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Load Products
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-6 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className={`${
                    selectedCategory === category.id
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="mt-4 text-gray-400">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="bg-zinc-900 border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 group">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-purple-600 text-xs px-3 py-1 rounded-full">
                        {product.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">${product.price}</span>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Buy
                        </Button>
                      </div>
                      {product.colors && product.colors.length > 0 && (
                        <div className="mt-4 flex gap-2">
                          {product.colors.slice(0, 4).map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border border-white/20"
                              style={{
                                background: color.toLowerCase().includes('black') ? '#000' :
                                           color.toLowerCase().includes('white') ? '#fff' :
                                           color.toLowerCase().includes('silver') ? '#c0c0c0' :
                                           color.toLowerCase().includes('gray') ? '#666' :
                                           color.toLowerCase().includes('blue') ? '#0066cc' :
                                           color.toLowerCase().includes('pink') ? '#ff69b4' :
                                           color.toLowerCase().includes('purple') ? '#9333ea' :
                                           color.toLowerCase().includes('green') ? '#10b981' :
                                           color.toLowerCase().includes('yellow') ? '#fbbf24' :
                                           color.toLowerCase().includes('red') ? '#ef4444' : '#666'
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-4">No products found</p>
              <Button onClick={seedProducts} className="bg-purple-600 hover:bg-purple-700">
                Load Sample Products
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-purple-900/20 to-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Why Pineapple?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Powered by next-generation chips for unmatched performance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-pink-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Beautiful Design</h3>
              <p className="text-gray-400">Stunning aesthetics meets premium materials</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-400">Your data stays yours with advanced security features</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-zinc-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Phones</a></li>
                <li><a href="#" className="hover:text-white transition">Laptops</a></li>
                <li><a href="#" className="hover:text-white transition">Tablets</a></li>
                <li><a href="#" className="hover:text-white transition">Watches</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Service & Repair</a></li>
                <li><a href="#" className="hover:text-white transition">Warranty</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Newsroom</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            <p>© 2025 Pineapple Inc. All rights reserved. Designed with 🍍</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
