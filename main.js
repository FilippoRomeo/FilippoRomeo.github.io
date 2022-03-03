import * as THREE from "https://cdn.skypack.dev/three@0.132.2";

import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/GlitchPass.js";
import { GUI } from 'https://unpkg.com/three@0.138.0/examples/jsm/libs/lil-gui.module.min.js';
import { Sky } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/objects/Sky.js";



// import * as THREE from 'three';

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';

// import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { Sky } from 'three/examples/jsm/objects/Sky.js';

let camera, scene, renderer, composer;
let object, light;
let glitchPass;
let sky, sun;
let mouseX = 0,
    mouseY = 0;

init();
render();

function makeRequest(method, url) {
    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                document.getElementById("position").innerHTML = "Sorry there is a problem.\n Please notify the owner";
                document.getElementById("fail").innerHTML = xhr.status + " " + xhr.statusText;
                console.log(xhr)
            }
        };
        xhr.onerror = function() {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

async function doAjaxThings() {
    // await code here
    //http://ip-api.com/json/ https not free 
    let result = await makeRequest("GET", "https://freegeoip.app/json/");
    // code below here will only execute when await makeRequest() finished loading
    if (result) {
        console.log(result)
        console.log(typeof(result))
        result = JSON.parse(result);
        console.log(result);

        htmlhandler(result)
        initSky(result)
    };
}

function htmlhandler(result) {
    document.getElementById("position").innerHTML = result.city + ", " + result.country_name + " " + result.country_code;
    document.getElementById("region").innerHTML = result.zip_code + " " + result.region_name + " " + result.region_code;
    document.getElementById("lat&lon").innerHTML = result.latitude + "," + result.longitude + " " + result.time_zone;
    document.getElementById("status").innerHTML = result.ip + " ";
}

//handle if ccoord missing/api requuest

function failhtmlhandler(result) {
    document.getElementById("position").innerHTML = result.city + ", " + result.country + " " + result.countryCode;
    document.getElementById("region").innerHTML = result.zip + " " + result.regionName + " " + result.region;
    document.getElementById("lat&lon").innerHTML = result.lat + "," + result.lon + " " + result.timezone;
    document.getElementById("isp&org").innerHTML = result.isp + " " + result.org;
    document.getElementById("status").innerHTML = result.query + " " + result.status;
}

function sunPosition(lat, long, date) {
    const pi = Math.PI
    const twopi = 2 * pi;
    const deg2rad = pi / 180;

    const ndate = new Date(date)

    // Get Julian
    function getJulian(date) {
        return (date / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
    };

    var julian = getJulian(ndate); //get Julian date

    // The input to the Atronomer's almanach is the difference between
    // the Julian date and JD 2451545.0 (noon, 1 January 2000)

    let time = julian - 51545.;
    let hour = ndate.getHours();

    //Mean longitude

    let mnlong = 280.460 + (0.9856474 * time);
    mnlong = mnlong % 360
    if (mnlong < 0) { mnlong = mnlong + 360 };

    // Mean anomaly

    let mnanom = 357.528 + (0.9856474 * time);
    mnanom = mnanom % 360;
    if (mnanom < 0) { mnanom = mnanom + 360 };
    mnanom = mnanom * deg2rad;

    //Ecliptic longitude and obliquity of ecliptic

    let eclong = mnlong + (1.915 * Math.sin(mnanom)) + (0.020 * Math.sin(2 * mnanom))
    eclong = eclong % 360;
    if (eclong < 0) { eclong = eclong + 360 };
    let oblqec = 23.429 - (0.0000004 * time);
    eclong = eclong * deg2rad;
    oblqec = oblqec * deg2rad;

    //Celestial coordinates
    //Right ascension and declination
    let num = Math.cos(oblqec) * Math.sin(eclong);
    let den = Math.cos(eclong);
    let ra = Math.atan(num / den);
    if (den < 0) { ra = ra + pi };
    if (den >= 0 && num < 0) { ra = ra + twopi };
    let dec = Math.asin(Math.sin(oblqec) * Math.sin(eclong));


    //    Local coordinates
    //    Greenwich mean sidereal time
    let gmst = 6.697375 + .0657098242 * time + hour;
    gmst = gmst % 24;
    if (gmst < 0) { gmst = gmst + 24 };

    //    Local mean sidereal time
    let lmst = gmst + (long / 15);
    lmst = lmst % 24.
    if (lmst < 0) { lmst + 24.0 };
    lmst = lmst * 15.0 * deg2rad;

    //Hour angle
    let ha = lmst - ra;
    if (ha < -pi) { ha = ha + twopi };
    if (ha > pi) { ha = ha - twopi };

    // convert degree to radiants 
    lat = lat * deg2rad;

    //Azimuth and elevation
    let el = Math.asin(((Math.sin(dec) * Math.sin(lat)) + (Math.cos(dec) * Math.cos(lat) * Math.cos(ha))));
    let az = Math.asin((-Math.cos(dec) * Math.sin(ha) / Math.cos(el)));


    let cosAzPos;
    let sinAzNeg;
    if (Math.sin(dec) >= 0) { cosAzPos = Math.sin(dec) - Math.sin(el) * Math.sin(lat) }
    if (Math.sin(az) < 0) { sinAzNeg = Math.sin(az) < 0 }
    if (cosAzPos && sinAzNeg) { az = az + twopi }
    if (!cosAzPos) { az = pi - az }

    var result = {
        azimuth: az / deg2rad,
        altitude: el / deg2rad,
        latitude: lat / deg2rad
    }

    return (result)

}


function initSky(data) {

    //TODO function update clock realtime
    //TODO SunCalc time function to update effect based on the period (morning, evening night) 


    var sunPos = sunPosition(data.latitude, data.longitude, new Date(), );

    console.log(data.latitude);
    console.log(data.longitude);


    console.log(sunPos);


    //Sky
    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);
    sun = new THREE.Vector3();

    //GUI

    const effectController = {
        turbidity: 20,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        elevation: sunPos.altitude,
        azimuth: sunPos.azimuth,
        exposure: renderer.toneMappingExposure
    };

    function guiChanged() {

        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = effectController.turbidity;
        uniforms['rayleigh'].value = effectController.rayleigh;
        uniforms['mieCoefficient'].value = effectController.mieCoefficient;
        uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(effectController.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        uniforms['sunPosition'].value.copy(sun);

        renderer.toneMappingExposure = effectController.exposure;
        renderer.render(scene, camera);

    }

    const gui = new GUI();


    gui.add(effectController, 'turbidity', 0.0, 20.0, 0.1).onChange(guiChanged);
    gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged);
    gui.add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(guiChanged);
    gui.add(effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(guiChanged);
    gui.add(effectController, 'elevation', 0, 90, 0.1).onChange(guiChanged);
    gui.add(effectController, 'azimuth', -180, 180, 0.1).onChange(guiChanged);
    gui.add(effectController, 'exposure', 0, 1, 0.0001).onChange(guiChanged);

    guiChanged();

}

function init() {

    //const url = 'https://geolocation-db.com/json';

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 100, 2000000);
    camera.position.set(0, 200, 2000);

    scene = new THREE.Scene();

    object = new THREE.Object3D();
    scene.add(object);
    //objects
    let geometry;

    //random word generator, twitter api 
    for (let i = 0; i < 100; i++) {

        geometry = new THREE.WireframeGeometry(new THREE.BoxBufferGeometry(Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1, ), 8);

        var rcolor = Math.floor(Math.random() * 16777215).toString(16);

        const material = new THREE.LineBasicMaterial({ color: "#" + rcolor, flatShading: true });

        const mesh = new THREE.LineSegments(geometry, material);
        mesh.position.set(Math.random() - 0.5, Math.random() - 0.25, Math.random() - 0.3).normalize();
        mesh.position.multiplyScalar(Math.random() * 4000);
        mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
        object.add(mesh);

    }

    // light to be fixed

    scene.add(new THREE.AmbientLight(0x222222));

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5 * Math.random();
    document.body.appendChild(renderer.domElement);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    glitchPass = new GlitchPass();
    composer.addPass(glitchPass);

    // const helper = new THREE.GridHelper(10000, 5, 0xffffff, 0xffffff);
    // scene.add(helper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    //controls.maxPolarAngle = Math.PI / 2;
    controls.enableZoom = false;
    controls.enablePan = false;


    doAjaxThings();
    window.addEventListener('resize', onWindowResize);


}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}

function render() {

    const time = Date.now() * 0.00005;

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;

    camera.lookAt(scene.position);
    requestAnimationFrame(animate);


    renderer.render(scene, camera);
}


function animate() {


    //requestAnimationFrame(animate);
    object.rotation.x += 0.005;
    object.rotation.y += 0.001;

    composer.render();

}