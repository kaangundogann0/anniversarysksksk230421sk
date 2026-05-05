/**
 * 5. YIL DÖNÜMÜ SİTESİ SCRİPT
 */

// ================= YOUTUBE AUDIO API ================= //
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100',
        width: '100',
        videoId: 's9mI9I9bTbI', // The requested song
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'modestbranding': 1,
            'loop': 1,
            'playlist': 's9mI9I9bTbI' // Needed for loop to work
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    // Player is ready, but we won't play until user clicks start
}

// Load YouTube API script
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


// ================= MAIN LOGIC & UI ================= //
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const entryOverlay = document.getElementById('entry-overlay');
    const mainContent = document.getElementById('main-content');
    const messageOverlay = document.getElementById('message-overlay');
    const canvas = document.getElementById('flower-canvas');
    const ctx = canvas.getContext('2d');

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // START BUTTON CLICK
    startBtn.addEventListener('click', () => {
        // Start Audio with retry logic to ensure it plays even if API is slow
        let attempts = 0;
        const playInterval = setInterval(() => {
            if (player && typeof player.playVideo === 'function') {
                player.playVideo();
            }
            attempts++;
            if (attempts > 10) clearInterval(playInterval); // clear after 5s
        }, 500);

        // Hide overlay, show main
        entryOverlay.style.opacity = '0';
        setTimeout(() => {
            entryOverlay.style.visibility = 'hidden';
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';

            // Start Flower Animation
            startAnimations();

            // Start Falling Petals Effect
            startFallingPetals();
        }, 1000);
    });

    // ================= FLOWER CANVAS ANIMATION ================= //

    const startDate = new Date('2021-04-23T00:00:00');
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    document.getElementById('days-counter').innerText = `${diffDays} gündür`;

    const TOTAL_FLOWERS = diffDays;
    const flowers = [];
    const colors = [
        'rgba(214, 100, 118, 0.9)', // primary pink/red
        'rgba(255, 183, 178, 0.9)', // secondary light pink
        'rgba(235, 138, 144, 0.9)',
        'rgba(255, 203, 203, 0.9)',
        'rgba(250, 240, 240, 0.9)', // very light pink/white
        'rgba(221, 198, 255, 0.9)',
        'rgba(255, 162, 230, 0.9)'
    ];

    class Flower {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.targetSize = Math.random() * 8 + 4; // between 4 and 12 radius
            this.size = 0;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.petals = Math.floor(Math.random() * 3) + 5; // 5 to 7 petals
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.01;
            // Staggered blooming
            this.delay = Math.random() * 3000; // bloom anytime in the first 3 seconds
            this.startTime = null;
            this.bloomingTime = 800; // takes 800ms to bloom
        }

        draw(timestamp) {
            if (!this.startTime) this.startTime = timestamp;

            let elapsed = timestamp - this.startTime;
            if (elapsed < this.delay) return; // not time to bloom yet

            let bloomElapsed = elapsed - this.delay;
            if (bloomElapsed < this.bloomingTime) {
                // Easing function: easeOutBack or similar could be nice, plain ease out for now
                let progress = bloomElapsed / this.bloomingTime;
                // smooth step
                progress = progress * progress * (3 - 2 * progress);
                this.size = this.targetSize * progress;
            } else {
                this.size = this.targetSize;
            }

            this.rotation += this.rotationSpeed;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            ctx.fillStyle = this.color;
            ctx.beginPath();

            // Draw petals
            for (let i = 0; i < this.petals; i++) {
                let angle = (i / this.petals) * Math.PI * 2;
                let cX = Math.cos(angle) * this.size;
                let cY = Math.sin(angle) * this.size;

                ctx.moveTo(0, 0);
                // Simple teardrop/petal shape using quadratic curves
                ctx.quadraticCurveTo(
                    Math.cos(angle - 0.5) * this.size * 1.5,
                    Math.sin(angle - 0.5) * this.size * 1.5,
                    cX, cY
                );
                ctx.quadraticCurveTo(
                    Math.cos(angle + 0.5) * this.size * 1.5,
                    Math.sin(angle + 0.5) * this.size * 1.5,
                    0, 0
                );
            }
            ctx.fill();

            // Center dot
            ctx.fillStyle = 'rgba(255, 230, 150, 0.8)'; // yellow-ish center
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    const confettis = [];
    let confettiTriggered = false;

    class ConfettiParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 12 + 4;
            this.vx = Math.cos(angle) * velocity;
            this.vy = Math.sin(angle) * velocity;
            this.gravity = 0.4;
            this.drag = 0.96;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 20;
            this.isRound = Math.random() > 0.5;
        }

        draw() {
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            if (this.isRound) {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            ctx.restore();
        }
    }

    function triggerConfetti() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        for (let i = 0; i < 80; i++) {
            confettis.push(new ConfettiParticle(cx, cy));
        }
    }

    function startAnimations() {
        // Init all flowers
        for (let i = 0; i < TOTAL_FLOWERS; i++) {
            flowers.push(new Flower());
        }

        // Animation Loop
        function animate(timestamp) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear for next frame

            flowers.forEach(f => {
                f.draw(timestamp);
            });

            // Draw Confettis
            for (let i = confettis.length - 1; i >= 0; i--) {
                confettis[i].draw();
                if (confettis[i].y > canvas.height + 20) {
                    confettis.splice(i, 1);
                }
            }

            // Show message once all or most flowers have started blooming.
            if (timestamp > 3500 && messageOverlay.classList.contains('hidden')) {
                messageOverlay.classList.remove('hidden');
                messageOverlay.classList.add('visible');
            }

            // Pop confetti slightly after the text starts showing
            if (timestamp > 4200 && !confettiTriggered) {
                confettiTriggered = true;
                triggerConfetti();
            }

            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // ================= FALLING PETALS ================= //
    function startFallingPetals() {
        const petalsContainer = document.getElementById('falling-petals');

        function createPetal() {
            const petal = document.createElement('div');
            petal.classList.add('petal');

            // Randomize properties
            const startX = Math.random() * window.innerWidth;
            const size = Math.random() * 15 + 10; // width 10 to 25
            const duration = Math.random() * 5 + 5; // 5 to 10 seconds
            const translateX = (Math.random() - 0.5) * 200 + 'px'; // sway left/right
            const rotation = Math.random() * 360 + 360 + 'deg'; // total rotation
            const colors = ['#ffb7b2', '#ffcac8', '#fec8d8'];

            petal.style.left = startX + 'px';
            petal.style.width = size + 'px';
            petal.style.height = size + 'px';
            petal.style.background = colors[Math.floor(Math.random() * colors.length)];
            petal.style.animationDuration = duration + 's';
            petal.style.setProperty('--translateX', translateX);
            petal.style.setProperty('--rotation', rotation);

            petalsContainer.appendChild(petal);

            // Remove petal after animation finishes
            setTimeout(() => {
                petal.remove();
            }, duration * 1000);
        }

        // Create new petals constantly
        setInterval(createPetal, 400); // 400ms interval for a rich petal shower
    }

    // ================= SCROLL ANIMATIONS ================= //

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        observer.observe(item);
    });

});
