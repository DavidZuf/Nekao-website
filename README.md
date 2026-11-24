# NEKAO — The Apartment (interactive prototype)

Walk through the NEKAO apartment like a video game. Models wearing NEKAO
stand in every room. Walk up to one, press **E**, and a cinematic starts:
they talk, and you can open their tee and add it to the bag.
The drone flight (one continuous take) plays as the intro and as fast travel.

Everything you see is a placeholder: simple 3D shapes and a grey test flight.

## Run it

Node.js 18+ (https://nodejs.org), then:

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

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
| 1 2 3 | Choose: show me the tee / tell me about it / later |
| M | Map → fast travel (the drone flies you there) |
| Esc | Leave a conversation / skip the flight |

On phones: on-screen arrows + drag to look, tap the "Talk" button.

## How it fits together

| Part | File |
| --- | --- |
| Tees, rooms, models, their lines, flight timestamps | `src/data.js` ← edit this first |
| The 3D apartment (placeholder shapes) | `src/world/apartment.js` |
| The models (placeholder figures) | `src/world/model.js` |
| Walking, collisions, cinematic camera | `src/world/World.jsx` |
| Conversation (black bars, subtitles, choices) | `src/components/Cutscene.jsx` |
| Drone flight intro + fast travel | `src/components/FlightPlayer.jsx` |
| Glues it all together (E to talk, map) | `src/components/Experience.jsx` |
| Tee panel, bag, shop grid, landing page | `src/components/` |

## Making it real

1. **The flight**: replace `public/tour/flight.mp4` with the real FPV drone flight
   (one take, door → every room). In `src/data.js`, set each room's `stop` to the
   second the drone arrives in that room.
2. **The apartment + models**: scan the real apartment with the models standing
   frozen inside it (Gaussian splat scan: Polycam, Luma, Scaniverse, or a drone).
   The scan replaces `buildApartment` / `buildModel`; walking, talking and
   cinematics keep working on top of it.
3. **The conversations**: write real lines per model in `src/data.js` (`lines`),
   or film each model talking to camera and set `cutscene: '/cutscenes/<name>.mp4'`
   to play that video as the cinematic instead.
4. **Shop**: connect the bag's checkout to Shopify or Stripe.
