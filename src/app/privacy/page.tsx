import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PolicySection from "@/components/PolicySection";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | خل نلعب",
};

export default function PrivacyPage() {
  return (
    <PageShell title="سياسة الخصوصية">
      <div className="space-y-3">
        <PolicySection title="باختصار">
          <p>
            ما نحتفظ بأرقام جوالات ولا بيانات بطاقات. نطلب إيميلك وقت الشراء
            عشان نرسل لك الكود، ونحفظه بشكل مشفّر بس عشان نقدر نرجع لك الكود لو
            ضاع.
          </p>
        </PolicySection>

        <PolicySection title="الإيميل">
          <p>
            لما تكتب إيميلك وقت الشراء، نستخدمه لإرسال كود التفعيل لك. ونحفظ منه
            بصمة مشفّرة مربوطة برقم العملية، ما نقدر نرجع منها للإيميل نفسه،
            عشان لو ضاع الكود تكتب إيميلك ونرسله لك من جديد.
          </p>
          <p>
            ما نرسل لك أي إعلانات، وتقدر تطلب حذف إيميلك من صفحة «تواصل معنا».
          </p>
        </PolicySection>

        <PolicySection title="طيب وش يتخزن على جهازك؟">
          <p>
            أسماء الفرق ونتيجة الجلسة تنحفظ مؤقتًا في متصفحك عشان ما تضيع لو
            حدّثت الصفحة، وتنمسح لما تقفل الصفحة. ما توصلنا أبدًا.
          </p>
          <p>
            بعد الشراء ينحفظ كود التفعيل في ملف تعريف ارتباط (كوكي) على جهازك
            عشان يتذكر إن اللعبة مفعلة. هذا الكود ما فيه أي معلومة عنك.
          </p>
        </PolicySection>
      </div>
    </PageShell>
  );
}
