import { permanentRedirect } from 'next/navigation';

export default function AlbumDetailRedirectPage({
  params,
}: {
  params: { slug: string };
}) {
  permanentRedirect(`/bo-suu-tap/${params.slug}`);
}
