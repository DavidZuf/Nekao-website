import { useCallback, useState } from 'react';
import Header from './components/Header.jsx';
import Entrance from './components/Entrance.jsx';
import Experience from './components/Experience.jsx';
import Shop from './components/Shop.jsx';
import ProductDrawer from './components/ProductDrawer.jsx';
import BagDrawer from './components/BagDrawer.jsx';
import { PRODUCTS } from './data.js';

export default function App() {
  const [screen, setScreen] = useState('entrance'); // entrance | tour | shop
  const [room, setRoom] = useState(null);
  const [productId, setProductId] = useState(null);
  const [bag, setBag] = useState([]);
  const [bagOpen, setBagOpen] = useState(false);
  const onRoomChange = useCallback((r) => setRoom(r), []);

  return (
    <>
      <Header
        center={screen === 'tour' && room ? <><span className="eyebrow">Apt. 01</span><strong>{room.name}</strong></> : null}
        onHome={() => setScreen('entrance')}
        onShop={() => setScreen('shop')}
        onBag={() => setBagOpen(true)}
        bagCount={bag.length}
        dark={screen === 'shop'}
      />

      {screen === 'entrance' && <Entrance onEnter={() => setScreen('tour')} onShop={() => setScreen('shop')} />}
      {screen === 'tour' && <Experience onRoom={onRoomChange} onShowTee={setProductId} drawerOpen={!!productId || bagOpen} />}
      {screen === 'shop' && <Shop onOpen={setProductId} onTour={() => setScreen('tour')} />}

      <ProductDrawer
        product={productId ? PRODUCTS[productId] : null}
        roomName={screen === 'tour' && room ? room.name.toLowerCase() : null}
        onClose={() => setProductId(null)}
        onAdd={(product, size) => setBag((b) => [...b, { product, size }])}
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
