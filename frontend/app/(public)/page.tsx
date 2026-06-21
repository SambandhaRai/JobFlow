import CategorySection from "./_components/CategorySection";
import EmployerCTA from "./_components/EmployerCTA";
import FeaturedSection from "./_components/FeaturedSection";
import Footer from "./_components/Footer";
import Hero from "./_components/Hero";
import Navbar from "./_components/Navbar";
import StatsBar from "./_components/StatsBar";
import WhySection from "./_components/WhySection";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-surface">
            <Navbar />
            <Hero />
            <StatsBar />
            <WhySection />
            <FeaturedSection />
            <CategorySection />
            <EmployerCTA />
            <Footer />
        </div>
    );
}
