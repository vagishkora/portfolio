// Configuration
const CONFIG = {
    animationThreshold: 0.1,
    scrollOffset: 100
};

// --- Theme Toggle Logic (Pro Sliding Pill) ---
class ThemeManager {
    constructor() {
        this.toggleEl = document.getElementById('theme-toggle');
        this.thumb = document.getElementById('toggle-thumb');
        this.thumbMoon = document.getElementById('thumb-moon');
        this.thumbSun = document.getElementById('thumb-sun');

        // Mobile Toggle Elements
        this.mobileToggle = document.getElementById('mobile-theme-toggle');
        this.mobileMoon = document.getElementById('mobile-moon');
        this.mobileSun = document.getElementById('mobile-sun');
        this.highBeams = document.getElementById('high-beams');

        this.html = document.documentElement;

        this.init();
    }

    init() {
        // Desktop Listener
        if (this.toggleEl) {
            this.toggleEl.addEventListener('click', () => {
                const isDark = this.html.classList.contains('dark');
                this.setTheme(!isDark);
                this.flashHighBeams();
            });
        }

        // Mobile Listener
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => {
                const isDark = this.html.classList.contains('dark');
                this.setTheme(!isDark);
                this.flashHighBeams(); // Enable on mobile too
            });
        }

        // Check for saved preference or default to DARK
        const savedTheme = localStorage.getItem('theme');

        // Default to DARK if nothing saved (ignore system pref for now to enforce "black only" default)
        if (savedTheme === 'dark' || !savedTheme) {
            this.setTheme(true);
        } else {
            this.setTheme(false);
        }


    }

    flashHighBeams() {
        if (!this.highBeams) return;

        // Reset animation
        this.highBeams.classList.remove('flash');
        void this.highBeams.offsetWidth; // Trigger reflow
        this.highBeams.classList.add('flash');
    }

    setTheme(isDark) {
        if (isDark) {
            this.html.classList.add('dark');
            localStorage.setItem('theme', 'dark');

            // Desktop UI Update
            if (this.toggleEl) {
                this.toggleEl.classList.remove('bg-white', 'border-zinc-200');
                this.toggleEl.classList.add('bg-zinc-950', 'border-zinc-800');
                this.thumb.classList.remove('translate-x-8', 'bg-gray-200');
                this.thumb.classList.add('translate-x-0', 'bg-zinc-800');
                this.thumbMoon.classList.remove('hidden');
                this.thumbSun.classList.add('hidden');
            }

            // Mobile UI Update
            if (this.mobileMoon) {
                this.mobileMoon.classList.remove('hidden');
                this.mobileSun.classList.add('hidden');
            }

        } else {
            this.html.classList.remove('dark');
            localStorage.setItem('theme', 'light');

            // Desktop UI Update
            if (this.toggleEl) {
                this.toggleEl.classList.remove('bg-zinc-950', 'border-zinc-800');
                this.toggleEl.classList.add('bg-white', 'border-zinc-200');
                this.thumb.classList.remove('translate-x-0', 'bg-zinc-800');
                this.thumb.classList.add('translate-x-8', 'bg-gray-200');
                this.thumbMoon.classList.add('hidden');
                this.thumbSun.classList.remove('hidden');
            }

            // Mobile UI Update
            if (this.mobileMoon) {
                this.mobileMoon.classList.add('hidden');
                this.mobileSun.classList.remove('hidden');
            }
        }
    }
}

// --- Scroll Animations (Intersection Observer) ---
class ScrollAnimator {
    constructor() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    entry.target.classList.remove('opacity-0', 'translate-y-8');
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: CONFIG.animationThreshold
        });

        this.init();
    }

    init() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => this.observer.observe(el));
    }
}

