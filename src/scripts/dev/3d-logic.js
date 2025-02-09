import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xdddddd, 1);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 0, 5);
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

const loader = new GLTFLoader();
let model;
let originalColors = new Map();

const changeColor = document.querySelector('#changeColor');
const meshNameToChange = 'Circle003'

//////// Loading the 3D model ////////
loader.load('assets/models/armatura1_LOD0.glb',
    function (gltf) {
        model = gltf.scene;

        model.traverse((node) => {
            if (node.isMesh && node.material) {
                originalColors.set(node, node.material.color.clone());
            }
        });

        //////// Save original color and change it in Modal window ////////
        changeColor.addEventListener('click', function () {
            model.traverse((node) => {
                if (node.isMesh && node.material) {
                    if (node.name === meshNameToChange) {
                        if (node.material.color.equals(new THREE.Color(0x0000ff))) {
                            node.material.color.copy(originalColors.get(node));
                        } else {
                            node.material.color.set(0x0000ff);
                        }
                    }
                }
            });
        });

        scene.add(model);
    }, undefined, function (error) {
        console.error('Ошибка загрузки модели:', error);
    }
);

//////// Rotate and zoom ////////
const controls = new OrbitControls(camera, renderer.domElement);


//////// Move ////////
let isDragging = false;
let selectedObject = null;

function getIntersectedObject(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    return intersects.length > 0 ? model : null;
}

document.addEventListener('mousedown', function (event) {
    const intersectedObject = getIntersectedObject(event);
    if (intersectedObject) {
        isDragging = true;
        selectedObject = intersectedObject;
        controls.enableRotate = false;
    }
});

document.addEventListener('mouseup', function (event) {
    isDragging = false;
    selectedObject = null;
    controls.enableRotate = true;
});

document.addEventListener('mousemove', function (event) {
    if (isDragging && selectedObject) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);

        selectedObject.position.copy(intersection);
    }
});

//////// Show modal window ////////
const modalWindow = document.querySelector('#mw');

document.addEventListener('click', function (event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        modalWindow.classList.toggle("show-mw");
    }
});

//////// Render ////////
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

//////// Update when viewport changes ////////
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});