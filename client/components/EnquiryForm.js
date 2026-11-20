'use client';
import { useState } from 'react';
import { API } from '../lib/content';

export default function EnquiryForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch(`${API}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not send. Please call us instead.');
      setStatus('done');
      form.reset();
    } catch (err) {
      setMsg(err.message);
      setStatus('error');
    }
  }

  if (status === 'done') {
    return <div className="card"><h3>Thanks! We’ll call you back soon.</h3></div>;
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="name" placeholder="Your name" required maxLength={80} />
      <input name="phone" placeholder="Phone number" inputMode="tel" required maxLength={20} />
      <select name="goal">
        <option>Weight loss</option>
        <option>Muscle &amp; strength</option>
        <option>General fitness</option>
        <option>Yoga</option>
      </select>
      <select name="slot">
        <option>Morning (6am–1pm)</option>
        <option>Evening (4:30pm–10:30pm)</option>
      </select>
      <button className="btn" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Request a call back'}
      </button>
      {status === 'error' && <p style={{ color: '#ffb98a' }}>{msg}</p>}
    </form>
  );
}
