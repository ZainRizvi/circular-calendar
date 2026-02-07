import {
  Navigation,
  Hero,
  ProblemSection,
  HowItWorks,
  Benefits,
  Testimonials,
  PackageSection,
  FAQ,
  CTA,
  Footer,
} from '@/components';

export default function Home() {
  return (
    <>
      {/* Decorative background elements */}
      <div className="bg-pattern"></div>
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      <Navigation />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <PackageSection />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
