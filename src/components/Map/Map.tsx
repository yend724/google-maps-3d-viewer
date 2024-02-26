import { useEffect, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ENV } from '../../config/env';

const mapOptions = {
  mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
  center: { lat: 35.7100627, lng: 139.8107004 },
  zoom: 18,
  disableDefaultUI: true,
  heading: 25,
  tilt: 60,
};
export const Map = () => {
  return (
    <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <MyMap />
    </Wrapper>
  );
};

const MyMap = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const initWebGLOverlayView = (map: google.maps.Map) => {
      let renderer: THREE.WebGLRenderer;
      let scene: THREE.Scene;
      let camera: THREE.PerspectiveCamera;
      const webGLOverlayView = new google.maps.WebGLOverlayView();
      webGLOverlayView.onAdd = () => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera();
        scene.add(camera);
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0.5, -1, 0.5);
        scene.add(directionalLight);

        const loader = new GLTFLoader();
        loader.load(`${ENV.BASE_DIR}/assets/book.gltf`, gltf => {
          gltf.scene.scale.set(100, 100, 100);
          gltf.scene.position.z = 0;
          gltf.scene.rotation.x = (90 * Math.PI) / 180;
          scene.add(gltf.scene);
        });
      };
      webGLOverlayView.onContextRestored = ({ gl }) => {
        renderer = new THREE.WebGLRenderer({
          canvas: gl.canvas,
          context: gl,
          ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;
      };
      webGLOverlayView.onDraw = ({ transformer }) => {
        const latLngAltitudeLiteral = {
          lat: mapOptions.center.lat,
          lng: mapOptions.center.lng,
          altitude: 100,
        };
        const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

        webGLOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
      };
      webGLOverlayView.setMap(map);
    };
    const map = new window.google.maps.Map(ref.current, mapOptions);
    initWebGLOverlayView(map);
  }, []);

  return (
    <>
      <div ref={ref} style={{ height: '100vh', width: '100vw' }} id="map" />
    </>
  );
};
