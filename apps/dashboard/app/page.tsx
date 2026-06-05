import {
  Activity,
  AlertTriangle,
  Bot,
  CreditCard,
  Database,
  Headphones,
  ShieldCheck,
  Store,
  Workflow
} from "lucide-react";

const metrics = [
  { label: "Call Answer SLO", value: "99.0%", status: "MVP target" },
  { label: "Order Accuracy", value: "97%+", status: "Guardrail target" },
  { label: "Handoff Rate", value: "<25%", status: "MVP target" },
  { label: "Duplicate Orders", value: "0", status: "Hard requirement" }
];

const workstreams = [
  {
    icon: Bot,
    title: "Voice Runtime",
    text: "Vertex AI Gemini Live primary, OpenAI Realtime standby, Render WebSocket bridge."
  },
  {
    icon: Store,
    title: "FoodHub Grounding",
    text: "All orders, prices, menu choices, coupons, and statuses are grounded in FoodHub data."
  },
  {
    icon: Database,
    title: "Menu Intelligence",
    text: "Separate menu index for live item IDs, aliases, modifiers, stock, and multilingual matching."
  },
  {
    icon: CreditCard,
    title: "Payment Safety",
    text: "Secure payment links only; no card details over voice; reconciliation tracks stale payments."
  },
  {
    icon: Headphones,
    title: "Warm Handoff",
    text: "Staff screen-pop payload includes cart, caller, language, issue, confidence, and next action."
  },
  {
    icon: ShieldCheck,
    title: "Guardrails",
    text: "Closed-world menu/pricing, prompt governance, tenant isolation, audit logs, and kill switches."
  }
];

export default function DashboardPage() {
  return (
    <main className="shell">
      <section className="topbar" aria-label="AIMate overview">
        <div>
          <p className="eyebrow">AIMate for POS</p>
          <h1>Voice ordering control center</h1>
        </div>
        <div className="status-pill">
          <Activity size={18} aria-hidden="true" />
          Implementation scaffold
        </div>
      </section>

      <section className="metrics" aria-label="Target metrics">
        {metrics.map((metric) => (
          <article className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.status}</small>
          </article>
        ))}
      </section>

      <section className="grid" aria-label="Enterprise workstreams">
        {workstreams.map((item) => (
          <article className="panel" key={item.title}>
            <item.icon size={24} aria-hidden="true" />
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="ops-band" aria-label="Operational readiness">
        <div>
          <Workflow size={24} aria-hidden="true" />
          <h2>Next build milestones</h2>
        </div>
        <ol>
          <li>Connect FoodHub credentials and staging store.</li>
          <li>Seed MongoDB with API RAG and live menu snapshots.</li>
          <li>Connect telephony media stream to the Render voice bridge.</li>
          <li>Run voice regression tests before production canary.</li>
        </ol>
      </section>

      <section className="warning" aria-label="Credential status">
        <AlertTriangle size={22} aria-hidden="true" />
        <p>
          Live API actions stay disabled until FoodHub, MongoDB, payment, telephony, and voice
          provider credentials are configured in the deployment environment.
        </p>
      </section>
    </main>
  );
}
