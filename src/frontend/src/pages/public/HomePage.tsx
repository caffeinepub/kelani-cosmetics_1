import HomeHeroSection from '../../components/public/home/HomeHeroSection';
import HomepageCategoriesSection from '../../components/public/home/HomepageCategoriesSection';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <HomeHeroSection />
      <HomepageCategoriesSection />
    </div>
  );
}
