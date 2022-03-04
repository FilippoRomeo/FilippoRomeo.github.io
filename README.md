# Lip shaping

A Three.js site using Vite and openAPI to request info about the user location.

The website shows what appear to be static square shapes in a sky-like environment, if we turn or move in our fixed point, we can see the shaps moving, and a glitch effect appear. It sends a get request to freeGeoIP.app, which returns a JSON document containing information relative to the user's location (lat and long). The library suncalc.js is used to calculate the sun position and place it in the scene so that when the page is accessed, we can see the sun set in a different part. The site is not mobile/location coordinate proof, but it can display the information.

To install and start the master (ES6) branch

Due to poor result of the sunCalc library, I opted to write my own way to calculate the altitude and azimuth. [Reference](https://stackoverflow.com/questions/8708048/position-of-the-sun-given-time-of-day-latitude-and-longitude)]

```bash
git clone https://github.com/FilippoRomeo/FilippoRomeo.github.io
cd FilippoRomeo.github.io
npm i
npm start dev
```

Visit localhost:3000

[View example on github](https://filipporomeo.github.io/)