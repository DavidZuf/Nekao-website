// All product details are placeholders: replace names, prices and photos
// with the real drop 01 info. Each resident in a room points to a product id.

export const PRODUCTS = {
  'tee-cream': {
    id: 'tee-cream',
    name: '[Tee name] — Cream',
    color: 'Cream',
    swatch: '#ece5d6',
    logo: 'dark',
    price: '[PRICE]',
    details: '[Fabric, weight and fit. e.g. heavyweight cotton, boxy fit.]'
  },
  'tee-black': {
    id: 'tee-black',
    name: '[Tee name] — Black',
    color: 'Black',
    swatch: '#141412',
    logo: 'cream',
    price: '[PRICE]',
    details: '[Fabric, weight and fit.]'
  },
  'tee-olive': {
    id: 'tee-olive',
    name: '[Tee name] — Olive',
    color: 'Washed olive',
    swatch: '#5d6448',
    logo: 'cream',
    price: '[PRICE]',
    details: '[Fabric, weight and fit.]'
  },
  'tee-soleil': {
    id: 'tee-soleil',
    name: '[Tee name] — Soleil',
    color: 'White, martini & sun print',
    swatch: '#f4efe6',
    logo: 'dark',
    price: '[PRICE]',
    details: '[Fabric, weight and fit.] Daisy wears it boxy, tucked into wide trousers, over a sheer long sleeve.'
  },
  'tee-stripe': {
    id: 'tee-stripe',
    name: '[Tee name] — Stripe',
    color: 'White, striped print',
    swatch: '#f4efe6',
    logo: 'dark',
    price: '[PRICE]',
    details: '[Fabric, weight and fit.] Worn oversized, belted over a pleated mini skirt.'
  },
  'tee-grey': {
    id: 'tee-grey',
    name: '[Tee name] — Ash',
    color: 'Ash grey',
    swatch: '#8e8a83',
    logo: 'dark',
    price: '[PRICE]',
    details: '[Fabric, weight and fit.]'
  }
};

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Rooms: rectangles on the floor plan (metres). `spawn` = where you land
// after fast travel [x, z, yaw]. `view` = optional fixed camera for the
// phone room-swipe (otherwise it looks from `spawn` toward the residents).
// In the real version the 3D apartment comes from a scan.
export const ROOMS = [
  { id: 'hall', name: 'Entrance hall', rect: [-2, 0, 2, 4], spawn: [0, 3.3, 0] },
  { id: 'living', name: 'Living room', rect: [-7, -7, 2, 0], spawn: [-2.5, -0.6, 0], view: [-0.8, -0.1, 0.5] },
  { id: 'kitchen', name: 'Kitchen', rect: [2, -7, 8, 0], spawn: [2.8, -3.3, -Math.PI / 2] },
  { id: 'bedroom', name: 'Bedroom', rect: [2, 0, 8, 6], spawn: [2.8, 2, -Math.PI / 2] },
  { id: 'balcony', name: 'Balcony', rect: [-7, 0, -2, 3], spawn: [-4.5, 0.5, Math.PI], outdoor: true }
];

