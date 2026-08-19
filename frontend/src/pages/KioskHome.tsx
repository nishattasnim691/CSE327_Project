import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  MessageCircle,
  Pill,
  Activity,
  Package,
  Siren,
  Type as TypeIcon,
  Languages,
  Wifi,
  WifiOff,
  ShoppingCart,
} from "lucide-react";

import kioskBg from "../assets/kiosk-bg.png";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Lang = "en" | "bn";

interface Tile {
  id: string;
  to: string;
  icon: ReactNode;
  title: {
    en: string;
    bn: string;
  };
  desc: {
    en: string;
    bn: string;
  };
  badge?: number;
  tag?: {
    en: string;
    bn: string;
  };
}

// ---------------------------------------------------------------------------
// Patient service tiles
// ---------------------------------------------------------------------------

const TILES: Tile[] = [
  {
    id: "symptoms",
    to: "/kiosk/symptoms",
    icon: <Stethoscope size={22} strokeWidth={2} />,
    title: {
      en: "Check my symptoms",
      bn: "উপসর্গ পরীক্ষা করুন",
    },
    desc: {
      en: "Tell us how you feel. Your symptoms will be prepared for triage.",
      bn: "আপনার লক্ষণ জানান। সেগুলো ট্রায়াজের জন্য প্রস্তুত করা হবে।",
    },
    tag: {
      en: "Start here",
      bn: "এখান থেকে শুরু",
    },
  },

  {
  id: "chat",
  to: "/kiosk/consultation",
  icon: <MessageCircle size={22} strokeWidth={2} />,
  title: {
    en: "Talk to my doctor",
    bn: "ডাক্তারের সাথে কথা বলুন",
  },
  desc: {
    en: "Send and receive secure text messages with your remote doctor.",
    bn: "দূরবর্তী ডাক্তারের সাথে নিরাপদ টেক্সট বার্তা আদান-প্রদান করুন।",
  },
  badge: 2,
},

  {
    id: "prescription",
    to: "/kiosk/prescription",
    icon: <Pill size={22} strokeWidth={2} />,
    title: {
      en: "My prescription",
      bn: "আমার প্রেসক্রিপশন",
    },
    desc: {
      en: "Review prescribed medicines, dosage, and doctor instructions.",
      bn: "প্রেসক্রাইব করা ওষুধ, মাত্রা এবং ডাক্তারের নির্দেশনা দেখুন।",
    },
  },

  {
    id: "checkout",
    to: "/kiosk/checkout",
    icon: <ShoppingCart size={22} strokeWidth={2} />,
    title: {
      en: "Buy medicine",
      bn: "ওষুধ কিনুন",
    },
    desc: {
      en: "Purchase medicine using an approved digital prescription.",
      bn: "অনুমোদিত ডিজিটাল প্রেসক্রিপশন ব্যবহার করে ওষুধ কিনুন।",
    },
    tag: {
      en: "Prescription required",
      bn: "প্রেসক্রিপশন প্রয়োজন",
    },
  },

  {
    id: "dashboard",
    to: "/kiosk/dashboard",
    icon: <Activity size={22} strokeWidth={2} />,
    title: {
      en: "My health dashboard",
      bn: "আমার স্বাস্থ্য ড্যাশবোর্ড",
    },
    desc: {
      en: "View vitals, health history, and automatically updated trends.",
      bn: "ভাইটালস, স্বাস্থ্য ইতিহাস এবং আপডেট হওয়া প্রবণতা দেখুন।",
    },
  },

  {
    id: "tracking",
    to: "/kiosk/orders",
    icon: <Package size={22} strokeWidth={2} />,
    title: {
      en: "Track my delivery",
      bn: "ডেলিভারি ট্র্যাক করুন",
    },
    desc: {
      en: "Follow your medicine order from processing to delivery.",
      bn: "প্রসেসিং থেকে ডেলিভারি পর্যন্ত ওষুধের অর্ডার দেখুন।",
    },
    tag: {
      en: "Live status",
      bn: "লাইভ অবস্থা",
    },
  },
];

