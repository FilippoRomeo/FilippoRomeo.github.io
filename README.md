# Lip Shaping / Spatial WebGL Study

An early browser-based 3D experiment combining **Three.js, viewer movement, geolocation, solar position, and visual distortion**.

The scene presents geometric forms that initially read as static. As the viewing angle changes, their spatial relationship shifts and a glitch-like image emerges. Location and time are also used to influence the position of the sun in the scene.

[View the experiment](https://filipporomeo.github.io/)

## Concept

```text
viewer movement ──────────────┐
                              ├──► Three.js scene ──► shifting spatial image
location + time ─► sun model ─┘
```

The project explores two related ideas:

1. an image can be distributed across space rather than placed on a flat surface;
2. the same scene can behave differently depending on the viewer's position, geographic location, and time.

## Spatial behaviour

The composition uses separate square forms positioned in 3D. From some angles they appear disconnected; from others their relationship becomes legible. Changing the camera orientation therefore changes the image rather than simply changing the view of it.

## Location and sunlight

The original implementation requested approximate latitude and longitude from a geolocation service and used solar-position calculations to place the sun in the scene.

After testing SunCalc, the project also explored calculating solar altitude and azimuth directly.

Because this is an older experiment, external geolocation services referenced by the original implementation may no longer behave exactly as they did when it was built.

## Stack

`JavaScript` `Three.js` `WebGL` `Vite` `geolocation` `solar-position calculations`

## Run locally

```bash
git clone https://github.com/FilippoRomeo/FilippoRomeo.github.io.git
cd FilippoRomeo.github.io
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Context

This repository is part of my earlier creative-computing work around spatial interfaces, browser-based 3D, perspective, and systems whose visual output changes with environmental input.

## Status

Historical experiment. The repository is kept public as part of the progression towards my more recent realtime 3D and interactive-web work.
