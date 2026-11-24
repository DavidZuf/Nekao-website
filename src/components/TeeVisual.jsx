// Placeholder tee drawing in the product's colour. Swap for product photos.
export default function TeeVisual({ product, size = 160 }) {
  return (
    <>
      <svg width={size} height={size * 0.9} viewBox="0 0 200 180" aria-hidden="true">
        <path d="M50 20 L150 20 L190 60 L162 84 L148 70 L148 170 L52 170 L52 70 L38 84 L10 60 Z" fill={product.swatch} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      </svg>
      <img
        className="tee-logo"
        style={{ width: size * 0.19, height: size * 0.19 }}
        src={product.logo === 'dark' ? '/logo_dark.png' : '/logo_cream.png'}
        alt=""
      />
    </>
  );
}
