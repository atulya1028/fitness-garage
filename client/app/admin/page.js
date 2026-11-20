'use client';
import { useState } from 'react';
import { API } from '../../lib/content';

export default function Admin() {
  const [token, setToken] = useState('');
  const [leads, setLeads] = useState(null);
  const [err, setErr] = useState('');

  const headers = { 'Content-Type': 'application/json', 'x-admin-token': token };

  async function load() {
    setErr('');
    const res = await fetch(`${API}/api/admin/leads`, { headers });
    if (!res.ok) return setErr('Wrong token or server unavailable.');
    setLeads(await res.json());
  }

  async function toggle(l) {
    await fetch(`${API}/api/admin/leads/${l._id}`, { method: 'PATCH', headers, body: JSON.stringify({ contacted: !l.contacted }) });
    load();
  }

  return (
    <section>
      <p style={{ marginBottom: 16 }}><a href="/" style={{ color: 'var(--accent)' }}>← Back to website</a></p>
      <h2>Enquiries</h2>
      <p className="sub">Enter the admin token to view call-back requests.</p>
      <div style={{ display: 'flex', gap: 10, maxWidth: 520 }}>
        <input type="password" placeholder="Admin token" value={token} onChange={(e) => setToken(e.target.value)} />
        <button className="btn" onClick={load}>Load</button>
      </div>
      {err && <p style={{ color: '#ffb98a', marginTop: 12 }}>{err}</p>}
      {leads && (
        <div className="card" style={{ marginTop: 24, overflowX: 'auto' }}>
          <table>
            <tbody>
              {leads.length === 0 && <tr><td>No enquiries yet.</td></tr>}
              {leads.map((l) => (
                <tr key={l._id}>
                  <td>
                    <b>{l.name}</b> · <a href={`tel:${l.phone}`}>{l.phone}</a>
                    <br /><small style={{ color: 'var(--mute)' }}>{l.goal} · {l.slot} · {new Date(l.createdAt).toLocaleString('en-IN')}</small>
                  </td>
                  <td><button className="btn ghost" onClick={() => toggle(l)}>{l.contacted ? '✓ Contacted' : 'Mark contacted'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
