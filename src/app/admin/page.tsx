import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PageShell title="لوحة التحكم">
      <AdminPanel />
    </PageShell>
  );
}
