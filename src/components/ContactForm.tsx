"use client";

import { useState, type FormEvent } from "react";
import { SITE } from "@/data/site";

const COUNTRY_CODES = [
  { label: "السعودية \u2066+966\u2069", code: "+966" },
  { label: "الكويت \u2066+965\u2069", code: "+965" },
  { label: "الإمارات \u2066+971\u2069", code: "+971" },
  { label: "قطر \u2066+974\u2069", code: "+974" },
  { label: "البحرين \u2066+973\u2069", code: "+973" },
  { label: "عُمان \u2066+968\u2069", code: "+968" },
];

const inputClass =
  "h-12 w-full rounded-xl bg-[#15102b] px-4 text-right text-base font-bold text-white outline-none ring-1 ring-white/10 transition-shadow placeholder:text-white/35 focus:ring-2 focus:ring-[#ffc23d]";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(COUNTRY_CODES[0].code);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const canSend = name.trim() && message.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    const lines = [
      `الاسم: ${name.trim()}`,
      ...(email.trim() ? [`الإيميل: ${email.trim()}`] : []),
      ...(phone.trim() ? [`الجوال: ${country} ${phone.trim()}`] : []),
      "",
      message.trim(),
    ];

    const href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(
      `رسالة من ${name.trim()}`,
    )}&body=${encodeURIComponent(lines.join("\n"))}`;

    window.location.href = href;
    setSent(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-lg space-y-3 rounded-3xl bg-[#221a3f] p-5 shadow-[0_6px_0_#140f29] sm:p-7"
    >
      <label className="block">
        <span className="sr-only">اسمك</span>
        <input
          id="contact-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="اسمك"
          autoComplete="name"
          required
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="sr-only">الإيميل</span>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="الإيميل"
          autoComplete="email"
          dir="auto"
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-[minmax(0,1fr)_170px] gap-2">
        <label className="block">
          <span className="sr-only">رقم الجوال</span>
          <input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="رقم الجوال"
            autoComplete="tel-national"
            dir="ltr"
            className={`${inputClass} text-left placeholder:text-right`}
          />
        </label>

        <label className="block">
          <span className="sr-only">رمز الدولة</span>
          <select
            id="contact-country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className={`${inputClass} cursor-pointer pl-2 pr-3 text-sm`}
          >
            {COUNTRY_CODES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="sr-only">رسالتك</span>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="رسالتك"
          required
          rows={5}
          className={`${inputClass} h-auto resize-none py-3 leading-7`}
        />
      </label>

      <button
        type="submit"
        disabled={!canSend}
        className="btn-primary w-full py-3 text-lg"
      >
        إرسال
      </button>

      <p
        aria-live="polite"
        className="min-h-[20px] text-center text-sm font-bold text-white/50"
      >
        {sent ? "فتحنا لك تطبيق الإيميل، اضغط إرسال من هناك" : ""}
      </p>
    </form>
  );
}
