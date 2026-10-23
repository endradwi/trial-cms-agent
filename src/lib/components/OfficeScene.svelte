<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { FALLBACK_AGENTS, type AgentProfile } from '#lib/agents.js';

  let { onAgentClick, agents = FALLBACK_AGENTS }: { onAgentClick: (agent: AgentProfile) => void; agents?: AgentProfile[] } = $props();

  let container: HTMLDivElement;
  let raf = 0;
  let renderer: THREE.WebGLRenderer;
  let disposed = false;

  onMount(() => {
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010736);
    scene.fog = new THREE.FogExp2(0x010736, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
    camera.position.set(0, 11, 14.5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controls.target.set(0, 1.2, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0x8fa2cb, 0.55);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfcf1d0, 0.85);
    sun.position.set(8, 14, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    scene.add(sun);

    const warm = new THREE.PointLight(0xfcf1d0, 0.6, 30);
    warm.position.set(0, 6, 0);
    scene.add(warm);

    // Main Floor
    const floorGeo = new THREE.BoxGeometry(18, 0.15, 14);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a163a, roughness: 0.35, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.075;
    floor.receiveShadow = true;
    scene.add(floor);

    // Techy grid on floor
    const gridHelper = new THREE.GridHelper(18, 18, 0x22396f, 0x182a55);
    gridHelper.position.y = 0.01;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    // Outer Walls (back + left + right)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x091434, roughness: 0.8 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(18, 5, 0.15), wallMat);
    backWall.position.set(0, 2.5, -7);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const sideWallL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 5, 14), wallMat);
    sideWallL.position.set(-9, 2.5, 0);
    scene.add(sideWallL);

    const sideWallR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 5, 14), wallMat);
    sideWallR.position.set(9, 2.5, 0);
    scene.add(sideWallR);

    // War Room Screen on back wall
    const screenGeo = new THREE.BoxGeometry(6, 2.4, 0.05);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x010736, emissive: 0x22396f, emissiveIntensity: 0.7, roughness: 0.1 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 3, -6.9);
    scene.add(screen);

    const borderGeo = new THREE.BoxGeometry(6.2, 2.6, 0.02);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x22396f, emissive: 0x22396f, emissiveIntensity: 0.3 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, 3, -6.92);
    scene.add(border);

    // ==========================================
    // Office Partitions, Rugs, and Props
    // ==========================================

    // Zone 1: Executive Center Circular Rug (Coco)
    const rugCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.4, 0.02, 32),
      new THREE.MeshStandardMaterial({ color: 0x06112c, roughness: 0.8 })
    );
    rugCenter.position.set(0, 0.015, 2);
    rugCenter.receiveShadow = true;
    scene.add(rugCenter);

    const rimCenter = new THREE.Mesh(
      new THREE.RingGeometry(2.35, 2.42, 32),
      new THREE.MeshBasicMaterial({ color: 0xffe600, side: THREE.DoubleSide })
    );
    rimCenter.rotation.x = -Math.PI / 2;
    rimCenter.position.set(0, 0.028, 2);
    scene.add(rimCenter);

    // Zone 2: Creative & Video Studio Rug (Left Wing - Dimas & Salsa)
    const rugLeft = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 0.02, 7.8),
      new THREE.MeshStandardMaterial({ color: 0x071330, roughness: 0.8 })
    );
    rugLeft.position.set(-4.5, 0.015, 0.8);
    rugLeft.receiveShadow = true;
    scene.add(rugLeft);

    // Zone 3: Tech & QA Lab Rug (Right Wing - Satria, Layla, Raka)
    const rugRight = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 0.02, 7.8),
      new THREE.MeshStandardMaterial({ color: 0x071330, roughness: 0.8 })
    );
    rugRight.position.set(4.5, 0.015, 0.8);
    rugRight.receiveShadow = true;
    scene.add(rugRight);

    // Glass Partitions (Frosted glass separating wings)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x22396f,
      transparent: true,
      opacity: 0.35,
      roughness: 0.15,
      metalness: 0.1
    });
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.7
    });

    // Left Wing Glass Divider (z = -6.8 to -0.5)
    const glassL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.5, 6.2), glassMat);
    glassL.position.set(-1.8, 1.25, -3.6);
    scene.add(glassL);
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 6.2), railMat);
    railL.position.set(-1.8, 2.53, -3.6);
    scene.add(railL);

    // Right Wing Glass Divider (z = -6.8 to -0.5)
    const glassR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.5, 6.2), glassMat);
    glassR.position.set(1.8, 1.25, -3.6);
    scene.add(glassR);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 6.2), railMat);
    railR.position.set(1.8, 2.53, -3.6);
    scene.add(railR);

    // Whiteboard on left wall with sticky notes
    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 1.8, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x22396f, metalness: 0.6 })
    );
    boardFrame.position.set(-8.9, 2.4, 0.5);
    scene.add(boardFrame);

    const boardInner = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 1.6, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x071434, roughness: 0.2 })
    );
    boardInner.position.set(-8.88, 2.4, 0.5);
    scene.add(boardInner);

    const noteColors = [0xffe600, 0xff2a85, 0x00e5ff, 0x10b981];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const note = new THREE.Mesh(
          new THREE.BoxGeometry(0.01, 0.22, 0.22),
          new THREE.MeshStandardMaterial({ color: noteColors[(r * 4 + c) % noteColors.length], roughness: 0.9 })
        );
        note.position.set(-8.87, 2.7 - r * 0.4, -0.6 + c * 0.45);
        scene.add(note);
      }
    }

    // Potted Modern Plants Helper
    function createPlant(x: number, z: number) {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.16, 0.45, 6),
        new THREE.MeshStandardMaterial({ color: 0x0b1838, roughness: 0.5 })
      );
      pot.position.set(x, 0.225, z);
      scene.add(pot);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.35), leafMat);
        leaf.position.set(x, 0.48 + i * 0.03, z);
        leaf.rotation.y = (i * Math.PI) / 2.5;
        leaf.rotation.x = 0.35;
        scene.add(leaf);
      }
    }
    createPlant(-1.8, 0.8);
    createPlant(1.8, 0.8);
    createPlant(7.8, 5.2);

    // Coffee / Water Cooler Station at front-left
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.85, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x16254a, roughness: 0.4 })
    );
    cabinet.position.set(-7.8, 0.425, 5);
    scene.add(cabinet);

    const jug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.38, 12),
      new THREE.MeshStandardMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.75, roughness: 0.1 })
    );
    jug.position.set(-7.8, 1.04, 5);
    scene.add(jug);

    // Server rack decorations (back-left corner)
    const rackGeo = new THREE.BoxGeometry(0.5, 2, 0.4);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x22396f, roughness: 0.2, metalness: 0.5 });
    for (let i = 0; i < 3; i++) {
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.set(-7.5 + i * 0.7, 1, -6.2);
      rack.castShadow = true;
      scene.add(rack);

      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1 })
      );
      led.position.set(-7.5 + i * 0.7, 1.8, -5.98);
      led.userData = { blinkOffset: i * 1.5 };
      scene.add(led);
    }

    // ==========================================
    // Desk + Character Factory
    // ==========================================
    interface DeskData { agent: AgentProfile; mesh: THREE.Group }
    const desks: DeskData[] = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const clickables: THREE.Object3D[] = [];

    function createDesk(agent: AgentProfile): THREE.Group {
      const group = new THREE.Group();
      const accentColor = new THREE.Color(agent.accentColor);

      // Desk surface
      const deskGeo = new THREE.BoxGeometry(1.8, 0.08, 0.9);
      const deskMat = new THREE.MeshStandardMaterial({ color: 0x1a2a50, roughness: 0.4, metalness: 0.3 });
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.y = 0.75;
      desk.castShadow = true;
      desk.receiveShadow = true;
      group.add(desk);

      // Desk legs
      const legGeo = new THREE.BoxGeometry(0.06, 0.75, 0.06);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x22396f });
      for (const [lx, lz] of [[-0.8, -0.35], [0.8, -0.35], [-0.8, 0.35], [0.8, 0.35]]) {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.375, lz);
        group.add(leg);
      }

      // Monitor
      const monGeo = new THREE.BoxGeometry(0.7, 0.5, 0.04);
      const monMat = new THREE.MeshStandardMaterial({
        color: 0x010736,
        emissive: accentColor,
        emissiveIntensity: agent.status === 'WORKING' ? 0.6 : 0.2,
        roughness: 0.1
      });
      const monitor = new THREE.Mesh(monGeo, monMat);
      monitor.position.set(0, 1.3, -0.2);
      monitor.castShadow = true;
      group.add(monitor);

      // Monitor stand
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.04), new THREE.MeshStandardMaterial({ color: 0x22396f }));
      stand.position.set(0, 1.01, -0.2);
      group.add(stand);

      // Chair
      const chairSeatGeo = new THREE.BoxGeometry(0.5, 0.06, 0.5);
      const chairMat = new THREE.MeshStandardMaterial({ color: accentColor.clone().multiplyScalar(0.4), roughness: 0.6 });
      const seat = new THREE.Mesh(chairSeatGeo, chairMat);
      seat.position.set(0, 0.5, 0.7);
      group.add(seat);

      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.06), chairMat);
      chairBack.position.set(0, 0.78, 0.92);
      group.add(chairBack);

      // Status lamp on desk
      const lampGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const lampColor = agent.status === 'WORKING' ? 0x10b981 : agent.status === 'RESTING' ? 0xa3704b : 0x3b82f6;
      const lamp = new THREE.Mesh(lampGeo, new THREE.MeshStandardMaterial({ color: lampColor, emissive: lampColor, emissiveIntensity: 0.8 }));
      lamp.position.set(-0.6, 0.88, 0);
      group.add(lamp);

      // Ambient point light per desk
      const deskLight = new THREE.PointLight(accentColor.getHex(), 0.35, 4.5);
      deskLight.position.set(0, 1.6, 0);
      group.add(deskLight);

      // Nameplate
      const nameplateCanvas = document.createElement('canvas');
      nameplateCanvas.width = 256;
      nameplateCanvas.height = 64;
      const ctx = nameplateCanvas.getContext('2d')!;
      ctx.fillStyle = '#0d1c42';
      ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = '#fcf1d0';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${agent.avatarIcon} ${agent.name}`, 128, 40);
      const tex = new THREE.CanvasTexture(nameplateCanvas);
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
      plate.position.set(0, 0.84, -0.44);
      plate.rotation.x = -0.3;
      group.add(plate);

      // ==========================================
      // Humanoid Low-Poly Character Sitting at Desk
      // ==========================================
      const charGroup = new THREE.Group();

      // Lower body (sitting posture)
      const thighs = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.1, 0.38),
        new THREE.MeshStandardMaterial({ color: 0x0c1736, roughness: 0.7 })
      );
      thighs.position.set(0, 0.54, 0.5);
      charGroup.add(thighs);

      for (const sx of [-0.1, 0.1]) {
        const shin = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.45, 0.12),
          new THREE.MeshStandardMaterial({ color: 0x0c1736, roughness: 0.7 })
        );
        shin.position.set(sx, 0.25, 0.32);
        charGroup.add(shin);

        const shoe = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.08, 0.18),
          new THREE.MeshStandardMaterial({ color: 0xfcf1d0, roughness: 0.4 })
        );
        shoe.position.set(sx, 0.05, 0.28);
        charGroup.add(shoe);
      }

      // Torso / Tech Hoodie
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.45, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x142042, roughness: 0.6 })
      );
      torso.position.set(0, 0.82, 0.66);
      torso.castShadow = true;
      charGroup.add(torso);

      // Signature accent color chest stripe / badge
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.36, 0.02),
        new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.45 })
      );
      stripe.position.set(0, 0.82, 0.54);
      charGroup.add(stripe);

      // Arms (typing posture towards desk)
      for (const ax of [-0.24, 0.24]) {
        const upperArm = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 0.25, 0.1),
          new THREE.MeshStandardMaterial({ color: 0x142042 })
        );
        upperArm.position.set(ax, 0.76, 0.55);
        upperArm.rotation.x = 0.5;
        charGroup.add(upperArm);

        const foreArm = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, 0.28),
          new THREE.MeshStandardMaterial({ color: 0x142042 })
        );
        foreArm.position.set(ax * 0.8, 0.76, 0.32);
        charGroup.add(foreArm);

        const hand = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.04, 0.08),
          new THREE.MeshStandardMaterial({ color: 0xfcf1d0, roughness: 0.5 })
        );
        hand.position.set(ax * 0.7, 0.77, 0.16);
        charGroup.add(hand);
      }

      // Keyboard & Mouse on desk surface
      const kbd = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.02, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x0a142c, roughness: 0.5 })
      );
      kbd.position.set(0, 0.79, 0.15);
      charGroup.add(kbd);

      const mouseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.02, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x22396f, roughness: 0.4 })
      );
      mouseMesh.position.set(0.32, 0.79, 0.15);
      charGroup.add(mouseMesh);

      // Head Group (animatable tilting/nodding)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.18, 0.65);
      headGroup.userData = { isAgentHead: true, animOffset: Math.random() * 5 };

      const headMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.24, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xfce8c3, roughness: 0.5 })
      );
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      const hair = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.08, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x081026, roughness: 0.8 })
      );
      hair.position.set(0, 0.1, -0.01);
      headGroup.add(hair);

      // Cyberpunk Glowing Visor
      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.05, 0.04),
        new THREE.MeshStandardMaterial({
          color: accentColor,
          emissive: accentColor,
          emissiveIntensity: 1.2,
          roughness: 0.1
        })
      );
      visor.position.set(0, 0.01, -0.115);
      headGroup.add(visor);

      // Headset earpieces
      for (const hx of [-0.13, 0.13]) {
        const ear = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8),
          new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.5 })
        );
        ear.rotation.z = Math.PI / 2;
        ear.position.set(hx, 0.01, 0);
        headGroup.add(ear);
      }

      // Floating Beacon Crystal above head
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.075, 0),
        new THREE.MeshStandardMaterial({
          color: accentColor,
          emissive: accentColor,
          emissiveIntensity: 1.0,
          roughness: 0.2
        })
      );
      crystal.position.set(0, 0.38, 0);
      crystal.userData = { isAgentCrystal: true, animOffset: Math.random() * 5 };
      headGroup.add(crystal);

      charGroup.add(headGroup);
      group.add(charGroup);

      group.position.set(agent.deskPos.x, agent.deskPos.y, agent.deskPos.z);
      group.userData = { agentId: agent.id, agentSlug: agent.slug };

      clickables.push(group);
      return group;
    }

    for (const agent of agents) {
      const deskGroup = createDesk(agent);
      scene.add(deskGroup);
      desks.push({ agent, mesh: deskGroup });
    }

    // Track mouse down to distinguish click from camera rotation/drag
    let downX = 0;
    let downY = 0;
    const handleMouseDown = (e: MouseEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    renderer.domElement.addEventListener('mousedown', handleMouseDown);

    // Click handler
    const handleClick = (event: MouseEvent) => {
      const dist = Math.hypot(event.clientX - downX, event.clientY - downY);
      if (dist > 8) return; // Ignore drag / camera orbit gesture

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickables, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData?.agentId && !obj.userData?.agentSlug) obj = obj.parent;
        if (obj?.userData) {
          const targetId = obj.userData.agentId;
          const targetSlug = obj.userData.agentSlug;
          const agent = agents.find(a => (targetId && a.id === targetId) || (targetSlug && a.slug === targetSlug));
          if (agent) onAgentClick(agent);
        }
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    // Hover cursor
    const handleMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickables, true);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };
    renderer.domElement.addEventListener('mousemove', handleMove);

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animate loop
    const clock = new THREE.Clock();
    function loop() {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      controls.update();

      scene.traverse((obj) => {
        // Blink server LEDs
        if (obj.userData?.blinkOffset !== undefined && obj instanceof THREE.Mesh) {
          const m = obj.material as THREE.MeshStandardMaterial;
          m.emissiveIntensity = Math.sin(t * 3 + obj.userData.blinkOffset) > 0.3 ? 1 : 0.1;
        }
        // Subtle agent head motion
        if (obj.userData?.isAgentHead) {
          obj.rotation.y = Math.sin(t * 1.5 + obj.userData.animOffset) * 0.1;
          obj.rotation.x = Math.sin(t * 2.2 + obj.userData.animOffset) * 0.04;
        }
        // Rotating & bobbing crystal beacons
        if (obj.userData?.isAgentCrystal) {
          obj.rotation.y = t * 2.2 + obj.userData.animOffset;
          obj.position.y = 0.38 + Math.sin(t * 3.5 + obj.userData.animOffset) * 0.04;
        }
      });

      renderer.render(scene, camera);
    }
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handleMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      controls.dispose();
    };
  });
</script>

<div bind:this={container} class="w-full h-[430px] rounded-2xl border border-[#22396f]/60 overflow-hidden relative">
  <div class="absolute top-3 left-3 z-10 text-[10px] font-mono text-[#8fa2cb]/70 pointer-events-none select-none bg-[#010736]/70 px-2 py-1 rounded-md border border-[#22396f]/40">
    🏢 Virtual HQ — Klik meja / karakter agent untuk inspect
  </div>
</div>