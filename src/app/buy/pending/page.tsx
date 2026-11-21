import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import PendingPayment from "@/components/PendingPayment";
import { isValidPaymentId } from "@/lib/payment";

export const metadata: Metadata = {
  title: "تأكيد الدفع | خل نلعب",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function PendingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; from?: string }>;
}) {
  const { id = "", from } = await searchParams;

  if (!isValidPaymentId(id)) {
    redirect("/buy");
  }

  return (
    <PageShell title="تأكيد الدفع">
      <PendingPayment id={id} restore={from === "restore"} />
    </PageShell>
  );
}
