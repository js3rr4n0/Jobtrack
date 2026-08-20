import type { Metadata } from 'next';

import { BoardWorkspace } from '@/components/board/BoardWorkspace';

export const metadata: Metadata = {
  title: 'Tablero',
};

export default function BoardPage() {
  return <BoardWorkspace />;
}
