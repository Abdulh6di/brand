import { SiteChrome } from "@/components/layout/site-chrome";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
