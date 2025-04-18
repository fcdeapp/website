// app/setting/page.tsx
import dynamic from 'next/dynamic';

// dynamically import the client component,
// with SSR turned off completely:
const SettingClient = dynamic(
  () => import('./SettingClient'),
  { ssr: false }
);

export default function Page() {
  return <SettingClient />;
}
