import { Suspense } from 'react';
import ClientPage from '@/app/client-page';
import Loading from '@/app/loading';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientPage />
    </Suspense>
  );
}