// --- Contact Form Handler (Web3Forms) ---
class FormHandler {
    constructor() {
        this.form = document.getElementById('contact-form');
        if (this.form) {
            this.btn = this.form.querySelector('button[type="submit"]');
        }
        this.loadingIcon = document.getElementById('loading-icon');
        this.sendIcon = document.getElementById('send-icon');

        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // UI State: Loading
        this.setLoading(true);
        const btnText = this.btn.querySelector('span');
        const originalText = btnText.textContent;
        btnText.textContent = "Sending...";

        // Prepare Data
        const formData = new FormData(this.form);
        const object = Object.fromEntries(formData);

        // IMPORTANT: Replace this with your actual Access Key from Web3Forms
        object.access_key = '1c2c1346-e1f5-4e8c-9f1a-078ec5d2c3fd';

        const json = JSON.stringify(object);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });

            const result = await response.json();

            if (result.success) {
                // UI State: Success
                this.setLoading(false);
                btnText.textContent = "Message Sent!";
                this.btn.classList.remove('bg-primary', 'hover:bg-primary/90');
                this.btn.classList.add('bg-green-600', 'hover:bg-green-700');
                this.form.reset();

                // Reset Button after 3s
                setTimeout(() => {
                    btnText.textContent = originalText;
                    this.btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                    this.btn.classList.add('bg-primary', 'hover:bg-primary/90');
                }, 3000);
            } else {
                throw new Error(result.message || "Submission failed");
            }
        } catch (error) {
            console.error(error);
            // UI State: Error
            this.setLoading(false);
            btnText.textContent = "Error! Try Again.";
            this.btn.classList.add('bg-red-600');

            setTimeout(() => {
                btnText.textContent = originalText;
                this.btn.classList.remove('bg-red-600');
            }, 3000);
        }
    }

    setLoading(isLoading) {
        if (!this.btn || !this.loadingIcon || !this.sendIcon) return;

        if (isLoading) {
            this.btn.disabled = true;
            this.loadingIcon.classList.remove('hidden');
            this.sendIcon.classList.add('hidden');
        } else {
            this.btn.disabled = false;
            this.loadingIcon.classList.add('hidden');
            this.sendIcon.classList.remove('hidden');
        }
    }
}



// --- FUSION LOGIC (Interceptor) ---
class BioIgnition {
    constructor() {
        this.btn = document.getElementById('bio-start');
        if (!this.btn) return;

        this.init();
    }

    init() {
        if (this.btn) {
            this.btn.addEventListener('click', () => this.startSequence());
        }
    }

    startSequence() {
        // Play Audio (Removed)
        // const audio = new AudioEngine();
        // audio.playEngineStart();

        // Haptic Feedback
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        // Visual Feedback
        this.btn.classList.add('animate-pulse');
        this.btn.style.borderColor = '#10B981'; // Success Green
        this.btn.style.boxShadow = '0 0 20px #10B981';

        const text = this.btn.querySelector('span');
        if (text) text.innerText = 'ACCESS GRANTED';

        // Smooth Scroll to Work
        setTimeout(() => {
            document.getElementById('work').scrollIntoView({ behavior: 'smooth' });

            // Reset Button
            setTimeout(() => {
                this.btn.classList.remove('animate-pulse');
                this.btn.style.borderColor = '';
                this.btn.style.boxShadow = '';
                if (text) text.innerText = 'INITIALIZE SYSTEM';
            }, 2000);
        }, 800);
    }
}

class RadarChart {
    constructor() {
        this.canvas = document.getElementById('skill-radar');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.labels = ['Security', 'AI / ML', 'Vision', 'Dev', 'Systems', 'Web'];
        this.data = [0.9, 0.85, 0.88, 0.95, 0.8, 0.75]; // Skill Levels
        this.colors = ['#EF4444', '#6366F1', '#A855F7', '#10B981', '#F59E0B', '#3B82F6']; // Segment colors

        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        // Responsive Radius
        this.radius = window.innerWidth < 768 ? 120 : 160;
        this.progress = 0;
        this.targetProgress = 1;

        this.init();

        // Handle Resize
        window.addEventListener('resize', () => {
            this.centerX = this.canvas.width / 2;
            this.centerY = this.canvas.height / 2;
            this.radius = window.innerWidth < 768 ? 120 : 160;
            this.draw(this.progress || 1);
        });
    }

