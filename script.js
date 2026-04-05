// Initialize Data (will be fetched)
let data = window.siteData || {};

// DOM Elements
const sidebar = document.getElementById('timeline-sidebar');
const cardContainer = document.getElementById('experience-card');

// State
let activeId = 1;

// --- Data Loading ---
async function init() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Network response was not ok');
        const jsonData = await response.json();
        
        // Only update if we got valid data, otherwise fallback to window.siteData
        if (Object.keys(jsonData).length > 0) {
            data = jsonData;
            // Ensure activeId is valid
            if (data.experience && data.experience.length > 0) {
                activeId = data.experience[0].id;
            }
        }
    } catch (error) {
        console.log('Using static data fallback (server not running or unreachable)');
    }

    renderAll();
    initTiltEffect(); // Initialize 3D Tilt
}

function renderAll() {
    renderHero();
    renderSidebar();
    renderCard(activeId);
    renderAbout();
    renderWidgets();
    renderContact();
    
    // Re-run icons
    if(window.lucide) lucide.createIcons();
}

// --- 3D Tilt Effect Logic ---
function initTiltEffect() {
    // 1. Profile Card Tilt
    const card = document.getElementById('profile-card');
    if (card) {
        applyTilt(card, card.parentElement);
    }
}

// Re-apply tilt for dynamic content
function initDynamicTilt() {
    const expCardImg = document.getElementById('exp-card-img');
    if (expCardImg) {
        applyTilt(expCardImg, expCardImg.parentElement);
    }
}

