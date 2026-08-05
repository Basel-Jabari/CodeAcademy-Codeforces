'use client';

import Home from '@/components/home/Home';
import { getPromblemsListFromStorage } from '@/utils/storage';

export default function App() {
  const problemsList = getPromblemsListFromStorage();
  return <Home initialProblemsList={problemsList} />;
}
