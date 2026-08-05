import { Suspense } from 'react';
import ClientPage from './client-page';
import Loading from './loading';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientPage />
    </Suspense>
  );
}

