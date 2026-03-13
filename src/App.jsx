import { useState, useEffect, useMemo, useCallback } from "react";

// ══════════════════════════════════════════════════════════════
// AML TRANSACTION MONITOR — Anti-Money Laundering Compliance
// Real compliance workflows · Meaningful data · Zero APIs
// ══════════════════════════════════════════════════════════════

const CUSTOMERS = [
  { id: "C-1001", name: "Maple Ridge Developments Inc", type: "Business", industry: "Real Estate", riskRating: "High", onboardDate: "2023-03-15", country: "Canada", province: "ON", expectedActivity: "Monthly property transactions $50K-$200K", avgMonthlyVolume: 125000, pepStatus: false, adverseMedia: false, accountOfficer: "K. Joshi" },
  { id: "C-1002", name: "Chen Wei", type: "Individual", industry: "N/A", riskRating: "Medium", onboardDate: "2024-01-10", country: "Canada", province: "BC", expectedActivity: "Personal banking, occasional international wires to Hong Kong", avgMonthlyVolume: 15000, pepStatus: false, adverseMedia: false, accountOfficer: "S. Thompson" },
  { id: "C-1003", name: "Al-Rashid Trading Co.", type: "Business", industry: "Import/Export", riskRating: "High", onboardDate: "2022-08-20", country: "Canada", province: "ON", expectedActivity: "Weekly trade settlements $20K-$80K, Middle East corridors", avgMonthlyVolume: 220000, pepStatus: false, adverseMedia: true, accountOfficer: "K. Joshi" },
  { id: "C-1004", name: "Elena Volkov", type: "Individual", industry: "N/A", riskRating: "High", onboardDate: "2025-01-05", country: "Canada", province: "QC", expectedActivity: "Personal savings, $3K-$5K deposits", avgMonthlyVolume: 4000, pepStatus: true, adverseMedia: false, accountOfficer: "M. Dubois" },
  { id: "C-1005", name: "Pacific Shell Holdings Ltd", type: "Business", industry: "Consulting", riskRating: "High", onboardDate: "2024-06-12", country: "Canada", province: "BC", expectedActivity: "Consulting fees $10K-$30K monthly", avgMonthlyVolume: 20000, pepStatus: false, adverseMedia: true, accountOfficer: "S. Thompson" },
  { id: "C-1006", name: "Robert Singh", type: "Individual", industry: "N/A", riskRating: "Low", onboardDate: "2021-05-08", country: "Canada", province: "ON", expectedActivity: "Salary deposits, mortgage payments", avgMonthlyVolume: 6500, pepStatus: false, adverseMedia: false, accountOfficer: "K. Joshi" },
  { id: "C-1007", name: "Kingston Capital Partners", type: "Business", industry: "Financial Services", riskRating: "Medium", onboardDate: "2023-09-01", country: "Canada", province: "ON", expectedActivity: "Investment transactions $100K-$500K quarterly", avgMonthlyVolume: 150000, pepStatus: false, adverseMedia: false, accountOfficer: "K. Joshi" },
  { id: "C-1008", name: "Maria Gonzalez", type: "Individual", industry: "N/A", riskRating: "Medium", onboardDate: "2024-03-22", country: "Canada", province: "AB", expectedActivity: "Small business income $8K-$15K monthly", avgMonthlyVolume: 11000, pepStatus: false, adverseMedia: false, accountOfficer: "M. Dubois" },
];

