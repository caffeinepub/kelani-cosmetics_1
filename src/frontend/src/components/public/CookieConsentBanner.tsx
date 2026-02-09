import { useState, useEffect, useRef } from 'react';
import { useLocation } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { getConsent, setConsent, hasConsentBeenSet } from '../../utils/cookieUtils';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if we're on the privacy page
    const isPrivacyPage = location.pathname === '/privacy';
    
    // Check if user has already made a choice
    const hasConsent = hasConsentBeenSet();
    
    // Show banner only if not on privacy page and no consent set
    if (!isPrivacyPage && !hasConsent) {
      setIsVisible(true);
      
      // Focus the accept button after a short delay for accessibility
      setTimeout(() => {
        acceptButtonRef.current?.focus();
      }, 100);
    } else {
      setIsVisible(false);
    }
  }, [location.pathname]);

  const handleAccept = () => {
    setConsent('accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    setConsent('declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="cookie-consent-banner"
      role="region"
      aria-label="Aviso de cookies"
    >
      <div className="cookie-consent-container">
        <div className="cookie-consent-content">
          <p className="cookie-consent-text">
            Usamos cookies para mejorar tu experiencia.{' '}
            <a 
              href="/privacy" 
              className="cookie-consent-link"
              tabIndex={0}
            >
              Más info
            </a>
          </p>
          <div className="cookie-consent-actions">
            <Button
              ref={acceptButtonRef}
              onClick={handleAccept}
              size="sm"
              className="cookie-consent-button cookie-consent-button-accept"
            >
              Aceptar
            </Button>
            <Button
              onClick={handleDecline}
              size="sm"
              variant="outline"
              className="cookie-consent-button cookie-consent-button-decline"
            >
              Declinar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
