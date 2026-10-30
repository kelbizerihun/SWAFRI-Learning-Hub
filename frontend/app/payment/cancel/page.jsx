import { redirect } from 'next/navigation';

// Stripe Checkout "back" link: return the learner to the course page.
export default function Page({ searchParams }) {
  const id = String(searchParams?.course || '');
  redirect(/^\w+$/.test(id) ? '/#payment-cancel-' + id : '/#courses');
}
