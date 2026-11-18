import React from "react";
import { siteConfig } from "@/lib/config";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: siteConfig.logoUrl,
      caption: `${siteConfig.name} Logo`,
    },
    description: siteConfig.description,
    sameAs: [
      "https://github.com/kanchan-nath/scanbeforeeat",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support & Research Inquiries",
      email: siteConfig.contactEmail,
    },
  };
  return <JsonLd data={schema} />;
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/additives?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return <JsonLd data={schema} />;
}

export function SoftwareAppSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, iOS, Android (PWA)",
    url: siteConfig.url,
    offers: [
      {
        "@type": "Offer",
        name: "Free Plan (15 Scans / Month)",
        price: "0",
        priceCurrency: "INR",
        description: "15 free scans per month for mobile barcode and ingredient label analysis.",
      },
      {
        "@type": "Offer",
        name: "Monthly Pro (99 Scans)",
        price: "199",
        priceCurrency: "INR",
        description: "99 scans per month with chemical synergy and deep toxicology alerts.",
      },
      {
        "@type": "Offer",
        name: "6-Month Saver (99 Scans)",
        price: "499",
        priceCurrency: "INR",
        description: "99 scans per 6 months with multi-device synchronization.",
      },
      {
        "@type": "Offer",
        name: "Annual Pro (99 Scans)",
        price: "999",
        priceCurrency: "INR",
        description: "99 scans per year with complete family watchlists and exportable dossiers.",
      },
    ],
  };
  return <JsonLd data={schema} />;
}

export function ArticleSchema({
  title,
  description,
  url,
  publishedDate,
  modifiedDate,
  authorName,
  image,
}: {
  title: string;
  description: string;
  url: string;
  publishedDate: string;
  modifiedDate?: string;
  authorName: string;
  image?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: image || siteConfig.logoUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
  };
  return <JsonLd data={schema} />;
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLd data={schema} />;
}
