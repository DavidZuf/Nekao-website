import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { usePath } from './router.jsx';
import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import Shop from './components/Shop.jsx';
import ProductPage from './components/ProductPage.jsx';
import About from './components/About.jsx';
import Help from './components/Help.jsx';
import ProductDrawer from './components/ProductDrawer.jsx';
import BagDrawer from './components/BagDrawer.jsx';
import { PRODUCTS, ROOMS } from './data.js';

// The 3D apartment (three.js) only downloads when someone goes in,
// so the shop pages stay fast.
const Experience = lazy(() => import('./components/Experience.jsx'));

// The bag survives a reload (until checkout is connected to Shopify).
const loadBag = () => {
  try {
    return JSON.parse(localStorage.getItem('nekao-bag') || '[]')
      .filter((it) => PRODUCTS[it.id])
      .map((it) => ({ product: PRODUCTS[it.id], size: it.size }));
  } catch { return []; }
};

export default function App() {
  const path = usePath();
  const [room, setRoom] = useState(null);
  const [productId, setProductId] = useState(null);
  const [bag, setBag] = useState(loadBag);
  const [bagOpen, setBagOpen] = useState(false);
  const onRoomChange = useCallback((r) => setRoom(r), []);
  const add = useCallback((product, size) => setBag((b) => [...b, { product, size }]), []);

  useEffect(() => {
    try { localStorage.setItem('nekao-bag', JSON.stringify(bag.map((it) => ({ id: it.product.id, size: it.size })))); } catch { /* private mode */ }
  }, [bag]);
  useEffect(() => { setProductId(null); setBagOpen(false); }, [path]);

  const [, section, slug] = path.split('/');
  const inApartment = section === 'apartment';
  const startRoom = inApartment && ROOMS.some((r) => r.id === slug) ? slug : 'hall';

  let page;
  if (!section) page = <Home />;
  else if (inApartment) page = (
    <Suspense fallback={<main className="experience" />}>
      <Experience startRoom={startRoom} onRoom={onRoomChange} onShowTee={setProductId} drawerOpen={!!productId || bagOpen} />
    </Suspense>
  );
  else if (section === 'shop' && slug) page = <ProductPage key={slug} product={PRODUCTS[slug]} onAdd={add} />;
  else if (section === 'shop') page = <Shop />;
  else if (section === 'about') page = <About />;
  else if (section === 'help') page = <Help key={path} />;
  else page = <Home />;

  useEffect(() => {
    const product = section === 'shop' && slug && PRODUCTS[slug];
    document.title = product ? `${product.name} — NEKAO`
      : inApartment ? 'The Apartment — NEKAO'
      : section ? `${section[0].toUpperCase()}${section.slice(1)} — NEKAO`
      : 'NEKAO — The Apartment';
  }, [section, slug, inApartment]);

  return (
    <>
      <Header
        path={path}
        overlay={inApartment || !section}
        center={inApartment && room ? <><span className="eyebrow">Apt. 01</span><strong>{room.name}</strong></> : null}
        onBag={() => setBagOpen(true)}
        bagCount={bag.length}
      />

      {page}

      <ProductDrawer
        product={productId ? PRODUCTS[productId] : null}
        roomName={inApartment && room ? room.name.toLowerCase() : null}
        onClose={() => setProductId(null)}
        onAdd={add}
      />
      <BagDrawer
        open={bagOpen}
        items={bag}
        onClose={() => setBagOpen(false)}
        onRemove={(i) => setBag((b) => b.filter((_, j) => j !== i))}
      />
    </>
  );
}
