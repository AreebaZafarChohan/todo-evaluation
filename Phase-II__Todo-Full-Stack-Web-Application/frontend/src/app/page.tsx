// T013: Landing page with hero section and footer
import { HeroSection } from '@/components/layout/hero-section';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
