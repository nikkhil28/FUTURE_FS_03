import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, query, where } from 'firebase/firestore';

// GET handler
export async function GET(request, { params }) {
  const pathname = params?.path ? params.path.join('/') : '';
  
  try {
    // Get all products
    if (pathname === 'products' || pathname === '') {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return NextResponse.json({ products });
    }
    
    // Get products by category
    if (pathname.startsWith('products/category/')) {
      const category = pathname.split('/').pop();
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('category', '==', category));
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return NextResponse.json({ products });
    }
    
    // Get single product
    if (pathname.startsWith('products/')) {
      const productId = pathname.split('/').pop();
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        return NextResponse.json({ 
          product: { id: productSnap.id, ...productSnap.data() } 
        });
      } else {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json({ message: 'Pineapple API' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST handler - for seeding data
export async function POST(request, { params }) {
  const pathname = params?.path ? params.path.join('/') : '';
  
  try {
    if (pathname === 'products/seed') {
      const products = [
        {
          name: 'Pineapple Phone 15 Pro',
          category: 'phone',
          price: 999,
          description: 'The most powerful Pineapple Phone yet. Features titanium design, A17 Pro chip, and advanced camera system.',
          image: 'https://images.unsplash.com/photo-1592286927505-67dd3c29684d?w=800&auto=format&fit=crop',
          features: ['6.1-inch display', 'A17 Pro chip', 'Triple camera system', '128GB storage'],
          colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium']
        },
        {
          name: 'Pineapple Phone 15',
          category: 'phone',
          price: 799,
          description: 'All-day battery life. Super Retina XDR display. Dynamic Island. A powerful camera system.',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
          features: ['6.1-inch display', 'A16 chip', 'Dual camera system', '128GB storage'],
          colors: ['Pink', 'Yellow', 'Green', 'Blue', 'Black']
        },
        {
          name: 'PineBook Pro',
          category: 'laptop',
          price: 1999,
          description: 'Supercharged by M3 Pro or M3 Max. The most advanced chips ever built for a personal computer.',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
          features: ['14-inch Liquid Retina XDR', 'M3 Pro chip', 'Up to 18 hours battery', '512GB SSD'],
          colors: ['Space Black', 'Silver']
        },
        {
          name: 'PineBook Air',
          category: 'laptop',
          price: 1199,
          description: 'Incredibly thin and light. M2 chip delivers blazing-fast performance in a fanless design.',
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop',
          features: ['13.6-inch display', 'M2 chip', 'Up to 18 hours battery', '256GB SSD'],
          colors: ['Midnight', 'Starlight', 'Space Gray', 'Silver']
        },
        {
          name: 'PinePad Pro',
          category: 'tablet',
          price: 799,
          description: 'The ultimate tablet experience. M2 chip. All-day battery life. Stunning display.',
          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop',
          features: ['12.9-inch display', 'M2 chip', 'Face ID', '128GB storage'],
          colors: ['Space Gray', 'Silver']
        },
        {
          name: 'PinePad',
          category: 'tablet',
          price: 449,
          description: 'Colorfully reimagined. All-screen design. Powerful A14 Bionic chip. Fast wireless.',
          image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop',
          features: ['10.9-inch display', 'A14 chip', 'Touch ID', '64GB storage'],
          colors: ['Blue', 'Purple', 'Pink', 'Starlight', 'Space Gray']
        },
        {
          name: 'Pineapple Watch Ultra',
          category: 'watch',
          price: 799,
          description: 'The most rugged and capable Pineapple Watch ever. Titanium case. Extra-long battery life.',
          image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format&fit=crop',
          features: ['49mm titanium case', 'GPS + Cellular', 'Up to 36 hours battery', 'Water resistant'],
          colors: ['Natural', 'Black']
        },
        {
          name: 'Pineapple Watch Series 9',
          category: 'watch',
          price: 399,
          description: 'A magical way to use your watch without touching the screen. Advanced health features.',
          image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop',
          features: ['45mm case', 'GPS + Cellular', 'Up to 18 hours battery', 'Water resistant'],
          colors: ['Midnight', 'Starlight', 'Silver', 'Product Red']
        }
      ];
      
      const productsRef = collection(db, 'products');
      const addedProducts = [];
      
      for (const product of products) {
        const docRef = await addDoc(productsRef, product);
        addedProducts.push({ id: docRef.id, ...product });
      }
      
      return NextResponse.json({ 
        message: 'Products seeded successfully',
        count: addedProducts.length,
        products: addedProducts
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid endpoint' },
      { status: 404 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
