import { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import PublicHeader from '../../components/public/PublicHeader';
import PublicSidePanel from '../../components/public/PublicSidePanel';
import PublicFooter from '../../components/public/PublicFooter';
import ProductModalHost from '../../components/public/product/ProductModalHost';
import CookieConsentBanner from '../../components/public/CookieConsentBanner';

export default function PublicLayout() {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const toggleSidePanel = () => {
    setIsSidePanelOpen((prev) => !prev);
  };

  const closeSidePanel = () => {
    setIsSidePanelOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader onToggleSidePanel={toggleSidePanel} />
      
      <PublicSidePanel 
        isOpen={isSidePanelOpen} 
        onClose={closeSidePanel} 
      />
      
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-[1200px] px-4 py-4">
          <Outlet />
        </div>
      </main>
      
      <PublicFooter />
      
      {/* Product Modal Host - mounted at layout level */}
      <ProductModalHost />
      
      {/* Cookie Consent Banner - mounted at layout level */}
      <CookieConsentBanner />
    </div>
  );
}