const SCENARIOS = {
  structuring: {
    name: "Structuring / Smurfing",
    description: "Multiple cash deposits just below $10,000 reporting threshold within 48 hours — classic attempt to avoid FINTRAC Large Cash Transaction Report",
    regulation: "PCMLTFA s.7, FINTRAC GL-2023-1",
    customerId: "C-1006",
    riskImpact: "HIGH — Pattern indicates deliberate avoidance of reporting requirements",
    transactions: [
      { id: "TXN-90001", date: "2026-03-10T09:15:00", amount: 9800, type: "Cash Deposit", direction: "Inbound", branch: "Cornwall Main", teller: "T. Adams", memo: "Business income" },
      { id: "TXN-90002", date: "2026-03-10T14:30:00", amount: 9500, type: "Cash Deposit", direction: "Inbound", branch: "Cornwall East", teller: "P. Roy", memo: "Business income" },
      { id: "TXN-90003", date: "2026-03-11T10:00:00", amount: 9700, type: "Cash Deposit", direction: "Inbound", branch: "Ingleside", teller: "J. Martin", memo: "Cash savings" },
      { id: "TXN-90004", date: "2026-03-11T15:45:00", amount: 9900, type: "Cash Deposit", direction: "Inbound", branch: "Cornwall Main", teller: "T. Adams", memo: "Business income" },
      { id: "TXN-90005", date: "2026-03-12T11:20:00", amount: 9600, type: "Cash Deposit", direction: "Inbound", branch: "Morrisburg", teller: "L. Chen", memo: "Personal" },
    ],
    totalAmount: 48500,
    redFlags: ["5 cash deposits in 3 days across 4 branches", "All amounts $9,500-$9,900 (just below $10K threshold)", "Customer profile: salaried employee — cash deposits inconsistent", "Different branches used — possible to avoid teller recognition", "Memo fields vague and inconsistent"],
    recommendedAction: "File Suspicious Transaction Report (STR) with FINTRAC. Escalate to Branch Manager. Consider Enhanced Due Diligence review of customer relationship.",
  },
  rapidMovement: {
    name: "Rapid Fund Movement (Layering)",
    description: "Large wire received from high-risk jurisdiction, funds moved to multiple accounts within 24 hours — consistent with layering stage of money laundering",
    regulation: "PCMLTFA s.7, FATF Recommendation 20",
    customerId: "C-1005",
    riskImpact: "CRITICAL — Funds from shell company in known secrecy jurisdiction with immediate dispersal",
    transactions: [
      { id: "TXN-90010", date: "2026-03-08T08:00:00", amount: 285000, type: "Incoming Wire", direction: "Inbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Consulting fee - Invoice #4421 - Sender: Brightpath Ltd, Cayman Islands" },
      { id: "TXN-90011", date: "2026-03-08T11:30:00", amount: 95000, type: "Outgoing Wire", direction: "Outbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Investment - Receiver: Horizon Fund LP, Singapore" },
      { id: "TXN-90012", date: "2026-03-08T13:15:00", amount: 85000, type: "Outgoing Wire", direction: "Outbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Supplier payment - Receiver: Jade Commerce, Hong Kong" },
      { id: "TXN-90013", date: "2026-03-08T15:00:00", amount: 75000, type: "Internal Transfer", direction: "Outbound", branch: "Online", teller: "System", memo: "Transfer to savings account ****7823" },
      { id: "TXN-90014", date: "2026-03-08T16:45:00", amount: 28000, type: "Bank Draft", direction: "Outbound", branch: "Vancouver Downtown", teller: "R. Patel", memo: "Draft payable to 'Bearer'" },
    ],
    totalAmount: 568000,
    redFlags: ["$285K wire from Cayman Islands shell company", "98% of funds dispersed within 8 hours of receipt", "Funds split to 4 different channels (wire, transfer, draft)", "Bearer draft — untraceable once cashed", "Company has adverse media hits for offshore tax schemes", "Destinations span 3 different countries"],
    recommendedAction: "IMMEDIATE escalation to Compliance Officer. File STR with FINTRAC within 24 hours. Place temporary hold on remaining balance. Request source of funds documentation. Consider filing Terrorist Property Report if nexus identified.",
  },
  pepTransaction: {
    name: "PEP Unusual Activity",
    description: "Politically Exposed Person account receiving payments inconsistent with declared income — potential corruption proceeds",
    regulation: "PCMLTFA s.9.3, Enhanced Due Diligence Requirements",
    customerId: "C-1004",
    riskImpact: "HIGH — PEP with undisclosed income sources, recent large deposits inconsistent with profile",
    transactions: [
      { id: "TXN-90020", date: "2026-02-15T10:00:00", amount: 45000, type: "Incoming Wire", direction: "Inbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Gift - Sender: Private account, Switzerland" },
      { id: "TXN-90021", date: "2026-02-28T14:00:00", amount: 38000, type: "Incoming Wire", direction: "Inbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Loan repayment - Sender: Volkov Family Trust, Luxembourg" },
      { id: "TXN-90022", date: "2026-03-05T09:30:00", amount: 52000, type: "Incoming Wire", direction: "Inbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Consulting - Sender: EuroServ GmbH, Austria" },
      { id: "TXN-90023", date: "2026-03-10T11:00:00", amount: 25000, type: "Cash Withdrawal", direction: "Outbound", branch: "Montreal Centre", teller: "A. Bergeron", memo: "Personal expenses" },
    ],
    totalAmount: 160000,
    redFlags: ["Customer is a PEP — enhanced scrutiny required", "Receiving $135K in 3 weeks vs declared $4K/month activity", "Funds from 3 different European countries via private structures", "Vague descriptions: 'Gift', 'Loan repayment', 'Consulting'", "$25K cash withdrawal — possible layering", "Family Trust in Luxembourg — common secrecy vehicle"],
    recommendedAction: "Conduct Enhanced Due Diligence review. Request source of wealth documentation. Verify consulting arrangement legitimacy. File STR with FINTRAC. Update customer risk rating to CRITICAL. Schedule relationship review with Compliance.",
  },
  tradeBasedML: {
    name: "Trade-Based Money Laundering",
    description: "Import/export business with invoice values significantly deviating from market norms — potential over/under-invoicing to move value across borders",
    regulation: "PCMLTFA, FATF Trade-Based ML Indicators",
    customerId: "C-1003",
    riskImpact: "HIGH — Systematic over-invoicing pattern suggesting value transfer through trade channels",
    transactions: [
      { id: "TXN-90030", date: "2026-02-01T08:00:00", amount: 78000, type: "Outgoing Wire", direction: "Outbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Invoice #TR-2201 - 500 units textiles - Supplier: Oasis Trading, Dubai" },
      { id: "TXN-90031", date: "2026-02-15T08:00:00", amount: 82000, type: "Outgoing Wire", direction: "Outbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Invoice #TR-2215 - 500 units textiles - Supplier: Oasis Trading, Dubai" },
      { id: "TXN-90032", date: "2026-03-01T08:00:00", amount: 91000, type: "Outgoing Wire", direction: "Outbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Invoice #TR-2301 - 500 units textiles - Supplier: Oasis Trading, Dubai" },
      { id: "TXN-90033", date: "2026-03-05T14:00:00", amount: 165000, type: "Incoming Wire", direction: "Inbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Sale proceeds - Buyer: unknown retail chain, cash settlement" },
      { id: "TXN-90034", date: "2026-03-09T10:00:00", amount: 55000, type: "Outgoing Wire", direction: "Outbound", branch: "N/A - Wire", teller: "SWIFT", memo: "Invoice #TR-2309 - 200 units electronics - Supplier: Gulf Star, Bahrain" },
    ],
    totalAmount: 471000,
    redFlags: ["Same quantity (500 units) at escalating prices ($78K→$82K→$91K) — 17% increase in 30 days", "Single supplier in high-risk jurisdiction (Dubai)", "Customer has adverse media for trade irregularities", "Sale proceeds described as 'cash settlement' — unusual for legitimate wholesale", "New supplier (Gulf Star, Bahrain) added — expanding high-risk corridors", "Monthly volume ($471K) exceeds expected ($220K) by 114%"],
    recommendedAction: "Request commercial invoices and shipping documentation for verification. Cross-reference unit prices against market benchmarks. File STR with FINTRAC. Engage Trade Finance team for independent valuation. Consider placing wire approval hold pending review.",
  },
};

