# Lip shaping

A Three.js site using Vite and openAPI to request info about the user location.

When the page is load it shows static square shapes, if we turn or move in our fixed point we can see the shaps moving and glitch effect appear. It sends a get request to freegeoip.app which return a jeson document containg information relative to the location (lat and long) of te user. Then thhe library suncalc.jsis used to calcullate the sun postion and place it in the scene, that that whene the page is accessed we can see the sun placed in different position. 
The site is not mobile/location coordinate proof but it can still display the informations.

To install and start the master (ES6) branch

```bash
git clone https://github.com/FilippoRomeo/FilippoRomeo.github.io
cd FilippoRomeo.github.io
npm i
npm start dev
```

Visit localhost:3000

[View example on github](https://filipporomeo.github.io/)