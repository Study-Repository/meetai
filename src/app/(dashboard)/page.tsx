import { HomeView } from '@/modules/home/ui/views/home-view';

export default async function Page() {
  return (
    <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-start gap-y-20 bg-white px-16 py-32 sm:items-start dark:bg-black">
        <HomeView />
      </main>
    </div>
  );
}
