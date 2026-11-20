// Facts from the public Google listing. Anything else is "to be confirmed".
export const BUSINESS = {
  name: 'The Fitness Garage',
  phone: '+91 91666 62215',
  tel: '+919166662215',
  address: '2nd Floor, Marudhar Complex, 3/515, Shivanand Marg, Sector 3, Malviya Nagar, Jaipur, Rajasthan 302017',
  rating: '4.9',
  reviews: 189,
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=The+Fitness+Garage+Marudhar+Complex+Shivanand+Marg+Malviya+Nagar+Jaipur',
  hours: [
    ['Mon – Sat', '6:00 AM – 1:00 PM'],
    ['', '4:30 PM – 10:30 PM'],
    ['Sunday', 'Closed'],
  ],
};

export const DEFAULT_PLANS = ['Monthly', 'Quarterly', 'Half-yearly / Annual', 'Personal training add-on', 'Trial / day pass'].map(
  (name) => ({ _id: name, name, price: 'To be confirmed' })
);

export const DEFAULT_TRAINERS = [
  { _id: 'h', name: 'Himanshu', bio: 'Often mentioned by members for personal-trainer-style support.' },
  { _id: 'a', name: 'Anil', bio: 'Praised by members as supportive and encouraging.' },
  { _id: 'p', name: 'Pankaj', bio: 'Praised by members as supportive and encouraging.' },
];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Server-side fetch; falls back to defaults so the site still renders if the API is down.
export async function getContent() {
  try {
    const res = await fetch(`${API}/api/content`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('bad status');
    const { plans, trainers } = await res.json();
    return {
      plans: plans?.length ? plans : DEFAULT_PLANS,
      trainers: trainers?.length ? trainers : DEFAULT_TRAINERS,
    };
  } catch {
    return { plans: DEFAULT_PLANS, trainers: DEFAULT_TRAINERS };
  }
}