// ─── Styles ─────────────────────────────────────────────────
const C = {
  bg: "#08090d", panel: "#0e1015", border: "#1a1e2a", hover: "#13161f",
  accent: "#e11d48", accentDim: "rgba(225,29,72,0.10)", accentGlow: "rgba(225,29,72,0.15)",
  green: "#059669", greenDim: "rgba(5,150,105,0.10)",
  red: "#dc2626", redDim: "rgba(220,38,38,0.10)",
  amber: "#d97706", amberDim: "rgba(217,119,6,0.10)",
  blue: "#2563eb", blueDim: "rgba(37,99,235,0.10)",
  purple: "#7c3aed",
  text: "#e4e4e7", muted: "#a1a1aa", dim: "#52525b",
  surface: "#111318",
};

const Panel = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, cursor: onClick ? "pointer" : "default", transition: "border-color 0.2s", ...style }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = C.accent + "60"; }}
    onMouseLeave={e => { if (onClick) e.currentTarget.style.borderColor = C.border; }}>
    {children}
  </div>
);

const Badge = ({ text, color }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, color, background: color + "15", border: `1px solid ${color}25`, letterSpacing: "0.3px" }}>{text}</span>
);

const RiskBadge = ({ level }) => {
  const config = { HIGH: C.red, CRITICAL: C.accent, MEDIUM: C.amber, LOW: C.green };
  return <Badge text={level} color={config[level] || C.dim} />;
};

