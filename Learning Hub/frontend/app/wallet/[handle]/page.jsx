import { redirect } from 'next/navigation';

// Shareable link (e.g. printed in certificate QR codes) that opens the page inside the app.
export default function Page({ params }) {
  redirect('/#wallet-' + encodeURIComponent(params.handle));
}
