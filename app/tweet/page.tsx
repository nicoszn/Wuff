import MediaDownloader from '@/components/MediaDownloader';
import ExtractorForm from '@/components/ExtractorForm';
export default function Tweet() {
  // return <MediaDownloader />;
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <ExtractorForm />
    </main>
  );
}
