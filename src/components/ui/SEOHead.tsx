import React, { useEffect } from 'react';
import { Product } from '../../types/product';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  productSchema?: Product;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'MOSS | Thoughtfully Designed Everyday Essentials',
  description = 'A premium modern lifestyle brand focused on thoughtfully designed everyday essentials. Live simply. Live MOSS.',
  keywords = 'MOSS, minimalist lifestyle, modern home goods, European linen apparel, luxury essentials',
  ogImage = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  ogType = 'website',
  canonicalUrl,
  productSchema,
}) => {
  useEffect(() => {
    // Set Document Title
    const formattedTitle = title.includes('MOSS') ? title : `${title} | MOSS`;
    document.title = formattedTitle;

    // Helper to set meta tags
    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);

    if (canonicalUrl) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonicalUrl);
    }

    // Product JSON-LD Schema
    let scriptTag = document.getElementById('json-ld-product') as HTMLScriptElement;
    if (productSchema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'json-ld-product';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }

      const schema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: productSchema.name,
        image: productSchema.images,
        description: productSchema.shortDescription || productSchema.description,
        sku: productSchema.sku,
        brand: {
          '@type': 'Brand',
          name: 'MOSS',
        },
        offers: {
          '@type': 'Offer',
          url: window.location.href,
          priceCurrency: 'USD',
          price: productSchema.price,
          availability: productSchema.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
        aggregateRating: productSchema.reviewCount > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: productSchema.rating,
          reviewCount: productSchema.reviewCount,
        } : undefined,
      };

      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, productSchema]);

  return null;
};
