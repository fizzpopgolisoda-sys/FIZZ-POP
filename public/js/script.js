// script.js
// Data is loaded from distributorsData.js as window.distributorsData
const distributorsData = window.distributorsData || [];

// Aggressively strip any hash fragments from the URL to keep it pristine natively 
if (window.location.hash) {
    history.replaceState('', document.title, window.location.pathname + window.location.search);
}

window.addEventListener('hashchange', e => {
    e.preventDefault();
    history.replaceState('', document.title, window.location.pathname + window.location.search);
});

document.addEventListener("DOMContentLoaded", () => {
    // --- 0. Configurable Flavours Media ---
    const FLAVOUR_MEDIA_SRC = "assets/images/Video_Generation_From_Prompt.mp4"; 
    const mediaContainer = document.getElementById('flavour-media-container');
    if (mediaContainer && FLAVOUR_MEDIA_SRC.trim() !== "") {
        const isVideo = FLAVOUR_MEDIA_SRC.toLowerCase().match(/\.(mp4|webm|ogg)$/);
        if (isVideo) {
            const videoEl = document.createElement('video');
            videoEl.src = FLAVOUR_MEDIA_SRC;
            videoEl.autoplay = true;
            videoEl.muted = true;
            videoEl.loop = true;
            videoEl.playsInline = true;
            mediaContainer.appendChild(videoEl);
        } else {
            const imgEl = document.createElement('img');
            imgEl.src = FLAVOUR_MEDIA_SRC;
            imgEl.alt = "Tingly Flavours Visual";
            mediaContainer.appendChild(imgEl);
        }
        mediaContainer.style.display = "block";
    }

    // --- 1. Loader ---
    const loader = document.getElementById('loader');
    const loaderTl = gsap.timeline();
    loaderTl.to(loader, {
        yPercent: -100,
        delay: 1.25,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: () => {
            loader.style.display = 'none';
        }
    })
    .add(() => {
        initAnimations();
    }, "+=0.15");

    // --- 2. Navigation & Dropdowns ---
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    // Sticky nav toggle on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (window.scrollY > 400) {
            document.body.classList.add('scrolled-past-hero');
        } else {
            document.body.classList.remove('scrolled-past-hero');
        }
    });

    // Mobile menu toggle
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('is-active');
            document.body.classList.toggle('mobile-menu-open');
            const spans = hamburger.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    } else {
        console.warn('Hamburger or navLinks element not found');
    }

    // Dropdown toggle for mobile
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });

    // Close mobile menu when a direct link (not dropdown) is clicked
    document.querySelectorAll('.nav-links > a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    // Also close mobile menu when a dropdown child is clicked
    document.querySelectorAll('.dropdown-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (!link.classList.contains('openDistributorsModalLink')) {
                closeMobileMenu();
            }
        });
    });

    function closeMobileMenu() {
        navLinks.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        dropdowns.forEach(d => d.classList.remove('active'));
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && navLinks.classList.contains('active')) {
            if (!navbar.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });

    // Smooth scroll & Navigation Tracking
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId.length <= 1) return;
            e.preventDefault();
            
            // Track navigation click
            if (typeof gtag === 'function') {
                gtag('event', 'navigation_click', {
                    'target_section': targetId.replace('#', ''),
                    'link_text': (this.innerText || this.getAttribute('aria-label') || 'unnamed').trim()
                });
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = navbar.offsetHeight || 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                     top: offsetPosition,
                     behavior: "smooth"
                });
            }
        });
    });

    // --- 2.1 Section Visibility Tracking (Google Tag) ---
    const trackedSections = document.querySelectorAll('section[id]');
    let lastTrackedSection = '';
    
    // Mapping IDs to friendly names for better GA4 Reporting
    const sectionNames = {
        'hero': 'Home Intro',
        'flavours': 'Exploration (Flavours)',
        'story': 'Brand Story (The Tingly Tale)',
        'why-tingly': 'Value Proposition (Why Us)',
        'testimonials': 'Social Proof (Reviews)',
        'faq': 'Help Center (FAQ)',
        'partner': 'B2B (Partner Program)',
        'contact': 'Lead Gen (Contact Us)'
    };

    const sectionViewHandler = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // Prevent duplicate hits on minor scroll adjustments
                if (sectionId === lastTrackedSection) return;
                lastTrackedSection = sectionId;

                const friendlyName = sectionNames[sectionId] || sectionId;

                if (typeof gtag === 'function') {
                    // 1. Send as Virtual Page View (Appears in 'Pages & Screens' Report)
                    gtag('event', 'page_view', {
                        'page_title': 'Tingly | ' + friendlyName,
                        'page_location': window.location.origin + window.location.pathname + '#' + sectionId,
                        'page_path': window.location.pathname + '#' + sectionId
                    });

                    // 2. Keep specialized event for deep-dive analysis
                    gtag('event', 'section_view', {
                        'section_id': sectionId,
                        'section_name': friendlyName
                    });
                }
            }
        });
    };

    const scrollObserver = new IntersectionObserver(sectionViewHandler, {
        root: null,
        rootMargin: '-45% 0px -45% 0px', // Trigger when section is precisely in the middle 10% of viewport
        threshold: 0
    });
    trackedSections.forEach(section => scrollObserver.observe(section));

    // --- 3. Distributors Modal Logic ---
    const modal = document.getElementById('distributorsModal');
    const modalTableBody = document.getElementById('distributorsModalTableBody');
    const searchInput = document.getElementById('distributorSearch');
    const noResults = document.getElementById('noResults');
    const closeBtn = document.querySelector('.close-modal');

    // Select all potential triggers for the modal
    const modalTriggers = document.querySelectorAll('#openDistributorsModal, .openDistributorsModalBtn, .openDistributorsModalLink');

    function renderDistributors(data) {
        modalTableBody.innerHTML = '';
        if (data.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';
        
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.city}</strong></td>
                <td>${item.name}</td>
                <td><a href="tel:${item.phone.replace(/\s/g, '')}" class="text-maroon">${item.phone}</a></td>
                <td><small>${item.address}</small></td>
            `;
            modalTableBody.appendChild(tr);
        });
    }

    const becomeDistributorBtn = document.getElementById('becomeDistributorBtn');

    function openModal() {
        renderDistributors(distributorsData);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
        closeMobileMenu();

        // Track modal open as a virtual section visit
        if (typeof gtag === 'function') {
            gtag('event', 'page_view', {
                'page_title': 'Tingly | Distributors List',
                'page_location': window.location.origin + window.location.pathname + '#distributors-list',
                'page_path': window.location.pathname + '#distributors-list'
            });
            gtag('event', 'modal_open', { 'modal_name': 'distributors_list' });
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    if (becomeDistributorBtn) {
        becomeDistributorBtn.addEventListener('click', (e) => {
            closeModal();
            // The default anchor behavior will scroll to #contact
        });
    }

    // Modal Keyboard Accessibility (Esc to close)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = distributorsData.filter(d => 
            d.city.toLowerCase().includes(term) || 
            d.name.toLowerCase().includes(term) ||
            d.address.toLowerCase().includes(term)
        );
        renderDistributors(filtered);
    });

    // --- 4. Custom Form Validation ---
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));
        phoneInput.addEventListener('invalid', () => {
            phoneInput.setCustomValidity(phoneInput.value.length === 0 ? 'Enter your 10-digit phone number.' : 'Enter exactly 10 digits.');
        });
    }

    // --- Animations ---
    gsap.registerPlugin(ScrollTrigger);

    function initAnimations() {
        document.body.classList.remove('is-loading');
        const startVisible = document.querySelectorAll(".navbar, .hero-content, .hero-visuals");
        if (startVisible.length > 0) {
            gsap.set(startVisible, { visibility: "visible", opacity: 1 });
        }

        // Navbar Entrance
        const navLogo = document.querySelector(".nav-logo-img");
        if (navLogo) {
            gsap.fromTo(navLogo, { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 1.2, ease: "back.out(2)" });
        }
        
        const navItems = gsap.utils.toArray(".nav-links > a, .nav-dropdown");
        if (navItems.length > 0) {
            gsap.fromTo(navItems, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", clearProps: "all" }, "-=0.8");
        }

        // Hero sequence with defensive checks for each step
        const heroTl = gsap.timeline();
        
        const hSub = document.querySelector(".hero-subhead");
        if (hSub) heroTl.fromTo(hSub, { y: 50, opacity: 0, scale: 0.8, letterSpacing: "10px" }, { y: 0, opacity: 1, scale: 1, letterSpacing: "2px", duration: 1.2, ease: "back.out(1.5)" });
        
        const hHead = document.querySelector(".hero-head");
        if (hHead) heroTl.fromTo(hHead, { scale: 0.5, opacity: 0, rotation: 5, y: 30 }, { scale: 1, opacity: 1, rotation: -3, y: 0, duration: 1.2, ease: "power3.out" }, hSub ? "-=0.8" : 0);
        
        const hSub2 = document.querySelector(".hero-subhead2");
        if (hSub2) heroTl.fromTo(hSub2, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6");
        
        const hDesc = document.querySelector(".hero-desc");
        if (hDesc) heroTl.fromTo(hDesc, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=1.2");
        
        const hFeat = document.querySelectorAll(".hero-features span");
        if (hFeat.length > 0) heroTl.fromTo(hFeat, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(2)" }, "-=1.0");
        
        const hAct = document.querySelectorAll(".hero-actions .btn");
        if (hAct.length > 0) heroTl.fromTo(hAct, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "back.out(2)", clearProps: "all" }, "-=0.8");


        // Flavours
        gsap.utils.toArray('.flavour-item').forEach((item, i) => {
            gsap.fromTo(item, { y: 40, opacity: 0 }, {
                scrollTrigger: { trigger: item, start: "top 85%" },
                y: 0, opacity: 1, duration: 1, ease: "power3.out"
            });
        });
        
        // Dynamic bg change for flavours
        const bgColors = ["#ffffff", "#fff5e6", "#ffebf0", "#f4e4d5", "#e6ffff", "#e8efff", "#e8ffe8"];
        const flavoursSection = document.querySelector('.flavours');
        if (flavoursSection) {
            gsap.utils.toArray('.flavour-item').forEach((item, i) => {
                ScrollTrigger.create({
                    trigger: item,
                    start: "top 55%",
                    end: "bottom 45%",
                    onEnter: () => gsap.to(flavoursSection, { backgroundColor: bgColors[(i+1) % bgColors.length], duration: 0.8 }),
                    onEnterBack: () => gsap.to(flavoursSection, { backgroundColor: bgColors[(i+1) % bgColors.length], duration: 0.8 })
                });
            });
        }

        // Other Sections
        // Other Sections (using each grid as its own trigger)
        document.querySelectorAll(".features-grid").forEach(grid => {
            const cards = grid.querySelectorAll(".feature-card");
            if (cards.length > 0) {
                gsap.fromTo(cards, { y: 40, opacity: 0 }, {
                    scrollTrigger: { trigger: grid, start: "top 85%" },
                    y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out"
                });
            }
        });
    }

    // Platforms - Robust check for commented out or missing banner
    const platformsBanner = document.querySelector('.platforms-banner');
    const platformChips = document.querySelectorAll('.platform-chip');
    if (platformsBanner && platformChips.length > 0) {
        gsap.fromTo(platformChips, { y: 20, opacity: 0 }, {
            scrollTrigger: { trigger: platformsBanner, start: "top 85%" },
            y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(2)"
        });
    }

    // Sound logic & Pop Tracking
    document.querySelectorAll('.play-trigger-btn').forEach(btn => {
        btn.addEventListener('click', () => {
             const audio = new Audio('assets/audio/Tingly-Goli-Pop-Fizz.mp3');
             audio.volume = 0.6;
             audio.play().catch(e => console.warn("Blocked", e));
             btn.classList.add('show-tooltip');
             setTimeout(() => btn.classList.remove('show-tooltip'), 3000);

             // Track pop interaction
             if (typeof gtag === 'function') {
                gtag('event', 'soda_pop_played', {
                    'button_location': btn.id || 'hero_or_floating'
                });
             }
        });
    });

    // Form logic
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn');
            btn.innerText = "Sending...";
            fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
                .then(r => { 
                    if(r.ok) { btn.innerText = "Received!"; form.reset(); }
                    else { btn.innerText = "Error!"; }
                    setTimeout(() => btn.innerText = "Send Message", 3000);
                });
        });
    }
});

(function ($) {
  $(function () {


    $('.js-ag-carousel').slick({
      dots: false,
      arrows: false,
      infinite: true,
      slidesToShow: 5,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 0,
      speed: 8000,
      cssEase: 'linear',
      responsive: [
        {
          breakpoint: 1320,
          settings: {
            slidesToShow: 4,
            speed: 12000,
            slidesToScroll: 4
          }
        },
        {
          breakpoint: 1080,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 680,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
        }
      }]
    });


  });
})(jQuery);