/* ============================================================
   CONFIG
   ============================================================ */
// Since this is a static site with no server, the contact form
// needs a form backend to actually deliver email. Sign up free at
// https://formspree.io, create a form pointed at
// Manil.patel@sevendot.ca, and paste its endpoint URL below.
// Leaving this blank falls back to opening the visitor's email
// client with a pre-filled message instead.
const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxx"
const CONTACT_EMAIL = "Manil.patel@sevendot.ca";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(pointer: coarse)").matches;

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
if (!isTouch) {
  const dot = document.getElementById("cursorDot");
  window.addEventListener("mousemove", (e) => {
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
  document.querySelectorAll("[data-cursor-expand]").forEach((el) => {
    el.addEventListener("mouseenter", () => dot.classList.add("expand"));
    el.addEventListener("mouseleave", () => dot.classList.remove("expand"));
  });
}

/* ============================================================
   NAVBAR
   ============================================================ */
const navbar = document.getElementById("navbar");
window.addEventListener(
  "scroll",
  () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  },
  { passive: true }
);

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
menuBtn.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
mobileMenu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  })
);

/* ============================================================
   SCROLL REVEAL ANIMATIONS (GSAP)
   ============================================================ */
if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  // Hero staged reveal
  gsap.timeline({ delay: 0.3 }).to(".hero .reveal", {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: "power3.out",
    stagger: 0.3,
  });

  // Fade-up sections as they enter view
  document.querySelectorAll(".fade-up").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      }
    );
  });
} else {
  // Fallback if GSAP failed to load (e.g. offline): just show content
  document.querySelectorAll(".reveal, .fade-up").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

/* ============================================================
   HERO PARTICLE BACKGROUND (Three.js)
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas || !window.THREE) return;

  let gl;
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch (e) {
    gl = null;
  }
  if (!gl) return; // graceful fallback: hero-fade gradient still looks fine on its own

  const heroSection = document.getElementById("home");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, prefersReducedMotion ? 1 : 1.5));

  function getCount() {
    const w = window.innerWidth;
    if (w < 640) return 550;
    if (w < 1024) return 1100;
    return 2200;
  }
  const count = getCount();

  const positions = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const converge = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const gridSize = Math.ceil(Math.sqrt(count));

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = (Math.random() - 0.5) * 16;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 8;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    scatter[i3] = x;
    scatter[i3 + 1] = y;
    scatter[i3 + 2] = z;

    const gx = (i % gridSize) / gridSize - 0.5;
    const gy = Math.floor(i / gridSize) / gridSize - 0.5;
    converge[i3] = gx * 9;
    converge[i3 + 1] = gy * 5;
    converge[i3 + 2] = (Math.random() - 0.5) * 0.6;

    speeds[i] = 0.15 + Math.random() * 0.3;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size: 0.028,
    color: 0xcfd8cf,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  let scrollProgress = 0;
  function updateScrollProgress() {
    const max = window.innerHeight * 1.5;
    scrollProgress = Math.min(1, window.scrollY / max);
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  let isVisible = true;
  document.addEventListener("visibilitychange", () => {
    isVisible = document.visibilityState === "visible";
  });

  const clock = new THREE.Clock();
  const posAttr = geometry.getAttribute("position");

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const sx = scatter[i3], sy = scatter[i3 + 1], sz = scatter[i3 + 2];
        const cx = converge[i3], cy = converge[i3 + 1], cz = converge[i3 + 2];

        const baseX = sx + (cx - sx) * scrollProgress;
        const baseY = sy + (cy - sy) * scrollProgress;
        const baseZ = sz + (cz - sz) * scrollProgress;

        const drift = speeds[i];
        const wobbleX = Math.sin(t * drift + i) * 0.08 * (1 - scrollProgress * 0.6);
        const wobbleY = Math.cos(t * drift * 0.8 + i) * 0.08 * (1 - scrollProgress * 0.6);

        posAttr.setXYZ(i, baseX + wobbleX + mouseX * 0.15, baseY + wobbleY + mouseY * 0.15, baseZ);
      }
      posAttr.needsUpdate = true;
      points.rotation.y = mouseX * 0.05;
      points.rotation.x = -mouseY * 0.03;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ============================================================
   LIMEX MATERIAL MESH (Three.js)
   ============================================================ */
(function initMaterialMesh() {
  const canvas = document.getElementById("materialCanvas");
  if (!canvas || !window.THREE) return;

  let gl;
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch (e) {
    gl = null;
  }
  if (!gl) {
    canvas.parentElement.innerHTML =
      '<p style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(244,242,238,0.4);font-size:0.9rem;">Material visualization unavailable</p>';
    return;
  }

  const wrap = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
  camera.position.z = 4.2;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const point = new THREE.PointLight(0xf4f2ee, 0.8);
  point.position.set(3, 3, 3);
  scene.add(point);

  const sheetGeo = new THREE.PlaneGeometry(2.4, 2.4, 24, 24);
  const sheetMat = new THREE.MeshStandardMaterial({
    color: 0xe7e1d6,
    roughness: 0.55,
    metalness: 0.1,
    side: THREE.DoubleSide,
    wireframe: true,
  });
  const sheet = new THREE.Mesh(sheetGeo, sheetMat);
  scene.add(sheet);

  const coreGeo = new THREE.IcosahedronGeometry(0.9, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x6f9270,
    roughness: 0.4,
    metalness: 0.2,
    transparent: true,
    opacity: 0.5,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (prefersReducedMotion) {
      renderer.render(scene, camera);
      return;
    }
    const delta = clock.getDelta();
    const t = clock.getElapsedTime();
    sheet.rotation.y += delta * 0.18;
    sheet.rotation.x = Math.sin(t * 0.2) * 0.15;
    core.rotation.y -= delta * 0.1;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = wrap.clientWidth / wrap.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  });
})();

/* ============================================================
   CONTACT FORM
   ============================================================ */
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form-status";

  const data = Object.fromEntries(new FormData(form).entries());

  // Honeypot check
  if (data.company_website) {
    statusEl.textContent = "Thank you. Your enquiry has been received. We'll be in touch shortly.";
    statusEl.classList.add("success");
    form.reset();
    return;
  }

  if (!data.firstName || !data.lastName || !data.company || !data.email || !data.message) {
    statusEl.textContent = "Please fill in all required fields.";
    statusEl.classList.add("error");
    return;
  }

  if (!FORM_ENDPOINT) {
    // No backend configured — fall back to opening the visitor's email client
    const subject = encodeURIComponent(`New Seven Dot Website Enquiry — ${data.company}`);
    const body = encodeURIComponent(
      `Name: ${data.firstName} ${data.lastName}\nCompany: ${data.company}\nEmail: ${data.email}\nPhone: ${data.phone || "—"}\nIndustry: ${data.industry || "—"}\nInterest: ${data.interest || "General Enquiry"}\n\nMessage:\n${data.message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    statusEl.textContent = "Opening your email client to send this enquiry…";
    statusEl.classList.add("success");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      statusEl.textContent = "Thank you. Your enquiry has been received. We'll be in touch shortly.";
      statusEl.classList.add("success");
      form.reset();
    } else {
      throw new Error("Request failed");
    }
  } catch (err) {
    statusEl.textContent = `We couldn't send your enquiry. Please try again or email us directly at ${CONTACT_EMAIL}.`;
    statusEl.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Enquiry";
  }
});
