import '/public/css/styles.css';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function App() {
  const loaderRef = useRef(null);
  const navbarRef = useRef(null);

  useEffect(() => {
    // FORCE POINTER EVENTS FROM THE START
    document.documentElement.style.pointerEvents = 'auto';
    document.body.style.pointerEvents = 'auto';
    
    // Loader animation: slide up and hide
    const loaderTl = gsap.timeline();
    loaderTl.to(loaderRef.current, {
      yPercent: -100,
      delay: 1.25,
      duration: 0.8,
      ease: "power4.inOut",
      onComplete: () => {
        if (loaderRef.current) {
          loaderRef.current.style.display = 'none';
        }
        // Remove the is-loading class from body
        document.body.classList.remove('is-loading');
        // RESTORE POINTER EVENTS AFTER LOADER
        document.documentElement.style.pointerEvents = 'auto';
        document.body.style.pointerEvents = 'auto';
      }
    });
  }, []);

  useEffect(() => {
    // Navbar scroll animation - show logo when scrolling down
    const handleScroll = () => {
      const navbar = navbarRef.current;
      if (!navbar) return;

      if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Slick Carousel
  useEffect(() => {
    if (window.$ && window.$.fn.slick) {
      const $carousel = window.$('.js-ag-carousel');
      if ($carousel.length && !$carousel.hasClass('slick-initialized')) {
        $carousel.slick({
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
            }
          ]
        });
      }
    }
  }, []);

  // Interactive 3D pressure deformation effect on hero image
  useEffect(() => {
    const imageWrapper = document.getElementById('interactiveImage');
    const pressureImage = imageWrapper?.querySelector('.pressure-image');
    
    if (!imageWrapper || !pressureImage) return;
    
    // Enable 3D perspective
    imageWrapper.style.perspective = '1000px';
    imageWrapper.style.transformStyle = 'preserve-3d';
    pressureImage.style.transformStyle = 'preserve-3d';

    const handleMouseMove = (e) => {
      const rect = imageWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate angle for 3D rotation - INVERTED so hovered part goes BACK
      const rotateX = -((y - centerY) / centerY) * 12;  // Negative to push away
      const rotateY = -((centerX - x) / centerX) * 12;  // Negative to push away
      
      // Calculate distance from center for intensity
      const distX = x - centerX;
      const distY = y - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
      const intensity = Math.max(0, 1 - distance / (maxDistance * 0.8));
      
      // Apply 3D transform - hovered part pushes BACK, opposite comes forward
      pressureImage.style.transform = `
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        scale(${1 + intensity * 0.08})
      `;
      
      // Enhanced shadow following the deformation
      const shadowX = -rotateY * 3;
      const shadowY = -rotateX * 3;
      const shadowBlur = 40 + intensity * 60;
      pressureImage.style.boxShadow = `
        ${shadowX}px ${30 + shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${0.25 + intensity * 0.35})
      `;
      
      // Subtle brightness change on press
      pressureImage.style.filter = `brightness(${1 - intensity * 0.06})`;
    };

    const handleMouseLeave = () => {
      pressureImage.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      pressureImage.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
      pressureImage.style.filter = 'brightness(1)';
    };

    imageWrapper.addEventListener('mousemove', handleMouseMove);
    imageWrapper.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      imageWrapper.removeEventListener('mousemove', handleMouseMove);
      imageWrapper.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Features carousel infinite scroll duplication
  useEffect(() => {
    const carousel = document.querySelector('.features-carousel');
    if (!carousel) return;

    // Get all feature cards
    const cards = carousel.querySelectorAll('.feature-card');
    if (cards.length === 0) return;

    // Clone all cards and append them for seamless loop
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      carousel.appendChild(clone);
    });
  }, []);

  // ===== MOBILE MENU BUTTON CLICK HANDLER =====
  useEffect(() => {
    // Force pointer events on everything
    setTimeout(() => {
      document.documentElement.style.pointerEvents = 'auto';
      document.body.style.pointerEvents = 'auto';
      document.querySelectorAll('*').forEach(el => {
        if (el.style.pointerEvents === 'none' && !el.classList.contains('nav-links')) {
          el.style.pointerEvents = 'auto';
        }
      });
    }, 100);

    // Attach menu button handlers
    setTimeout(() => {
      const menuButton = document.querySelector('.hamburger');
      const mobileMenu = document.querySelector('.nav-links');
      
      if (menuButton && mobileMenu) {
        const toggleMenu = () => {
          console.log('⭐ MENU BUTTON CLICKED - TOGGLE ⭐');
          mobileMenu.classList.toggle('menu-open');
          menuButton.classList.toggle('menu-open');
        };
        
        // Only use onclick - fires after complete click/tap interaction
        menuButton.onclick = toggleMenu;

        // Close menu when clicking links
        mobileMenu.querySelectorAll('a').forEach(link => {
          link.onclick = function() {
            mobileMenu.classList.remove('menu-open');
            menuButton.classList.remove('menu-open');
          };
        });

        console.log('✅ Mobile menu initialized');
      }
    }, 300);
  }, []);

  return (
    <>
      <div id="loader" ref={loaderRef} className="loader">
        <h1 className="loader-logo"><img src="assets/images/FizzPop LOGO.png" alt="FIZZPOP" className="brand-img-loader" /></h1>
      </div>

      <header className="navbar" id="navbar" ref={navbarRef}>
        <div className="container nav-container">
          <a href="#hero" className="logo">
            {/* <img src="assets/images/favicon.png" alt="FIZZPOP LOGO" className="nav-logo-img" /> */}
            <img src="assets/images/FizzPop%20LOGO%20Black.png" alt="FIZZPOP LOGO" className="brand-img-nav" />
          </a>
          <nav className="nav-links">
            <a href="#hero">Home</a>
            <div className="nav-dropdown">
              <a href="#" className="dropdown-trigger">Explore <i className="fas fa-chevron-down"></i></a>
              <div className="dropdown-menu">
                <a href="#flavours">Explore Flavours</a>
                <a href="#story">The FIZZ POP Story</a>
                {/* <a href="#testimonials">Testimonials</a> */}
              </div>
            </div>
            <div className="nav-dropdown">
              <a href="#" className="dropdown-trigger">Business <i className="fas fa-chevron-down"></i></a>
              <div className="dropdown-menu">
                <a href="#why-fizz-pop">Why Us?</a>
                {/* <a href="#" id="openDistributorsModal">Distributors List</a> */}
                <a href="#partner">Partner Program</a>
              </div>
            </div>
            <a href="#contact">Contact</a>
            <a href="https://wa.me/917037228868" target="_blank" className="nav-whatsapp" rel="noreferrer noopener">
              <i className="fa-brands fa-whatsapp"></i> <span>WhatsApp Us</span>
            </a>
          </nav>
          <div className="mobile-nav-group">
            <a href="https://wa.me/917037228868?text=Hello%2C%20I%E2%80%99m%20interested%20in%20discussing%20the%20FizzPOP%20distributorship%20and%20would%20like%20to%20connect%20with%20you." target="_blank" className="nav-whatsapp-mobile" aria-label="Chat on WhatsApp" rel="noreferrer noopener">
              <i className="fa-brands fa-whatsapp"></i>
            </a>
            <button className="hamburger" aria-label="Toggle mobile menu" type="button">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section id="hero" className="hero">
          <div className="hero-bg-texture"></div>
          <div className="hero-interactive-container">
            <div className="interactive-image-wrapper" id="interactiveImage">
              <img src="/assets/images/hero image.png" alt="FIZZ POP Goli Soda - The Best Indian Banta Brand" className="pressure-image" />
              <div className="pressure-overlay" id="pressureOverlay"></div>
            </div>
          </div>
        </section>

        <section className="carousel-section py-section">
          <div className="container">
            {/* <h3 className="text-center" style={{ marginBottom: '30px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--clr-brand-primary)' }}>Our Flavours</h3> */}
            <div className="js-ag-carousel">
  <div className="ag-carousel_item">
    <picture>
      {/* <source srcset="https://raw.githack.com/SochavaAG/example-mycode/master/pens/1_images/avatar-circle-1.png"> */}
      <img src="/assets/images/blueberry.png" alt="Avatar" />
    </picture>
  </div>

  <div className="ag-carousel_item">
    <picture>
      {/* <source srcset="https://raw.githack.com/SochavaAG/example-mycode/master/pens/1_images/avatar-circle-2.png"> */}
      <img src="/assets/images/fruit-beer.png" alt="Avatar" />
    </picture>
  </div>

  <div className="ag-carousel_item">
    <picture>
      {/* <source srcset="https://raw.githack.com/SochavaAG/example-mycode/master/pens/1_images/avatar-circle-3.png"> */}
      <img src="/assets/images/lemon-masala.png" alt="Avatar" />
    </picture>
  </div>

  <div className="ag-carousel_item">
    <picture>
      {/* <source srcset="https://raw.githack.com/SochavaAG/example-mycode/master/pens/1_images/avatar-circle-4.png"> */}
      <img src="/assets/images/jeera.png" alt="Avatar" />
    </picture>
  </div>

  <div className="ag-carousel_item">
    <picture>
      {/* <source srcset="https://raw.githack.com/SochavaAG/example-mycode/master/pens/1_images/avatar-circle-5.png"> */}
      <img src="/assets/images/pudina.png" alt="Avatar" />
    </picture>
  </div>

  <div className="ag-carousel_item">
    <picture>
      {/* <source srcset="https://raw.githack.com/SochavaAG/example-mycode/master/pens/1_images/avatar-circle-6.png"> */}
      <img src="/assets/images/watermelon.png" alt="Avatar" />
    </picture>
  </div>
            </div>
          </div>
        </section>
{/* 
        <section className="marquee-section">
          <div className="marquee-content">
            POP. SIP. REPEAT. &nbsp;&nbsp;&nbsp;&nbsp; POP. SIP. REPEAT. &nbsp;&nbsp;&nbsp;&nbsp; POP. SIP.
            REPEAT. &nbsp;&nbsp;&nbsp;&nbsp; POP. SIP. REPEAT. &nbsp;&nbsp;&nbsp;&nbsp; POP. SIP. REPEAT.
            &nbsp;&nbsp;&nbsp;&nbsp; POP. SIP. REPEAT. &nbsp;&nbsp;&nbsp;&nbsp; POP. SIP. REPEAT.
            &nbsp;&nbsp;&nbsp;&nbsp; POP. SIP. REPEAT. &nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </section> */}

        <section id="flavours" className="flavours">
          <div className="container">
            <div className="section-header text-center">
              <h2 className="title">Best Flavoured Goli Soda in India</h2>
              <p className="subtitle">Discover our premium range of FIZZ POP flavours.</p>
            </div>
          </div>

          <div id="flavour-media-container" className="flavour-media-container" style={{ display: "none" }}>
          </div>

          <div className="container">
            <div className="flavour-list" itemScope itemType="https://schema.org/ItemList">
              <link itemProp="url" href="https://fizzpopdrink.com/#flavours" />
              <h3 className="sr-only" itemProp="name">FIZZ POP Goli Soda Flavours</h3>

              <div className="flavour-item" itemProp="itemListElement" itemScope itemType="https://schema.org/Product">
                <div className="flavour-visual">
                  <div className="liquid-splash lime-splash"></div>
                  <img src="assets/images/lemon masala char png.png" alt="FIZZ POP Masala Lemon Soda - Authentic Indian Banta Soda Bottle" className="bottle-img" loading="lazy" itemProp="image" />
                </div>
                <div className="flavour-info">
                  {/* <span className="flavour-tag tagline-lemon">The Crowd Puller</span> */}
                  <h3 itemProp="name">Lemon Masala</h3>
                  <p itemProp="description">Chatpata nimbu with that masaledaar kick.
 Bold, refreshing, full on desi swaad.
 Har sip bole — “Oye hoye, kya baat hai!”</p>
                  <meta itemProp="brand" content="FIZZ POP" />
                </div>
              </div>

              <div className="flavour-item reverse" itemProp="itemListElement" itemScope itemType="https://schema.org/Product">
                <div className="flavour-visual">
                  <span className="badge badge-guava">Must Try</span>
                  <div className="liquid-splash pink-splash"></div>
                  <img src="assets/images/watermelon char png.png" alt="FIZZ POP Watermelon Soda - Refreshing Summer Fizzy Drink" className="bottle-img" loading="lazy" itemProp="image" />
                </div>
                <div className="flavour-info">
                  {/* <span className="flavour-tag tagline-guava">The Spicy Sweetheart 🔥</span> */}
                  <h3 itemProp="name">Watermelon</h3>
                  <p itemProp="description">Tarbooz ki juicy thandak in every sip.
 Light, sweet, super refreshing yaar.
 Garmi mein bole — “Thanda matlab maze!”</p>
                  <meta itemProp="brand" content="FIZZ POP" />
                </div>
              </div>

              <div className="flavour-item" itemProp="itemListElement" itemScope itemType="https://schema.org/Product">
                <div className="flavour-visual">
                  <div className="liquid-splash brown-splash"></div>
                  <img src="assets/images/jeera char png.png" alt="FIZZ POP Masala Jeera Soda - Traditional Cumin Spiced Fizz" className="bottle-img" loading="lazy" itemProp="image" />
                </div>
                <div className="flavour-info">
                  {/* <span className="flavour-tag tagline-jeera">The Desi Rockstar</span> */}
                  <h3 itemProp="name">Jeera</h3>
                  <p itemProp="description">Classic jeera ka chatpata fizz twist.
 Bold, savory, uniquely refreshing.
 Desi swaad jo bole — “Swad anusaar!”</p>
                  <meta itemProp="brand" content="FIZZ POP" />
                </div>
              </div>

              <div className="flavour-item reverse" itemProp="itemListElement" itemScope itemType="https://schema.org/Product">
                <div className="flavour-visual">
                  <div className="liquid-splash mint-splash"></div>
                  <img src="assets/images/fruitbeer char png.png" alt="FIZZ POP Fruit Beer Soda - Refreshing Fruit Flavored Fizz" className="bottle-img" loading="lazy" itemProp="image" />
                </div>
                <div className="flavour-info">
                  {/* <span className="flavour-tag tagline-mojito">The Cool Explorer</span> */}
                  <h3 itemProp="name">Fruit Beer</h3>
                  <p itemProp="description">Malt ka mazedaar fruity tadka.
 Sweet, refreshing, full on character.
 Wohi classic feel, ab extra fizzy scene.</p>
                  <meta itemProp="brand" content="FIZZ POP" />
                </div>
              </div>

              <div className="flavour-item" itemProp="itemListElement" itemScope itemType="https://schema.org/Product">
                <div className="flavour-visual">
                  <div className="liquid-splash blue-splash"></div>
                  <img src="assets/images/blueberry char png.png" alt="FIZZ POP Berry Tingle Blueberry Soda - Modern Indian Fruit Fizz" className="bottle-img" loading="lazy" itemProp="image" />
                </div>
                <div className="flavour-info">
                  {/* <span className="flavour-tag tagline-blueberry">The GenZ Favourite</span> */}
                  <h3 itemProp="name">Blue Berry</h3>
                  <p itemProp="description">Blueberry ka sweet-tangy blast.
 Crisp bubbles with full fruity punch.
 Ek sip aur — “Dil blueberry blueberry!”</p>
                  <meta itemProp="brand" content="FIZZ POP" />
                </div>
              </div>

              <div className="flavour-item reverse" itemProp="itemListElement" itemScope itemType="https://schema.org/Product">
                <div className="flavour-visual">
                  <span className="badge badge-mango">Must Try</span>
                  <div className="liquid-splash green-splash"></div>
                  <img src="assets/images/pudina char png.png" alt="FIZZ POP Kacha Mango Soda - Nostalgic Raw Mango Flavoured Drink" className="bottle-img" loading="lazy" itemProp="image" />
                </div>
                <div className="flavour-info">
                  {/* <span className="flavour-tag tagline-mango">The Nostalgia Trip 🥭</span> */}
                  <h3 itemProp="name">Pudina</h3>
                  <p itemProp="description">Thandi mint wali instant freshness.
 Light, crisp, bilkul mast refreshing.
 Har sip pe — “Dimag ki batti on!”</p>
                  <meta itemProp="brand" content="FIZZ POP" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="story" className="brand-story py-section">
          <div className="container story-content text-center">
            <h2>FIZZ POP Story</h2>
            <div className="story-card mb-4">
              {/* <p><strong>Indian Roots. Modern Vibe.</strong></p> */}
              <p>Born from the nostalgia of India’s iconic goli soda, FizzPop brings back the unforgettable “pop” with a bold modern twist.
 Inspired by memories from 1978, we’ve reimagined childhood flavours into vibrant, premium refreshment.</p>
              <p> From Jeera to Blueberry, every bottle is crafted to spark fun, flavour, and nostalgia together.
 One mission. One pop. A drink made to reach every Indian household.</p>
            </div>

        
          </div>
        </section>

        <section id="why-fizz-pop" className="why-fizz-pop py-section">
          <div className="container">
            <div className="section-header text-center">
              <h2 className="title">Why Choose FIZZ POP?</h2>
              {/* <p className="subtitle">Join the FIZZ POP revolution with India's most profitable margins.</p> */}
            </div>
            <div className="features-carousel-wrapper">
              <div className="features-carousel">
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">🥇</div>
                  <h4>First Mover</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">🔊</div>
                  <h4>Pop Experience</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">🏪</div>
                  <h4>Café Friendly</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">❄️</div>
                  <h4>Best Served Cold</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">💰</div>
                  <h4>Higher Margins</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">📸</div>
                  <h4>Instagrammable</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">📈</div>
                  <h4>High Rotation</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">🌟</div>
                  <h4>Unique Flavours</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">🚀</div>
                  <h4>Youth Appeal</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">✨</div>
                  <h4>Eye Catching</h4>
                </div>
                <div className="feature-card">
                  <div className="icon-wrap" aria-hidden="true">⚡</div>
                  <h4>Fast Moving</h4>
                </div>
              </div>
            </div>

            <div className="sells-best-container text-center mt-5">
              <h3 className="mb-4">Serving Customers Across</h3>
              <div className="sells-best-grid">
                <div className="sell-pill">
                  <span className="emoji">☕</span>
                  <span>Cafes</span>
                </div>
                <div className="sell-pill">
                  <span className="emoji">🤖</span>
                  <span>Vending Machines</span>
                </div>
                <div className="sell-pill">
                  <span className="emoji">🍔</span>
                  <span>Food Joints</span>
                </div>
                <div className="sell-pill">
                  <span className="emoji">⚡</span>
                  <span>Blinkit & Instamart</span>
                </div>
                <div className="sell-pill">
                  <span className="emoji">🛒</span>
                  <span>Modern Stores & Marts</span>
                </div>
    
              </div>
            </div>
          </div>
        </section>

        {/* <section id="testimonials" className="testimonials py-section">
          <div className="container text-center">
            <h2 className="title">Trusted by FIZZ POP Lovers</h2>
            <div className="features-grid testimonial-grid">
              <div className="feature-card">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p>"Guava Chilli literally blew my mind. It tastes exactly like the fresh guava with masala I used to eat outside school!"</p>
                <h4>- Priya S.</h4>
              </div>
              <div className="feature-card">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p>"Stocking Tingly was the best decision for my cafe. The bottles look so attractive that they sell themselves. Blueberry is a hit!"</p>
                <h4>- Rahul M. (Cafe Owner)</h4>
              </div>
              <div className="feature-card">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p>"The Masala Lemon glass bottle gave me pure nostalgia. The authentic goli pop fizz is unmatched. Highly recommended."</p>
                <h4>- Amit D.</h4>
              </div>
            </div>
          </div>
        </section> */}

        <section id="partner" className="partner py-section text-center">
          <div className="container">
            <h2 className="title text-light">Power Your Business With FizzPop</h2>
            <p className="subtitle text-light mb-4">Join one of India’s fastest-growing modern beverage brands and bring bold, nostalgic flavours to your customers.</p>

            <div className="features-grid mb-5">
              <div className="feature-card">
                <div className="icon-wrap" aria-hidden="true">💰</div>
                <h4>High Profit Margins</h4>
                <p>Built for strong retailer and distributor profitability with fast repeat purchases.</p>
              </div>
              <div className="feature-card">
                <div className="icon-wrap" aria-hidden="true">🚀</div>
                <h4>Flexible Revenue Sharing</h4>
                <p>Smart partnership models designed for scalable and sustainable growth.</p>
              </div>
              <div className="feature-card">
                <div className="icon-wrap" aria-hidden="true">📈</div>
                <h4>Presence Across 10+ Cities</h4>
                <p>From vending machines to cafés and food joints — FizzPop is expanding everywhere.</p>
              </div>
              <div className="feature-card">
                <div className="icon-wrap" aria-hidden="true">✨</div>
                <h4>Fast-Moving Consumer Brand</h4>
                <p>Unique flavours and eye-catching branding drive quick shelf movement and repeat demand.</p>
              </div>
              <div className="feature-card">
                <div className="icon-wrap" aria-hidden="true">✨</div>
                <h4>Built for Modern India</h4>
                <p>A perfect blend of nostalgia, innovation, and Gen Z appeal in one bottle.</p>
              </div>
            </div>

            <div className="mt-5 pt-3">
              {/* <a href="#" className="btn btn-secondary openDistributorsModalBtn btn-distributor-view btn-large">VIEW DISTRIBUTORS LIST</a> */}
              <a href="#contact" className="btn btn-primary btn-large text-dark-hover">BECOME A FIZZPOP PARTNER</a>
            </div>
          </div>
        </section>

        <section id="contact" className="contact py-section">
          <div className="container contact-wrapper">
            <div className="contact-info">
              <h2>Get Fizzy With Us!🍾✨</h2>
              <p>Whether you wanna stock FizzPop, share feedback, ya bas bolna ho “Bhai kya swaad hai!” 😎</p>
              <div className="contact-details">
                <p><strong>📞 Phone:</strong> <br /> <a href="https://wa.me/7037228868?text=Hello%2C%20I%E2%80%99m%20interested%20in%20discussing%20the%20Tingly%20distributorship%20and%20would%20like%20to%20connect%20with%20you." target="_blank" style={{ textDecoration: 'none', color: 'inherit' }} rel="noreferrer noopener">+91 7037228868</a> (WhatsApp) <br /> +91 7351555567 </p>
                <p><strong>✉️ Email:</strong> <br /> Fizzpopgolisoda@gmail.com</p>
              </div>
            </div>
            <div className="contact-form-container">
              <form className="contact-form" id="contactForm" action="https://formspree.io/f/xqegkjyp" method="POST">
                <div className="form-group">
                  <label htmlFor="name">Name / Business Name</label>
                  <input type="text" id="name" name="name" required placeholder="Apka Naam" />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" required placeholder="Number Toh Chhodke Jao 😄" pattern="[0-9]{10}" maxLength="10" />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows="4" required placeholder="Dil Ki Baat Batao"></textarea>
                </div>
                <button type="submit" className="btn btn-primary submit-btn">FizzPop Bhej Do!</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <div id="distributorsModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Authorized Distributors</h2>
            <span className="close-modal">&times;</span>
          </div>
          <div className="modal-search-bar">
            <input type="text" id="distributorSearch" placeholder="Search by city or distributor name..." />
            <i className="fas fa-search"></i>
          </div>
          <div className="modal-body">
            <div className="table-responsive">
              <table className="distributors-table">
                <thead>
                  <tr>
                    <th>City / Region</th>
                    <th>Distributor Name</th>
                    <th>Contact Number</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody id="distributorsModalTableBody"></tbody>
              </table>
            </div>
            <div id="noResults" style={{ display: 'none', textAlign: 'center', padding: '20px' }}>No distributors found matching your search.</div>
          </div>
          <div className="modal-footer">
            <p>Want to see your name here?</p>
            <a href="#contact" className="btn btn-primary" id="becomeDistributorBtn">BECOME A DISTRIBUTOR</a>
          </div>
        </div>
      </div>

      <button id="floatingPopBtn" className="play-pop-btn play-trigger-btn" data-tooltip="Listen to the iconic pop of Kancha soda and relive the nostalgia." aria-label="Play iconic soda pop sound">
        <span className="btn-icon">🫧</span>
        <span className="btn-text">Hear the Goli Pop!</span>
      </button>

      <a href="https://wa.me/919717698682?text=Hello%2C%20I%E2%80%99m%20interested%20in%20discussing%20the%20Tingly%20distributorship%20and%20would%20like%20to%20connect%20with%20you." target="_blank" id="whatsappChatBtn" className="whatsapp-btn" data-tooltip="Chat with us on WhatsApp!" rel="noreferrer noopener">
        <span className="btn-icon"><i className="fa-brands fa-whatsapp"></i></span>
        <span className="btn-text">WhatsApp Us</span>
      </a>

      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <nav className="footer-nav">
              <a href="#hero">Home</a>
              <a href="#flavours">Flavours</a>
              <a href="#" className="openDistributorsModalLink">Distributors</a>
              <a href="#contact">Contact</a>
            </nav>
            <h2><img src="assets/images/FizzPop LOGO.png" alt="FizzPop Goli Pop Soda" className="brand-img-footer" loading="lazy" /></h2>
            <p>Goli Pop Soda</p>
            <div className="footer-info-block" itemScope itemType="https://schema.org/Organization">
              <meta itemProp="name" content="MLA BEVERAGES" />
              <meta itemProp="url" content="https://fizzpopdrink.com/" />
              <meta itemProp="logo" content="https://fizzpopdrink.com/assets/images/favicon.png" />
              <strong>MLA BEVERAGES</strong><br />
              <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                Building No./Flat No.: <span itemProp="streetAddress">12 KISHANGADH</span><br />
                <span itemProp="addressLocality">IDGAH 
COLONY</span>, WARD NO. 08 IDGAH
<br />
                <span itemProp="addressRegion">Agra</span>, Uttar Pradesh, PIN: <span itemProp="postalCode">282001</span>
                <meta itemProp="addressCountry" content="IN" />
              </div>
            </div>
          </div>
          <div className="footer-links">
            <p><strong>FSSAI Lic No:</strong> 30260310123673187</p>
            <p><strong>GST No:</strong> 09ACGFM5598K1ZE</p>
            <div className="footer-contact-block">
              <p><strong>Got feedback, complaints, ya bas pyaar bhejna hai? 💥
 FizzPop is always one call away!</strong></p>
              <p><strong>Email:</strong> Fizzpopgolisoda@gmail.com</p>
              <p><strong>Ph.:</strong> +91 7037228868, +91 7351555567</p>
            </div>
          </div>
          <div className="footer-social">
            <a href="https://www.linkedin.com/company/fizz-pop/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-linkedin"></i> <span>LinkedIn</span>
            </a>
            <a href="https://www.instagram.com/fizzpop_soda?igsh=MWMwdm5kMjlpeHh2cQ==" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-instagram"></i> <span>Instagram</span>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MLA Beverages - FIZZ POP. All rights reserved.</p>
          <div className="sr-only">
            Popular Searches: Goli Soda Near Me, Kancha Soda Manufacturer, Banta Soda Online, Indian Masala Soda, Flavoured Fizzy Drinks India, Traditional Goli Soda Brands, Masala Lemon Drink, Guava Chilli Mocktail, Best Banta Brands in India, Refreshing Summer Coolers, Goli Soda Franchise Ghaziabad.
          </div>
          <p className="footer-credits">Designed & Handled by Viral Sharma (<a href="mailto:viral.rohitian@gmail.com">viral.rohitian@gmail.com</a>)</p>
        </div>
      </footer>
    </>
  );
}

export default App;
