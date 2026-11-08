import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import HomeLogoLink from "@/components/HomeLogoLink";
import PixelHero from "@/components/PixelHero";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "تواصل معنا | خل نلعب",
};

export default function ContactPage() {
  return (
    <main className="min-h-[100dvh] overflow-x-clip text-white">
      <HomeLogoLink />

      <PixelHero logo={false} overlap={false} compact>
        <h1 className="pt-20 text-3xl font-black sm:pt-2 sm:text-4xl">
          تواصل معنا
        </h1>

        <p className="mt-2 text-sm font-black opacity-70 sm:text-base">
          نرد عادة خلال يومين
        </p>
      </PixelHero>

      <div className="mx-auto mt-8 max-w-3xl px-4 pb-6">
        <ContactForm />

        <SiteFooter />
      </div>
    </main>
  );
}