    init() {
        // Intersection Observer for animation
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.animate();
                observer.disconnect();
            }
        }, { threshold: 0.5 });

        observer.observe(this.canvas);

        // Initial Static Draw (Empty)
        this.draw(0);
    }

    animate() {
        const start = performance.now();
        const duration = 1500;

        const loop = (now) => {
            const dt = now - start;
            this.progress = Math.min(dt / duration, 1);

            // Ease Out Cubic
            const ease = 1 - Math.pow(1 - this.progress, 3);

            this.draw(ease);

            if (this.progress < 1) requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    draw(animFactor) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Grid (Hexagons)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 1; i <= 5; i++) {
            this.drawPolygon(this.radius * (i / 5), false);
        }

        // 2. Draw Axes
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(
                this.centerX + Math.cos(angle) * this.radius,
                this.centerY + Math.sin(angle) * this.radius
            );
        }
        this.ctx.stroke();

        // 3. Draw Data Polygon
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            const val = this.data[i] * animFactor;
            const r = this.radius * val;
            const x = this.centerX + Math.cos(angle) * r;
            const y = this.centerY + Math.sin(angle) * r;

            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();

        // Gradient Fill
        const grad = this.ctx.createRadialGradient(this.centerX, this.centerY, 0, this.centerX, this.centerY, this.radius);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.2)'); // Indigo center
        grad.addColorStop(1, 'rgba(99, 102, 241, 0.6)'); // Indigo edge

        this.ctx.fillStyle = grad;
        this.ctx.fill();
        this.ctx.strokeStyle = '#6366F1';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 4. Draw Points & Labels
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;

            // Point
            const val = this.data[i] * animFactor;
            const px = this.centerX + Math.cos(angle) * (this.radius * val);
            const py = this.centerY + Math.sin(angle) * (this.radius * val);

            this.ctx.beginPath();
            this.ctx.arc(px, py, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();

            // Label
            const lx = this.centerX + Math.cos(angle) * (this.radius + 30);
            const ly = this.centerY + Math.sin(angle) * (this.radius + 30);

            this.ctx.fillStyle = this.colors[i];
            this.ctx.font = 'bold 12px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.labels[i], lx, ly);
        }
    }

    drawPolygon(r, fill) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            const x = this.centerX + Math.cos(angle) * r;
            const y = this.centerY + Math.sin(angle) * r;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }
}

class BMWCursor {
    constructor() {
        this.cursor = document.getElementById('bmw-cursor');
        if (!this.cursor) return;

        this.trails = [];
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.cursorX = this.mouseX;
        this.cursorY = this.mouseY;

        // Create 3 trails (M Colors)
        for (let i = 1; i <= 3; i++) {
            const trail = document.createElement('div');
            trail.className = `m-trail trail-${i}`;
            document.body.appendChild(trail);
            this.trails.push({
                el: trail,
                x: this.cursorX,
                y: this.cursorY,
                delay: i * 0.08 // Staggered delay
            });
        }

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Hover Effects
        document.querySelectorAll('a, button, .project-card, input').forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hovering'));
        });

        this.animate();
    }

    animate() {
        // Main Cursor (Fast follow)
        this.cursorX += (this.mouseX - this.cursorX) * 0.2;
        this.cursorY += (this.mouseY - this.cursorY) * 0.2;
        this.cursor.style.left = `${this.cursorX}px`;
        this.cursor.style.top = `${this.cursorY}px`;

        // Rotation based on movement
        const dx = this.mouseX - this.cursorX;
        const dy = this.mouseY - this.cursorY;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        // Basic rotation smoothing can be added here if needed

        // Trails (Lag follow)
        this.trails.forEach(trail => {
            trail.x += (this.cursorX - trail.x) * (0.3 - trail.delay); // Different speeds
            trail.y += (this.cursorY - trail.y) * (0.3 - trail.delay);
            trail.el.style.left = `${trail.x}px`;
            trail.el.style.top = `${trail.y}px`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// --- Gear Shift Navigation Logic ---
class GearNav {
    constructor() {
        this.gears = document.querySelectorAll('.gear-item');
        this.sections = [];
        this.init();
    }

    init() {
        if (!this.gears.length) return;

        // Map gears to sections
        this.gears.forEach(gear => {
            const targetId = gear.getAttribute('data-target');
            const section = document.querySelector(targetId);
            if (section) {
                this.sections.push({ gear, section, id: targetId });

                // Click to scroll
                gear.addEventListener('click', () => {
                    document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
                });
            }
        });

        // Observer for active state
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveGear(entry.target.id);
                }
            });
        }, { threshold: 0.5 }); // 50% visible

        this.sections.forEach(item => observer.observe(item.section));
    }

    setActiveGear(sectionId) {
        this.gears.forEach(gear => {
            const target = gear.getAttribute('data-target');
            if (target === `#${sectionId}`) {
                gear.classList.add('active');
            } else {
                gear.classList.remove('active');
            }
        });
    }
}

