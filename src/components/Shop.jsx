import { PRODUCTS } from '../data.js';
import { Link } from '../router.jsx';
import ProductIndex from './ProductIndex.jsx';
import Footer from './Footer.jsx';

export default function Shop() {
  const all = Object.values(PRODUCTS);
  return (
    <main className="page">
      <section className="section section--top">
        <div className="wardrobe-head">
          <h1>The wardrobe</h1>
          <p>{all.length} tees, each one worn by someone in the apartment. <Link to="/apartment" className="inline-link">Go meet them</Link></p>
        </div>
        <ProductIndex products={all} />
      </section>
      <Footer />
    </main>
  );
}
