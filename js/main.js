document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Audio & Overlay ---
    const overlay = document.getElementById('overlay');
    const audio = new Audio('assets/audio/breath_ambient.mp3');
    audio.loop = true;

    overlay.addEventListener('click', () => {
        gsap.to(overlay, { opacity: 0, duration: 1.5, ease: "power2.inOut", onComplete: () => overlay.remove() });
        audio.play().catch(e => console.log("Audio play failed (interaction required):", e));
        initParticles(); // Start particles
    });

    // --- 2. GSAP Animations (Motion Graphics Style) ---
    gsap.registerPlugin(ScrollTrigger);

    // Hero Text Entrance
    const heroTimeline = gsap.timeline();
    heroTimeline
        .from(".hero-title", { y: 100, opacity: 0, duration: 1.5, ease: "power3.out" })
        .from(".hero-subtitle", { y: 50, opacity: 0, duration: 1, stagger: 0.3, ease: "power2.out" }, "-=1");

    // Cards Reveal
    gsap.utils.toArray('.glass-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 1.2,
            ease: "power2.out"
        });
    });

    // Stat Numbers Count Up
    gsap.utils.toArray('.stat-item').forEach(stat => {
        gsap.from(stat, {
            scrollTrigger: {
                trigger: stat,
                start: "top 90%",
            },
            scale: 0.5,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
        });
    });

    // --- 3. Modal Logic ---
    const openButtons = document.querySelectorAll('.open-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const modals = document.querySelectorAll('.info-modal');

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.showModal();
            modal.style.display = 'flex';
            gsap.fromTo(modal.querySelector('.modal-content'),
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
            );
        }
    }

    function closeModal(modal) {
        gsap.to(modal.querySelector('.modal-content'), {
            y: 50, opacity: 0, duration: 0.3, onComplete: () => {
                modal.close();
                modal.style.display = 'none';
            }
        });
    }

    openButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('dialog');
            closeModal(modal);
        });
    });

    // Cloud on backdrop click
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // ESC Key Listener (Global)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModalEl = document.querySelector('dialog[open]');
            if (openModalEl) {
                closeModal(openModalEl);
            }
        }
    });

    // --- 3b. Glosario Interactivo ---
    const glosarioDefs = {
        'obituarios': {
            titulo: 'Obituario',
            def: 'Es el anuncio que se publica en un periódico cuando alguien muere, generalmente con una foto pequeña y el nombre de la persona. Muñoz tomaba esas fotos —las de personas que nadie más iba a recordar— y las usaba como materia prima de su obra.'
        },
        'vaho': {
            titulo: 'Vaho',
            def: 'Es el vapor húmedo y caliente que sale de la boca cuando exhalas, especialmente cuando hace frío. Puedes verlo en invierno frente a ti. Es exactamente lo que necesitas para activar la obra: acercarte al espejo y soplar suavemente.'
        },
        'protografias': {
            titulo: 'Protografía',
            def: 'Es el término que inventó Oscar Muñoz para describir sus propias obras. "Proto" significa "antes de" o "en estado inicial". Una protografía es una imagen que está a punto de nacer —o de morir— y que necesita algo externo (como tu aliento) para existir por un instante.'
        },
        'serigrafía': {
            titulo: 'Serigrafía (o grasa serigráfica)',
            def: 'La serigrafía es una técnica de impresión, como una estampadora sofisticada, que usa una malla fina y tinta para transferir imágenes a superficies. En Aliento, Muñoz usa una grasa especial (sin color, invisible) en lugar de tinta. Esa grasa repele el agua, lo que hace que el rostro aparezca justo donde la grasa NO está.'
        },
        'condensación': {
            titulo: 'Condensación',
            def: 'Es cuando el vapor de agua del aire se convierte en gotitas de agua al tocar una superficie fría. Como cuando el vaso con bebida fría "suda" por fuera. Eso mismo pasa con el espejo: tu aliento caliente toca el metal frío y se transforma en una capa húmeda que revela la imagen.'
        }
    };

    document.querySelectorAll('.glosario-word').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = el.getAttribute('data-word');
            const termino = glosarioDefs[key];
            if (!termino) return;
            // Rellenar contenido antes de abrir
            document.getElementById('glosario-titulo').textContent = termino.titulo;
            document.getElementById('glosario-def').textContent = termino.def;
            // Usar el mismo sistema de apertura que los demás modales
            openModal('modal-glosario');
        });
    });

    // --- 4. Three.js Particle System (Calm & Immersive) ---
    function initParticles() {
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050505, 0.02);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        camera.position.z = 100;

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1000;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 400; // Wide spread
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.7,
            color: 0xFFD700, // Gold particles
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        function animate() {
            requestAnimationFrame(animate);
            particlesMesh.rotation.y += 0.0003; // Slow drift
            particlesMesh.rotation.x += 0.0001;

            // Gentle repulsion logic
            particlesMesh.rotation.y += 0.03 * (mouseX * 0.5 - particlesMesh.rotation.y);
            particlesMesh.rotation.x += 0.03 * (mouseY * 0.5 - particlesMesh.rotation.x);

            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // --- 5. "Breath" Reveal Interaction (click) ---
    const mirrors = document.querySelectorAll('.mirror-circle');
    mirrors.forEach(mirror => {
        const imageSrc = mirror.getAttribute('data-image');
        const img = document.createElement('img');
        img.src = imageSrc;
        mirror.appendChild(img);

        let animating = false; // evitar doble click mientras corre la animación

        mirror.addEventListener('click', () => {
            if (animating) return;
            animating = true;

            // Fase 1: aparece con vapor/blur intenso — rápido (0.8s)
            gsap.fromTo(img,
                { opacity: 0, filter: 'blur(18px) grayscale(80%)', scale: 1.08 },
                {
                    opacity: 1,
                    filter: 'blur(18px) grayscale(80%)',
                    scale: 1,
                    duration: 0.8,
                    ease: 'power2.out',
                    onComplete: () => {
                        // Fase 2: se despeja — nítido en 0.6s
                        gsap.to(img, {
                            filter: 'blur(0px) grayscale(0%)',
                            duration: 0.6,
                            ease: 'power2.out',
                            onComplete: () => {
                                // Fase 3: espera 5s, luego desvanece en 1.2s
                                gsap.to(img, {
                                    opacity: 0,
                                    filter: 'blur(6px)',
                                    duration: 1.2,
                                    delay: 5,
                                    ease: 'power2.in',
                                    onComplete: () => {
                                        // Resetear estado para permitir nuevo click
                                        gsap.set(img, { filter: 'blur(18px) grayscale(80%)', scale: 1.08 });
                                        animating = false;
                                    }
                                });
                            }
                        });
                    }
                }
            );
        });
    });
});
