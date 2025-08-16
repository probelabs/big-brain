// Neural Network Background Animation
class NeuralNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.animationId = null;
        
        this.init();
        this.createNodes();
        this.createConnections();
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.nodes = [];
        this.connections = [];
        this.createNodes();
        this.createConnections();
    }
    
    createNodes() {
        const nodeCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    createConnections() {
        const maxDistance = 150;
        
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const distance = this.getDistance(this.nodes[i], this.nodes[j]);
                
                if (distance < maxDistance) {
                    this.connections.push({
                        nodeA: this.nodes[i],
                        nodeB: this.nodes[j],
                        distance: distance,
                        maxDistance: maxDistance
                    });
                }
            }
        }
    }
    
    getDistance(nodeA, nodeB) {
        return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
    }
    
    updateNodes() {
        this.nodes.forEach(node => {
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off walls
            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
            
            // Keep nodes in bounds
            node.x = Math.max(0, Math.min(this.canvas.width, node.x));
            node.y = Math.max(0, Math.min(this.canvas.height, node.y));
            
            // Update pulse
            node.pulsePhase += 0.02;
        });
    }
    
    drawNodes() {
        this.nodes.forEach(node => {
            const pulse = Math.sin(node.pulsePhase) * 0.3 + 0.7;
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
            
            // Create gradient for node
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * pulse * 2
            );
            gradient.addColorStop(0, `rgba(124, 58, 237, ${node.opacity * pulse})`);
            gradient.addColorStop(0.5, `rgba(59, 130, 246, ${node.opacity * pulse * 0.6})`);
            gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = `rgba(124, 58, 237, ${node.opacity * pulse})`;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawConnections() {
        this.connections.forEach(connection => {
            const currentDistance = this.getDistance(connection.nodeA, connection.nodeB);
            
            if (currentDistance < connection.maxDistance) {
                const opacity = (1 - currentDistance / connection.maxDistance) * 0.3;
                
                this.ctx.beginPath();
                this.ctx.moveTo(connection.nodeA.x, connection.nodeA.y);
                this.ctx.lineTo(connection.nodeB.x, connection.nodeB.y);
                
                // Create gradient for connection
                const gradient = this.ctx.createLinearGradient(
                    connection.nodeA.x, connection.nodeA.y,
                    connection.nodeB.x, connection.nodeB.y
                );
                gradient.addColorStop(0, `rgba(124, 58, 237, ${opacity})`);
                gradient.addColorStop(0.5, `rgba(6, 182, 212, ${opacity * 0.8})`);
                gradient.addColorStop(1, `rgba(59, 130, 246, ${opacity})`);
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 0.5;
                this.ctx.stroke();
            }
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateNodes();
        this.drawConnections();
        this.drawNodes();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Copy Cursor install command
function copyCursorCommand() {
    const command = document.getElementById('cursor-install-cmd').textContent;
    const copyBtn = document.querySelector('.alt-command .copy-btn');
    const copyIcon = copyBtn.querySelector('.copy-icon');
    
    navigator.clipboard.writeText(command).then(() => {
        // Visual feedback
        copyBtn.classList.add('copied');
        copyIcon.innerHTML = '<path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyIcon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        fallbackCopyTextToClipboard(command, copyBtn, copyIcon);
    });
}

// Copy to clipboard functionality
function copyInstallCommand() {
    const command = document.getElementById('install-cmd').textContent;
    const copyBtn = document.querySelector('#install .copy-btn');
    const copyIcon = copyBtn.querySelector('.copy-icon');
    
    navigator.clipboard.writeText(command).then(() => {
        // Visual feedback
        copyBtn.classList.add('copied');
        copyIcon.innerHTML = '<path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyIcon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        fallbackCopyTextToClipboard(command, copyBtn, copyIcon);
    });
}

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all tab buttons and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Mode switching functionality
function switchMode(mode) {
    // Remove active class from all mode buttons and content
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.mode-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.journey-strip').forEach(strip => strip.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    event.target.classList.add('active');
    document.getElementById(`${mode}-mode-steps`).classList.add('active');
    document.getElementById(`${mode}-journey`).classList.add('active');
}

// Copy hero cursor install command
function copyHeroCursorCommand() {
    const command = document.getElementById('hero-cursor-cmd').textContent;
    const copyBtn = event.target.closest('.copy-btn');
    const copyIcon = copyBtn.querySelector('.copy-icon');
    
    navigator.clipboard.writeText(command).then(() => {
        // Visual feedback
        copyBtn.classList.add('copied');
        copyIcon.innerHTML = '<path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyIcon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        fallbackCopyTextToClipboard(command, copyBtn, copyIcon);
    });
}

// Copy hero install command
function copyHeroCommand() {
    const command = document.getElementById('hero-install-cmd').textContent;
    const copyBtn = document.querySelector('.hero-command .copy-btn');
    const copyIcon = copyBtn.querySelector('.copy-icon');
    
    navigator.clipboard.writeText(command).then(() => {
        // Visual feedback
        copyBtn.classList.add('copied');
        copyIcon.innerHTML = '<path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyIcon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        fallbackCopyTextToClipboard(command, copyBtn, copyIcon);
    });
}

function fallbackCopyTextToClipboard(text, copyBtn, copyIcon) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            copyBtn.classList.add('copied');
            copyIcon.innerHTML = '<path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>';
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyIcon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>';
            }, 2000);
        }
    } catch (err) {
        console.error('Fallback copy failed: ', err);
    }
    
    document.body.removeChild(textArea);
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Intersection Observer for fade-in animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate in
    const animateElements = document.querySelectorAll(`
        .problem-card,
        .flow-step,
        .model-card,
        .code-example,
        .video-container,
        .install-command,
        .ecosystem-content > *
    `);
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Parallax effect for hero section with fade and scale
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    const brainAnimation = document.querySelector('.brain-animation');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero ? hero.offsetHeight : window.innerHeight;
        const scrollProgress = Math.min(scrolled / (heroHeight * 0.8), 1);
        
        if (brainAnimation) {
            // Parallax movement
            const parallax = scrolled * 0.3;
            
            // Calculate fade and scale based on scroll progress
            const opacity = Math.max(1 - (scrollProgress * 1.5), 0);
            const scale = Math.max(1 - (scrollProgress * 0.5), 0.3);
            
            // Apply all transformations
            brainAnimation.style.transform = `translateY(${parallax}px) scale(${scale})`;
            brainAnimation.style.opacity = opacity;
        }
    });
}

