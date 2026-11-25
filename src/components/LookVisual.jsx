import { wornBy } from '../data.js';
import TeeVisual from './TeeVisual.jsx';

// The resident wearing the tee, lit like the apartment. Falls back to the
// flat tee drawing for residents who don't have artwork yet.
export default function LookVisual({ product, teeSize = 160, roomName, who }) {
  const art = wornBy(product.id).filter((w) => w.model.cutout);
  // the person you clicked; else whoever is in your room; else anyone
  const look = art.find((w) => w.model.id === who) || art.find((w) => w.room.name.toLowerCase() === roomName) || art[0];
  return (
    <div className={`look ${look ? '' : 'look--flat'}`}>
      {look
        ? <img src={look.model.cutout.src} alt={`${look.model.name} wearing ${product.name}`} />
        : <TeeVisual product={product} size={teeSize} />}
    </div>
  );
}
