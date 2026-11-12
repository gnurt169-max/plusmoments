import { redirect } from 'next/navigation';

export default function AlbumsRedirectPage({
  searchParams,
}: {
  searchParams: { concept?: string; category?: string };
}) {
  const param = searchParams?.category || searchParams?.concept;
  const query = param ? `?concept=${encodeURIComponent(param)}` : '';
  redirect(`/bo-suu-tap${query}`);
}
