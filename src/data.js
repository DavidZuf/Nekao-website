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
    name: '[Tee name] — Vogue Paris × Jacquemus',
    color: 'White, martini & sun print',
    swatch: '#f4efe6',
    logo: 'dark',
    price: '[PRICE]',
    details: '[Fabric, weight and fit.] Daisy wears it boxy, tucked into wide trousers, over a sheer long sleeve.'
  },
  'tee-vogue-kith': {
    id: 'tee-vogue-kith',
    name: '[Tee name] — Vogue ♥ Kith',
    color: 'White, striped logo print',
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

// ---------------------------------------------------------------
// THE TOUR — one continuous flight (FPV drone / gimbal), no cuts.
// The site plays the flight and PAUSES at each room's `stop` (seconds
// into the video). Models are frozen, so the paused frame looks alive.
//
// Swap public/tour/flight.mp4 for your real flight, then set the stops.
// x / y = where each model's tag sits, in % of the video frame.
// ---------------------------------------------------------------
export const FLIGHT = {
  src: './tour/flight.mp4',
  poster: './tour/flight.jpg'
};

// Rooms: rectangles on the floor plan (metres). `stop` = when the flight
// video reaches this room. `spawn` = where you land after fast travel
// [x, z, yaw]. In the real version the 3D apartment comes from a scan.
export const ROOMS = [
  { id: 'hall', name: 'Entrance hall', stop: 2.4, rect: [-2, 0, 2, 4], spawn: [0, 3.3, 0] },
  { id: 'living', name: 'Living room', stop: 6.4, rect: [-7, -7, 2, 0], spawn: [-2.5, -0.6, 0] },
  { id: 'kitchen', name: 'Kitchen', stop: 10.4, rect: [2, -7, 8, 0], spawn: [2.8, -3.3, -Math.PI / 2] },
  { id: 'bedroom', name: 'Bedroom', stop: 14.5, rect: [2, 0, 8, 6], spawn: [2.8, 2, -Math.PI / 2] },
  { id: 'balcony', name: 'Balcony', stop: 18.5, rect: [-7, 0, -2, 3], spawn: [-4.5, 0.5, Math.PI], outdoor: true }
];

// The residents: models standing in the apartment wearing NEKAO.
// Names and lines are placeholders — write the real ones with the models.
// pos = [x, z] on the floor plan, face = direction they look (radians).
// cutscene = optional video of the model talking (plays instead of the
// in-engine scene), e.g. '/cutscenes/ines.mp4'.
export const MODELS = [
  {
    id: 'ines', name: '[Inès]', room: 'hall', pos: [1.2, 1.4], face: -Math.PI / 2,
    product: 'tee-cream', skin: '#c9a387', hair: '#2a1d14',
    lines: [
      'Oh, hey. You just walked in like you live here.',
      'Relax, everyone does. That\'s kind of the point of this place.',
      'This one? Cream. I wear it every time I get home.'
    ]
  },
  {
    id: 'daisy', name: 'Daisy', room: 'living', pos: [-3.95, -3.7], face: 0.4,
    // standing cut-out of the illustration (1.8 m tall), feet on the floor
    cutout: { src: './daisy.png', w: 619, h: 1526, scale: 1.8 / 1526, anchor: [446, 1526], tip: [23, 250] },
    product: 'tee-soleil',
    lines: [
      'Darling, you\'re standing in my light.',
      'Kidding. Stay. Just not on the pink side of the sofa, that one\'s mine.',
      'The tee? NEKAO, obviously. The only sun I let near me after midnight.'
    ]
  },
  {
    id: 'gigi', name: '[Gigi]', room: 'living', pos: [-1.75, -5.05], face: 0, eye: 1.12, reach: 3.1,
    // sitting cut-out on the pink sofa: seat contact at the sofa's seat height
    cutout: { src: './gigi.png', w: 925, h: 1277, scale: 0.44 / 388, anchor: [401, 889], anchorY: 0.44, tip: [274, 314], turn: 0.45, shadow: [0.45, 0.12, 0.28] },
    product: 'tee-vogue-kith',
    lines: [
      'Mm. You found the good sofa.',
      'Don\'t sit too close, I just got comfortable.',
      'This one\'s the Vogue and Kith tee. Wear it with boots, never with sneakers. Trust me.'
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
    id: 'nael', name: '[Naël]', room: 'balcony', pos: [-4.5, 2.2], face: Math.PI,
    product: 'tee-black', skin: '#7a5640', hair: '#141412',
    lines: [
      'Best view in the building. Don\'t tell the others.',
      'This one\'s for nights like this. Black, heavy, quiet.'
    ]
  }
];