// ---------------------------------------------------------------------------
// Language content
// ---------------------------------------------------------------------------

const COPY = {
  en: {
    headline: "How can we help you today?",
    sub:
      "Private, text-first healthcare designed to continue working even when internet connectivity is limited.",

    kiosk: "KIOSK 04 · RANGPUR RURAL CLINIC",

    emergency: "Emergency",

    offline:
      "Working offline — your information is being saved locally and will synchronize when the connection returns.",

    connected: "Connected",

    offlineChip: "Offline · saving locally",

    services: "Patient Services",

    serviceSub:
      "Choose the service you need. Your medical journey can continue from symptoms to pharmacy delivery.",

    secure: "Private & secure",

    offlineReady: "Offline-ready",

    textFirst: "Text-first care",

    footer:
      "Virtual Clinic System · Offline-First Telemedicine & Pharmacy Kiosk",
  },

  bn: {
    headline: "আজ আমরা আপনাকে কীভাবে সাহায্য করতে পারি?",

    sub:
      "গোপনীয়, টেক্সট-ভিত্তিক স্বাস্থ্যসেবা যা কম ইন্টারনেটেও কাজ করার জন্য তৈরি।",

    kiosk: "কিয়স্ক ০৪ · রংপুর গ্রামীণ ক্লিনিক",

    emergency: "জরুরি",

    offline:
      "অফলাইনে কাজ চলছে — আপনার তথ্য স্থানীয়ভাবে সংরক্ষিত হচ্ছে এবং ইন্টারনেট ফিরে এলে সিঙ্ক হবে।",

    connected: "সংযুক্ত",

    offlineChip: "অফলাইন · সংরক্ষণ হচ্ছে",

    services: "রোগী সেবা",

    serviceSub:
      "আপনার প্রয়োজনীয় সেবা নির্বাচন করুন। লক্ষণ পরীক্ষা থেকে ওষুধ ডেলিভারি পর্যন্ত সেবা ব্যবহার করুন।",

    secure: "গোপনীয় ও নিরাপদ",

    offlineReady: "অফলাইন-রেডি",

    textFirst: "টেক্সট-ভিত্তিক সেবা",

    footer:
      "ভার্চুয়াল ক্লিনিক সিস্টেম · অফলাইন-ফার্স্ট টেলিমেডিসিন ও ফার্মেসি কিয়স্ক",
  },
} as const;

// ---------------------------------------------------------------------------
// Connectivity pulse line
// ---------------------------------------------------------------------------

