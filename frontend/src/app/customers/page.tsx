import { CustomerList } from '../components/customers/CustomerList';

export default function CustomersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Customers</h1>
      <CustomerList />
    </div>
  );
} 