/* ============================================
   PORTFOLIO CUSTOM JAVASCRIPT
   ============================================ */

(function($) {
    'use strict';

    // ============================================
    // LIGHTBOX FUNCTIONALITY
    // ============================================
    window.currentImageIndex = 0;
    window.imageElements = [];

    window.openLightbox = function(index) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');

        // Collect all gallery images
        window.imageElements = document.querySelectorAll('.gallery-item img');
        window.currentImageIndex = index;

        if (lightbox && lightboxImg && window.imageElements[index]) {
            lightboxImg.src = window.imageElements[index].src;
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeLightbox = function() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    window.changeImage = function(direction) {
        window.currentImageIndex += direction;

        if (window.currentImageIndex >= window.imageElements.length) {
            window.currentImageIndex = 0;
        }
        if (window.currentImageIndex < 0) {
            window.currentImageIndex = window.imageElements.length - 1;
        }

        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg && window.imageElements[window.currentImageIndex]) {
            lightboxImg.src = window.imageElements[window.currentImageIndex].src;
        }
    };

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                changeImage(-1);
            } else if (e.key === 'ArrowRight') {
                changeImage(1);
            }
        }
    });

    // ============================================
    // PROJECT FILTER FUNCTIONALITY
    // ============================================
    $(document).ready(function() {
        $('.filter-btn').on('click', function() {
            const filter = $(this).data('filter');

            // Update active button
            $('.filter-btn').removeClass('active');
            $(this).addClass('active');

            // Filter projects
            if (filter === 'all') {
                $('.project-detail').fadeIn(400);
            } else {
                $('.project-detail').hide();
                $(`.project-detail[data-category="${filter}"]`).fadeIn(400);
            }
        });
    });

    // ============================================
    // CODE EXAMPLES TAB SWITCHING
    // ============================================
    $(document).ready(function() {
        $('.tab-btn').on('click', function() {
            const lang = $(this).data('lang');

            // Update active tab
            $('.tab-btn').removeClass('active');
            $(this).addClass('active');

            // Show corresponding code section
            $('.code-section').removeClass('active');
            $(`.code-section[data-category="${lang}"]`).addClass('active');

            // Trigger syntax highlighting if Prism is loaded
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        });
    });

    // ============================================
    // COPY CODE FUNCTIONALITY
    // ============================================
    window.copyCode = function(button) {
        const codeBlock = button.nextElementSibling.querySelector('code');
        const textArea = document.createElement('textarea');
        textArea.value = codeBlock.textContent;
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            button.textContent = 'Copied!';
            button.style.background = 'rgba(0, 255, 0, 0.3)';

            setTimeout(function() {
                button.textContent = 'Copy';
                button.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
            button.textContent = 'Failed';
        }

        document.body.removeChild(textArea);
    };

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.scroll-reveal');

        reveals.forEach(function(element) {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }

    // Add scroll-reveal class to elements
    $(document).ready(function() {
        $('.project-card, .skill-category, .code-example-card, .timeline-item, .cert-card, .testimonial-card').addClass('scroll-reveal');

        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll(); // Initial check
    });

    // ============================================
    // ANIMATED COUNTERS
    // ============================================
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Trigger counter animation when stats come into view
    let statsAnimated = false;
    $(window).on('scroll', function() {
        if (!statsAnimated) {
            const statsSection = $('.github-stats');
            if (statsSection.length) {
                const sectionTop = statsSection.offset().top;
                const scrollTop = $(window).scrollTop();
                const windowHeight = $(window).height();

                if (scrollTop + windowHeight > sectionTop) {
                    statsAnimated = true;
                    $('.stat-card h3').each(function() {
                        const text = $(this).text();
                        const number = parseInt(text.replace(/[^0-9]/g, ''));
                        if (!isNaN(number)) {
                            const originalText = text;
                            $(this).text('0');
                            animateCounter(this, number);

                            // Restore any + or suffix
                            setTimeout(() => {
                                $(this).text(originalText);
                            }, 2000);
                        }
                    });
                }
            }
        }
    });

    // ============================================
    // SKILL BARS ANIMATION
    // ============================================
    let skillBarsAnimated = false;
    $(window).on('scroll', function() {
        if (!skillBarsAnimated) {
            const skillsSection = $('.skills-bars-section');
            if (skillsSection.length) {
                const sectionTop = skillsSection.offset().top;
                const scrollTop = $(window).scrollTop();
                const windowHeight = $(window).height();

                if (scrollTop + windowHeight > sectionTop + 100) {
                    skillBarsAnimated = true;
                    $('.skill-progress-fill').each(function() {
                        const width = $(this).css('width');
                        $(this).css('width', '0');
                        $(this).animate({ width: width }, 1500, 'easeOutCubic');
                    });
                }
            }
        }
    });

    // ============================================
    // SMOOTH HOVER EFFECTS FOR IMAGES
    // ============================================
    $(document).ready(function() {
        $('.project-card, .gallery-item').on('mouseenter', function() {
            $(this).find('img').css('transform', 'scale(1.1)');
        }).on('mouseleave', function() {
            $(this).find('img').css('transform', 'scale(1)');
        });
    });

    // ============================================
    // PARALLAX EFFECT FOR HERO SECTION
    // ============================================
    $(window).on('scroll', function() {
        const scrolled = $(window).scrollTop();
        $('#intro').css('transform', 'translateY(' + (scrolled * 0.5) + 'px)');
        $('#intro').css('opacity', 1 - (scrolled / 500));
    });

    // ============================================
    // DYNAMIC TECH TAG COLORS
    // ============================================
    $(document).ready(function() {
        const colors = [
            'rgba(255, 99, 71, 0.3)',
            'rgba(100, 149, 237, 0.3)',
            'rgba(144, 238, 144, 0.3)',
            'rgba(255, 215, 0, 0.3)',
            'rgba(147, 112, 219, 0.3)',
            'rgba(255, 140, 0, 0.3)'
        ];

        $('.tech-tag').each(function(index) {
            $(this).css('background', colors[index % colors.length]);
            $(this).css('animation-delay', (index * 0.1) + 's');
        });
    });

    // ============================================
    // TESTIMONIALS SLIDER (OPTIONAL)
    // ============================================
    let currentTestimonial = 0;

    function rotateTestimonials() {
        const testimonials = $('.testimonial-card');
        if (testimonials.length > 1) {
            testimonials.eq(currentTestimonial).fadeOut(400, function() {
                currentTestimonial = (currentTestimonial + 1) % testimonials.length;
                testimonials.eq(currentTestimonial).fadeIn(400);
            });
        }
    }

    // Auto-rotate testimonials every 5 seconds (optional)
    // setInterval(rotateTestimonials, 5000);

    // ============================================
    // FORM VALIDATION (BASIC)
    // ============================================
    $(document).ready(function() {
        $('footer form').on('submit', function(e) {
            e.preventDefault();

            const name = $('#name').val().trim();
            const email = $('#email').val().trim();
            const message = $('#message').val().trim();

            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return false;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return false;
            }

            // Here you would typically send the form data to a server
            alert('Thank you for your message! I will get back to you soon.');
            $(this)[0].reset();
        });
    });

    // ============================================
    // VIDEO LAZY LOADING
    // ============================================
    $(document).ready(function() {
        const videos = document.querySelectorAll('video');

        const videoObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (video.dataset.src) {
                        video.src = video.dataset.src;
                        video.load();
                    }
                    videoObserver.unobserve(video);
                }
            });
        }, {
            rootMargin: '50px'
        });

        videos.forEach(function(video) {
            videoObserver.observe(video);
        });
    });

    // ============================================
    // DYNAMIC YEAR IN FOOTER
    // ============================================
    $(document).ready(function() {
        const currentYear = new Date().getFullYear();
        $('#copyright').find('li').first().html('&copy; Your Name ' + currentYear);
    });

    // ============================================
    // PRELOADER (OPTIONAL)
    // ============================================
    $(window).on('load', function() {
        $('.is-preload').removeClass('is-preload');

        // Add entrance animations
        setTimeout(function() {
            $('.project-card').each(function(index) {
                $(this).css('animation-delay', (index * 0.1) + 's');
                $(this).addClass('fadeInUp');
            });
        }, 100);
    });

    // ============================================
    // MOBILE MENU ENHANCEMENTS
    // ============================================
    $(document).ready(function() {
        // Close mobile menu when clicking on a link
        $('#nav a').on('click', function() {
            if ($('body').hasClass('navPanel-visible')) {
                $('body').removeClass('navPanel-visible');
            }
        });
    });

    // ============================================
    // BACK TO TOP BUTTON (OPTIONAL)
    // ============================================
    $(document).ready(function() {
        // Create back to top button
        $('body').append('<button id="back-to-top" title="Back to Top"><i class="fas fa-arrow-up"></i></button>');

        const backToTop = $('#back-to-top');
        backToTop.css({
            'position': 'fixed',
            'bottom': '30px',
            'right': '30px',
            'display': 'none',
            'background': 'rgba(255, 255, 255, 0.2)',
            'color': '#fff',
            'border': '2px solid #fff',
            'border-radius': '50%',
            'width': '50px',
            'height': '50px',
            'cursor': 'pointer',
            'z-index': '1000',
            'transition': 'all 0.3s ease'
        });

        $(window).scroll(function() {
            if ($(this).scrollTop() > 300) {
                backToTop.fadeIn();
            } else {
                backToTop.fadeOut();
            }
        });

        backToTop.on('click', function() {
            $('html, body').animate({ scrollTop: 0 }, 600);
            return false;
        });

        backToTop.on('mouseenter', function() {
            $(this).css({
                'background': 'rgba(255, 255, 255, 0.4)',
                'transform': 'scale(1.1)'
            });
        }).on('mouseleave', function() {
            $(this).css({
                'background': 'rgba(255, 255, 255, 0.2)',
                'transform': 'scale(1)'
            });
        });
    });

    // ============================================
    // CONSOLE MESSAGE (EASTER EGG)
    // ============================================
    console.log('%c👋 Hello, fellow developer!', 'font-size: 20px; color: #00d4ff; font-weight: bold;');
    console.log('%cI see you\'re checking out the code. I like your style! 🚀', 'font-size: 14px; color: #ffffff;');
    console.log('%cFeel free to reach out if you want to collaborate or just chat about tech!', 'font-size: 12px; color: #cccccc;');

})(jQuery);

// ============================================
// VANILLA JS UTILITIES
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply optimized scroll handler
window.addEventListener('scroll', throttle(function() {
    // Your optimized scroll code here
}, 100));