function PulseLine({ online }: { online: boolean }) {
  const path = online
    ? "M0,24 L40,24 L52,24 L58,4 L66,44 L74,24 L86,24 L120,24 L132,24 L138,10 L146,38 L154,24 L166,24 L200,24"
    : "M0,24 L200,24";

  return (
    <svg
      viewBox="0 0 200 48"
      preserveAspectRatio="none"
      className="h-8 w-full max-w-[360px]"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={online ? "#4ADE80" : "#D98E2B"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: online ? "0" : "6 6",
          transition: "stroke 300ms ease",
        }}
      />

      {online && (
        <circle r="3" fill="#4ADE80">
          <animateMotion
            dur="1.8s"
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function KioskHome() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined"
      ? navigator.onLine
      : true
  );

  const [largeText, setLargeText] = useState(false);

  const [lang, setLang] = useState<Lang>("en");

  const [showToast, setShowToast] = useState(false);

  const c = COPY[lang];

  // -------------------------------------------------------------------------
  // Detect internet connection
  // -------------------------------------------------------------------------

  useEffect(() => {
    const goOffline = () => {
      setOnline(false);
    };

    const goOnline = () => {
      setOnline(true);
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Offline notification
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!online) {
      setShowToast(true);

      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3800);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [online]);

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#F6F8F6] font-body"
      style={{
        backgroundImage: `
          linear-gradient(
            180deg,
            rgba(15,61,62,0.94) 0%,
            rgba(246,248,246,0.98) 360px
          ),
          url(${kioskBg})
        `,
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      {/* ================================================================
          TOP STATUS BAR
      ================================================================= */}

      <header className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-10">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B7A6B] shadow-lg shadow-black/10">
            <Activity
              size={19}
              className="text-white"
              strokeWidth={2.5}
            />
          </div>

          <div className="leading-tight">
            <div className="font-display text-sm font-semibold tracking-wide text-white">
              Virtual Clinic
            </div>

            <div className="font-mono text-[10px] tracking-widest text-[#8FB9AE]">
              {c.kiosk}
            </div>
          </div>
        </div>

        {/* Pulse */}
        <div className="hidden flex-1 justify-center opacity-90 md:flex">
          <PulseLine online={online} />
        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Text size */}
          <button
            type="button"
            onClick={() => setLargeText((value) => !value)}
            className="
              flex items-center gap-1
              rounded-full
              bg-white/10
              px-3 py-2
              font-mono
              text-xs text-white
              transition-colors
              hover:bg-white/20
              focus:outline-none
              focus:ring-2
              focus:ring-white/50
            "
            aria-pressed={largeText}
            aria-label="Toggle larger text"
          >
            <TypeIcon size={14} />

            {largeText ? "A+" : "Aa"}
          </button>

          {/* Language */}
          <button
            type="button"
            onClick={() =>
              setLang((current) =>
                current === "en" ? "bn" : "en"
              )
            }
            className="
              flex items-center gap-1
              rounded-full
              bg-white/10
              px-3 py-2
              font-mono
              text-xs text-white
              transition-colors
              hover:bg-white/20
              focus:outline-none
              focus:ring-2
              focus:ring-white/50
            "
            aria-label="Toggle language"
          >
            <Languages size={14} />

            {lang === "en" ? "EN" : "বাং"}
          </button>

          {/* Network status */}
          <div
            className={`
              flex items-center gap-1.5
              rounded-full
              px-3 py-2
              font-mono
              text-xs
              ${
                online
                  ? "bg-[#1B7A6B]/40 text-[#8FE0C9]"
                  : "bg-[#D98E2B]/25 text-[#F3C67A]"
              }
            `}
          >
            {online ? (
              <Wifi size={14} />
            ) : (
              <WifiOff size={14} />
            )}

            {online
              ? c.connected
              : c.offlineChip}
          </div>
        </div>
      </header>

      {/* ================================================================
          OFFLINE NOTIFICATION
      ================================================================= */}

      {showToast && (
        <div
          role="status"
          className="
            fixed left-1/2 top-20 z-30
            -translate-x-1/2
            rounded-full
            border border-[#D98E2B]/40
            bg-[#3A2A12]
            px-5 py-3
            text-center
            text-xs text-[#F3C67A]
            shadow-xl
            md:text-sm
          "
        >
          {c.offline}
        </div>
      )}

      {/* ================================================================
          MAIN PAGE
      ================================================================= */}

      <main className="relative mx-auto max-w-6xl px-6 pb-32 pt-7 md:px-10">
        {/* Hero */}
        <section className="mb-10">
          <div
            className="
              inline-flex
              items-center gap-2
              rounded-full
              border border-white/30
              bg-white/10
              px-3 py-1.5
              text-xs
              font-medium
              text-[#D6EEE8]
              backdrop-blur-sm
            "
          >
            <Stethoscope size={14} />

            Offline-first telemedicine
          </div>

          <h1
            className={`
              mt-5
              max-w-3xl
              font-display
              font-semibold
              leading-tight
              tracking-tight
              text-white
              ${
                largeText
                  ? "text-4xl md:text-6xl"
                  : "text-3xl md:text-5xl"
              }
            `}
          >
            {c.headline}
          </h1>

          <p
            className={`
              mt-4
              max-w-2xl
              leading-7
              text-[#CDE2DC]
              ${
                largeText
                  ? "text-lg"
                  : "text-base"
              }
            `}
          >
            {c.sub}
          </p>

          {/* Trust indicators */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-[#D7EBE6]">
              ✓ {c.secure}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-[#D7EBE6]">
              ✓ {c.offlineReady}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-[#D7EBE6]">
              ✓ {c.textFirst}
            </span>
          </div>
        </section>

        {/* ================================================================
            SERVICES
        ================================================================= */}

        <section>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
              {c.services}
            </p>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5E716B]">
              {c.serviceSub}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TILES.map((tile) => (
              <Link
                key={tile.id}
                to={tile.to}
                className="
                  group
                  relative
                  flex
                  min-h-[165px]
                  flex-col
                  justify-between
                  rounded-2xl
                  border border-[#D8E5E0]
                  bg-white
                  p-5
                  text-left
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:border-[#1B7A6B]
                  hover:shadow-[0_15px_35px_-15px_rgba(15,61,62,0.38)]
                  active:scale-[0.98]
                  focus:outline-none
                  focus:ring-4
                  focus:ring-[#69B9A5]/30
                "
                style={{
                  minHeight: largeText
                    ? 190
                    : 165,
                }}
              >
                {/* Message badge */}
                {tile.badge && (
                  <span
                    className="
                      absolute
                      right-4
                      top-4
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-[#D98E2B]
                      font-mono
                      text-[11px]
                      font-semibold
                      text-white
                    "
                  >
                    {tile.badge}
                  </span>
                )}

                {/* Icon */}
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#DCEEE9]
                    text-[#0F3D3E]
                    transition-colors
                    group-hover:bg-[#1B7A6B]
                    group-hover:text-white
                  "
                >
                  {tile.icon}
                </div>

                <div className="mt-5">
                  <div
                    className={`
                      font-display
                      font-semibold
                      text-[#12231F]
                      ${
                        largeText
                          ? "text-xl"
                          : "text-lg"
                      }
                    `}
                  >
                    {tile.title[lang]}
                  </div>

                  <div
                    className={`
                      mt-1.5
                      leading-5
                      text-[#6B7D77]
                      ${
                        largeText
                          ? "text-sm"
                          : "text-[13px]"
                      }
                    `}
                  >
                    {tile.desc[lang]}
                  </div>

                  {tile.tag && (
                    <span
                      className="
                        mt-3
                        inline-flex
                        rounded-full
                        bg-[#EDF6F3]
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-[#1B7A6B]
                      "
                    >
                      {tile.tag[lang]}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ================================================================
            SIMPLE CARE FLOW
        ================================================================= */}

        <section
          className="
            mt-10
            rounded-2xl
            border border-[#D8E5E0]
            bg-white/90
            p-6
            shadow-sm
            backdrop-blur
          "
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
            Your care journey
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              "1. Symptom Check",
              "2. Doctor Review",
              "3. Prescription",
              "4. Pharmacy & Delivery",
            ].map((step) => (
              <div
                key={step}
                className="
                  rounded-xl
                  bg-[#F2F7F5]
                  px-4
                  py-4
                  text-sm
                  font-semibold
                  text-[#29443D]
                "
              >
                {step}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-[#D8E5E0] pt-5">
          <p className="text-xs text-[#82918C]">
            {c.footer}
          </p>

          <div className="mt-2 flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-wide text-[#91A09B]">
            <span>FHIR READY</span>
            <span>RBAC</span>
            <span>OFFLINE-FIRST</span>
            <span>TEXT-FIRST</span>
          </div>
        </footer>
      </main>

      {/* ================================================================
          EMERGENCY BUTTON
      ================================================================= */}

      <button
        type="button"
        className="
          fixed
          bottom-6
          right-6
          z-20
          flex
          items-center
          gap-2
          rounded-full
          bg-[#C1442B]
          px-5
          py-3.5
          font-body
          font-semibold
          text-white
          shadow-lg
          transition
          hover:bg-[#A8371F]
          focus:outline-none
          focus:ring-4
          focus:ring-red-300/40
          md:right-10
        "
        aria-label={c.emergency}
      >
        <Siren size={18} />

        {c.emergency}
      </button>
    </div>
  );
}