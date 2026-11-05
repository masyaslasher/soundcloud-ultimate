// Ambient Smoke & Mist Canvas Effect
// Lightweight, GPU-accelerated organic fluid particles
(function() {
    const canvas = document.getElementById('smoke-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Smoke particle cloud definition
    class SmokeCloud {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = 180 + Math.random() * 260;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.alpha = 0.03 + Math.random() * 0.05;
            this.alphaTarget = this.alpha;
            // Mix between deep midnight violet and subtle warm amber/orange mist
            this.isOrange = Math.random() > 0.65;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries gently
            if (this.x < -this.radius) this.x = width + this.radius;
            if (this.x > width + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = height + this.radius;
            if (this.y > height + this.radius) this.y = -this.radius;
        }

        draw() {
            const grad = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius
            );

            if (this.isOrange) {
                // Subtle glowing orange smoke
                grad.addColorStop(0, `rgba(255, 85, 0, ${this.alpha * 1.2})`);
                grad.addColorStop(0.5, `rgba(255, 120, 0, ${this.alpha * 0.5})`);
                grad.addColorStop(1, 'rgba(255, 85, 0, 0)');
            } else {
                // Deep ambient purple/indigo mist
                grad.addColorStop(0, `rgba(60, 40, 95, ${this.alpha * 1.4})`);
                grad.addColorStop(0.6, `rgba(30, 20, 50, ${this.alpha * 0.6})`);
                grad.addColorStop(1, 'rgba(10, 9, 15, 0)');
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const clouds = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
        clouds.push(new SmokeCloud());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        // Base dark tone
        ctx.fillStyle = 'rgba(11, 10, 16, 0.4)';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < clouds.length; i++) {
            clouds[i].update();
            clouds[i].draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
})();
