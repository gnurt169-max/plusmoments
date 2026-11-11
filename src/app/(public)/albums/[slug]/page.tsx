import { redirect } from 'next/navigation';

export default function AlbumDetailRedirectPage({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/bo-suu-tap/${params.slug}`);
}