// Enhanced brain animation with mouse interaction
function initBrainInteraction() {
    const brainCore = document.querySelector('.brain-core');
    const brainAnimation = document.querySelector('.brain-animation');
    
    if (!brainCore || !brainAnimation) return;
    
    brainAnimation.addEventListener('mousemove', (e) => {
        const rect = brainAnimation.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const moveX = x * 0.1;
        const moveY = y * 0.1;
        
        brainCore.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    });
    
    brainAnimation.addEventListener('mouseleave', () => {
        brainCore.style.transform = 'translate(-50%, -50%)';
    });
}

// Performance optimization: Reduce animations on mobile
function optimizeForMobile() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Reduce neural network complexity on mobile
        const canvas = document.getElementById('neural-canvas');
        if (canvas) {
            canvas.style.opacity = '0.2';
        }
        
        // Disable parallax on mobile for better performance
        return false;
    }
    
    return true;
}

// Video placeholder interaction
function initVideoPlaceholder() {
    const playButton = document.querySelector('.play-button');
    const videoPlaceholder = document.querySelector('.video-placeholder');
    
    if (playButton && videoPlaceholder) {
        playButton.addEventListener('click', () => {
            // Pulse animation
            playButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                playButton.style.transform = 'scale(1)';
            }, 150);
            
            // Here you would implement actual video loading
            console.log('Video would load here');
        });
    }
}

// Theme color management
function initThemeColors() {
    // Dynamic color shifting for gradient text
    const gradientTexts = document.querySelectorAll('.gradient-text');
    let hueShift = 0;
    
    setInterval(() => {
        hueShift = (hueShift + 1) % 360;
        gradientTexts.forEach(text => {
            text.style.filter = `hue-rotate(${hueShift * 0.5}deg)`;
        });
    }, 100);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize neural network background
    const canvas = document.getElementById('neural-canvas');
    if (canvas && optimizeForMobile()) {
        new NeuralNetwork(canvas);
    }
    
    // Initialize other features
    initSmoothScrolling();
    initScrollAnimations();
    initBrainInteraction();
    initVideoPlaceholder();
    initThemeColors();
    
    // Only enable parallax on desktop
    if (optimizeForMobile()) {
        initParallaxEffect();
    }
    
    // Add loading complete class for final animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// Handle page visibility change to pause/resume animations
document.addEventListener('visibilitychange', () => {
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        if (document.hidden) {
            canvas.style.animationPlayState = 'paused';
        } else {
            canvas.style.animationPlayState = 'running';
        }
    }
});

// Preload important assets
function preloadAssets() {
    // Preload fonts and other critical assets
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;600;700;900&display=swap';
    link.as = 'style';
    document.head.appendChild(link);
}

// Error handling for JavaScript features
window.addEventListener('error', (e) => {
    console.warn('Big Brain website error:', e.error);
    // Graceful degradation - website should still work without JS features
});

// Initialize preloading
preloadAssets();