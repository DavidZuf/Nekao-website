import { wornBy } from '../data.js';
import TeeVisual from './TeeVisual.jsx';

// The resident wearing the tee, lit like the apartment. Falls back to the
// flat tee drawing for residents who don't have artwork yet.
export default function LookVisual({ product, teeSize = 160, roomName }) {
  const art = wornBy(product.id).filter((w) => w.model.cutout);
  // prefer whoever is in the room you're standing in
  const look = art.find((w) => w.room.name.toLowerCase() === roomName) || art[0];
  return (
    <div className={`look ${look ? '' : 'look--flat'}`}>
      {look
        ? <img src={look.model.cutout.src} alt={`${look.model.name} wearing ${product.name}`} />
        : <TeeVisual product={product} size={teeSize} />}
    </div>
  );
}
