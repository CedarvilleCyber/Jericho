'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RefreshOnMount() {
  const router = useRouter();

  useEffect(() => {
    console.log('RefreshOnMount executing - calling router.refresh()');
    router.refresh();
  }, [router]);

  return null;
}
