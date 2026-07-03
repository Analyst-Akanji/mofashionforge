import Hero from "../components/Hero";
import IntroSection from "../components/IntroSection";
import ShopSection from "../components/ShopSection";
import StoryBanner from "../components/StoryBanner";
import ProcessSection from "../components/ProcessSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <IntroSection />
      <ShopSection />
      <StoryBanner />
      <ProcessSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
