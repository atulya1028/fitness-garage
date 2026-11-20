import EnquiryForm from '../components/EnquiryForm';
import { BUSINESS as B, getContent } from '../lib/content';

export const revalidate = 60;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HealthClub',
  name: B.name,
  telephone: B.tel,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '2nd Floor, Marudhar Complex, 3/515, Shivanand Marg, Sector 3',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    postalCode: '302017',
    addressCountry: 'IN',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '06:00', closes: '13:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '16:30', closes: '22:30' },
  ],
  aggregateRating: { '@type': 'AggregateRating', ratingValue: B.rating, reviewCount: B.reviews },
};

export default async function Home() {
  const { plans, trainers } = await getContent();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="banner">Concept draft prepared for The Fitness Garage — not their official website. Items marked “to be confirmed” need the gym’s input.</div>

      <nav>
        <div className="nav">
          <a className="logo" href="#top">THE FITNESS <span>GARAGE</span></a>
          <div className="links">
            <a href="#about">About</a><a href="#programs">Programs</a><a href="#trainers">Trainers</a>
            <a href="#membership">Membership</a><a href="#visit">Visit</a>
          </div>
          <a className="btn" href={`tel:${B.tel}`}>Call now</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <h1>Strength, support and <em>real results</em> in Malviya Nagar.</h1>
        <p>A gym and yoga studio in Sector 3, Jaipur, where trainers actually watch your form and help you stay consistent — whether it’s your first week or your fifth year.</p>
        <div className="cta">
          <a className="btn" href="#enquire">Book a free visit</a>
          <a className="btn ghost" href={`https://wa.me/${B.tel.replace('+', '')}?text=Hi%2C%20I%27d%20like%20to%20know%20about%20membership`}>WhatsApp us</a>
        </div>
        <div className="stats">
          <div className="stat"><b>{B.rating}★</b><span>Google rating</span></div>
          <div className="stat"><b>{B.reviews}</b><span>Google reviews</span></div>
          <div className="stat"><b>2nd floor</b><span>Marudhar Complex, Sector 3</span></div>
          <div className="stat"><b>6 days</b><span>Mon–Sat, morning &amp; evening</span></div>
        </div>
      </section>

      <section id="about">
        <div className="two">
          <div>
            <h2>About the gym</h2>
            <p className="sub">The Fitness Garage is a neighbourhood gym and yoga studio on Shivanand Marg. Members describe a positive, motivating atmosphere, a clean space and well-maintained modern machines, suitable for beginners through experienced lifters.</p>
            <p className="sub"><b>Founder story / years open:</b> <span className="tbc">to be confirmed by the gym</span></p>
          </div>
          <div className="ph">PHOTO SLOT — gym floor</div>
        </div>
      </section>

      <section id="programs">
        <h2>What you can do here</h2>
        <p className="sub">Listed on Google as a gym, fitness centre and yoga studio. Detailed class list to be confirmed.</p>
        <div className="grid">
          <div className="card"><h3>Strength &amp; gym floor</h3><p>Modern, well-maintained machines and free-weight space.</p></div>
          <div className="card"><h3>Personal guidance</h3><p>Trainers help with spotting, posture correction and building a routine around your goals.</p></div>
          <div className="card"><h3>Yoga</h3><p>Yoga studio listed alongside the gym. Timetable to be confirmed.</p></div>
          <div className="card"><h3>Body transformation</h3><p>Programs for weight loss and strength. Plans and pricing to be confirmed.</p></div>
        </div>
      </section>

      <section id="trainers">
        <h2>Meet the trainers</h2>
        <p className="sub">Members regularly name these trainers as supportive and encouraging.</p>
        <div className="grid">
          {trainers.map((t) => (
            <div className="card" key={t._id}>
              {t.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.photoUrl} alt={t.name} style={{ width: '100%', borderRadius: 16, marginBottom: 14, aspectRatio: '4/3', objectFit: 'cover' }} />
              ) : (
                <div className="ph" style={{ marginBottom: 14 }}>PHOTO SLOT</div>
              )}
              <h3>{t.name}</h3>
              <p>{t.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why">
        <h2>Why members rate us {B.rating}★</h2>
        <p className="sub">Themes from our Google reviews, in brief.</p>
        <div className="grid">
          <div className="card"><h3>Trainers who care</h3><p>Attentive help with form, spotting and new routines.</p></div>
          <div className="card"><h3>Clean &amp; well kept</h3><p>Modern machines and a tidy, comfortable space.</p></div>
          <div className="card"><h3>Positive vibe</h3><p>A motivating atmosphere that helps people stay consistent.</p></div>
        </div>
        <p style={{ marginTop: 18 }}><a className="btn ghost" href={B.mapsUrl}>Read all reviews on Google</a></p>
      </section>

      <section id="membership">
        <h2>Membership</h2>
        <p className="sub">Ask us for current plans and any trial option.</p>
        <div className="card">
          <table>
            <tbody>
              {plans.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}{p.note ? <small style={{ color: 'var(--mute)' }}> · {p.note}</small> : null}</td>
                  <td className={p.price === 'To be confirmed' ? 'tbc' : ''}>{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="visit">
        <h2>Visit us</h2>
        <div className="two" style={{ marginTop: 20 }}>
          <div className="card">
            <h3>Address</h3><p>{B.address}</p>
            <h3 style={{ marginTop: 18 }}>Phone</h3><p><a href={`tel:${B.tel}`}>{B.phone}</a></p>
            <h3 style={{ marginTop: 18 }}>Hours</h3>
            <table><tbody>{B.hours.map(([d, h], i) => <tr key={i}><td>{d}</td><td>{h}</td></tr>)}</tbody></table>
            <p style={{ marginTop: 16 }}><a className="btn" href={B.mapsUrl}>Get directions</a></p>
          </div>
          <div className="ph" style={{ aspectRatio: 'auto', minHeight: 260 }}>MAP EMBED SLOT</div>
        </div>
      </section>

      <section id="enquire">
        <h2>Book a free visit</h2>
        <p className="sub">Leave your number and we’ll call you back.</p>
        <EnquiryForm />
      </section>

      <footer>Concept draft — details sourced from the public Google listing. Not affiliated with or approved by The Fitness Garage.</footer>
    </>
  );
}
