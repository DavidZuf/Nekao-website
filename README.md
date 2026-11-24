# NEKAO — The Apartment (interactive prototype)

A clothing shop with a walkable 3D apartment at its heart. Models wearing
NEKAO stand in every room. Walk up to one and hit **Shop the look**, or press
**E** to hear what they have to say first.

Pages: `/` home, `/shop`, `/shop/<tee-id>`, `/apartment` (or
`/apartment/<room-id>` to land in a room), `/about`, `/help`.

Product names, prices, photos and copy in [brackets] are placeholders.

## Run it

Node.js 18+ (https://nodejs.org), then:

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

When you host it, send every unknown path to `index.html` (Vercel and
Netlify call it a rewrite) so links like `/shop/tee-cream` work.

## Controls

| Key | Action |
| --- | --- |
| ↑ ↓ (or W S) | Walk forward / back |
| ← → | Turn |
| A D | Step sideways |
| Drag mouse | Look around |
| Shift | Run |
| E | Talk to the model in front of you |
| Enter / click | Next line in a conversation |
| 1 2 3 | Choose: shop the look / tell me about it / later |
| M | Map → jump to another room |
| Esc | Leave a conversation |

On phones: on-screen arrows + drag to look, tap the "Talk" button.

## How it fits together

| Part | File |
| --- | --- |
| Tees, rooms, models, their lines | `src/data.js` ← edit this first |
| The 3D apartment (placeholder shapes) | `src/world/apartment.js` |
| The models (placeholder figures) | `src/world/model.js` |
| Walking, collisions, cinematic camera | `src/world/World.jsx` |
| Conversation (black bars, subtitles, choices) | `src/components/Cutscene.jsx` |
| The apartment page (E to talk, map, room jumps) | `src/components/Experience.jsx` |
| Pages: home, shop, product, about, help | `src/components/` |
| Menu and footer | `src/components/Header.jsx`, `Footer.jsx` |
| Page addresses | `src/router.jsx`, `src/App.jsx` |

## Making it real

1. **The apartment + models**: scan the real apartment with the models standing
   frozen inside it (Gaussian splat scan: Polycam, Luma, Scaniverse, or a drone).
   The scan replaces `buildApartment` / `buildModel`; walking, talking and
   cinematics keep working on top of it.
2. **The conversations**: write real lines per model in `src/data.js` (`lines`),
   or film each model talking to camera and set `cutscene: '/cutscenes/<name>.mp4'`
   to play that video as the cinematic instead.
3. **Shop**: connect the bag's checkout and the newsletter form to Shopify.
4. **Copy**: fill in every [bracket]: prices, fabric, About, Help.
