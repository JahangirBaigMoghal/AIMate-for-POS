"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CreditCard,
  Database,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  FileText,
  Phone,
  RefreshCw,
  Search,
  ShoppingCart,
  Eye,
  Info
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "calls" | "orders" | "webhooks" | "settings">("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  
  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    ai_answering: true,
    order_commit: true,
    payment_links: true,
    handoff: true,
    fallback_staff_number: ""
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch all dashboard data
  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const json = await res.json();
      if (json.ok) {
        setData(json);
        setSettingsForm({
          ai_answering: json.config.ai_answering,
          order_commit: json.config.order_commit,
          payment_links: json.config.payment_links,
          handoff: json.config.handoff,
          fallback_staff_number: json.config.fallback_staff_number || ""
        });
      } else {
        throw new Error(json.error || "Unknown API error");
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-poll every 8 seconds to show live updates
    const timer = setInterval(fetchData, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/dashboard/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm)
      });
      const json = await res.json();
      if (json.ok) {
        setSaveStatus({ type: "success", message: "Settings saved to MongoDB successfully!" });
        fetchData();
      } else {
        throw new Error(json.error || "Failed to update configuration");
      }
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err.message || "An error occurred saving settings" });
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading && !data) {
    return (
      <main className="shell">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px" }}>
          <RefreshCw size={40} className="animate-spin" style={{ color: "var(--accent)" }} />
          <p style={{ color: "var(--muted)" }}>Connecting to database, please wait...</p>
        </div>
      </main>
    );
  }

  const credentials = data?.credentials || {
    mongodb: false,
    gemini: false,
    twilio: false,
    stripe: false,
    foodhub: false
  };

  const stats = data?.stats || {
    totalCalls: 0,
    activeCalls: 0,
    successfulOrders: 0,
    failedOrders: 0,
    paymentPending: 0
  };

  return (
    <main className="shell">
      {/* ─── Topbar ─── */}
      <section className="topbar" aria-label="AIMate overview">
        <div>
          <p className="eyebrow">AIMate for POS</p>
          <h1>Voice ordering control center</h1>
        </div>
        <div className="status-pill">
          <Activity size={18} aria-hidden="true" />
          {credentials.mongodb ? "Database Connected" : "Mock/Disconnected Mode"}
        </div>
      </section>

      {/* ─── Navigation Tabs ─── */}
      <nav className="tabs" aria-label="Dashboard views">
        <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
          Overview
        </button>
        <button className={`tab-btn ${activeTab === "calls" ? "active" : ""}`} onClick={() => setActiveTab("calls")}>
          Call Logs ({data?.sessions?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
          Orders & Payments ({data?.attempts?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === "webhooks" ? "active" : ""}`} onClick={() => setActiveTab("webhooks")}>
          Webhook Audit ({data?.webhooks?.length || 0})
        </button>
        <button className={`tab-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
          Settings & Config
        </button>
      </nav>

      {error && (
        <div className="alert-box danger">
          <AlertTriangle size={20} />
          <div>
            <strong>Database Error:</strong> {error}
          </div>
        </div>
      )}

      {/* ─── Tab Content: Overview ─── */}
      {activeTab === "overview" && (
        <section aria-label="Overview overview">
          <div className="metrics">
            <article className="metric">
              <span>Total Calls</span>
              <strong>{stats.totalCalls}</strong>
              <small>{stats.activeCalls} active now</small>
            </article>
            <article className="metric">
              <span>Successful Orders</span>
              <strong>{stats.successfulOrders}</strong>
              <small>POS committed</small>
            </article>
            <article className="metric">
              <span>Failed Orders</span>
              <strong>{stats.failedOrders}</strong>
              <small>Require manual check</small>
            </article>
            <article className="metric">
              <span>Payments Pending</span>
              <strong>{stats.paymentPending}</strong>
              <small>Checkout links active</small>
            </article>
          </div>

          <div className="panel">
            <h2>
              <ShieldCheck size={22} style={{ color: "var(--accent)" }} />
              Environment Integration Status
            </h2>
            <p style={{ marginBottom: "20px" }}>
              The status of third-party API integrations based on credentials configured in the deployment environment.
            </p>
            <div className="checklist-grid">
              <div className={`checklist-card ${credentials.mongodb ? "configured" : "missing"}`}>
                {credentials.mongodb ? <CheckCircle2 size={24} style={{ color: "var(--success)" }} /> : <XCircle size={24} style={{ color: "var(--error)" }} />}
                <div>
                  <strong>MongoDB Persistence</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                    {credentials.mongodb ? "Connected to database" : "Missing MONGODB_URI"}
                  </p>
                </div>
              </div>
              <div className={`checklist-card ${credentials.gemini ? "configured" : "missing"}`}>
                {credentials.gemini ? <CheckCircle2 size={24} style={{ color: "var(--success)" }} /> : <XCircle size={24} style={{ color: "var(--error)" }} />}
                <div>
                  <strong>Gemini Live API</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                    {credentials.gemini ? "Voice Model Configured" : "Missing GEMINI_API_KEY"}
                  </p>
                </div>
              </div>
              <div className={`checklist-card ${credentials.twilio ? "configured" : "missing"}`}>
                {credentials.twilio ? <CheckCircle2 size={24} style={{ color: "var(--success)" }} /> : <XCircle size={24} style={{ color: "var(--error)" }} />}
                <div>
                  <strong>Twilio Telephony</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                    {credentials.twilio ? "Linked to Twilio" : "Missing TWILIO_ACCOUNT_SID"}
                  </p>
                </div>
              </div>
              <div className={`checklist-card ${credentials.stripe ? "configured" : "missing"}`}>
                {credentials.stripe ? <CheckCircle2 size={24} style={{ color: "var(--success)" }} /> : <XCircle size={24} style={{ color: "var(--error)" }} />}
                <div>
                  <strong>Stripe Payments</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                    {credentials.stripe ? "Stripe checkout active" : "Stripe Disabled (Mock Mode)"}
                  </p>
                </div>
              </div>
              <div className={`checklist-card ${credentials.foodhub ? "configured" : "missing"}`}>
                {credentials.foodhub ? <CheckCircle2 size={24} style={{ color: "var(--success)" }} /> : <XCircle size={24} style={{ color: "var(--error)" }} />}
                <div>
                  <strong>FoodHub Partner API</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                    {credentials.foodhub ? "FoodHub API Active" : "FoodHub Disabled (Mock Mode)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="alert-box">
            <Info size={20} />
            <p>
              <strong>System Notice:</strong> Active call state is securely backed up in MongoDB. If the server scales or restarts, calls can automatically reconnect and recover their carts transparently.
            </p>
          </div>
        </section>
      )}

      {/* ─── Tab Content: Call Logs ─── */}
      {activeTab === "calls" && (
        <section aria-label="Call Logs Overview" className="panel">
          <h2>
            <FileText size={22} style={{ color: "var(--accent)" }} />
            Active and Historic Call Sessions
          </h2>
          {data?.sessions?.length === 0 ? (
            <div className="empty-state">
              <Clock size={48} />
              <p>No call logs found in the database. Place a phone call to see records.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Caller Phone</th>
                    <th>Started At</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Cart Summary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map((session: any) => (
                    <tr key={session.call_id} className="clickable-row" onClick={() => setSelectedCall(session)}>
                      <td style={{ fontWeight: 600 }}>{session.caller_phone || "Anonymous"}</td>
                      <td>{new Date(session.started_at || session.created_at).toLocaleString()}</td>
                      <td><span className="badge badge-info">{session.language}</span></td>
                      <td>
                        <span className={`badge ${session.status === "ENDED" ? "badge-success" : "badge-purple"}`}>
                          {session.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session.summary || "No items"}
                      </td>
                      <td>
                        <button className="save-btn" style={{ padding: "6px 12px", fontSize: "12px" }}>
                          <Eye size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ─── Tab Content: Orders & Payments ─── */}
      {activeTab === "orders" && (
        <section aria-label="Orders Overview" className="panel">
          <h2>
            <ShoppingCart size={22} style={{ color: "var(--accent)" }} />
            Order Submission & Card Payments Ledger
          </h2>
          {data?.attempts?.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={48} />
              <p>No order submission records found in the database.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order Attempt ID</th>
                    <th>Call ID</th>
                    <th>Type</th>
                    <th>Total Price</th>
                    <th>State</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attempts.map((attempt: any) => (
                    <tr key={attempt.order_attempt_id}>
                      <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{attempt.order_attempt_id}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{attempt.call_id}</td>
                      <td><span className="badge badge-info">{attempt.payment_type}</span></td>
                      <td style={{ fontWeight: 600 }}>
                        GBP {attempt.price ? (attempt.price.total / 100).toFixed(2) : "0.00"}
                      </td>
                      <td>
                        <span className={`badge ${
                          attempt.state === "SUBMITTED" ? "badge-success" : 
                          attempt.state === "FAILED" ? "badge-error" : "badge-warn"
                        }`}>
                          {attempt.state}
                        </span>
                      </td>
                      <td>{new Date(attempt.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ─── Tab Content: Webhooks ─── */}
      {activeTab === "webhooks" && (
        <section aria-label="Webhooks Overview" className="panel">
          <h2>
            <Database size={22} style={{ color: "var(--accent)" }} />
            Webhook Processing Audit Trail
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px", fontSize: "14px" }}>
            Audit log of incoming HTTP POST webhooks received from the FoodHub platform. Webhook verification ensures security and prevents repeat event processing (idempotency).
          </p>
          {data?.webhooks?.length === 0 ? (
            <div className="empty-state">
              <Database size={48} />
              <p>No webhook events received yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Provider</th>
                    <th>Event Type</th>
                    <th>Signature</th>
                    <th>Status</th>
                    <th>Received At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.webhooks.map((hook: any) => (
                    <tr key={hook.event_id}>
                      <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{hook.event_id}</td>
                      <td style={{ fontWeight: 600 }}>{hook.provider}</td>
                      <td><span className="badge badge-purple">{hook.event_type || "UNKNOWN"}</span></td>
                      <td>
                        <span className={`badge ${hook.signature_valid !== false ? "badge-success" : "badge-error"}`}>
                          {hook.signature_valid !== false ? "VALID" : "INVALID"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${hook.processed ? "badge-success" : "badge-warn"}`}>
                          {hook.processed ? "PROCESSED" : "RECEIVED"}
                        </span>
                      </td>
                      <td>{new Date(hook.received_at || hook.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ─── Tab Content: Settings ─── */}
      {activeTab === "settings" && (
        <section aria-label="Settings panel" className="panel">
          <h2>
            <Settings size={22} style={{ color: "var(--accent)" }} />
            AI Voice Agent Kill Switches & Config
          </h2>
          
          <form onSubmit={handleSaveSettings}>
            {saveStatus && (
              <div className={`alert-box ${saveStatus.type === "success" ? "" : "danger"}`} style={{ borderLeft: `4px solid var(--${saveStatus.type === "success" ? "success" : "error"})` }}>
                {saveStatus.type === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                <p>{saveStatus.message}</p>
              </div>
            )}

            <div className="setting-row">
              <div className="setting-info">
                <h3>AI Answering Enabled</h3>
                <p>Allow the AI Voice Agent to intercept and answer incoming Twilio calls.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settingsForm.ai_answering}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ai_answering: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h3>Payment Link Creation</h3>
                <p>Enable generating secure payment checkout links using Stripe adapter.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settingsForm.payment_links}
                  disabled={!credentials.stripe}
                  onChange={(e) => setSettingsForm({ ...settingsForm, payment_links: e.target.checked })}
                />
                <span className={`slider ${!credentials.stripe ? "disabled" : ""}`}></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h3>Order POS Commit</h3>
                <p>Allow successfully confirmed orders to be pushed directly to FoodHub POS.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settingsForm.order_commit}
                  disabled={!credentials.foodhub}
                  onChange={(e) => setSettingsForm({ ...settingsForm, order_commit: e.target.checked })}
                />
                <span className={`slider ${!credentials.foodhub ? "disabled" : ""}`}></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h3>Staff Fallback routing</h3>
                <p>Allow redirection to a staff phone number if caller request handoff or errors occur.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settingsForm.handoff}
                  onChange={(e) => setSettingsForm({ ...settingsForm, handoff: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ marginTop: "24px" }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: "14px" }}>
                Handoff Phone Number (Twilio Handoff Destination)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="+44123456789"
                value={settingsForm.fallback_staff_number}
                onChange={(e) => setSettingsForm({ ...settingsForm, fallback_staff_number: e.target.value })}
              />
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                Must be in E.164 format. The agent dials this number if handoff is triggered.
              </p>
            </div>

            <div style={{ marginTop: "32px", borderTop: "1px solid var(--line)", paddingTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="save-btn" disabled={savingSettings}>
                {savingSettings ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>

          {/* Locked/Mock features indicators */}
          <div style={{ marginTop: "40px", borderTop: "1px solid var(--line)", paddingTop: "24px" }}>
            <h4 style={{ margin: "0 0 16px", color: "var(--muted)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em" }}>
              Developer / Integration Settings
            </h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px dashed var(--line)", padding: "16px", borderRadius: "8px", opacity: credentials.foodhub ? 1 : 0.6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "14px" }}>FoodHub Synchronization</strong>
                  <span className={`badge ${credentials.foodhub ? "badge-success" : "badge-warn"}`}>
                    {credentials.foodhub ? "CONNECTED" : "LOCKED / MOCK"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                  Triggers catalog synchronization from the FoodHub platform. Enabled when FoodHub client secrets are set.
                </p>
                <button className="input-field save-btn" style={{ marginTop: "12px", width: "auto", fontSize: "12px", padding: "6px 12px" }} disabled={!credentials.foodhub}>
                  Sync Catalog Now
                </button>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px dashed var(--line)", padding: "16px", borderRadius: "8px", opacity: credentials.stripe ? 1 : 0.6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "14px" }}>Payment Gateway Controls</strong>
                  <span className={`badge ${credentials.stripe ? "badge-success" : "badge-warn"}`}>
                    {credentials.stripe ? "CONNECTED" : "LOCKED / MOCK"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                  Manage payment gateways, success callbacks, webhooks validation, and refunds. Enabled when Stripe credentials are set.
                </p>
                <button className="input-field save-btn" style={{ marginTop: "12px", width: "auto", fontSize: "12px", padding: "6px 12px" }} disabled={!credentials.stripe}>
                  Manage Refunds
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Call details Modal ─── */}
      {selectedCall && (
        <div className="modal-overlay" onClick={() => setSelectedCall(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Call Session Detail</h3>
              <button className="close-btn" onClick={() => setSelectedCall(null)}>
                <XCircle size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Call ID</strong>
                  <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{selectedCall.call_id}</span>
                </div>
                <div className="detail-item">
                  <strong>Caller Phone</strong>
                  <span>{selectedCall.caller_phone || "Anonymous"}</span>
                </div>
                <div className="detail-item">
                  <strong>Started At</strong>
                  <span>{new Date(selectedCall.started_at || selectedCall.created_at).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <strong>Language</strong>
                  <span>{selectedCall.language}</span>
                </div>
                <div className="detail-item">
                  <strong>Session Status</strong>
                  <span className={`badge ${selectedCall.status === "ENDED" ? "badge-success" : "badge-purple"}`}>
                    {selectedCall.status}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Payment Type</strong>
                  <span>{selectedCall.payment_type || "Not Selected"}</span>
                </div>
              </div>

              {selectedCall.cart ? (
                <div className="cart-summary-box">
                  <h4>Cart Snapshot (Version {selectedCall.cart.version || 1})</h4>
                  <div style={{ marginBottom: "12px", fontSize: "13px" }}>
                    <strong>Fulfillment Type:</strong> <span className="badge badge-info">{selectedCall.cart.fulfillment_type || "Not Set"}</span>
                  </div>
                  {selectedCall.cart.items && selectedCall.cart.items.length > 0 ? (
                    <div>
                      {selectedCall.cart.items.map((item: any, idx: number) => (
                        <div key={idx} className="cart-item-row">
                          <span>{item.quantity} x {item.name}</span>
                          <span style={{ fontWeight: 600 }}>GBP {(item.price * item.quantity / 100).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      {selectedCall.price && (
                        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--muted)", margin: "4px 0" }}>
                            <span>Subtotal</span>
                            <span>GBP {(selectedCall.price.subtotal / 100).toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--muted)", margin: "4px 0" }}>
                            <span>Delivery Fee</span>
                            <span>GBP {(selectedCall.price.delivery_fee / 100).toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--ink)", fontWeight: 700, margin: "8px 0 0", paddingTop: "8px", borderTop: "1px dashed var(--line)" }}>
                            <span>Total</span>
                            <span>GBP {(selectedCall.price.total / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>Cart is currently empty.</p>
                  )}
                </div>
              ) : (
                <div className="cart-summary-box">
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>No cart snapshots recorded for this session.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
