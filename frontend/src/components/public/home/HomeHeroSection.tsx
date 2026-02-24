import StoreBanner from './StoreBanner';
import SearchBar from './search/SearchBar';
import type { StoreDetails } from '../../../backend';

interface HomeHeroSectionProps {
  storeDetails: StoreDetails[];
}

export default function HomeHeroSection({ storeDetails }: HomeHeroSectionProps) {
  return (
    <div className="-mx-4 -mt-8 md:-mx-[calc((100vw-1200px)/2+1rem)]">
      <StoreBanner />
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <SearchBar storeDetails={storeDetails} />
      </div>
    </div>
  );
}
