import Image from "next/image";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ProductCard } from "@/components/shop/ProductCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { RecentlyViewed } from "@/components/personalization/RecentlyViewed";
import { PersonalStylist } from "@/components/personalization/PersonalStylist";
import { listProducts } from "@/lib/db/products";
import { getActiveBanners } from "@/lib/db/banners";

async function getProducts() {
  try {
    const [featured, bestSellers, trending] = await Promise.all([
      listProducts({ featured: true, bestSeller: false, limit: 5 }),
      listProducts({ bestSeller: true, sort: "popular", limit: 5 }),
      listProducts({ sort: "popular", bestSeller: false, featured: false, limit: 5 }),
    ]);

    return {
      featured: featured.products,
      bestSellers: bestSellers.products,
      trending: trending.products,
    };
  } catch {
    return { featured: [], bestSellers: [], trending: [] };
  }
}

async function getBanners(): Promise<string[]> {
  try {
    const banners = await getActiveBanners();
    return banners.map((b) => String(b.image)).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const { featured, bestSellers, trending } = await getProducts();
  const banners = await getBanners();
  const displayFeatured = featured.length ? featured : trending.slice(0, 5);

  return (
    <>
      <HeroSection />
      {banners.length > 0 && (
        <section className="relative h-72 sm:h-96 flex items-center justify-center overflow-hidden">
          <Image src={banners[0]} alt="Homepage Banner" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-rift-base/90 via-rift-base/50 to-transparent" />
          <div className="relative z-10 text-center px-4 sm:px-6">
            <p className="text-xs tracking-[0.3em] uppercase text-rift-orange mb-3">New Arrival</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">RIFT DISTRICT</h2>
            <p className="mt-3 text-rift-mist/70 text-sm md:text-base">Luxury Streetwear — Built Different</p>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Curated</p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-left">Featured Collection</h2>
            </div>
            <AnimatedButton href="/shop" variant="outline">View All</AnimatedButton>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {displayFeatured.length > 0 ? displayFeatured.slice(0, 5).map((p, i) => <ProductCard key={p._id} product={p} index={i} />) : null}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card--strong rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rift-orange/5 to-transparent" />
            <div className="relative max-w-3xl">
              <p className="text-xs tracking-[0.4em] uppercase text-rift-orange mb-4">Exclusive</p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-2xl text-left">Limited Drop SS26</h2>
              <p className="mt-4 text-rift-mist/60 max-w-md text-sm text-left">
                Acid wash essentials. Oversized silhouettes. Once they&apos;re gone, they&apos;re gone.
              </p>
              <div className="mt-8">
                <AnimatedButton href="/collection/limited-drop">Shop Drop</AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Top Picks</p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-left">Best Sellers</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {bestSellers.slice(0, 4).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">Hot Right Now</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-left">Trending Now</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {trending.slice(0, 4).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      <PersonalStylist />
      <RecentlyViewed />

      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card--strong rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rift-orange/5 via-transparent to-rift-slate/10" />
            <div className="relative max-w-3xl">
              <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-4">Our Story</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-left">Born in the Underground</h2>
              <p className="text-rift-mist/60 leading-relaxed mb-4 text-left">
                RIFT DISTRICT emerged from the intersection of luxury fashion and street culture.
                We craft oversized silhouettes with acid wash treatments that define modern Gen Z style.
              </p>
              <p className="text-rift-mist/60 leading-relaxed mb-8 text-left">
                Every piece is designed for those who move differently — premium materials,
                cinematic aesthetics, and an unapologetic edge.
              </p>
              <AnimatedButton href="/about" variant="outline">Learn More</AnimatedButton>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}