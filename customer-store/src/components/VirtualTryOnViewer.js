import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Box, CircularProgress, Typography, Button, ButtonGroup } from '@mui/material';
import { RotateLeft, ZoomIn, ZoomOut, CenterFocusStrong } from '@mui/icons-material';

const VirtualTryOnViewer = ({ avatarModelUrl, clothingModelUrl, productCategory }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const avatarRef = useRef(null);
  const clothingRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 80, 200);
    cameraRef.current = camera;

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(100, 100, 50);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-100, 50, -50);
    scene.add(directionalLight2);

    // Setup Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 40, 0);
    controls.update();
    controlsRef.current = controls;

    // Load Models
    loadModels();

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const scene = sceneRef.current;

      // Load Avatar (Mannequin)
      const avatarUrl = avatarModelUrl || 'http://localhost:8082/uploads/models/ScaleReferenceDummy.obj';
      const avatar = await loadModel(avatarUrl, 'obj');
      avatar.position.set(0, 0, 0);
      avatarRef.current = avatar;
      scene.add(avatar);
      console.log('✅ Avatar loaded');

      // Load Clothing Model if provided
      if (clothingModelUrl) {
        const clothing = await loadModel(clothingModelUrl);
        
        // Position and scale clothing based on category
        positionClothingOnAvatar(clothing, productCategory);
        
        clothingRef.current = clothing;
        scene.add(clothing);
        console.log('✅ Clothing loaded and positioned');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading models:', err);
      setError('Failed to load 3D models');
      setLoading(false);
    }
  };

  const loadModel = (url, forceType = null) => {
    return new Promise((resolve, reject) => {
      const fullUrl = url.startsWith('http') ? url : `http://localhost:8082${url}`;
      const extension = forceType || url.split('.').pop().toLowerCase();

      console.log('Loading model:', { url, fullUrl, extension });

      if (extension === 'obj') {
        const loader = new OBJLoader();
        loader.load(
          fullUrl,
          (object) => {
            // Apply material to all meshes
            object.traverse((child) => {
              if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xcccccc,
                  roughness: 0.7,
                  metalness: 0.2,
                });
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            resolve(object);
          },
          undefined,
          reject
        );
      } else if (extension === 'glb' || extension === 'gltf') {
        const loader = new GLTFLoader();
        loader.load(
          fullUrl,
          (gltf) => {
            gltf.scene.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            resolve(gltf.scene);
          },
          undefined,
          reject
        );
      } else {
        reject(new Error('Unsupported file format'));
      }
    });
  };

  const positionClothingOnAvatar = (clothing, category) => {
    // Default position - overlay on avatar
    clothing.position.set(0, 0, 0);
    
    // Adjust based on clothing type
    const cat = (category || '').toLowerCase();
    
    if (cat.includes('shirt') || cat.includes('top') || cat.includes('blouse')) {
      // Upper body clothing
      clothing.position.y = 0;
      clothing.scale.set(1, 1, 1);
    } else if (cat.includes('pant') || cat.includes('jean') || cat.includes('trouser')) {
      // Lower body clothing
      clothing.position.y = 0;
      clothing.scale.set(1, 1, 1);
    } else if (cat.includes('dress') || cat.includes('gown') || cat.includes('frock')) {
      // Full body clothing
      clothing.position.y = 0;
      clothing.scale.set(1.05, 1.05, 1.05); // Slightly larger to cover avatar
    } else {
      // Default
      clothing.position.y = 0;
      clothing.scale.set(1.02, 1.02, 1.02);
    }

    console.log('Clothing positioned:', { category: cat, position: clothing.position, scale: clothing.scale });
  };

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 80, 200);
      controlsRef.current.target.set(0, 40, 0);
      controlsRef.current.update();
    }
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2);
    }
  };

  const handleRotate = () => {
    if (avatarRef.current) {
      avatarRef.current.rotation.y += Math.PI / 4;
    }
    if (clothingRef.current) {
      clothingRef.current.rotation.y += Math.PI / 4;
    }
  };

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="500px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box position="relative">
      {loading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          style={{ transform: 'translate(-50%, -50%)' }}
          zIndex={10}
        >
          <CircularProgress />
          <Typography variant="body2" align="center" mt={2}>
            Loading 3D models...
          </Typography>
        </Box>
      )}
      
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '600px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
        }}
      />

      <Box position="absolute" bottom={16} left="50%" style={{ transform: 'translateX(-50%)' }}>
        <ButtonGroup variant="contained" size="small">
          <Button onClick={handleRotate} startIcon={<RotateLeft />}>
            Rotate
          </Button>
          <Button onClick={handleZoomIn} startIcon={<ZoomIn />}>
            Zoom In
          </Button>
          <Button onClick={handleZoomOut} startIcon={<ZoomOut />}>
            Zoom Out
          </Button>
          <Button onClick={handleResetCamera} startIcon={<CenterFocusStrong />}>
            Reset
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default VirtualTryOnViewer;
