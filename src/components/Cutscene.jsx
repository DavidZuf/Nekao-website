import { useEffect, useRef, useState } from 'react';

// GTA-style cinematic: black bars, name, typed-out subtitles. The choices
// show from the start, so you can shop the look without reading every line.
// If the model has a `cutscene` video, it plays instead of the subtitles.
export default function Cutscene({ model, product, ready, onShowTee, onClose }) {
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState('');
  const [extra, setExtra] = useState(null);
  const [videoDone, setVideoDone] = useState(false);
  const videoRef = useRef(null);

  const lines = extra ? [extra] : model.lines;
  const full = lines[line] || '';
  const finished = model.cutscene && !extra ? videoDone : line >= lines.length - 1 && typed === full;

  // typewriter
  const timer = useRef(null);
  useEffect(() => {
    if (!ready || (model.cutscene && !extra)) return;
    setTyped('');
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(timer.current);
    }, 28);
    return () => clearInterval(timer.current);
  }, [full, ready, model.cutscene, extra]);

  const advance = () => {
    if (!ready) return;
    if (typed !== full) { clearInterval(timer.current); setTyped(full); return; }
    if (line < lines.length - 1) setLine(line + 1);
  };

  const choose = (n) => {
    if (n === 1) onShowTee();
    if (n === 2) { setExtra(`${product.name}. ${product.details}`); setLine(0); }
    if (n === 3) onClose();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === 'Escape') onClose();
      else if (ready && ['1', '2', '3'].includes(e.key)) choose(Number(e.key));
      else if (['Enter', ' ', 'e', 'E'].includes(e.key)) { e.preventDefault(); advance(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className={`cutscene ${ready ? 'is-ready' : ''}`} onClick={advance}>
      <div className="bar bar--top" />
      <div className="bar bar--bottom" />

      {model.cutscene && !extra && ready && (
        <video
          ref={videoRef}
          className="cutscene-video"
          src={model.cutscene}
          autoPlay
          playsInline
          onEnded={() => setVideoDone(true)}
        />
      )}

      {ready && (
        <div className="subtitle">
          <div className="speaker">{model.name}</div>
          {!(model.cutscene && !extra) && <p>{typed}<span className="caret" /></p>}
          <div className="choices" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => choose(1)}><kbd>1</kbd> Shop the look</button>
            <button type="button" onClick={() => choose(2)}><kbd>2</kbd> Tell me about it</button>
            <button type="button" onClick={() => choose(3)}><kbd>3</kbd> Later</button>
          </div>
          {!finished && <div className="skip-hint">Enter / click for more · Esc to leave</div>}
        </div>
      )}
    </div>
  );
}
