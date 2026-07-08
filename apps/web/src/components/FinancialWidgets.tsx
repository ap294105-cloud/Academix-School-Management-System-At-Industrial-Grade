import { useState, useEffect } from 'react';

interface WidgetProps {
  token: string;
}

// --- 1. Dynamic Payroll & Tax Calculator ---
export function PayrollCalculatorWidget({ token }: WidgetProps) {
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/payroll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPayroll(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = () => {
    if (!payroll) return;
    alert(`📥 PDF Payslip Downloaded!\n-------------------------\nEmployee: ${payroll.employeeName}\nGross Pay: $${payroll.grossPay}\nTax Deduction (15%): $${payroll.taxDeductions}\nNet Pay Disbursed: $${payroll.netSalary}\nPeriod: ${payroll.payPeriod}`);
  };

  if (loading) return <div className="text-slate-400 text-xs">Loading payroll registry...</div>;
  if (!payroll) return null;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Faculty Payroll & Tax Calculator</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Calculates net salary based on workload hours and state tax rates.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GROSS BASE PAY</span>
          <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)' }}>${payroll.basePay.toFixed(2)}</strong>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TAX DEDUCTIONS (15%)</span>
          <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--danger)' }}>-${payroll.taxDeductions.toFixed(2)}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem' }}>Net Disbursed Pay ({payroll.payPeriod}):</span>
        <strong style={{ fontSize: '1.3rem', color: 'var(--success)' }}>${payroll.netSalary.toFixed(2)}</strong>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={handleDownloadPayslip}>
        📥 Download Digital Payslip
      </button>
    </div>
  );
}

// --- 2. Asset Depreciation Tracker ---
export function AssetDepreciationWidget({ token }: WidgetProps) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/assets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-slate-400 text-xs">Computing asset values...</div>;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Asset Inventory & Depreciation</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Declining balance depreciation calculations for auditing.</p>

      <div className="table-wrapper">
        <table className="custom-table" style={{ fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Initial Cost</th>
              <th>Years</th>
              <th>Current Value</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td style={{ fontWeight: 600 }}>{asset.name}</td>
                <td>${asset.cost.toFixed(2)}</td>
                <td>{asset.yearsElapsed} yrs</td>
                <td style={{ color: 'var(--success)', fontWeight: 600 }}>${asset.currentValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 3. Vendor Procurement & Bids ---
export function VendorProcurementWidget({ token }: WidgetProps) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/procurement', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setQuotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewQuote = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/finance/procurement/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchQuotes();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-slate-400 text-xs">Loading supplier bids...</div>;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Vendor Bidding & Procurement</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Review procurement quotations submitted for school contracts.</p>

      <div className="table-wrapper">
        <table className="custom-table" style={{ fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Scope</th>
              <th>Quoted Bid</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(quote => (
              <tr key={quote.id}>
                <td style={{ fontWeight: 600 }}>{quote.vendorName}</td>
                <td style={{ fontSize: '0.75rem' }}>{quote.particulars}</td>
                <td style={{ fontWeight: 600 }}>${quote.amount}</td>
                <td>
                  {quote.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleReviewQuote(quote.id, 'APPROVED')}>Approve</button>
                      <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleReviewQuote(quote.id, 'REJECTED')}>Reject</button>
                    </div>
                  ) : (
                    <span className={`badge ${quote.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>{quote.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
