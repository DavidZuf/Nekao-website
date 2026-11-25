// The last frame of the peephole, shown over the apartment while its 3D
// starts up, so walking in from the homepage has no black gap.
let still = null;
export const giveFrame = (src) => { still = src ? { src, at: Date.now() } : null; };
export const takeFrame = () => {
  const s = still;
  still = null;
  return s && Date.now() - s.at < 4000 ? s.src : null;
};