// --- Mobile Navigation Logic ---
class MobileMenu {
    constructor() {
        this.btn = document.getElementById('mobile-menu-btn');
        this.menu = document.getElementById('mobile-menu');
        this.init();
    }

    init() {
        if (!this.btn || !this.menu) return;

        this.btn.addEventListener('click', () => {
            this.menu.classList.toggle('hidden');
        });

        // Close on link click
        this.menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.menu.classList.add('hidden');
            });
        });
    }
}

// --- Start Sequence (Push Start) ---
class StartSequence {
    constructor() {
        this.screen = document.getElementById('splash-screen');
        this.btn = document.getElementById('engine-start-btn');
        this.init();
    }

    init() {
        if (!this.screen || !this.btn) return;

        // Prevent scrolling initially
        document.body.style.overflow = 'hidden';

        this.btn.addEventListener('click', () => {
            this.ignite();
        });
    }

    ignite() {
        // 1. (Audio Removed per user request)

        // 2. Visuals - Button Pressed
        this.btn.classList.remove('pulsing');
        this.btn.style.transform = 'scale(0.95)';
        this.btn.style.boxShadow = 'inset 0 0 30px rgba(0,0,0,0.9)';
        this.btn.style.borderColor = '#10B981'; // Green on start

        // 3. Fade Out Splash
        setTimeout(() => {
            this.screen.classList.add('hidden-splash');
            document.body.style.overflow = ''; // Restore sroll

            // Optional: Trigger BioIgnition auto-scan visually if we wanted
            // but let's let the user explore
        }, 500); // Small delay to hear the "crank"
    }
}

// --- Holographic Deck Logic ---
class HolographicDeck {
    constructor() {
        this.grid = document.getElementById('cert-grid');
        this.certs = [
            { title: "Cybersecurity Job Simulation", issuer: "Mastercard", key: "certificates/Cybersecurity Job Simulation Mastercard_page-0001.jpg" },
            { title: "Cybersecurity Analyst", issuer: "Tata", key: "certificates/Cybersecurity Analyst Job Simulation TATA - Forage_page-0001.jpg" },
            { title: "AI & Data Analytics", issuer: "AICTE", key: "certificates/Vagish N Kora_AICTE_Certificate_page-0001.jpg" },
            { title: "Internship Completion", issuer: "Karunadu Tech", key: "certificates/karunadu internship certificate_page-0001.jpg" },
            { title: "Data Visualization", issuer: "Accenture", key: "certificates/accenture data_visulatization_completion_certificate_page-0001.jpg" },
            { title: "Data Plus Overview", issuer: "TCS", key: "certificates/TSC Data Plus Overview Course_page-0001.jpg" },
            { title: "Hashgraph Developer", issuer: "Hedera", key: "certificates/Vagish_Kora_Hashgraph Developer Course_certificate_page-0001.jpg" },
            { title: "Career Edge", issuer: "TCS", key: "certificates/Tcs Certificate._page-0001.jpg" },
            { title: "Fundamentals of AI & ML", issuer: "Course Completion", key: "certificates/Fundamentals of AI&ML certification_page-0001.jpg" },
            { title: "AI for Metaverse", issuer: "Metaverse Cert", key: "certificates/Introduction to AI For Metaverse Certification_page-0001.jpg" },
            { title: "Info & Cyber Security", issuer: "Fundamentals", key: "certificates/Fundamentals of Information Security-Cyber Security_page-0001.jpg" }
        ];

        this.init();
    }

