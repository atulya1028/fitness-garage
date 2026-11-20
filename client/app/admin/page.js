'use client';
import { useState, useEffect } from 'react';
import { API } from '../../lib/content';

export default function Admin() {
  const [token, setToken] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [tab, setTab] = useState('leads'); // leads | plans | trainers
  const [leads, setLeads] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all | pending | contacted
  const [feedback, setFeedback] = useState('');
  const [err, setErr] = useState('');

  // Editing state for plans
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planDraft, setPlanDraft] = useState({ price: '', note: '' });

  // New plan state
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', note: '' });

  // Editing state for trainers
  const [editingTrainerId, setEditingTrainerId] = useState(null);
  const [trainerDraft, setTrainerDraft] = useState({ name: '', bio: '', photoUrl: '' });

  // New trainer state
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ name: '', bio: '', photoUrl: '' });

  const getHeaders = (t = token) => ({
    'Content-Type': 'application/json',
    'x-admin-token': t,
  });

  function showMsg(msg) {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  }

  async function checkAuth(tokenToTry) {
    if (!tokenToTry) return;
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`${API}/api/admin/leads`, { headers: getHeaders(tokenToTry) });
      if (!res.ok) throw new Error('Invalid admin token or server unavailable.');
      const data = await res.json();
      setLeads(data);
      setIsAuth(true);
      localStorage.setItem('tfg_token', tokenToTry);
      fetchPlansAndTrainers(tokenToTry);
    } catch (e) {
      setErr(e.message);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlansAndTrainers(tokenToUse = token) {
    try {
      const [resP, resT] = await Promise.all([
        fetch(`${API}/api/admin/plans`, { headers: getHeaders(tokenToUse) }),
        fetch(`${API}/api/admin/trainers`, { headers: getHeaders(tokenToUse) }),
      ]);
      if (resP.ok) setPlans(await resP.json());
      if (resT.ok) setTrainers(await resT.json());
    } catch {}
  }

  useEffect(() => {
    const saved = localStorage.getItem('tfg_token');
    if (saved) {
      setToken(saved);
      checkAuth(saved);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('tfg_token');
    setIsAuth(false);
    setToken('');
    setLeads([]);
    setPlans([]);
    setTrainers([]);
  }

  // --- Leads Actions ---
  async function toggleContacted(lead) {
    const updatedStatus = !lead.contacted;
    // Optimistic UI update
    setLeads((prev) => prev.map((l) => (l._id === lead._id ? { ...l, contacted: updatedStatus } : l)));
    try {
      const res = await fetch(`${API}/api/admin/leads/${lead._id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ contacted: updatedStatus }),
      });
      if (!res.ok) throw new Error();
      showMsg(updatedStatus ? 'Marked as contacted ✓' : 'Marked as pending');
    } catch {
      // Revert on failure
      setLeads((prev) => prev.map((l) => (l._id === lead._id ? { ...l, contacted: !updatedStatus } : l)));
      setErr('Could not update lead status.');
    }
  }

  // --- Plans Actions ---
  async function savePlan(id) {
    try {
      const res = await fetch(`${API}/api/admin/plans/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(planDraft),
      });
      if (!res.ok) throw new Error('Failed to update plan');
      const updated = await res.json();
      setPlans((prev) => prev.map((p) => (p._id === id ? updated : p)));
      setEditingPlanId(null);
      showMsg('Plan updated successfully! ✓');
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleAddPlan(e) {
    e.preventDefault();
    if (!newPlan.name.trim()) return;
    try {
      const res = await fetch(`${API}/api/admin/plans`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newPlan),
      });
      if (!res.ok) throw new Error('Failed to add plan');
      const created = await res.json();
      setPlans((prev) => [...prev, created]);
      setNewPlan({ name: '', price: '', note: '' });
      setShowAddPlan(false);
      showMsg('New plan added! ✓');
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deletePlan(id) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await fetch(`${API}/api/admin/plans/${id}`, { method: 'DELETE', headers: getHeaders() });
      setPlans((prev) => prev.filter((p) => p._id !== id));
      showMsg('Plan deleted ✓');
    } catch (e) {
      setErr(e.message);
    }
  }

  // --- Trainers Actions ---
  async function saveTrainer(id) {
    try {
      const res = await fetch(`${API}/api/admin/trainers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(trainerDraft),
      });
      if (!res.ok) throw new Error('Failed to update trainer');
      const updated = await res.json();
      setTrainers((prev) => prev.map((t) => (t._id === id ? updated : t)));
      setEditingTrainerId(null);
      showMsg('Trainer profile updated! ✓');
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleAddTrainer(e) {
    e.preventDefault();
    if (!newTrainer.name.trim()) return;
    try {
      const res = await fetch(`${API}/api/admin/trainers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newTrainer),
      });
      if (!res.ok) throw new Error('Failed to add trainer');
      const created = await res.json();
      setTrainers((prev) => [...prev, created]);
      setNewTrainer({ name: '', bio: '', photoUrl: '' });
      setShowAddTrainer(false);
      showMsg('Trainer added! ✓');
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deleteTrainer(id) {
    if (!confirm('Are you sure you want to delete this trainer?')) return;
    try {
      await fetch(`${API}/api/admin/trainers/${id}`, { method: 'DELETE', headers: getHeaders() });
      setTrainers((prev) => prev.filter((t) => t._id !== id));
      showMsg('Trainer removed ✓');
    } catch (e) {
      setErr(e.message);
    }
  }

  const filteredLeads = leads.filter((l) => {
    if (filter === 'pending') return !l.contacted;
    if (filter === 'contacted') return l.contacted;
    return true;
  });

  const pendingCount = leads.filter((l) => !l.contacted).length;

  return (
    <section style={{ maxWidth: 960, margin: 'auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <a href="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>← Back to Website</a>
        {isAuth && (
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--mute)',
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Log out
          </button>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>The Fitness Garage — Admin Portal</h1>
        <p className="sub" style={{ margin: 0 }}>
          Manage incoming customer enquiries, membership plans, and trainer profiles.
        </p>
      </div>

      {feedback && (
        <div style={{ background: '#1c3a27', color: '#73e29f', padding: '10px 16px', borderRadius: 8, marginBottom: 18, border: '1px solid #2d5e3f' }}>
          {feedback}
        </div>
      )}

      {err && (
        <div style={{ background: '#3d1d16', color: '#ffb98a', padding: '10px 16px', borderRadius: 8, marginBottom: 18, border: '1px solid #6b2e21' }}>
          {err}
        </div>
      )}

      {!isAuth ? (
        <div className="card" style={{ maxWidth: 460 }}>
          <h3 style={{ marginBottom: 12 }}>Enter Admin Passcode</h3>
          <p style={{ color: 'var(--mute)', fontSize: 14, marginBottom: 18 }}>
            Please enter your admin token to securely access enquiries and manage gym details.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkAuth(token);
            }}
            style={{ display: 'grid', gap: 12 }}
          >
            <input
              type="password"
              placeholder="Admin token (e.g. change-me)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <button
              onClick={() => setTab('leads')}
              style={{
                background: tab === 'leads' ? 'var(--accent)' : 'transparent',
                color: tab === 'leads' ? '#111' : 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '8px 18px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Enquiries ({leads.length}) {pendingCount > 0 && <span style={{ background: '#e53e3e', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, marginLeft: 6 }}>{pendingCount} new</span>}
            </button>

            <button
              onClick={() => setTab('plans')}
              style={{
                background: tab === 'plans' ? 'var(--accent)' : 'transparent',
                color: tab === 'plans' ? '#111' : 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '8px 18px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Membership Plans ({plans.length})
            </button>

            <button
              onClick={() => setTab('trainers')}
              style={{
                background: tab === 'trainers' ? 'var(--accent)' : 'transparent',
                color: tab === 'trainers' ? '#111' : 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '8px 18px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Trainers ({trainers.length})
            </button>
          </div>

          {/* TAB 1: LEADS / ENQUIRIES */}
          {tab === 'leads' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h3 style={{ fontSize: 20 }}>Member Enquiries</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setFilter('all')}
                    style={{
                      background: filter === 'all' ? 'var(--card)' : 'transparent',
                      border: '1px solid var(--line)',
                      color: filter === 'all' ? 'var(--text)' : 'var(--mute)',
                      padding: '5px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    All ({leads.length})
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    style={{
                      background: filter === 'pending' ? 'var(--card)' : 'transparent',
                      border: '1px solid var(--line)',
                      color: filter === 'pending' ? 'var(--text)' : 'var(--mute)',
                      padding: '5px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFilter('contacted')}
                    style={{
                      background: filter === 'contacted' ? 'var(--card)' : 'transparent',
                      border: '1px solid var(--line)',
                      color: filter === 'contacted' ? 'var(--text)' : 'var(--mute)',
                      padding: '5px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Contacted ({leads.length - pendingCount})
                  </button>
                </div>
              </div>

              {filteredLeads.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--mute)', padding: 36 }}>
                  No enquiries matching this filter.
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                  <table style={{ margin: 0 }}>
                    <tbody>
                      {filteredLeads.map((l) => (
                        <tr key={l._id}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                              {l.name}
                              <span
                                style={{
                                  marginLeft: 10,
                                  fontSize: 12,
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  background: l.contacted ? '#1c3a27' : '#3a2b16',
                                  color: l.contacted ? '#73e29f' : '#ffb98a',
                                  fontWeight: 600,
                                }}
                              >
                                {l.contacted ? '✓ Contacted' : '● Needs Call'}
                              </span>
                            </div>
                            <div style={{ marginBottom: 4 }}>
                              📞 <a href={`tel:${l.phone}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>{l.phone}</a>
                              <span style={{ color: 'var(--mute)', margin: '0 8px' }}>·</span>
                              <a
                                href={`https://wa.me/${l.phone.replace(/[^\d]/g, '')}?text=Hi%20${encodeURIComponent(l.name)}%2C%20thank%20you%20for%20contacting%20The%20Fitness%20Garage!`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#25D366', fontSize: 13 }}
                              >
                                WhatsApp
                              </a>
                            </div>
                            <small style={{ color: 'var(--mute)' }}>
                              Goal: <b>{l.goal || 'General'}</b> · Preferred: <b>{l.slot || 'Flexible'}</b> · Received:{' '}
                              {new Date(l.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </small>
                          </td>
                          <td style={{ padding: '16px 20px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <button
                              className={`btn ${l.contacted ? 'ghost' : ''}`}
                              style={{ padding: '8px 16px', fontSize: 13 }}
                              onClick={() => toggleContacted(l)}
                            >
                              {l.contacted ? 'Mark Pending' : 'Mark Contacted ✓'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PLANS & PRICING */}
          {tab === 'plans' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 20 }}>Membership Plans &amp; Pricing</h3>
                  <p style={{ color: 'var(--mute)', fontSize: 13 }}>Updates show instantly on the main website.</p>
                </div>
                <button className="btn" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => setShowAddPlan(!showAddPlan)}>
                  {showAddPlan ? 'Cancel' : '+ Add Plan'}
                </button>
              </div>

              {showAddPlan && (
                <form onSubmit={handleAddPlan} className="card" style={{ marginBottom: 20, display: 'grid', gap: 12 }}>
                  <h4 style={{ margin: 0 }}>Add New Membership Plan</h4>
                  <input
                    placeholder="Plan Name (e.g. 3 Months Regular)"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Price (e.g. ₹4,500)"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                  />
                  <input
                    placeholder="Note / Features (e.g. Includes Cardio & Weights)"
                    value={newPlan.note}
                    onChange={(e) => setNewPlan({ ...newPlan, note: e.target.value })}
                  />
                  <button className="btn" type="submit" style={{ width: 'fit-content' }}>
                    Save Plan
                  </button>
                </form>
              )}

              <div className="card" style={{ padding: 0 }}>
                <table style={{ margin: 0 }}>
                  <tbody>
                    {plans.map((p) => {
                      const isEditing = editingPlanId === p._id;
                      return (
                        <tr key={p._id}>
                          <td style={{ padding: '16px 20px' }}>
                            <b>{p.name}</b>
                            {p.note && <div style={{ color: 'var(--mute)', fontSize: 13 }}>{p.note}</div>}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            {isEditing ? (
                              <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                                <input
                                  style={{ width: 140, padding: '6px 10px', fontSize: 14 }}
                                  value={planDraft.price}
                                  placeholder="Price (₹...)"
                                  onChange={(e) => setPlanDraft({ ...planDraft, price: e.target.value })}
                                />
                                <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => savePlan(p._id)}>
                                  Save
                                </button>
                                <button
                                  className="btn ghost"
                                  style={{ padding: '6px 10px', fontSize: 12 }}
                                  onClick={() => setEditingPlanId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: p.price === 'To be confirmed' ? '#ffb98a' : 'var(--text)' }}>
                                  {p.price}
                                </span>
                                <button
                                  className="btn ghost"
                                  style={{ padding: '5px 12px', fontSize: 12 }}
                                  onClick={() => {
                                    setEditingPlanId(p._id);
                                    setPlanDraft({ price: p.price, note: p.note || '' });
                                  }}
                                >
                                  Edit Price
                                </button>
                                <button
                                  onClick={() => deletePlan(p._id)}
                                  style={{ background: 'transparent', border: 0, color: '#e53e3e', cursor: 'pointer', fontSize: 14 }}
                                  title="Delete plan"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TRAINERS */}
          {tab === 'trainers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 20 }}>Trainers &amp; Staff</h3>
                  <p style={{ color: 'var(--mute)', fontSize: 13 }}>Highlighted on the website trainer showcase.</p>
                </div>
                <button className="btn" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => setShowAddTrainer(!showAddTrainer)}>
                  {showAddTrainer ? 'Cancel' : '+ Add Trainer'}
                </button>
              </div>

              {showAddTrainer && (
                <form onSubmit={handleAddTrainer} className="card" style={{ marginBottom: 20, display: 'grid', gap: 12 }}>
                  <h4 style={{ margin: 0 }}>Add New Trainer</h4>
                  <input
                    placeholder="Trainer Name"
                    value={newTrainer.name}
                    onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Short bio / specialisation (e.g. Strength conditioning, Weight loss)"
                    rows={2}
                    value={newTrainer.bio}
                    onChange={(e) => setNewTrainer({ ...newTrainer, bio: e.target.value })}
                  />
                  <input
                    placeholder="Photo URL (optional)"
                    value={newTrainer.photoUrl}
                    onChange={(e) => setNewTrainer({ ...newTrainer, photoUrl: e.target.value })}
                  />
                  <button className="btn" type="submit" style={{ width: 'fit-content' }}>
                    Save Trainer
                  </button>
                </form>
              )}

              <div style={{ display: 'grid', gap: 14 }}>
                {trainers.map((t) => {
                  const isEditing = editingTrainerId === t._id;
                  return (
                    <div className="card" key={t._id}>
                      {isEditing ? (
                        <div style={{ display: 'grid', gap: 10 }}>
                          <input
                            value={trainerDraft.name}
                            onChange={(e) => setTrainerDraft({ ...trainerDraft, name: e.target.value })}
                            placeholder="Trainer Name"
                          />
                          <textarea
                            rows={2}
                            value={trainerDraft.bio}
                            onChange={(e) => setTrainerDraft({ ...trainerDraft, bio: e.target.value })}
                            placeholder="Trainer Bio"
                          />
                          <input
                            value={trainerDraft.photoUrl}
                            onChange={(e) => setTrainerDraft({ ...trainerDraft, photoUrl: e.target.value })}
                            placeholder="Photo URL"
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => saveTrainer(t._id)}>
                              Save Changes
                            </button>
                            <button className="btn ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setEditingTrainerId(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                          <div>
                            <h4 style={{ fontSize: 18, marginBottom: 4 }}>{t.name}</h4>
                            <p style={{ color: 'var(--mute)', fontSize: 14, margin: 0 }}>{t.bio || 'No bio added yet.'}</p>
                            {t.photoUrl && (
                              <small style={{ color: 'var(--accent)', marginTop: 6, display: 'inline-block' }}>
                                ✓ Photo connected
                              </small>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <button
                              className="btn ghost"
                              style={{ padding: '5px 12px', fontSize: 12 }}
                              onClick={() => {
                                setEditingTrainerId(t._id);
                                setTrainerDraft({ name: t.name, bio: t.bio || '', photoUrl: t.photoUrl || '' });
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTrainer(t._id)}
                              style={{ background: 'transparent', border: 0, color: '#e53e3e', cursor: 'pointer', fontSize: 14 }}
                              title="Delete trainer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
