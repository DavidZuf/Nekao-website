import { useEffect } from 'react';
import { SIZES } from '../data.js';
import Footer from './Footer.jsx';

export default function Help() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <main className="page">
      <section className="section section--top help">
        <p className="eyebrow">Help</p>
        <h1 className="page-title">Good to know</h1>

        <div id="size-guide" className="help-block">
          <h2>Size guide</h2>
          <table className="size-table">
            <thead><tr><th>Size</th>{SIZES.map((s) => <th key={s}>{s}</th>)}</tr></thead>
            <tbody>
              <tr><td>Chest (cm)</td>{SIZES.map((s) => <td key={s}>[ ]</td>)}</tr>
              <tr><td>Length (cm)</td>{SIZES.map((s) => <td key={s}>[ ]</td>)}</tr>
            </tbody>
          </table>
          <p>[Fit note, e.g. boxy fit: take your usual size, or one down for a closer fit.]</p>
        </div>
        <div id="shipping" className="help-block">
          <h2>Shipping</h2>
          <p>[Where you ship, how long it takes, what it costs, free shipping threshold.]</p>
        </div>
        <div id="returns" className="help-block">
          <h2>Returns</h2>
          <p>[Returns window, condition, how to start a return, who pays shipping.]</p>
        </div>
        <div id="contact" className="help-block">
          <h2>Contact</h2>
          <p>[Email address and Instagram for questions.]</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
