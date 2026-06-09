import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { type LucideIcon,
  ArrowRight, Sparkles, Lock, ShieldCheck, Calculator, Palette,
  LayoutGrid, Monitor, Smartphone, Check, Star, MapPin, Wifi,
  Coffee, Waves, Wind, Car, Calendar, Users, MessageCircle,
  ChevronLeft, ChevronRight, Mail, Phone, Home, Building2,
  KeyRound, CheckCircle2, AlertCircle, Settings2, Eye,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HostFreedom Configurator — Calcola il tuo risparmio" },
      { name: "description", content: "Strumento gratuito per host italiani per progettare il sito di prenotazione diretta e calcolare il risparmio sulle commissioni." },
    ],
  }),
  component: Configurator,
});

/* ============================================================================
   TYPES & CONSTANTS
============================================================================ */

type Palette = {
  id: string;
  name: string;
  best?: boolean;
  bg: string;
  text: string;
  cta: string;
  accent?: string;
  muted?: string;
};

const PALETTES_2: Palette[] = [
  { id: "sleek", name: "Sleek Luxury", best: true, bg: "#FFFFFF", text: "#0F172A", cta: "#0F172A", muted: "#F1F5F9" },
  { id: "organic", name: "Organic Retreat", bg: "#FBFBFA", text: "#1E2C22", cta: "#1E2C22", muted: "#EFEFEC" },
  { id: "ocean", name: "Deep Ocean", bg: "#F4F6F9", text: "#0B192C", cta: "#0B192C", muted: "#E5E9F0" },
  { id: "boutique", name: "Chic Boutique", bg: "#FDF8F2", text: "#221F1F", cta: "#221F1F", muted: "#F3ECE0" },
];

const PALETTES_3: Palette[] = [
  { id: "costiera", name: "Costiera Serenity", best: true, bg: "#FFFFFF", text: "#1E293B", cta: "#0284C7", muted: "#F1F5F9" },
  { id: "tuscan", name: "Tuscan Sun & Earth", bg: "#FAF8F5", text: "#2D2D2D", cta: "#D97706", muted: "#F0EBE3" },
  { id: "emerald", name: "High-Trust Emerald", bg: "#F8FAFC", text: "#0F172A", cta: "#10B981", muted: "#ECFDF5" },
  { id: "urban", name: "Urban Vibe", bg: "#F3F4F6", text: "#111827", cta: "#FF5A5F", muted: "#E5E7EB" },
];

const PALETTES_4: Palette[] = [
  { id: "modern", name: "HostFreedom Modern", best: true, bg: "#F8FAFC", text: "#0F172A", cta: "#38BDF8", accent: "#10B981", muted: "#E2E8F0" },
  { id: "med", name: "Mediterranean Eco-Resort", bg: "#FAF7F2", text: "#2F3E46", cta: "#84A98C", accent: "#E07A5F", muted: "#EFEAE2" },
  { id: "nordic", name: "Nordic Essential", bg: "#F4F4F5", text: "#18181B", cta: "#1E3A8A", accent: "#D4A373", muted: "#E4E4E7" },
  { id: "golden", name: "Golden Hour Luxury", bg: "#FFFDF9", text: "#1C1A17", cta: "#9A7B56", accent: "#4E6551", muted: "#F5EFE4" },
];

const ARCHETYPES = [
  { id: "coastal", name: "Coastal Boutique", desc: "Aria marina, leggerezza" },
  { id: "tuscan", name: "Tuscan Estate", desc: "Calore terroso, autentico" },
  { id: "alpine", name: "Alpine Refuge", desc: "Caldo, legno, intimo" },
  { id: "urban", name: "Minimal Modern", desc: "Pulito, contemporaneo, focus immagini" },
  { id: "lake", name: "Lake Villa", desc: "Sereno, signorile" },
  { id: "trullo", name: "Trullo & Masseria", desc: "Pietra, identità" },
  { id: "luxury", name: "Pure Luxury", desc: "Editoriale, hi-end" },
  { id: "eco", name: "Eco Wellness", desc: "Verde, calmo, mindful" },
] as const;

const LAYOUTS = [
  { id: "classic", name: "Classico", desc: "Hero · Galleria · Amenities · Booking" },
  { id: "editorial", name: "Editoriale", desc: "Hero · Storia · Galleria · Booking" },
  { id: "showcase", name: "Showcase", desc: "Galleria · Hero · Amenities · Booking" },
  { id: "compact", name: "Compact", desc: "Hero · Booking · Galleria · Amenities" },
  { id: "story", name: "Storytelling", desc: "Hero · Amenities · Storia · Booking" },
  { id: "minimal", name: "Minimal", desc: "Hero · Booking · Galleria" },
] as const;

type LayoutId = (typeof LAYOUTS)[number]["id"];

const LAYOUT_BLOCKS: Record<LayoutId, ("hero" | "story" | "gallery" | "amenities" | "booking")[]> = {
  classic: ["hero", "gallery", "amenities", "booking"],
  editorial: ["hero", "story", "gallery", "booking"],
  showcase: ["gallery", "hero", "amenities", "booking"],
  compact: ["hero", "booking", "gallery", "amenities"],
  story: ["hero", "amenities", "story", "booking"],
  minimal: ["hero", "booking", "gallery"],
};

/* ============================================================================
   MAIN COMPONENT
============================================================================ */

