import { Hero } from "@/components/storefront/home/hero";
import { FeaturedCollection } from "@/components/storefront/home/featured-collection";
import { ProductRail } from "@/components/storefront/home/product-rail";
import { BrandStory } from "@/components/storefront/home/brand-story";
import { ShopByCategory } from "@/components/storefront/home/shop-by-category";
import { LookbookTeaser } from "@/components/storefront/home/lookbook-teaser";
import { CustomOrderCta } from "@/components/storefront/home/custom-order-cta";
import { ReviewsSection } from "@/components/storefront/home/reviews-section";
import { InstagramGallery } from "@/components/storefront/home/instagram-gallery";
import { NewsletterSection } from "@/components/storefront/home/newsletter-section";
import { getBestsellers, getNewArrivals } from "@/server/queries/products";
import {
  getActiveCategories,
  getFeaturedCollection,
  getApprovedReviewsSample,
  getPublishedLookbook,
} from "@/server/queries/catalog";

export default async function HomePage() {
  const [bestsellers, newArrivals, categories, featuredCollection, reviews, lookbook] = await Promise.all([
    getBestsellers(8),
    getNewArrivals(8),
    getActiveCategories(),
    getFeaturedCollection(),
    getApprovedReviewsSample(3),
    getPublishedLookbook(),
  ]);

  return (
    <>
      <Hero />
      {featuredCollection && <FeaturedCollection collection={featuredCollection} />}
      <ProductRail kicker="Fan Favorites" title="Bestsellers" products={bestsellers} viewAllHref="/shop?sort=bestselling" />
      <BrandStory />
      <ShopByCategory categories={categories} />
      {lookbook && <LookbookTeaser images={lookbook.images} />}
      <ProductRail kicker="Just In" title="New Arrivals" products={newArrivals} viewAllHref="/shop?sort=newest" />
      <CustomOrderCta />
      <ReviewsSection reviews={reviews} />
      <InstagramGallery />
      <NewsletterSection />
    </>
  );
}
