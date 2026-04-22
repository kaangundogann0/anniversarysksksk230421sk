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

    const TOTAL_FLOWERS = 1826;
    const flowers = [];
    const colors = [
        'rgba(214, 100, 118, 0.9)', // primary pink/red
        'rgba(255, 183, 178, 0.9)', // secondary light pink
        'rgba(235, 138, 144, 0.9)',
        'rgba(255, 203, 203, 0.9)',
        'rgba(250, 240, 240, 0.9)' // very light pink/white
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

    function startAnimations() {
        // Init all flowers
        for (let i = 0; i < TOTAL_FLOWERS; i++) {
            flowers.push(new Flower());
        }

        // Animation Loop
        let lastTime = 0;
        function animate(timestamp) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear for next frame

            // Draw a subtle gradient background or allow CSS background to show.
            // We are just clearing so CSS background shows.

            let allBloomed = true;
            flowers.forEach(f => {
                f.draw(timestamp);
                if (f.size < f.targetSize) {
                    allBloomed = false;
                }
            });

            // Show message once all or most flowers have started blooming.
            if (timestamp > 3500 && messageOverlay.classList.contains('hidden')) {
                messageOverlay.classList.remove('hidden');
                messageOverlay.classList.add('visible');
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
