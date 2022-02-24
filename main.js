import * as THREE from '/node_modules/three';
import moment from 'moment-timezone';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from '/node_modules/three/examples/jsm/postprocessing/GlitchPass.js';

import { GUI } from '/node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import { Sky } from '/node_modules/three/examples/jsm/objects/Sky.js';

let camera, scene, renderer, composer;
let object, light;
let glitchPass;
let sky, sun;
let mouseX = 0,
    mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

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
                console.log(1)
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
    let result = await makeRequest("GET", "http://ip-api.com/json/");
    // code below here will only execute when await makeRequest() finished loading
    result = JSON.parse(result);
    htmlhandler(result)
    initSky(result);
}

function htmlhandler(result) {
    document.getElementById("position").innerHTML = result.city + ", " + result.country + " " + result.countryCode;
    document.getElementById("region").innerHTML = result.zip + " " + result.regionName + " " + result.region;
    document.getElementById("lat&lon").innerHTML = result.lat + "," + result.lon + " " + result.timezone;
    document.getElementById("isp&org").innerHTML = result.isp + " " + result.org;
    document.getElementById("status").innerHTML = result.query + " " + result.status;
}

function initSky(data) {

    //TODO function update clock realtime

    var d = new Date();
    var m = new Date(moment(d, 'MMMM DD, YYYY HH:mm:ss'));


    //TODO SunCalc time function to update effect based on the period (morning, evening night) 
    var times = SunCalc.getTimes(new Date(), data.lat, data.lon);
    let dusk = SunCalc.getPosition(times.dusk, data.lat, data.lon);

    //sun position
    var sunPos = SunCalc.getPosition(m, data.lat, data.lon);

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
    const geometry = new THREE.SphereGeometry(1, 4, 4);


    for (let i = 0; i < 100; i++) {

        const material = new THREE.MeshPhongMaterial({ color: Math.random(), flatShading: true });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(Math.random() - 0.5, Math.random() - 0.25, Math.random() - 0.3).normalize();
        mesh.position.multiplyScalar(Math.random() * 40000);
        mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
        object.add(mesh);

    }

    scene.add(new THREE.AmbientLight(0x222222));

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.body.appendChild(renderer.domElement);

    // postprocessing

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    glitchPass = new GlitchPass();
    composer.addPass(glitchPass);


    const helper = new THREE.GridHelper(10000, 5, 0xffffff, 0xffffff);
    scene.add(helper);


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    //controls.maxPolarAngle = Math.PI / 2;
    controls.enableZoom = true;
    controls.enablePan = true;



    doAjaxThings();
    animate();
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
    requestAnimationFrame(animate) * 0.5;


    renderer.render(scene, camera);
}


function onPointerMove(event) {

    if (event.isPrimary === false) return;

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

}

function animate() {


    //requestAnimationFrame(animate);

    object.rotation.x += 0.005;
    object.rotation.y += 0.001;

    composer.render();

}