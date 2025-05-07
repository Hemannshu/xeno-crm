import { CustomerForm } from '../../components/customers/CustomerForm';

export default function NewCustomerPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">New Customer</h1>
      <CustomerForm />
    </div>
  );
} 