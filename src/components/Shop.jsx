import { PRODUCTS } from '../data.js';
import { Link } from '../router.jsx';
import ProductCard from './ProductCard.jsx';
import Footer from './Footer.jsx';

export default function Shop() {
  return (
    <main className="page">
      <section className="section section--top">
        <div className="shop-head">
          <div>
            <p className="eyebrow">Drop 01</p>
            <h1>All the tees</h1>
          </div>
          <Link to="/apartment" className="btn btn--ghost">See them in the apartment</Link>
        </div>
        <div className="shop-grid">
          {Object.values(PRODUCTS).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
      <Footer />
    </main>
  );
}
