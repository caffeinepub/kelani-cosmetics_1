import { useEffect } from 'react';

export interface SeoMetaTags {
  title: string;
  description: string;
  keywords?: string;
  robots?: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogType?: string;
  ogLocale?: string;
  ogSiteName?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

interface SeoHeadProps {
  meta: SeoMetaTags;
}

export default function SeoHead({ meta }: SeoHeadProps) {
  useEffect(() => {
    // Set document title
    document.title = meta.title;

    // Helper to set or update meta tag
    const setMetaTag = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          element.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '');
        } else if (selector.includes('name=')) {
          element.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] || '');
        }
        element.setAttribute('data-seo-managed', 'true');
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Helper to set or update link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        element.setAttribute('data-seo-managed', 'true');
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Set basic meta tags
    setMetaTag('meta[name="description"]', 'content', meta.description);
    if (meta.keywords) {
      setMetaTag('meta[name="keywords"]', 'content', meta.keywords);
    }
    if (meta.robots) {
      setMetaTag('meta[name="robots"]', 'content', meta.robots);
    }

    // Set canonical link
    setLinkTag('canonical', meta.canonical);

    // Set Open Graph tags
    setMetaTag('meta[property="og:title"]', 'content', meta.ogTitle);
    setMetaTag('meta[property="og:description"]', 'content', meta.ogDescription);
    setMetaTag('meta[property="og:url"]', 'content', meta.ogUrl);
    if (meta.ogType) {
      setMetaTag('meta[property="og:type"]', 'content', meta.ogType);
    }
    if (meta.ogLocale) {
      setMetaTag('meta[property="og:locale"]', 'content', meta.ogLocale);
    }
    if (meta.ogSiteName) {
      setMetaTag('meta[property="og:site_name"]', 'content', meta.ogSiteName);
    }

    // Set Twitter tags
    if (meta.twitterCard) {
      setMetaTag('meta[name="twitter:card"]', 'content', meta.twitterCard);
    }
    if (meta.twitterTitle) {
      setMetaTag('meta[name="twitter:title"]', 'content', meta.twitterTitle);
    }
    if (meta.twitterDescription) {
      setMetaTag('meta[name="twitter:description"]', 'content', meta.twitterDescription);
    }

    // Cleanup function to remove managed tags on unmount
    return () => {
      const managedElements = document.querySelectorAll('[data-seo-managed="true"]');
      managedElements.forEach((element) => {
        element.remove();
      });
    };
  }, [meta]);

  return null;
}
