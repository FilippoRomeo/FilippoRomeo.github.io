# Lip Shaping

An experimental Three.js / WebGL study built with Vite. The scene combines spatial movement, glitch-like visual behaviour, geolocation, and solar-position calculations to make the environment respond to where and when it is viewed.

## Concept

The experience presents apparently static square forms inside a sky-like environment. As the viewer moves or changes orientation, the spatial relationship between those forms shifts and visual distortion appears.

The original implementation also requested approximate latitude and longitude from a geolocation service, then used solar-position calculations to place the sun differently depending on location and time. After experimenting with SunCalc, the project also explored a custom altitude / azimuth calculation.

This is an older creative-coding experiment, so third-party services referenced by the original implementation may no longer behave exactly as they did when it was built.

## Stack

- Three.js
- Vite
- JavaScript
- WebGL
- geolocation data
- solar-position calculations

## Run locally

```bash
git clone https://github.com/FilippoRomeo/FilippoRomeo.github.io.git
cd FilippoRomeo.github.io
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

## Live experiment

https://filipporomeo.github.io/

## Why it is here

The repository is part of my earlier creative-computing work around browser-based spatial experiences, location-aware visuals, and perceptual distortion with realtime 3D.
