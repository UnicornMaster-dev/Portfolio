// Bouncing Balls Animation
class BouncingBall {
    constructor(x, y, vx, vy, radius) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.mass = radius;
    }

    update(canvas) {
        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.vx *= -1;
            this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        }
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.vy *= -1;
            this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(11, 70%, 60%)`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    bounceOffCursor(cursorX, cursorY, cursorRadius = 15) {
        const dx = this.x - cursorX;
        const dy = this.y - cursorY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + cursorRadius) {
            // Normalize and apply bounce
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const bounceSpeed = Math.max(speed, 3);

            this.vx = Math.cos(angle) * bounceSpeed;
            this.vy = Math.sin(angle) * bounceSpeed;

            // Push away from cursor
            const overlap = this.radius + cursorRadius - distance;
            this.x += Math.cos(angle) * overlap;
            this.y += Math.sin(angle) * overlap;
        }
    }
}

let canvas, ctx;
let balls = [];
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let burstTimer = 0;
let ballsAnimationEnabled = false;
let animationRunning = false;

function initCanvas() {
    canvas = document.getElementById('bouncing-balls');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'bouncing-balls';
        document.body.insertBefore(canvas, document.body.firstChild);
    }
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create initial balls
    balls = [];
    const ballCount = 12;
    for (let i = 0; i < ballCount; i++) {
        const radius = Math.random() * 15 + 8;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        const vx = (Math.random() - 0.5) * 8;
        const vy = (Math.random() - 0.5) * 8;
        balls.push(new BouncingBall(x, y, vx, vy, radius));
    }
}

function animate() {
    // Clear canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Only animate if enabled
    if (ballsAnimationEnabled) {
        // Apply gravity
        balls.forEach(ball => {
            ball.vy += 0.1; // Gravity
        });

        // Update and draw balls
        balls.forEach(ball => {
            ball.update(canvas);
            ball.draw(ctx);
        });

        // Handle cursor interactions
        burstTimer++;
        balls.forEach(ball => {
            ball.bounceOffCursor(cursorX, cursorY, 15);

            // Random bursts towards cursor every 60 frames
            if (burstTimer % 60 === 0 && Math.random() > 0.7) {
                const dx = cursorX - ball.x;
                const dy = cursorY - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    const burstStrength = 4;
                    ball.vx += (dx / distance) * burstStrength;
                    ball.vy += (dy / distance) * burstStrength;
                }
            }
        });
    }

    requestAnimationFrame(animate);
}

// Track cursor position
document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

// Handle window resize
window.addEventListener('resize', () => {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// Initialize and start animation
initCanvas();
animate();

// Ball animation toggle handler
const ballToggle = document.getElementById('ball-toggle');
const toggleSwitch = document.querySelector('.toggle-switch');
if (ballToggle) {
    ballToggle.addEventListener('change', function() {
        ballsAnimationEnabled = this.checked;
        if (ballsAnimationEnabled) {
            // Reset balls when turning on
            initCanvas();
            burstTimer = 0;
        }
    });
}

// Handle toggle switch click
if (toggleSwitch) {
    toggleSwitch.addEventListener('click', function() {
        ballToggle.checked = !ballToggle.checked;
        ballToggle.dispatchEvent(new Event('change'));
    });
}

// Smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll animation for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards for animation
document.querySelectorAll('.project-card, .highlight, .skill-category').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
});

// Highlight active navigation link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = 'var(--primary-color)';
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// Mobile menu toggle (if you add a hamburger menu later)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Log to console for debugging
console.log('Portfolio site loaded successfully!');
