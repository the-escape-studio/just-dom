import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Image from 'next/image';

export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout
    {...baseOptions()}
    className='[&>header]:fixed [&>header]:inset-0 [&>header>nav]:backdrop-blur-none! [&>header>nav]:border-none [&>header>nav]:bg-gradient-to-b [&>header>nav]:from-background [&>header>nav]:via-background/80 [&>header>nav]:to-background/0'
    nav={{
      transparentMode: 'always',
      title: <>
        <Image src="/logo.svg" alt="JUST DOM" width={32} height={32} />
        <span className="hidden md:block">JUST-DOM</span>
      </>,
    }}
    links={[
      { text: 'Documentation', url: '/docs' },
      { text: 'Playground', url: '/playground' },
      { text: 'Converter', url: '/converter' },
    ]}
  > {children}</HomeLayout >;
}