    init() {
        if (!this.grid) return;
        this.grid.innerHTML = ''; // Clear loading state

        for (const cert of this.certs) {
            const card = this.createCard(cert);
            this.grid.appendChild(card);

            // Render Image
            this.renderCertImage(cert.key, card);
        }
    }

    createCard(cert) {
        const card = document.createElement('div');
        // Added overflow-hidden to clip the image
        card.className = 'holo-card group relative h-64 rounded-xl cursor-pointer bg-surface/80 border border-white/10 overflow-hidden';

        card.innerHTML = `
            <!-- Glare Effect -->
            <div class="holo-glare"></div>
            
            <!-- Image Container -->
            <div class="absolute inset-0 p-4 transition-opacity duration-500" id="canvas-container-${cert.key.replace(/[^a-zA-Z0-9-_]/g, '')}">
                <div class="flex items-center justify-center h-full">
                     <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
            </div>

            <!-- Content Overlay -->
            <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300 z-10">
                <h3 class="text-white font-bold text-sm leading-tight mb-1 line-clamp-2">${cert.title}</h3>
                <p class="text-xs text-primary font-mono">${cert.issuer}</p>
            </div>
            
            <!-- Cyber Decor lines -->
            <div class="cyber-line w-full h-[1px] top-4 left-0 opacity-20 z-10"></div>
            <div class="cyber-line h-full w-[1px] top-0 right-4 opacity-20 z-10"></div>
        `;

        // Tilt Event
        card.addEventListener('mousemove', (e) => this.handleTilt(e, card));
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
            card.querySelector('.holo-glare').style.opacity = 0;
        });

        // Click to view full image
        card.addEventListener('click', () => {
            window.open(cert.key, '_blank');
        });

        return card;
    }

    handleTilt(e, card) {
        const box = card.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        const centerX = box.width / 2;
        const centerY = box.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // Update Glare
        const glare = card.querySelector('.holo-glare');
        glare.style.setProperty('--mouse-x', `${(x / box.width) * 100}%`);
        glare.style.setProperty('--mouse-y', `${(y / box.height) * 100}%`);
        glare.style.opacity = 1;

        // Update Border Gradient Angle
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
        card.style.setProperty('--rotate', `${angle}deg`);
    }

    renderCertImage(key, card) {
        const container = card.querySelector(`[id="canvas-container-${key.replace(/[^a-zA-Z0-9-_]/g, '')}"]`);
        if (!container) return;

        // Create Image
        const img = document.createElement('img');
        // If your files are in root/certificates, then src="certificates/filename.jpg" is correct
        img.src = key;
        img.alt = 'Certificate';
        img.className = 'w-full h-full object-contain filter brightness-90 group-hover:brightness-110 transition-all duration-300';

        img.onload = () => {
            container.innerHTML = '';
            container.appendChild(img);
        };

        img.onerror = () => {
            container.innerHTML = '<div class="text-red-500 text-xs text-center p-2 flex items-center justify-center h-full">Image Not Found</div>';
            console.error('Failed to load image:', key);
        };
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new ScrollAnimator();
    new FormHandler();
    new BioIgnition();
    new RadarChart();
    new BMWCursor();
    new MobileMenu();
    new GearNav();
    new StartSequence();

    // Initialize Holographic Deck immediately (no need to wait for PDF.js)
    new HolographicDeck();
});
