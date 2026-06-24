import express, { Request, Response } from 'express';

interface Product {
  id: number;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Dairy' | 'Poultry';
  pricePerKg: number;
  farmerName: string;
  location: string;
  stock: number;
}

interface Order {
  productId: number;
  quantity: number;
  consumerName: string;
  contact: string;
}

const app = express();
app.use(express.json());

// Mock Database
const products: Product[] = [
  {
    id: 1,
    name: 'Organic Kale (Sukuma Wiki)',
    category: 'Vegetables',
    pricePerKg: 50,
    farmerName: 'Mama Njeri',
    location: 'Limuru',
    stock: 100
  },
  {
    id: 2,
    name: 'Grade A Eggs',
    category: 'Poultry',
    pricePerKg: 15,
    farmerName: 'Karanja Poultry',
    location: 'Kikuyu',
    stock: 500
  },
  {
    id: 3,
    name: 'Fresh Hass Avocado',
    category: 'Fruits',
    pricePerKg: 80,
    farmerName: 'Gatundu Greens',
    location: 'Gatundu',
    stock: 200
  }
];

const orders: Order[] = [];

// Routes
app.get('/api/products', (req: Request, res: Response) => {
  const { category } = req.query;
  if (category) {
    return res.json(products.filter(p => p.category === category));
  }
  res.json(products);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { productId, quantity, consumerName, contact } = req.body;

  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Insufficient stock available' });
  }

  const newOrder: Order = {
    productId,
    quantity,
    consumerName,
    contact
  };

  product.stock -= quantity;
  orders.push(newOrder);

  console.log(`New order from ${consumerName} for ${quantity} units of product ID ${productId}`);
  res.status(201).json({ message: 'Order placed successfully', order: newOrder });
});

app.get('/api/admin/stats', (req: Request, res: Response) => {
  const totalValue = orders.reduce((acc, curr) => {
    const p = products.find(prod => prod.id === curr.productId);
    return acc + (curr.quantity * (p?.pricePerKg || 0));
  }, 0);

  res.json({
    totalOrders: orders.length,
    totalRevenue: totalValue,
    activeFarmers: [...new Set(products.map(p => p.farmerName))].length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kiambu Farmer Direct API running on port ${PORT}`);
  console.log('Connecting local farmers to urban consumers...');
});
