import { OrderForm } from '../../components/orders/OrderForm';

export default function NewOrderPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">New Order</h1>
      <OrderForm />
    </div>
  );
} 