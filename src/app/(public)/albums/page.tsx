import { permanentRedirect } from 'next/navigation';

export default function AlbumsRedirectPage({
  searchParams,
}: {
  searchParams: { concept?: string; category?: string };
}) {
  const param = searchParams?.category || searchParams?.concept;
  const query = param ? `?concept=${encodeURIComponent(param)}` : '';
  permanentRedirect(`/bo-suu-tap${query}`);
}