// The residents: models standing in the apartment wearing NEKAO.
// Names and lines are placeholders — write the real ones with the models.
// Keep it to two short lines each: people came to see the tee.
// pos = [x, z] on the floor plan, face = direction they look (radians).
// cutscene = optional video of the model talking (plays instead of the
// in-engine scene), e.g. '/cutscenes/ines.mp4'.
export const MODELS = [
  {
    id: 'ines', name: '[Inès]', room: 'hall', pos: [1.2, 1.4], face: -Math.PI / 2,
    product: 'tee-cream', skin: '#c9a387', hair: '#2a1d14',
    lines: [
      'Oh, hey. You just walked in like you live here.',
      'This one? Cream. I wear it every time I get home.'
    ]
  },
  {
    id: 'david', name: 'David', room: 'hall', pos: [-1.3, 0.6], face: 0.6,
    // standing cut-out (1.85 m), in front of the 'you can smoke inside' neon;
    // tip = the lit end of his cigarette, so the 3D smoke rises from it
    cutout: { src: '/david.png', w: 591, h: 1745, scale: 1.85 / 1737, anchor: [300, 1740], tip: [440, 130] },
    product: 'tee-black',
    // he stops you if you walk past him (see Experience: the intercept)
    intercept: 'Hey. Hey! You walked straight past me.',
    greeting: 'Nobody gets into this apartment without saying hi. So. Hi.',
    lines: [
      'Read the sign. I put it there.',
      'All black, every night. It never asks me to explain myself.'
    ]
  },
  {
    id: 'daisy', name: 'Daisy', room: 'living', pos: [-3.95, -3.7], face: 0.4,
    // standing cut-out of the illustration (1.8 m tall), feet on the floor
    cutout: { src: '/daisy.png', w: 619, h: 1526, scale: 1.8 / 1526, anchor: [446, 1526], tip: [23, 250] },
    product: 'tee-soleil',
    lines: [
      'Darling, you\'re standing in my light.',
      'The tee? NEKAO, obviously. The only sun I let near me after midnight.'
    ]
  },
  {
    id: 'gigi', name: '[Gigi]', room: 'living', pos: [-1.75, -5.05], face: 0, eye: 1.12, reach: 3.1,
    // sitting cut-out on the pink sofa: seat contact at the sofa's seat height
    cutout: { src: '/gigi.png', w: 925, h: 1277, scale: 0.44 / 388, anchor: [401, 889], anchorY: 0.44, tip: [274, 314], turn: 0.45, shadow: [0.45, 0.12, 0.28] },
    product: 'tee-stripe',
    lines: [
      'Mm. You found the good sofa.',
      'Wear this one with boots, never with sneakers. Trust me.'
    ]
  },
  {
    id: 'vera', name: '[Vera]', room: 'kitchen', pos: [3.9, -2.4], face: Math.PI,
    // standing cut-out (1.8 m tall), in front of the island counter
    cutout: { src: '/vera.png', w: 465, h: 1379, scale: 1.8 / 1379, anchor: [130, 1379] },
    product: 'tee-stripe',
    lines: [
      'You\'re just in time. I opened the good bottle.',
      'This tee goes with red wine and bad decisions.'
    ]
  },
  {
    id: 'camille', name: '[Camille]', room: 'bedroom', pos: [4, 4.4], face: Math.PI,
    product: 'tee-grey', skin: '#d9b08c', hair: '#3a2416',
    lines: [
      'Two minutes, I\'m almost ready.',
      'Ash grey goes with everything. That\'s why I\'m always late: I never have to choose.'
    ]
  },
  {
    id: 'rouge', name: '[Rouge]', room: 'balcony', pos: [-4.1, 2.3], face: Math.PI,
    // standing cut-out (1.75 m tall), red heels on the balcony floor
    cutout: { src: '/rouge.png', w: 677, h: 1569, scale: 1.75 / 1552, anchor: [300, 1560] },
    product: 'tee-stripe',
    lines: [
      'Close the door behind you, the city is louder than the party.',
      'White tee, red heels. Paris does the rest.'
    ]
  },
  {
    id: 'nael', name: '[Naël]', room: 'balcony', pos: [-6.1, 2.0], face: Math.PI,
    product: 'tee-black', skin: '#7a5640', hair: '#141412',
    lines: [
      'Best view in the building. Don\'t tell the others.',
      'This one\'s for nights like this. Black, heavy, quiet.'
    ]
  }
];

// Who wears a product, and in which room (for "seen in" labels and links).
export const wornBy = (productId) =>
  MODELS.filter((m) => m.product === productId).map((m) => ({ model: m, room: ROOMS.find((r) => r.id === m.room) }));

export const residentsIn = (roomId) => MODELS.filter((m) => m.room === roomId);

// A fixed camera that frames a room's residents [x, z, yaw].
export const roomView = (room) => {
  if (room.view) return room.view;
  const [x, z] = room.spawn;
  const who = residentsIn(room.id);
  if (!who.length) return room.spawn;
  const tx = who.reduce((a, m) => a + m.pos[0], 0) / who.length;
  const tz = who.reduce((a, m) => a + m.pos[1], 0) / who.length;
  return [x, z, Math.atan2(-(tx - x), -(tz - z))];
};

// A resident's name without the [placeholder] brackets (for handwriting).
export const nameOf = (m) => m.name.replace(/[[\]]/g, '');
