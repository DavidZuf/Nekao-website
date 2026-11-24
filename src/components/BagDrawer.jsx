export default function BagDrawer({ open, items, onClose, onRemove }) {
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Your bag">
        <div className="drawer-top">
          <h2 style={{ margin: 0 }}>Your bag</h2>
          <button type="button" className="close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {items.length === 0 ? (
          <p className="details">Empty for now. Go meet the residents.</p>
        ) : (
          <ul className="bag-list">
            {items.map((it, i) => (
              <li key={`${it.product.id}-${it.size}-${i}`}>
                <span className="bag-swatch" style={{ background: it.product.swatch }} />
                <span className="bag-name">{it.product.name}<small>Size {it.size}</small></span>
                <button type="button" className="link link--dark" onClick={() => onRemove(i)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn btn--dark" disabled={!items.length}>
          Checkout (connect Shopify / Stripe)
        </button>
      </aside>
    </>
  );
}
