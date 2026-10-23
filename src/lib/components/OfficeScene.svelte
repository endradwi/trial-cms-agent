<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
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
    scene.fog = new THREE.FogExp2(0x010736, 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 10, 14);

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
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controls.target.set(0, 1, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0x8fa2cb, 0.5);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfcf1d0, 0.8);
    sun.position.set(8, 12, 6);
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

    // Floor
    const floorGeo = new THREE.BoxGeometry(18, 0.15, 14);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0d1c42, roughness: 0.3, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.075;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid lines on floor for techy feel
    const gridHelper = new THREE.GridHelper(18, 18, 0x22396f, 0x22396f);
    gridHelper.position.y = 0.01;
    (gridHelper.material as THREE.Material).opacity = 0.3;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    // Walls (back + sides)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0d1c42, roughness: 0.8 });
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
    const screenGeo = new THREE.BoxGeometry(6, 2.5, 0.05);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x010736, emissive: 0x22396f, emissiveIntensity: 0.6, roughness: 0.1 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 3, -6.9);
    scene.add(screen);

    // Screen border glow
    const borderGeo = new THREE.BoxGeometry(6.2, 2.7, 0.02);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x22396f, emissive: 0x22396f, emissiveIntensity: 0.3 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, 3, -6.92);
    scene.add(border);

    // Helper: create a desk with monitor and chair
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
      const monMat = new THREE.MeshStandardMaterial({ color: 0x010736, emissive: accentColor, emissiveIntensity: agent.status === 'WORKING' ? 0.5 : 0.15, roughness: 0.1 });
      const monitor = new THREE.Mesh(monGeo, monMat);
      monitor.position.set(0, 1.3, -0.2);
      monitor.castShadow = true;
      group.add(monitor);

      // Monitor stand
      const standGeo = new THREE.BoxGeometry(0.04, 0.45, 0.04);
      const stand = new THREE.Mesh(standGeo, new THREE.MeshStandardMaterial({ color: 0x22396f }));
      stand.position.set(0, 1.01, -0.2);
      group.add(stand);

      // Chair
      const chairSeatGeo = new THREE.BoxGeometry(0.5, 0.06, 0.5);
      const chairMat = new THREE.MeshStandardMaterial({ color: accentColor.clone().multiplyScalar(0.4), roughness: 0.6 });
      const seat = new THREE.Mesh(chairSeatGeo, chairMat);
      seat.position.set(0, 0.5, 0.7);
      group.add(seat);

      const chairBackGeo = new THREE.BoxGeometry(0.5, 0.5, 0.06);
      const chairBack = new THREE.Mesh(chairBackGeo, chairMat);
      chairBack.position.set(0, 0.78, 0.92);
      group.add(chairBack);

      // Status lamp on desk
      const lampGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const lampColor = agent.status === 'WORKING' ? 0x10b981 : agent.status === 'RESTING' ? 0xa3704b : 0x3b82f6;
      const lampMat = new THREE.MeshStandardMaterial({ color: lampColor, emissive: lampColor, emissiveIntensity: 0.8 });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(-0.6, 0.88, 0);
      group.add(lamp);

      // Ambient point light per desk
      const deskLight = new THREE.PointLight(accentColor.getHex(), 0.3, 4);
      deskLight.position.set(0, 1.5, 0);
      group.add(deskLight);

      // Nameplate
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0d1c42';
      ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = '#fcf1d0';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${agent.avatarIcon} ${agent.name}`, 128, 40);
      const tex = new THREE.CanvasTexture(canvas);
      const plateMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      const plateGeo = new THREE.PlaneGeometry(0.9, 0.22);
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.set(0, 0.84, -0.44);
      plate.rotation.x = -0.3;
      group.add(plate);

      group.position.set(agent.deskPos.x, agent.deskPos.y, agent.deskPos.z);
      group.userData = { agentId: agent.id };

      clickables.push(group);
      return group;
    }

    for (const agent of agents) {
      const deskGroup = createDesk(agent);
      scene.add(deskGroup);
      desks.push({ agent, mesh: deskGroup });
    }

    // Server rack decorations (back-left corner)
    const rackGeo = new THREE.BoxGeometry(0.5, 2, 0.4);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x22396f, roughness: 0.2, metalness: 0.5 });
    for (let i = 0; i < 3; i++) {
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.set(-7.5 + i * 0.7, 1, -6.2);
      rack.castShadow = true;
      scene.add(rack);

      // Blinking LED
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1 })
      );
      led.position.set(-7.5 + i * 0.7, 1.8, -5.98);
      led.userData = { blinkOffset: i * 1.5 };
      scene.add(led);
    }

    // Click handler
    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickables, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData?.agentId) obj = obj.parent;
        if (obj?.userData?.agentId) {
          const agent = agents.find(a => a.id === obj!.userData.agentId);
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

    // Animate
    const clock = new THREE.Clock();
    function loop() {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      controls.update();

      // Blink server LEDs
      scene.traverse((obj) => {
        if (obj.userData?.blinkOffset !== undefined && obj instanceof THREE.Mesh) {
          const m = obj.material as THREE.MeshStandardMaterial;
          m.emissiveIntensity = Math.sin(t * 3 + obj.userData.blinkOffset) > 0.3 ? 1 : 0.1;
        }
      });

      renderer.render(scene, camera);
    }
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handleMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      controls.dispose();
    };
  });
</script>

<div bind:this={container} class="w-full h-[420px] rounded-2xl border border-[#22396f]/60 overflow-hidden relative">
  <div class="absolute top-3 left-3 z-10 text-[10px] font-mono text-[#8fa2cb]/60 pointer-events-none select-none">
    🏢 Virtual HQ — Klik meja agent untuk inspect
  </div>
</div>
