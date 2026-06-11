import { useEffect, useState } from "react";
import { X, ShieldCheck, Cookie } from "lucide-react";

export type LegalDoc = "terms" | "privacy" | null;

const PRIVACY_TEXT = `INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI (GDPR)

1. TITOLARE DEL TRATTAMENTO: Il titolare del trattamento è Simone Pio Bellavia, residente in via Crucillà 225, Serradifalco (CL), email: bellaviasimone22@gmail.com, PEC: bellaviasimone@pec.it (Partita IVA: [INSERIRE PARTITA IVA]).

2. DATI RACCOLTI: Vengono raccolti dati identificativi (Nome struttura, Città, Email, Telefono), dati economici (Fatturato lordo OTA, numero strutture, posizionamento canali) e preferenze estetiche (palette, font, layout scelto e screenshot dell'anteprima del sito).

3. FINALITÀ E BASE GIURIDICA: I dati sono trattati esclusivamente per elaborare la stima delle commissioni, generare la bozza del sito, ricontattare l'utente entro 24-48 ore per una consulenza strategica e per future attività di marketing diretto e remarketing da parte del Titolare. La base giuridica è il consenso esplicito dell'utente tramite checkbox.

4. DESTINATARI DEI DATI: I dati vengono conservati in modo sicuro sul database Supabase (utilizzato anche per l'autenticazione OTP) e inoltrati al Titolare tramite il servizio Resend. I dati non saranno ceduti a terzi.

5. CONSERVAZIONE E DIRITTI: I dati saranno conservati per il tempo necessario a espletare la consulenza e le attività di marketing. L'utente ha il diritto in qualsiasi momento di richiedere l'accesso, la rettifica o la cancellazione totale dei propri dati scrivendo a bellaviasimone22@gmail.com.`;

const TERMS_TEXT = `TERMINI E CONDIZIONI DI UTILIZZO

1. REQUISITI DI ETÀ: L'utilizzo dell'applicazione di HostFreedom e la richiesta di consulenza sono riservati esclusivamente a utenti che abbiano compiuto il 18° anno di età (maggiorenni).

2. LIMITAZIONE DI RESPONSABILITÀ: Il calcolatore delle commissioni e l'anteprima del sito web generati da questa applicazione forniscono stime puramente indicative e commerciali basate sui dati inseriti dall'utente. Il Titolare non si assume alcuna responsabilità per eventuali discrepanze, errori o differenze rispetto dei dati reali, economici o fiscali della struttura dell'host.

3. PROPRIETÀ INTELLETTUALE: Tutti i contenuti, i marchi e le logiche dell'applicazione appartengono a HostFreedom. La bozza del sito generata ha puro scopo dimostrativo.

4. LEGGE APPLICABILE E FORO COMPETENTE: I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia legale derivante dall'utilizzo di questo sito o dei servizi connessi, il Foro competente esclusivo è il Tribunale di Caltanissetta.`;

export function LegalModal({ open, onClose }: { open: LegalDoc; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const title = open === "privacy" ? "Privacy Policy" : "Termini di Servizio";
  const text = open === "privacy" ? PRIVACY_TEXT : TERMS_TEXT;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="font-serif-display text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-slate-700">{text}</pre>
        </div>
        <div className="border-t border-slate-200 px-5 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export function LegalLink({ doc, onOpen, children }: { doc: "terms" | "privacy"; onOpen: (d: LegalDoc) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen(doc); }}
      className="font-semibold text-slate-900 underline underline-offset-2 hover:text-emerald-700"
    >
      {children}
    </button>
  );
}

const CONSENT_KEY = "hf_cookie_consent";

function injectGoogleAnalytics() {
  if (typeof window === "undefined") return;
  if (document.getElementById("ga-loader")) return;
  const s = document.createElement("script");
  s.id = "ga-loader";
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXX";
  document.head.appendChild(s);
  const s2 = document.createElement("script");
  s2.id = "ga-init";
  s2.text = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXX');";
  document.head.appendChild(s2);
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = localStorage.getItem(CONSENT_KEY);
    if (!v) {
      setVisible(true);
    } else if (v === "all") {
      injectGoogleAnalytics();
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    try { localStorage.setItem(CONSENT_KEY, "all"); } catch { /* noop */ }
    injectGoogleAnalytics();
    setVisible(false);
  };
  const reject = () => {
    try { localStorage.setItem(CONSENT_KEY, "necessary"); } catch { /* noop */ }
    setVisible(false);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[70] bg-slate-900/10" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-[75] p-3 sm:p-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-white">
                <Cookie className="h-4 w-4" />
              </div>
              <p className="text-[12.5px] leading-relaxed text-slate-700">
                Utilizziamo cookie tecnici per salvare le tue preferenze nel database e Google Analytics per l'analisi del traffico. Cliccando su <strong>"Accetta Tutti"</strong> acconsenti anche ai nostri Termini di Servizio e alla Privacy Policy.
              </p>
            </div>
            <div className="flex shrink-0 gap-2 sm:flex-col md:flex-row">
              <button
                onClick={reject}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
              >
                Solo Necessari
              </button>
              <button
                onClick={accept}
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 sm:flex-none"
              >
                Accetta Tutti
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
