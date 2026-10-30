import { redirect } from 'next/navigation';

// Stripe Checkout returns here (?session_id=cs_…); the app then confirms the payment with the API.
export default function Page({ searchParams }) {
  const id = String(searchParams?.session_id || '');
  redirect(/^cs_\w+$/.test(id) ? '/#payment-' + id : '/#my-learning');
}
