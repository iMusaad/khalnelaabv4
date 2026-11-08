import type { Metadata } from "next";
import AdminMessages from "@/components/AdminMessages";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "الرسائل",
  robots: { index: false, follow: false },
};

export default function AdminMessagesPage() {
  return (
    <PageShell title="الرسائل">
      <AdminMessages />
    </PageShell>
  );
}
