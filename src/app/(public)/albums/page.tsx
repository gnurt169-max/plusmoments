import { redirect } from 'next/navigation';

export default function AlbumsRedirectPage({
  searchParams,
}: {
  searchParams: { concept?: string };
}) {
  const query = searchParams?.concept ? `?concept=${encodeURIComponent(searchParams.concept)}` : '';
  redirect(`/bo-suu-tap${query}`);
}
