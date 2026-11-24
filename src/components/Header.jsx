export default function Header({ center, onHome, onShop, onBag, bagCount, dark }) {
  return (
    <header className={`header ${dark ? 'header--solid' : ''}`}>
      <button type="button" className="brand" onClick={onHome}>
        <img src="./logo_cream.png" alt="" />
        <span>NEKAO</span>
      </button>
      <div className="header-center">{center}</div>
      <nav className="header-nav">
        <button type="button" className="link" onClick={onShop}>Shop all</button>
        <button type="button" className="link" onClick={onBag}>Bag ({bagCount})</button>
      </nav>
    </header>
  );
}