const StatusBadge = ({ status }) => {
  const config = { OPEN: C.red, INVESTIGATING: C.amber, ESCALATED: C.purple, "SAR FILED": C.accent, CLOSED: C.dim, "NO ACTION": C.green };
  return <Badge text={status} color={config[status] || C.dim} />;
};

const Label = ({ children }) => (
  <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{children}</div>
);

const Value = ({ children, color = C.text, mono }) => (
  <div style={{ fontSize: 14, fontWeight: 700, color, fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit" }}>{children}</div>
);

// ─── Timeline Component ─────────────────────────────────────
const TransactionTimeline = ({ transactions }) => (
  <div style={{ position: "relative", paddingLeft: 24 }}>
    <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 2, background: C.border }} />
    {transactions.map((t, i) => {
      const isInbound = t.direction === "Inbound";
      const date = new Date(t.date);
      return (
        <div key={t.id} style={{ position: "relative", marginBottom: 16, paddingLeft: 16 }}>
          <div style={{ position: "absolute", left: -20, top: 4, width: 12, height: 12, borderRadius: "50%", background: isInbound ? C.green : C.red, border: `2px solid ${C.panel}` }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: "monospace" }}>{t.id}</span>
                <Badge text={t.type} color={C.blue} />
                <Badge text={t.direction} color={isInbound ? C.green : C.red} />
              </div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{t.memo}</div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>
                {date.toLocaleDateString("en-CA")} at {date.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })} · {t.branch} · {t.teller}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: isInbound ? C.green : C.red, fontFamily: "'JetBrains Mono', monospace" }}>
                {isInbound ? "+" : "-"}${t.amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// ─── Customer Profile Card ──────────────────────────────────
const CustomerCard = ({ customer }) => {
  const riskColor = { High: C.red, Medium: C.amber, Low: C.green, Critical: C.accent };
  return (
    <Panel style={{ borderLeft: `3px solid ${riskColor[customer.riskRating] || C.dim}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{customer.name}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{customer.id} · {customer.type} · {customer.industry}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <RiskBadge level={customer.riskRating.toUpperCase()} />
          {customer.pepStatus && <Badge text="PEP" color={C.accent} />}
          {customer.adverseMedia && <Badge text="ADVERSE MEDIA" color={C.amber} />}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <div><Label>Province</Label><Value>{customer.province}</Value></div>
        <div><Label>Onboard Date</Label><Value>{customer.onboardDate}</Value></div>
        <div><Label>Expected Monthly</Label><Value mono color={C.blue}>${customer.avgMonthlyVolume.toLocaleString()}</Value></div>
        <div><Label>Account Officer</Label><Value>{customer.accountOfficer}</Value></div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Label>Expected Activity Pattern</Label>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5, fontStyle: "italic" }}>"{customer.expectedActivity}"</div>
      </div>
    </Panel>
  );
};

// ─── Case Investigation View ────────────────────────────────
const CaseView = ({ scenario, onBack }) => {
  const [status, setStatus] = useState("OPEN");
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [decision, setDecision] = useState(null);
  const customer = CUSTOMERS.find(c => c.id === scenario.customerId);

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [...prev, { text: noteText, time: new Date().toISOString(), analyst: "K. Joshi" }]);
    setNoteText("");
  };

  const handleDecision = (dec) => {
    setDecision(dec);
    setStatus(dec === "escalate" ? "ESCALATED" : dec === "sar" ? "SAR FILED" : dec === "close" ? "CLOSED" : "NO ACTION");
    setNotes(prev => [...prev, {
      text: `Case decision: ${dec === "escalate" ? "Escalated to Senior Compliance" : dec === "sar" ? "SAR filed with FINTRAC" : dec === "close" ? "Case closed — no further action" : "No action required"}`,
      time: new Date().toISOString(), analyst: "K. Joshi — SYSTEM"
    }]);
  };

  return (
    <div>
      <button onClick={onBack} style={{ padding: "6px 16px", background: "none", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>← Back to Cases</button>

      {/* Case Header */}
      <Panel style={{ marginBottom: 14, background: C.surface }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.accent }}>{scenario.name}</span>
              <StatusBadge status={status} />
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, maxWidth: 600 }}>{scenario.description}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Label>Total Exposure</Label>
            <Value mono color={C.accent}>${scenario.totalAmount.toLocaleString()}</Value>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{scenario.transactions.length} transactions</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: "8px 12px", background: C.amberDim, borderRadius: 6, border: `1px solid ${C.amber}20` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: "0.5px" }}>REGULATORY BASIS</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{scenario.regulation}</div>
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14, marginBottom: 14 }}>
        {/* Customer Profile */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "1px", marginBottom: 8, textTransform: "uppercase" }}>Customer Profile</div>
          <CustomerCard customer={customer} />
        </div>

        {/* Red Flags */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "1px", marginBottom: 8, textTransform: "uppercase" }}>Red Flags Identified</div>
          <Panel style={{ borderLeft: `3px solid ${C.red}` }}>
            {scenario.redFlags.map((flag, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < scenario.redFlags.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ color: C.red, fontSize: 14, lineHeight: 1.4 }}>⚑</span>
                <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{flag}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: "8px 10px", background: C.redDim, borderRadius: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.red, letterSpacing: "0.5px" }}>RISK ASSESSMENT</div>
              <div style={{ fontSize: 12, color: C.text, marginTop: 4 }}>{scenario.riskImpact}</div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Transaction Timeline */}
      <Panel style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "1px", marginBottom: 14, textTransform: "uppercase" }}>Transaction Timeline</div>
        <TransactionTimeline transactions={scenario.transactions} />
      </Panel>

      {/* Recommended Action */}
      <Panel style={{ marginBottom: 14, borderLeft: `3px solid ${C.amber}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, letterSpacing: "1px", marginBottom: 8, textTransform: "uppercase" }}>Recommended Action</div>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{scenario.recommendedAction}</div>
      </Panel>

      {/* Decision Panel */}
      <Panel style={{ marginBottom: 14, background: C.surface }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "1px", marginBottom: 12, textTransform: "uppercase" }}>Analyst Decision</div>
        {!decision ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "sar", label: "File SAR with FINTRAC", color: C.accent },
              { id: "escalate", label: "Escalate to Senior Compliance", color: C.amber },
              { id: "close", label: "Close — Insufficient Evidence", color: C.dim },
              { id: "noaction", label: "No Action Required", color: C.green },
            ].map(d => (
              <button key={d.id} onClick={() => handleDecision(d.id)} style={{
                padding: "10px 20px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: d.color + "15", color: d.color, border: `1px solid ${d.color}30`,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = d.color + "25"; }}
                onMouseLeave={e => { e.currentTarget.style.background = d.color + "15"; }}>
                {d.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: "12px", background: status === "SAR FILED" ? C.accentDim : status === "ESCALATED" ? C.amberDim : C.greenDim, borderRadius: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <StatusBadge status={status} />
            <span style={{ fontSize: 13, color: C.text }}>Decision recorded at {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </Panel>

      {/* Investigation Notes */}
      <Panel>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "1px", marginBottom: 12, textTransform: "uppercase" }}>Investigation Notes</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Document your investigation findings..."
            onKeyDown={e => { if (e.key === "Enter") addNote(); }}
            style={{ flex: 1, padding: "10px 12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12, outline: "none" }} />
          <button onClick={addNote} style={{ padding: "10px 20px", background: C.accent, color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>ADD NOTE</button>
        </div>
        {notes.length === 0 && <div style={{ fontSize: 11, color: C.dim, fontStyle: "italic", padding: "8px 0" }}>No investigation notes yet. Document your findings, observations, and rationale above.</div>}
        {notes.map((n, i) => (
          <div key={i} style={{ padding: "10px 12px", background: C.bg, borderRadius: 6, marginBottom: 6, borderLeft: `3px solid ${n.analyst.includes("SYSTEM") ? C.accent : C.blue}` }}>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{n.text}</div>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{n.analyst} · {new Date(n.time).toLocaleString()}</div>
          </div>
        ))}
      </Panel>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function AMLMonitor() {
  const [activeView, setActiveView] = useState("cases");
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => { setTimeout(() => setAnimate(true), 80); }, []);

  const scenarioList = Object.entries(SCENARIOS);

  return (
    <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: C.bg, color: C.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input:focus { border-color: ${C.accent} !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .anim { animation: fadeIn 0.4s ease forwards; opacity: 0; }
      `}</style>

      {/* Header */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${C.accent}, #9f1239)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff" }}>AML</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.5px" }}>AML TRANSACTION MONITOR</div>
            <div style={{ fontSize: 9, color: C.dim, letterSpacing: "1.5px" }}>FINTRAC COMPLIANCE · PCMLTFA</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {["cases", "customers", "rules"].map(v => (
            <button key={v} onClick={() => { setActiveView(v); setSelectedScenario(null); }}
              style={{ padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", background: activeView === v ? C.accentDim : "transparent", color: activeView === v ? C.accent : C.dim, border: `1px solid ${activeView === v ? C.accent + "40" : "transparent"}`, borderRadius: 5, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ─── CASES VIEW ─── */}
        {activeView === "cases" && !selectedScenario && (
          <div className={animate ? "anim" : ""}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Open Cases", value: "4", color: C.accent },
                { label: "High Risk Alerts", value: "3", color: C.red },
                { label: "Total Exposure", value: "$1.25M", color: C.amber },
                { label: "Pending SARs", value: "2", color: C.purple },
              ].map((m, i) => (
                <Panel key={i}>
                  <Label>{m.label}</Label>
                  <div style={{ fontSize: 24, fontWeight: 800, color: m.color, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>{m.value}</div>
                </Panel>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "1px", marginBottom: 12, textTransform: "uppercase" }}>Active Investigations — Click to open case file</div>

            {scenarioList.map(([key, scenario], i) => {
              const customer = CUSTOMERS.find(c => c.id === scenario.customerId);
              return (
                <Panel key={key} onClick={() => setSelectedScenario(key)}
                  style={{ marginBottom: 10, borderLeft: `3px solid ${scenario.riskImpact.includes("CRITICAL") ? C.accent : C.red}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 250 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{scenario.name}</span>
                        <RiskBadge level={scenario.riskImpact.includes("CRITICAL") ? "CRITICAL" : "HIGH"} />
                        <StatusBadge status="OPEN" />
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 8 }}>{scenario.description}</div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 11, color: C.dim }}>Customer: <span style={{ color: C.text, fontWeight: 600 }}>{customer?.name}</span></div>
                        <div style={{ fontSize: 11, color: C.dim }}>Transactions: <span style={{ color: C.text, fontWeight: 600 }}>{scenario.transactions.length}</span></div>
                        <div style={{ fontSize: 11, color: C.dim }}>Red Flags: <span style={{ color: C.red, fontWeight: 600 }}>{scenario.redFlags.length}</span></div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, fontFamily: "'JetBrains Mono', monospace" }}>${scenario.totalAmount.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>Total exposure</div>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}

        {/* ─── CASE DETAIL VIEW ─── */}
        {activeView === "cases" && selectedScenario && (
          <div className={animate ? "anim" : ""}>
            <CaseView scenario={SCENARIOS[selectedScenario]} onBack={() => setSelectedScenario(null)} />
          </div>
        )}

        {/* ─── CUSTOMERS VIEW ─── */}
        {activeView === "customers" && (
          <div className={animate ? "anim" : ""}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "1px", marginBottom: 14, textTransform: "uppercase" }}>Customer Risk Registry — {CUSTOMERS.length} monitored accounts</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr>
                    {["ID", "Customer", "Type", "Industry", "Risk", "Province", "Expected Monthly", "Flags", "Officer"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 9, color: C.dim, borderBottom: `1px solid ${C.border}`, letterSpacing: "1px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CUSTOMERS.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}08` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.hover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px", fontSize: 11, color: C.blue, fontFamily: "monospace" }}>{c.id}</td>
                      <td style={{ padding: "10px", fontSize: 12, fontWeight: 600, color: C.text }}>{c.name}</td>
                      <td style={{ padding: "10px", fontSize: 11, color: C.muted }}>{c.type}</td>
                      <td style={{ padding: "10px", fontSize: 11, color: C.muted }}>{c.industry}</td>
                      <td style={{ padding: "10px" }}><RiskBadge level={c.riskRating.toUpperCase()} /></td>
                      <td style={{ padding: "10px", fontSize: 11, color: C.muted }}>{c.province}</td>
                      <td style={{ padding: "10px", fontSize: 12, fontFamily: "monospace", color: C.text }}>${c.avgMonthlyVolume.toLocaleString()}</td>
                      <td style={{ padding: "10px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {c.pepStatus && <Badge text="PEP" color={C.accent} />}
                          {c.adverseMedia && <Badge text="ADV MEDIA" color={C.amber} />}
                          {!c.pepStatus && !c.adverseMedia && <span style={{ fontSize: 10, color: C.dim }}>—</span>}
                        </div>
                      </td>
                      <td style={{ padding: "10px", fontSize: 11, color: C.muted }}>{c.accountOfficer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── RULES VIEW ─── */}
        {activeView === "rules" && (
          <div className={animate ? "anim" : ""}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "1px", marginBottom: 14, textTransform: "uppercase" }}>AML Detection Rule Library — FINTRAC / PCMLTFA Compliance</div>
            {[
              { id: "R-001", name: "Large Cash Transaction", threshold: "$10,000+", basis: "PCMLTFA s.7", desc: "Any cash transaction of $10,000 or more requires a Large Cash Transaction Report (LCTR) filed with FINTRAC within 15 days.", category: "Mandatory Reporting" },
              { id: "R-002", name: "Structuring / Smurfing", threshold: "Multiple <$10K in 48hrs", basis: "PCMLTFA s.7, GL-2023-1", desc: "Multiple cash transactions designed to avoid the $10,000 reporting threshold. Look for same customer, amounts $8,500-$9,999, multiple branches.", category: "Suspicious Pattern" },
              { id: "R-003", name: "Rapid Fund Movement", threshold: ">80% moved in 24hrs", basis: "FATF Rec. 20", desc: "Funds received and substantially moved within 24 hours, especially when routed through multiple channels or jurisdictions — consistent with layering.", category: "Suspicious Pattern" },
              { id: "R-004", name: "High-Risk Jurisdiction", threshold: "FATF Grey/Blacklist", basis: "PCMLTFA Regulations", desc: "Transactions involving countries on FATF grey or blacklist, known tax havens, or jurisdictions with weak AML controls (e.g., Cayman Islands, Panama, Myanmar).", category: "Geographic Risk" },
              { id: "R-005", name: "PEP Monitoring", threshold: "Any unusual activity", basis: "PCMLTFA s.9.3", desc: "Enhanced due diligence required for Politically Exposed Persons. Any activity inconsistent with declared source of funds triggers automatic review.", category: "Enhanced Due Diligence" },
              { id: "R-006", name: "Trade-Based ML", threshold: "Price deviation >15%", basis: "FATF TBML Indicators", desc: "Import/export transactions with values significantly deviating from fair market value — over/under-invoicing as a mechanism to transfer value across borders.", category: "Suspicious Pattern" },
              { id: "R-007", name: "Adverse Media Match", threshold: "Real-time screening", basis: "PCMLTFA Regulations", desc: "Customer or counterparty appears in adverse media related to financial crime, sanctions, fraud, corruption, or terrorism financing.", category: "Screening" },
              { id: "R-008", name: "Dormant Account Activation", threshold: ">90 days inactive", basis: "Internal Policy", desc: "Previously dormant account showing sudden significant activity — may indicate compromised account or nominee arrangement.", category: "Behavioral" },
            ].map(rule => (
              <Panel key={rule.id} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 250 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: C.accent, fontFamily: "monospace" }}>{rule.id}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{rule.name}</span>
                      <Badge text={rule.category} color={C.blue} />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{rule.desc}</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 160 }}>
                    <Label>Threshold</Label>
                    <Value color={C.amber}>{rule.threshold}</Value>
                    <div style={{ fontSize: 10, color: C.dim, marginTop: 6 }}>{rule.basis}</div>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", padding: "24px 0 12px", fontSize: 10, color: C.dim, letterSpacing: "1px" }}>
          AML TRANSACTION MONITOR · FINTRAC COMPLIANCE · PCMLTFA · ZERO API DEPENDENCIES · KARTIK JOSHI
        </div>
      </div>
    </div>
  );
}
