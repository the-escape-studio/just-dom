import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ArrowRightLeft } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      nav={{
        title: <>
          <Image src="/logo.svg" alt="JUST DOM" width={24} height={24} />
          <span className="font-bold">JUST-DOM</span>
        </>,
      }}
      sidebar={{
        banner: (
          <div className="flex flex-col gap-2">
            <Link
              href="/playground"
              className="flex items-center gap-2 rounded-md border bg-fd-card px-3 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
            >
              <Play className="size-4" />
              Playground
            </Link>
            <Link
              href="/converter"
              className="flex items-center gap-2 rounded-md border bg-fd-card px-3 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
            >
              <ArrowRightLeft className="size-4" />
              Converter
            </Link>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
