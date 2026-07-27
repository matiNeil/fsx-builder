import { SiteFooter } from "@/components/marketing/site-footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
