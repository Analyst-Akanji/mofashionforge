import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import IntroSection from "./components/IntroSection";
import ShopSection from "./components/ShopSection";
import StoryBanner from "./components/StoryBanner";
import ProcessSection from "./components/ProcessSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import useReveal from "./hooks/useReveal";

function App() {
  const containerRef = useReveal();

  return (
    <div ref={containerRef} className="min-h-screen bg-linen font-body">
      <Navbar />
      <Hero />
      <IntroSection />
      <ShopSection />
      <StoryBanner />
      <ProcessSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default App;