function applyTilt(card, container) {
    // Remove existing listeners to avoid duplicates if re-initialized (simple approach)
    // In a production app, we might handle this more robustly
    
    container.onmousemove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top; 
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation values (Max tilt: 10deg)
        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;
        
        // Apply transform
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Update Sheen Gradient Position
        const sheen = card.querySelector('.sheen-layer');
        if (sheen) {
            const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) - 90;
            sheen.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)`;
        }
    };

    container.onmouseleave = () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        const sheen = card.querySelector('.sheen-layer');
        if (sheen) {
            sheen.style.background = `linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)`;
        }
    };
}

// --- Rendering Functions ---

function renderHero() {
    if (!data.hero) return;
    const heroTitle = document.querySelector('#hero h1');
    const heroSubtitle = document.querySelector('#hero p');
    const heroCta = document.querySelector('#hero span.text-sm');
    // Avatar is static in HTML now for tilt effect structure, so we might skip re-rendering it or update strictly the src
    // const heroAvatar = document.querySelector('#hero img'); 
    // if(heroAvatar) heroAvatar.src = data.hero.avatar; 
}

function renderAbout() {
    if (!data.about) return;
    
    // Personality
    const mbtiEl = document.querySelector('#about h4');
    const keywordsEl = document.querySelector('#about .flex.flex-wrap');
    
    if (mbtiEl) {
        mbtiEl.innerHTML = `${data.about.personality.mbti} <span class="text-lg font-normal text-gray-500">· ${data.about.personality.role}</span>`;
    }
    
    if (keywordsEl && data.about.personality.keywords) {
        keywordsEl.innerHTML = data.about.personality.keywords.map((kw, i) => {
            const dot = i < data.about.personality.keywords.length - 1 ? '<span class="text-gray-300 text-xs self-center">●</span>' : '';
            return `<span>${kw}</span>${dot}`;
        }).join('');
    }

    // Hobbies
    const hobbiesContainer = document.querySelector('#about .grid');
    if (hobbiesContainer && data.about.hobbies) {
        hobbiesContainer.innerHTML = data.about.hobbies.map(hobby => `
            <div class="flex items-center space-x-4 p-4 rounded-2xl bg-white/40 hover:bg-white/60 transition-colors shadow-sm border border-white/50 cursor-default group">
                <div class="text-2xl group-hover:scale-110 transition-transform duration-300">${hobby.icon}</div>
                <span class="text-sm font-medium text-gray-700">${hobby.name}</span>
            </div>
        `).join('');
    }

    // Slogan
    const sloganEl = document.querySelector('#about p.italic');
    if (sloganEl) {
        sloganEl.innerHTML = `${data.about.slogan} <span class="text-red-400 ml-2 text-[10px]">♥</span>`;
    }
}

function renderWidgets() {
    if (!data.widgets) return;

    // Stack
    const stackContainer = document.querySelector('#tools .flex.space-x-6');
    if (stackContainer && data.widgets.stack) {
        stackContainer.innerHTML = data.widgets.stack.map(tool => `
            <div class="w-16 h-16 bg-white/80 rounded-2xl shadow-sm flex items-center justify-center border border-white/50 hover:scale-110 transition-transform cursor-pointer" title="${tool.name}">
                ${tool.icon.startsWith('http') 
                    ? `<img src="${tool.icon}" class="w-10 h-10 object-contain">` 
                    : `<span class="text-xs font-bold">${tool.name}</span>`}
            </div>
        `).join('');
    }

    // Status
    const status = data.widgets.status;
    if (status) {
        const titleEl = document.querySelector('#tools h3.text-lg');
        const descEl = document.querySelector('#tools p.text-sm');
        const stateText = document.querySelector('#tools .text-xs.text-green-600');
        
        if(titleEl) titleEl.innerText = status.title;
        if(descEl) descEl.innerHTML = `${status.desc_prefix} <span class="font-semibold text-blue-500 white-glow">${status.highlight1}</span> ${status.desc_mid} <span class="font-semibold text-blue-500 white-glow">${status.highlight2}</span>`;
        if(stateText) stateText.innerText = status.state;
    }
}

function renderContact() {
    if (!data.contact) return;
    const dockContainer = document.querySelector('#contact .dock-container');
    if (!dockContainer) return;

    dockContainer.innerHTML = data.contact.map(item => `
        <a href="${item.link}" class="dock-item group relative">
            <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 transition-all duration-300 overflow-hidden">
                <i data-lucide="${item.icon}" class="w-6 h-6 text-gray-600 group-hover:text-black"></i>
            </div>
            <span class="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md">${item.name}</span>
        </a>
    `).join('');
    
    // Re-initialize icons for new elements
    if(window.lucide) lucide.createIcons();
}

// Render Sidebar
function renderSidebar() {
    if (!data.experience) return;
    sidebar.innerHTML = '';
    data.experience.forEach(exp => {
        const item = document.createElement('div');
        item.className = `relative pl-6 cursor-pointer group transition-all duration-300`;
        item.onclick = () => switchExperience(exp.id);

        // Dot
        const dot = document.createElement('div');
        const isActive = exp.id === activeId;
        
        dot.className = `absolute left-[-9px] top-1 w-4 h-4 rounded-full border-4 transition-all duration-300 ${
            isActive 
            ? 'bg-black border-gray-200 scale-125' 
            : 'bg-white border-gray-200 group-hover:border-gray-300 group-hover:scale-110'
        }`;

        // Year Text
        const year = document.createElement('span');
        year.className = `text-sm font-medium transition-colors duration-300 ${
            isActive ? 'text-black font-bold' : 'text-gray-400 group-hover:text-gray-600'
        }`;
        year.innerText = exp.year;

        item.appendChild(dot);
        item.appendChild(year);
        sidebar.appendChild(item);
    });
}

// Render Card Content
function renderCard(id) {
    if (!data.experience) return;
    const exp = data.experience.find(e => e.id === id);
    if (!exp) return;

    // Fade out
    cardContainer.style.opacity = '0';
    cardContainer.style.transform = 'scale(0.95)';

    setTimeout(() => {
        // Update Content
        let tagsHtml = exp.tags.map(tag => 
            `<span class="px-3 py-1 bg-white/40 rounded-full text-xs font-medium text-gray-600 border border-white/60">${tag}</span>`
        ).join('');

        cardContainer.innerHTML = `
            <span class="text-xs font-bold text-gray-400 mb-4 block tracking-widest uppercase">Experience</span>
            <h3 class="text-3xl font-bold mb-2 text-[#1d1d1f] tracking-tight">${exp.title}</h3>
            <div class="text-xl font-normal text-gray-500 mb-6">${exp.company || ''}</div>
            
            ${exp.image ? `
            <div class="relative w-full aspect-video mb-8 group perspective-1000">
                <!-- Diffuse Shadow -->
                <div class="absolute inset-0 top-4 scale-[0.95] -z-10 blur-2xl opacity-50 transition-opacity duration-500 group-hover:opacity-70">
                    <img src="${exp.image}" class="w-full h-full object-cover rounded-2xl">
                </div>
                
                <!-- Main Image Card -->
                <div id="exp-card-img" class="relative w-full h-full rounded-2xl overflow-hidden border border-white/60 shadow-lg transition-all duration-100 ease-out transform-style-3d cursor-pointer bg-white">
                    <img src="${exp.image}" class="w-full h-full object-cover">
                    <!-- Sheen Layer -->
                    <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none sheen-layer"></div>
                </div>
            </div>
            ` : ''}

            <div class="text-gray-600 leading-relaxed text-base mb-8 space-y-3 font-light">${exp.description}</div>
            
            ${exp.pdf ? `
            <a href="${exp.pdf.url}" target="_blank" class="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors mb-4 group mr-3">
                <i data-lucide="file-text" class="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform"></i>
                <span>${exp.pdf.name}</span>
                <i data-lucide="external-link" class="w-3 h-3 text-gray-400"></i>
            </a>
            ` : ''}

            ${exp.prd ? `
            <a href="${exp.prd}" target="_blank" class="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-xl transition-colors mb-4 group mr-3">
                <i data-lucide="file-text" class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform"></i>
                <span>📄 产品需求文档 (PRD)</span>
                <i data-lucide="external-link" class="w-3 h-3 text-blue-400"></i>
            </a>
            ` : ''}

            ${exp.github ? `
            <a href="${exp.github}" target="_blank" class="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-xl transition-colors mb-4 group">
                <i data-lucide="github" class="w-4 h-4 group-hover:scale-110 transition-transform"></i>
                <span>GitHub 仓库</span>
                <i data-lucide="external-link" class="w-3 h-3 text-gray-400"></i>
            </a>
            ` : ''}

            <div class="flex flex-wrap gap-2 mt-auto">
                ${tagsHtml}
            </div>
        `;

        // Fade in (Jelly effect simulation)
        cardContainer.style.opacity = '1';
        cardContainer.style.transform = 'scale(1)';
        
        // Initialize Tilt for the new image
        if(exp.image) {
            setTimeout(initDynamicTilt, 50);
        }
    }, 200);
}

// Switch Handler
function switchExperience(id) {
    if (activeId === id) return;
    activeId = id;
    renderSidebar();
    renderCard(id);
}

// Initialize
document.addEventListener('DOMContentLoaded', init);

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
