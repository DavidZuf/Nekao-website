import { Link } from '../router.jsx';
import Footer from './Footer.jsx';

export default function About() {
  return (
    <main className="page">
      <section className="section section--top about">
        <p className="eyebrow">About</p>
        <h1 className="page-title">Clothes look better<br />on someone</h1>
        <p className="lead">
          [The NEKAO story: who started it, where, and why. Two or three sentences in your own voice.]
        </p>
        <div className="about-grid">
          <div>
            <h2>The tees</h2>
            <p>[Fabric, weight, where they're made. What makes them worth the price.]</p>
          </div>
          <div>
            <h2>The apartment</h2>
            <p>[Why we built an apartment instead of a lookbook: every drop moves in with real people.]</p>
          </div>
          <div>
            <h2>The drops</h2>
            <p>[How often, how many pieces, whether they come back.]</p>
          </div>
        </div>
        <Link to="/apartment" className="btn btn--light">Enter the apartment</Link>
      </section>
      <Footer />
    </main>
  );
}