function Configurator() {
  const [step, setStep] = useState(1);
  const [revenue, setRevenue] = useState<string>("");
  const [properties, setProperties] = useState<string>("");
  const [regime, setRegime] = useState<"forfettario" | "ordinario">("forfettario");

  const [colorCount, setColorCount] = useState<2 | 3 | 4>(3);
  const [selectedPalette, setSelectedPalette] = useState<Palette>(PALETTES_3[0]);
  const [archetype, setArchetype] = useState<string>("coastal");
  const [layout, setLayout] = useState<LayoutId>("classic");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [interactionCount, setInteractionCount] = useState(0);
  const [mobileTab, setMobileTab] = useState<"controls" | "preview">("controls");

  // Lead form
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadStruct, setLeadStruct] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [leadError, setLeadError] = useState<string | null>(null);

  // OTP
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpLocked, setOtpLocked] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const correctOtp = useRef("482913");

  const palettes = colorCount === 2 ? PALETTES_2 : colorCount === 3 ? PALETTES_3 : PALETTES_4;

  // When color count changes, reset to recommended palette of that group
  useEffect(() => {
    setSelectedPalette(palettes.find((p) => p.best) ?? palettes[0]);
  }, [colorCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLayoutChange = (l: LayoutId) => {
    if (l === layout) return;
    setLayout(l);
    if (interactionCount < 3) setInteractionCount((c) => c + 1);
  };

  return (
    <div className="min-h-screen bg-[#FBFAF7] text-slate-900">
      <Header step={step} />
      <main className="mx-auto w-full max-w-[1400px] px-4 pb-32 pt-6 md:px-8">
        {step === 1 && (
          <Step1
            revenue={revenue}
            setRevenue={setRevenue}
            properties={properties}
            setProperties={setProperties}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            revenue={Number(revenue) || 0}
            properties={Number(properties) || 1}
            regime={regime}
            setRegime={setRegime}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            colorCount={colorCount}
            setColorCount={setColorCount}
            palettes={palettes}
            selectedPalette={selectedPalette}
            setSelectedPalette={setSelectedPalette}
            archetype={archetype}
            setArchetype={setArchetype}
            layout={layout}
            setLayout={onLayoutChange}
            previewDevice={previewDevice}
            setPreviewDevice={setPreviewDevice}
            interactionCount={interactionCount}
            mobileTab={mobileTab}
            setMobileTab={setMobileTab}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <Step4
            email={leadEmail}
            setEmail={setLeadEmail}
            phone={leadPhone}
            setPhone={setLeadPhone}
            struct={leadStruct}
            setStruct={setLeadStruct}
            city={leadCity}
            setCity={setLeadCity}
            error={leadError}
            setError={setLeadError}
            onNext={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <Step5
            email={leadEmail}
            otp={otp}
            setOtp={setOtp}
            attempts={otpAttempts}
            setAttempts={setOtpAttempts}
            locked={otpLocked}
            setLocked={setOtpLocked}
            error={otpError}
            setError={setOtpError}
            correctOtp={correctOtp.current}
            payload={{
              hostProfile: {
                grossRevenue: Number(revenue) || 0,
                properties: Number(properties) || 1,
                taxTier:
                  Number(properties) === 1
                    ? "Cedolare 21%"
                    : Number(properties) <= 4
                    ? "Cedolare 26%"
                    : regime === "forfettario"
                    ? "Forfettario 15%"
                    : "Ordinario 30%",
              },
              styleConfig: {
                colorCount,
                followedRecommendation: selectedPalette.best === true,
                paletteName: selectedPalette.name,
                hexMap: {
                  background: selectedPalette.bg,
                  text: selectedPalette.text,
                  button: selectedPalette.cta,
                  highlight: selectedPalette.accent ?? selectedPalette.cta,
                },
                archetype,
              },
              structuralLayout: LAYOUT_BLOCKS[layout].reduce(
                (acc, b, i) => ({ ...acc, [`block_${i + 1}`]: b }),
                {} as Record<string, string>,
              ),
              lead: {
                email: leadEmail,
                phone: leadPhone,
                structureName: leadStruct,
                city: leadCity,
              },
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

/* ============================================================================
   HEADER / FOOTER
============================================================================ */

function Header({ step }: { step: number }) {
  const steps = ["Dati", "Verdetto", "Design", "Contatti", "Verifica"];
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#FBFAF7]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white">
            <KeyRound className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="font-serif-display text-lg font-semibold tracking-tight">HostFreedom</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Configurator · Gratuito</div>
          </div>
        </div>
        <div className="hidden items-center gap-1 md:flex">
          {steps.map((s, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : done
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-400"
                  }`}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15 text-[10px]">
                    {done ? <Check className="h-3 w-3" /> : n}
                  </span>
                  {s}
                </div>
                {i < steps.length - 1 && <div className="h-px w-4 bg-slate-200" />}
              </div>
            );
          })}
        </div>
        <div className="text-xs text-slate-500 md:hidden">
          Step <span className="font-semibold text-slate-900">{step}</span>/5
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-[#FBFAF7] py-8">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 md:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          Dati elaborati localmente · GDPR compliant
        </div>
        <div>© HostFreedom · Strumento 100% gratuito</div>
      </div>
    </footer>
  );
}

/* ============================================================================
   STEP 1
============================================================================ */

function Step1({
  revenue, setRevenue, properties, setProperties, onNext,
}: {
  revenue: string; setRevenue: (v: string) => void;
  properties: string; setProperties: (v: string) => void;
  onNext: () => void;
}) {
  const valid = Number(revenue) > 0 && Number(properties) > 0;
  return (
    <section className="mx-auto max-w-2xl pt-10 md:pt-16">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-600">
        <Sparkles className="h-3 w-3" /> Passo 1 di 5 · 30 secondi
      </div>
      <h1 className="font-serif-display text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
        Quanto stai <em className="italic text-slate-500">davvero</em> lasciando<br /> sul tavolo?
      </h1>
      <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
        Inserisci due dati. In tre secondi calcoliamo, <strong>localmente nel tuo browser</strong>, quante commissioni stai regalando ai portali — e cosa significherebbe averle nel tuo conto.
      </p>

      <div className="mt-10 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-8">
        <Field label="Fatturato Lordo Annuo via portali" hint="Quanto incassi in un anno tramite Booking, Airbnb, Vrbo, ecc.">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-slate-400">€</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="es. 80000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-4 pl-10 pr-4 text-lg font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
            />
          </div>
        </Field>

        <Field label="Numero di strutture gestite in Italia" hint="Appartamenti, B&B, ville, case vacanza — il totale.">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={properties}
            onChange={(e) => setProperties(e.target.value)}
            placeholder="es. 3"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4 text-lg font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
          />
        </Field>

        <button
          disabled={!valid}
          onClick={onNext}
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          <Calculator className="h-4 w-4" />
          Calcola il mio risparmio
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <Lock className="h-3 w-3" /> Calcolo locale. Nessun dato trasmesso. GDPR.
        </p>
      </div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
      </div>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </label>
  );
}

/* ============================================================================
   STEP 2 — VERDICT
============================================================================ */

function Step2({
  revenue, properties, regime, setRegime, onNext,
}: {
  revenue: number; properties: number;
  regime: "forfettario" | "ordinario";
  setRegime: (r: "forfettario" | "ordinario") => void;
  onNext: () => void;
}) {
  const taxRate = useMemo(() => {
    if (properties === 1) return { rate: 0.21, label: "Cedolare Secca 21%", basis: "fatturato" as const };
    if (properties <= 4) return { rate: 0.26, label: "Cedolare Secca 26%", basis: "fatturato" as const };
    if (regime === "forfettario")
      return { rate: 0.15, label: "Forfettario 15% (su 40%)", basis: "forfettario" as const };
    return { rate: 0.30, label: "Regime Ordinario ~30%", basis: "fatturato" as const };
  }, [properties, regime]);

  const computeTax = (gross: number) => {
    if (taxRate.basis === "forfettario") return gross * 0.4 * 0.15;
    return gross * taxRate.rate;
  };

  // Use revenue as guest price for booking; inflated 14% for airbnb guest price; same nominal revenue for direct
  const guestBooking = revenue;
  const bookingCommission = guestBooking * 0.15;
  const bookingTax = computeTax(guestBooking - bookingCommission);
  const bookingNet = guestBooking - bookingCommission - bookingTax;

  const guestAirbnb = revenue * 1.14;
  const airbnbCommission = revenue * 0.03; // 3% on host revenue
  const airbnbTax = computeTax(revenue - airbnbCommission);
  const airbnbNet = revenue - airbnbCommission - airbnbTax;

  const directGuest = revenue;
  const directCommission = 0;
  const directTax = computeTax(revenue);
  const directNet = revenue - directTax;

  const savings = Math.max(0, directNet - bookingNet);

  const fmt = (n: number) =>
    new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(Math.round(n));

  return (
    <section className="pt-8 md:pt-12">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-600">
        <Sparkles className="h-3 w-3" /> Verdetto · Calcolato localmente
      </div>

      {/* Macro header */}
      <h2 className="font-serif-display text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
        Stai lasciando sul tavolo<br />
        <span className="relative inline-block">
          <span className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 bg-clip-text text-transparent">
            €{fmt(savings)}
          </span>
        </span>{" "}
        all'anno di commissioni.
        <br />
        <span className="italic text-slate-600">Riprenditela ora.</span>
      </h2>
      <p className="mt-3 max-w-2xl text-base text-slate-600">
        Stima basata sul tuo fatturato lordo dichiarato e sul regime fiscale stimato: <strong className="text-slate-900">{taxRate.label}</strong>.
      </p>

      {properties >= 5 && (
        <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 pl-4">
          <span className="text-xs font-medium text-slate-600">Regime fiscale:</span>
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
            {(["forfettario", "ordinario"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegime(r)}
                className={`rounded-md px-3 py-1.5 transition ${
                  regime === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {r === "forfettario" ? "Partita IVA Forfettario" : "Regime Ordinario"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparative chart */}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <ScenarioCard
          title="Booking.com"
          subtitle="Standard del mercato"
          guest={guestBooking}
          commission={-bookingCommission}
          commissionLabel="Commissione 15%"
          tax={-bookingTax}
          net={bookingNet}
          max={Math.max(bookingNet, airbnbNet, directNet)}
          fmt={fmt}
          tone="booking"
        />
        <ScenarioCard
          title="Airbnb"
          subtitle="Con guest fee nascosta"
          guest={guestAirbnb}
          commission={-airbnbCommission}
          commissionLabel="Commissione host 3%"
          tax={-airbnbTax}
          net={airbnbNet}
          max={Math.max(bookingNet, airbnbNet, directNet)}
          fmt={fmt}
          tone="airbnb"
          hiddenNote={`L'ospite paga €${fmt(guestAirbnb - revenue)} in più di service fee.`}
        />
        <ScenarioCard
          title="HostFreedom"
          subtitle="Sito di prenotazione diretta"
          guest={directGuest}
          commission={directCommission}
          commissionLabel="Commissioni piattaforma"
          tax={-directTax}
          net={directNet}
          max={Math.max(bookingNet, airbnbNet, directNet)}
          fmt={fmt}
          tone="direct"
        />
      </div>

      {/* Manifesto */}
      <div className="relative mt-12 overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 via-white to-white p-6 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <Lock className="h-3.5 w-3.5" /> Manifesto d'Indipendenza
          </div>
          <h3 className="mt-3 max-w-3xl font-serif-display text-2xl font-semibold text-slate-900 md:text-3xl">
            La tua Indipendenza è il nostro unico obiettivo.
          </h3>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-700">
            I clienti sono <strong>tuoi</strong>. Il merito è <strong>tuo</strong>. Il guadagno è tuo <strong>al 100%</strong>. A differenza delle grandi piattaforme, noi non possediamo i tuoi ospiti, non facciamo pagare commissioni al cliente e non tratteniamo commissioni sull'host — ti forniamo la tecnologia per metterti in proprio online guadagnando tutto quello che meriti.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            I tuoi dati vivono in un database privato dedicato e isolato. I pagamenti degli ospiti sono protetti dai canali bancari globali con crittografia di livello istituzionale (Stripe).
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { icon: ShieldCheck, t: "Database isolato" },
              { icon: Lock, t: "Stripe bank-grade" },
              { icon: Check, t: "Ospiti tuoi al 100%" },
              { icon: Check, t: "Zero lock-in" },
            ].map((b) => (
              <span key={b.t} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-emerald-800">
                <b.icon className="h-3.5 w-3.5" />
                {b.t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Transition banner */}
      <div className="mt-10 overflow-hidden rounded-3xl bg-slate-900 p-6 text-white md:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Prossimo passo</div>
            <h3 className="mt-2 font-serif-display text-2xl font-semibold md:text-3xl">
              Costruisci la bozza del tuo sito in <em className="italic">10 secondi</em>.
            </h3>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Niente configurazioni difficili, nessun codice. Scegli le tue preferenze qui sotto e guarda immediatamente come prenderà vita la tua piattaforma indipendente.
            </p>
          </div>
          <button
            onClick={onNext}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-slate-900 shadow-xl shadow-black/20 transition hover:bg-slate-50"
          >
            Disegna il mio sito
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ScenarioCard({
  title, subtitle, guest, commission, commissionLabel, tax, net, max, fmt, tone, hiddenNote,
}: {
  title: string; subtitle: string;
  guest: number; commission: number; commissionLabel: string;
  tax: number; net: number; max: number;
  fmt: (n: number) => string;
  tone: "booking" | "airbnb" | "direct";
  hiddenNote?: string;
}) {
  const pct = Math.min(100, Math.max(8, (net / Math.max(1, max)) * 100));
  const isDirect = tone === "direct";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 transition ${
        isDirect
          ? "border-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,0.08),0_20px_50px_-20px_rgba(16,185,129,0.45)]"
          : "border-slate-200"
      }`}
    >
      {isDirect && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          <Sparkles className="h-3 w-3" /> Tuo
        </div>
      )}
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>

      <div className="mt-5 space-y-2.5 text-sm">
        <Row label="Prezzo ospite" value={`€${fmt(guest)}`} />
        <Row label={commissionLabel} value={`€${fmt(commission)}`} negative={commission < 0} muted={commission === 0} />
        <Row label="Tasse stimate" value={`€${fmt(tax)}`} negative />
        <div className="my-3 h-px bg-slate-100" />
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profitto netto</span>
          <span className={`font-serif-display text-3xl font-bold ${isDirect ? "text-emerald-600" : "text-slate-900"}`}>
            €{fmt(net)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isDirect
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : tone === "booking"
                ? "bg-slate-700"
                : "bg-slate-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {hiddenNote && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-900">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {hiddenNote}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, negative, muted }: { label: string; value: string; negative?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`tabular-nums font-medium ${muted ? "text-slate-400" : negative ? "text-rose-600" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}

/* ============================================================================
   STEP 3 — SIMULATOR
============================================================================ */

function Step3(props: {
  colorCount: 2 | 3 | 4; setColorCount: (c: 2 | 3 | 4) => void;
  palettes: Palette[]; selectedPalette: Palette; setSelectedPalette: (p: Palette) => void;
  archetype: string; setArchetype: (a: string) => void;
  layout: LayoutId; setLayout: (l: LayoutId) => void;
  previewDevice: "mobile" | "desktop"; setPreviewDevice: (d: "mobile" | "desktop") => void;
  interactionCount: number;
  mobileTab: "controls" | "preview"; setMobileTab: (t: "controls" | "preview") => void;
  onNext: () => void;
}) {
  const {
    colorCount, setColorCount, palettes, selectedPalette, setSelectedPalette,
    archetype, setArchetype, layout, setLayout,
    previewDevice, setPreviewDevice, interactionCount, mobileTab, setMobileTab, onNext,
  } = props;

  const locked = interactionCount >= 3;

  return (
    <section className="pt-4 md:pt-6">
      {/* Mobile tabs */}
      <div className="sticky top-[64px] z-30 -mx-4 mb-4 border-b border-slate-200 bg-[#FBFAF7]/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
          {(["controls", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMobileTab(t)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 transition ${
                mobileTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {t === "controls" ? <Settings2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {t === "controls" ? "Pannello Comandi" : "Anteprima Sito"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8">
        {/* CONTROL PANEL */}
        <div className={`${mobileTab === "controls" ? "block" : "hidden"} md:sticky md:top-24 md:block md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:pr-2`}>
          <div className="relative space-y-6">
            {locked && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/70 p-6 text-center backdrop-blur-md">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-white">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="font-serif-display text-xl font-semibold text-slate-900">
                  Bozza pronta
                </div>
                <p className="max-w-xs text-sm text-slate-600">
                  Hai esplorato 3 strutture di layout diverse. La tua bozza è pronta: procedi per ricevere il file di progetto.
                </p>
                <button
                  onClick={onNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  Continua <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <div>
              <h2 className="font-serif-display text-3xl font-semibold tracking-tight text-slate-900">
                Disegna il tuo sito.
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Colori, palette e stile sono illimitati. Puoi provare <span className="font-semibold text-slate-900">{Math.max(0, 3 - interactionCount)}</span> {3 - interactionCount === 1 ? "altra struttura di layout" : "altre strutture di layout"}.
              </p>
            </div>

            {/* Phase 3A */}
            <Panel title="01 · Complessità cromatica" icon={Palette}>
              <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
                {[2, 3, 4].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColorCount(c as 2 | 3 | 4)}
                    className={`flex-1 rounded-lg px-3 py-2.5 transition ${
                      colorCount === c ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    {c} Colori
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 text-[13px] leading-relaxed text-amber-950">
                <div className="font-semibold">💡 Il consiglio del designer</div>
                <p className="mt-1 text-amber-900/90">
                  La configurazione a <strong>3 Colori</strong> è la più utilizzata e performante nel turismo (formula 60-30-10). Riduce il carico cognitivo, focalizza lo sguardo sul pulsante di prenotazione e <strong>aumenta le conversioni del 18%</strong> rispetto a layout multicolore.
                </p>
              </div>
            </Panel>

            {/* Phase 3B */}
            <Panel title="02 · Palette" icon={Sparkles}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {palettes.map((p) => (
                  <PaletteCard
                    key={p.id}
                    palette={p}
                    active={selectedPalette.id === p.id}
                    onClick={() => setSelectedPalette(p)}
                  />
                ))}
              </div>
            </Panel>

            {/* Archetypes */}
            <Panel title="03 · Stile estetico" icon={Star}>
              <div className="grid grid-cols-2 gap-2">
                {ARCHETYPES.map((a) => {
                  const isRecommended = a.id === "urban";
                  const isActive = archetype === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setArchetype(a.id)}
                      className={`relative rounded-xl border p-3 text-left transition ${
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white"
                          : isRecommended
                            ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white hover:border-amber-400"
                            : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="text-sm font-semibold">{a.name}</div>
                      </div>
                      {isRecommended && (
                        <div className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide ${
                          isActive ? "bg-amber-300/90 text-slate-900" : "bg-amber-100 text-amber-900 ring-1 ring-amber-300/60"
                        }`}>
                          ✨ Consigliato · Massima Conversione
                        </div>
                      )}
                      <div className={`mt-1 text-[11px] ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                        {a.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-[11px] leading-relaxed text-slate-700">
                💡 <span className="font-semibold text-slate-900">Il consiglio del designer:</span> Lo stile <em>"Minimal Modern"</em> è ideale per l'hospitality di alto livello. Riduce le distrazioni visive e mette al centro le immagini della tua struttura, aumentando la fiducia dell'ospite.
              </div>
            </Panel>

            {/* Layouts */}
            <Panel title="04 · Struttura della pagina" icon={LayoutGrid}>
              <div className="space-y-2">
                {LAYOUTS.map((l, idx) => {
                  const isRecommended = l.id === "classic";
                  const isActive = layout === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setLayout(l.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-slate-900 bg-slate-50"
                          : isRecommended
                            ? "border-amber-300 bg-gradient-to-r from-amber-50 to-white hover:border-amber-400"
                            : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold text-slate-900">Layout {idx + 1} · {l.name}</div>
                          {isRecommended && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-amber-900 ring-1 ring-amber-300/60">
                              ✨ Più Performante
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{l.desc}</div>
                      </div>
                      {isActive && <Check className="h-4 w-4 shrink-0 text-slate-900" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-[11px] leading-relaxed text-slate-700">
                💡 <span className="font-semibold text-slate-900">Il consiglio del designer:</span> Questo layout posiziona il widget di ricerca date e disponibilità in primo piano. Riduce i passaggi necessari per prenotare e ottimizza l'esperienza touch da smartphone, dove avviene l'80% delle prenotazioni.
              </div>
            </Panel>
          </div>
        </div>

        {/* PREVIEW */}
        <div className={`${mobileTab === "preview" ? "block" : "hidden"} md:block`}>
          <div className="md:sticky md:top-24">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Anteprima live</div>
              <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                    previewDevice === "mobile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Mobile
                </button>
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                    previewDevice === "desktop" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" /> Desktop
                </button>
              </div>
            </div>

            <DevicePreview device={previewDevice}>
              <SitePreview palette={selectedPalette} layout={layout} archetype={archetype} device={previewDevice} />
            </DevicePreview>

            <p className="mt-4 max-w-md text-[11px] leading-relaxed text-slate-500">
              <strong className="text-slate-700">Attenzione:</strong> Questa è esclusivamente una bozza d'esempio generata automaticamente per mostrarti il potenziale del tuo brand. Non rappresenta il layout finale del sito, che verrà rifinito, personalizzato e ottimizzato su misura per te durante la nostra consulenza.
            </p>

            <button
              onClick={onNext}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 md:w-auto"
            >
              Procedi al passo finale <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}

function PaletteCard({ palette, active, onClick }: { palette: Palette; active: boolean; onClick: () => void }) {
  const swatches = [palette.bg, palette.text, palette.cta, palette.accent].filter(Boolean) as string[];
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${
        active ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {palette.best && (
        <div className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
          <Sparkles className="h-2.5 w-2.5" /> Top
        </div>
      )}
      <div className="flex h-16 overflow-hidden rounded-lg ring-1 ring-black/5">
        {swatches.map((c, i) => (
          <div key={i} className="flex-1 transition-all duration-500" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="mt-2.5 text-[13px] font-semibold text-slate-900">{palette.name}</div>
      <div className="mt-0.5 flex flex-wrap gap-1">
        {swatches.map((c, i) => (
          <span key={i} className="text-[9px] font-mono uppercase text-slate-400">{c}</span>
        ))}
      </div>
    </button>
  );
}

/* ============================================================================
   DEVICE PREVIEW FRAME
============================================================================ */

function DevicePreview({ device, children }: { device: "mobile" | "desktop"; children: React.ReactNode }) {
  if (device === "mobile") {
    return (
      <div className="mx-auto w-full max-w-[360px]">
        <div className="relative rounded-[2.4rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-slate-900/30">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
          <div className="relative h-[640px] overflow-hidden rounded-[1.6rem] bg-white">
            <div className="absolute inset-0 overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-100 shadow-xl shadow-slate-900/10">
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-[11px] text-slate-400">villaserena.it</div>
        </div>
        <div className="h-[560px] overflow-y-auto bg-white">{children}</div>
      </div>
    </div>
  );
}

/* ============================================================================
   SITE PREVIEW (DYNAMIC)
============================================================================ */

function SitePreview({
  palette, layout, archetype, device,
}: { palette: Palette; layout: LayoutId; archetype: string; device: "mobile" | "desktop" }) {
  const blocks = LAYOUT_BLOCKS[layout];
  const isMobile = device === "mobile";

  const styleBg: React.CSSProperties = { backgroundColor: palette.bg, color: palette.text };

  return (
    <div className="relative min-h-full transition-colors duration-500" style={styleBg}>
      {/* Top nav */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="font-serif-display text-lg font-semibold tracking-tight" style={{ color: palette.text }}>
          Villa Serena
        </div>
        <div className="hidden items-center gap-4 text-[11px] font-medium md:flex" style={{ color: palette.text }}>
          <span className="opacity-70">Camere</span>
          <span className="opacity-70">Esperienze</span>
          <span className="opacity-70">Contatti</span>
        </div>
        <button
          className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-white transition"
          style={{ backgroundColor: palette.cta }}
        >
          Prenota
        </button>
      </div>

      <div className="space-y-8 pb-24 md:pb-10">
        {blocks.map((b, i) => (
          <div key={`${layout}-${b}-${i}`} className="animate-[fadeIn_0.5s_ease]">
            {b === "hero" && <HeroBlock palette={palette} archetype={archetype} isMobile={isMobile} />}
            {b === "gallery" && <GalleryBlock palette={palette} isMobile={isMobile} />}
            {b === "amenities" && <AmenitiesBlock palette={palette} isMobile={isMobile} />}
            {b === "booking" && <BookingBlock palette={palette} isMobile={isMobile} />}
            {b === "story" && <StoryBlock palette={palette} />}
          </div>
        ))}
      </div>

      {/* Sticky bottom CTA — mobile only */}
      {isMobile && (
        <div
          className="sticky bottom-0 left-0 right-0 z-10 flex items-center gap-2 border-t px-4 py-3 backdrop-blur"
          style={{
            backgroundColor: `${palette.bg}EE`,
            borderColor: `${palette.text}15`,
          }}
        >
          <button
            className="flex-1 rounded-xl py-3 text-[13px] font-semibold text-white"
            style={{ backgroundColor: palette.cta }}
          >
            Prenota ora
          </button>
          <button
            className="flex items-center gap-1.5 rounded-xl border px-3 py-3 text-[11px] font-semibold"
            style={{ borderColor: `${palette.text}25`, color: palette.text }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}

function HeroBlock({ palette, archetype, isMobile }: { palette: Palette; archetype: string; isMobile: boolean }) {
  const tagline: Record<string, string> = {
    coastal: "Una brezza di mare a un passo dalla camera",
    tuscan: "Tra cipressi, vino e silenzio",
    alpine: "Il caldo di un rifugio, la quiete di una vetta",
    urban: "Il cuore della città, in privato",
    lake: "Acqua, riflessi, e tempo lento",
    trullo: "Pietra antica, comfort moderno",
    luxury: "Un'esperienza che non si dimentica",
    eco: "Natura, benessere, riconnessione",
  };
  return (
    <section className="px-5">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${palette.muted ?? palette.bg} 0%, ${palette.bg} 100%)`,
        }}
      >
        <div
          className="aspect-[4/3] w-full bg-cover bg-center md:aspect-[16/9]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
            {ARCHETYPES.find((a) => a.id === archetype)?.name}
          </div>
          <h1 className="mt-1 font-serif-display text-[26px] font-semibold leading-tight text-white md:text-4xl">
            {tagline[archetype] ?? "Benvenuto a Villa Serena"}
          </h1>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/85">
            <MapPin className="h-3 w-3" /> Positano, Costiera Amalfitana
            <Star className="ml-2 h-3 w-3 fill-amber-300 text-amber-300" /> 4.96 · 128 recensioni
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`mt-4 grid gap-2 ${isMobile ? "" : "grid-cols-4"}`}>
        <SearchInput icon={Calendar} label="Check-in" value="14 Giu" palette={palette} />
        <SearchInput icon={Calendar} label="Check-out" value="21 Giu" palette={palette} />
        <SearchInput icon={Users} label="Ospiti" value="2 adulti" palette={palette} />
        <button
          className="rounded-xl py-3 text-[13px] font-semibold text-white transition"
          style={{ backgroundColor: palette.cta }}
        >
          Verifica disponibilità
        </button>
      </div>
    </section>
  );
}

function SearchInput({ icon: Icon, label, value, palette }: { icon: LucideIcon; label: string; value: string; palette: Palette }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
      style={{ borderColor: `${palette.text}18`, backgroundColor: palette.bg }}
    >
      <Icon className="h-4 w-4 opacity-60" style={{ color: palette.text }} />
      <div className="flex flex-col">
        <span className="text-[9px] font-semibold uppercase tracking-wider opacity-50" style={{ color: palette.text }}>{label}</span>
        <span className="text-[12px] font-medium" style={{ color: palette.text }}>{value}</span>
      </div>
    </div>
  );
}

function GalleryBlock({ palette, isMobile }: { palette: Palette; isMobile: boolean }) {
  const imgs = [
    "https://images.unsplash.com/photo-1551776235-dde6d4829808?w=800&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
  ];

  if (isMobile) {
    return (
      <section className="space-y-3">
        <div className="flex items-end justify-between px-5">
          <h3 className="font-serif-display text-xl font-semibold" style={{ color: palette.text }}>Galleria</h3>
          <span className="text-[11px] opacity-60" style={{ color: palette.text }}>1 / {imgs.length}</span>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {imgs.map((src, i) => (
            <div key={i} className="relative h-44 w-[78%] shrink-0 snap-start overflow-hidden rounded-xl">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <div className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
                {i + 1} / {imgs.length}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-5">
      <h3 className="mb-3 font-serif-display text-2xl font-semibold" style={{ color: palette.text }}>Galleria</h3>
      <div className="grid grid-cols-4 grid-rows-2 gap-2" style={{ height: 320 }}>
        <img src={imgs[0]} alt="" className="col-span-2 row-span-2 h-full w-full rounded-xl object-cover" />
        <img src={imgs[1]} alt="" className="h-full w-full rounded-xl object-cover" />
        <img src={imgs[2]} alt="" className="h-full w-full rounded-xl object-cover" />
        <img src={imgs[3]} alt="" className="h-full w-full rounded-xl object-cover" />
        <img src={imgs[4]} alt="" className="h-full w-full rounded-xl object-cover" />
      </div>
    </section>
  );
}

function AmenitiesBlock({ palette, isMobile }: { palette: Palette; isMobile: boolean }) {
  const items = [
    { icon: Wifi, label: "Wi-Fi fibra" },
    { icon: Waves, label: "Piscina privata" },
    { icon: Coffee, label: "Colazione" },
    { icon: Wind, label: "Aria cond." },
    { icon: Car, label: "Parcheggio" },
    { icon: ShieldCheck, label: "Check-in 24/7" },
  ];
  return (
    <section className="px-5">
      <h3 className="mb-3 font-serif-display text-xl font-semibold md:text-2xl" style={{ color: palette.text }}>
        Cosa è incluso
      </h3>
      <div className={`grid gap-2 ${isMobile ? "grid-cols-2" : "grid-cols-3"}`}>
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center gap-2.5 rounded-xl border p-3"
            style={{ borderColor: `${palette.text}15`, backgroundColor: palette.muted ?? palette.bg }}
          >
            <div
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{ backgroundColor: palette.bg, color: palette.cta }}
            >
              <it.icon className="h-4 w-4" />
            </div>
            <span className="text-[12px] font-medium" style={{ color: palette.text }}>{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BookingBlock({ palette, isMobile }: { palette: Palette; isMobile: boolean }) {
  return (
    <section className="px-5">
      <h3 className="mb-3 font-serif-display text-xl font-semibold md:text-2xl" style={{ color: palette.text }}>
        Prenota direttamente
      </h3>
      <div className={`grid gap-3 ${isMobile ? "" : "grid-cols-2"}`}>
        <div className="rounded-2xl border p-4" style={{ borderColor: `${palette.text}15`, backgroundColor: palette.muted ?? palette.bg }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60" style={{ color: palette.text }}>Pagamento sicuro</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-serif-display text-3xl font-bold" style={{ color: palette.text }}>€420</span>
            <span className="text-xs opacity-60" style={{ color: palette.text }}>/ notte</span>
          </div>
          <div className="my-3 space-y-1.5 text-[12px] opacity-80" style={{ color: palette.text }}>
            <div className="flex justify-between"><span>7 notti × €420</span><span>€2.940</span></div>
            <div className="flex justify-between"><span>Pulizia</span><span>€80</span></div>
            <div className="flex justify-between font-semibold"><span>Totale</span><span>€3.020</span></div>
          </div>
          <button
            className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition"
            style={{ backgroundColor: palette.cta }}
          >
            Conferma con Stripe
          </button>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] opacity-60" style={{ color: palette.text }}>
            <Lock className="h-3 w-3" /> Crittografia bank-grade
          </div>
        </div>
        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: palette.accent ? `${palette.accent}40` : `${palette.text}15`,
            backgroundColor: palette.bg,
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60" style={{ color: palette.text }}>Hai una domanda?</div>
          <div className="mt-1 font-serif-display text-lg font-semibold" style={{ color: palette.text }}>
            Parla con l'host
          </div>
          <p className="mt-1 text-[12px] opacity-70" style={{ color: palette.text }}>
            Risposta tipica entro 5 minuti. Sconti riservati ai prenotanti diretti.
          </p>
          <button
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Richiedi uno sconto all'host su WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}

function StoryBlock({ palette }: { palette: Palette }) {
  return (
    <section className="px-5">
      <div className="rounded-2xl p-5" style={{ backgroundColor: palette.muted ?? palette.bg }}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60" style={{ color: palette.text }}>
          La nostra storia
        </div>
        <p className="mt-2 font-serif-display text-lg leading-snug md:text-2xl" style={{ color: palette.text }}>
          "Tre generazioni di ospitalità in una casa che profuma di gelsomino. Vi accogliamo come parte della famiglia."
        </p>
        <div className="mt-3 text-[12px] opacity-70" style={{ color: palette.text }}>— Famiglia Russo, Host dal 1998</div>
      </div>
    </section>
  );
}

/* ============================================================================
   STEP 4 — LEAD WALL
============================================================================ */

function Step4(props: {
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  struct: string; setStruct: (v: string) => void;
  city: string; setCity: (v: string) => void;
  error: string | null; setError: (v: string | null) => void;
  onNext: () => void;
}) {
  const { email, setEmail, phone, setPhone, struct, setStruct, city, setCity, error, setError, onNext } = props;
  const submit = () => {
    if (!email.includes("@") || email.length < 5) return setError("Inserisci una email valida.");
    if (phone.replace(/\D/g, "").length < 7) return setError("Inserisci un numero di telefono valido.");
    if (!struct.trim()) return setError("Inserisci il nome della struttura.");
    if (!city.trim()) return setError("Inserisci la città della struttura.");
    setError(null);
    onNext();
  };
  return (
    <section className="mx-auto max-w-2xl pt-10 md:pt-14">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-600">
        <Sparkles className="h-3 w-3" /> Ultimo passo · Salva il progetto
      </div>
      <h2 className="font-serif-display text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
        Dove ti inviamo<br />il tuo file di progetto?
      </h2>
      <p className="mt-3 max-w-xl text-base text-slate-600">
        Riceverai via email il PDF della bozza, il calcolo del risparmio e l'accesso al tuo workspace dedicato.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <Field label="Email di contatto" hint="Useremo questa email per inviarti il file di progetto e il codice OTP.">
          <IconInput icon={Mail} type="email" value={email} onChange={setEmail} placeholder="mario@villaserena.it" />
        </Field>
        <Field label="Numero di telefono">
          <IconInput icon={Phone} type="tel" value={phone} onChange={setPhone} placeholder="+39 333 1234567" />
        </Field>
        <Field label="Nome della struttura principale">
          <IconInput icon={Home} value={struct} onChange={setStruct} placeholder="Villa Serena" />
        </Field>
        <Field label="Città della struttura">
          <IconInput icon={Building2} value={city} onChange={setCity} placeholder="Positano" />
        </Field>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </div>
        )}

        <button
          onClick={submit}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800"
        >
          Invia il codice di verifica <ArrowRight className="h-4 w-4" />
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <Lock className="h-3 w-3" /> Salvati in database privato isolato · 0 spam, mai.
        </p>
      </div>
    </section>
  );
}

function IconInput({
  icon: Icon, type = "text", value, onChange, placeholder,
}: {
  icon: LucideIcon;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-4 text-base text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
      />
    </div>
  );
}

/* ============================================================================
   STEP 5 — OTP
============================================================================ */

function Step5({
  email, otp, setOtp, attempts, setAttempts, locked, setLocked, error, setError, correctOtp, payload,
}: {
  email: string;
  otp: string[]; setOtp: (v: string[]) => void;
  attempts: number; setAttempts: (n: number) => void;
  locked: boolean; setLocked: (b: boolean) => void;
  error: string | null; setError: (v: string | null) => void;
  correctOtp: string;
  payload: Record<string, unknown>;
}) {
  const [success, setSuccess] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, v: string) => {
    if (locked || success) return;
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const submit = () => {
    const code = otp.join("");
    if (code.length < 6) return setError("Inserisci tutte le 6 cifre.");
    if (code === correctOtp) {
      setSuccess(true);
      setError(null);
    } else {
      const n = attempts + 1;
      setAttempts(n);
      if (n >= 5) {
        setLocked(true);
        setError("Troppi tentativi errati. Verifica bloccata per sicurezza.");
      } else {
        setError(`Codice errato. Tentativi rimasti: ${5 - n}`);
      }
    }
  };

  if (success) {
    return (
      <section className="mx-auto max-w-2xl pt-10 md:pt-16">
        <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-white p-8 text-center md:p-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 font-serif-display text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Sei dentro.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-slate-600">
            Il tuo progetto è stato salvato in modo sicuro nella tua <strong>istanza dedicata</strong>. Riceverai entro pochi minuti il PDF del calcolo, la bozza del tuo sito, e l'accesso al workspace.
          </p>

          <div className="mt-6 grid gap-2 text-left md:grid-cols-3">
            <Stat label="Profilo Host" value="Salvato" />
            <Stat label="Stile & Layout" value="Salvato" />
            <Stat label="Contatti" value="Verificati" />
          </div>

          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mostra payload tecnico
            </summary>
            <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-slate-900 p-4 text-[11px] leading-relaxed text-emerald-200">
{JSON.stringify(payload, null, 2)}
            </pre>
          </details>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl pt-10 md:pt-16">
      <div className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-600">
          <ShieldCheck className="h-3 w-3" /> Verifica sicura
        </div>
        <h2 className="mt-4 font-serif-display text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
          Controlla la tua casella email
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base text-slate-600">
          Abbiamo inviato un codice a 6 cifre a <strong className="text-slate-900">{email || "la tua email"}</strong>. Inseriscilo per finalizzare il progetto.
        </p>
        <p className="mt-1 text-[11px] text-slate-400">Demo: il codice è <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">{correctOtp}</code></p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex justify-between gap-2">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              disabled={locked}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              className="h-14 w-12 rounded-xl border border-slate-200 bg-slate-50 text-center font-serif-display text-2xl font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50 md:h-16 md:w-14 md:text-3xl"
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={locked}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Verifica codice <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-500">
          Non hai ricevuto nulla? <span className="font-semibold text-slate-700 underline-offset-2 hover:underline">Reinvia</span>
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-emerald-200/70 bg-white/80 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
        <Check className="h-3.5 w-3.5" /> {value}
      </div>
    </div>
  );
}
