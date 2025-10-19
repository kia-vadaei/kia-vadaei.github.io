/**
 * Main JavaScript for Kianoosh Vadaei's Academic Homepage
 * Handles theme toggle, navigation, animations, and interactions
 */

(function() {
  'use strict';

  // ===== THEME MANAGEMENT =====
  class ThemeManager {
    constructor() {
      this.themeToggle = document.querySelector('.theme-toggle');
      this.currentTheme = localStorage.getItem('theme') || 'light'; // Default to light theme
      this.init();
    }

    getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    init() {
      this.applyTheme(this.currentTheme);
      this.bindEvents();
      this.watchSystemTheme();
    }

    bindEvents() {
      if (this.themeToggle) {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
      }
    }

    watchSystemTheme() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    toggleTheme() {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(this.currentTheme);
      localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.updateThemeIcon(theme);
    }

    updateThemeIcon(theme) {
      if (this.themeToggle) {
        this.themeToggle.innerHTML = theme === 'dark' ? 
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' :
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      }
    }
  }

  // ===== NAVIGATION MANAGEMENT =====
  class NavigationManager {
    constructor() {
      this.navLinks = document.querySelectorAll('.nav__link');
      this.sections = document.querySelectorAll('section[id]');
      this.init();
    }

    init() {
      this.bindEvents();
      this.highlightActiveSection();
    }

    bindEvents() {
      // Smooth scroll for navigation links
      this.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            this.scrollToSection(href.substring(1));
          }
        });
      });

      // Update active section on scroll
      window.addEventListener('scroll', this.throttle(() => {
        this.highlightActiveSection();
      }, 100));
    }

    scrollToSection(sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }

    highlightActiveSection() {
      const scrollPosition = window.scrollY + 100;
      
      this.sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  }

  // ===== ANIMATION MANAGER =====
  class AnimationManager {
    constructor() {
      this.observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      this.init();
    }

    init() {
      this.setupIntersectionObserver();
      this.animateElements();
    }

    setupIntersectionObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add a small delay to ensure smooth animation
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, 100);
          }
        });
      }, this.observerOptions);
    }

    animateElements() {
      const elementsToAnimate = document.querySelectorAll('.fade-in');
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        // Skip animations for users who prefer reduced motion
        elementsToAnimate.forEach(element => {
          element.classList.add('visible');
        });
        return;
      }
      
      elementsToAnimate.forEach((element, index) => {
        // Add animate class after a short delay to prevent immediate hiding
        setTimeout(() => {
          element.classList.add('animate');
          this.observer.observe(element);
        }, index * 50); // Stagger the animations slightly
      });
    }
  }

  // ===== CONTACT FORM MANAGER =====
  class ContactFormManager {
    constructor() {
      this.form = document.querySelector('.contact-form');
      this.init();
    }

    init() {
      if (this.form) {
        this.bindEvents();
      }
    }

    bindEvents() {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      // Copy email to clipboard
      const copyEmailBtn = document.querySelector('.copy-email');
      if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
          this.copyToClipboard('kianoosh.vadaei@gmail.com');
        });
      }
    }

    handleSubmit() {
      const formData = new FormData(this.form);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');

      if (!name || !email || !message) {
        this.showNotification('Please fill in all fields.', 'error');
        return;
      }

      // Create mailto link
      const subject = `Contact from ${name}`;
      const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      const mailtoLink = `mailto:kianoosh.vadaei@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      // Show success message
      this.showNotification('Email client opened. Please send your message.', 'success');
      
      // Reset form
      this.form.reset();
    }

    copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.showNotification('Email copied to clipboard!', 'success');
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showNotification('Email copied to clipboard!', 'success');
      }
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification notification--${type}`;
      notification.textContent = message;
      
      // Style the notification
      Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease-out',
        backgroundColor: type === 'success' ? '#00BFA6' : type === 'error' ? '#ff4757' : '#00FFCC'
      });

      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);

      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }
  }

  // ===== PUBLICATIONS FILTER MANAGER =====
  class PublicationsFilterManager {
    constructor() {
      this.searchInput = document.querySelector('.publications-search');
      this.filterButtons = document.querySelectorAll('.filter-btn');
      this.publicationCards = document.querySelectorAll('.publication-card');
      this.init();
    }

    init() {
      if (this.searchInput || this.filterButtons.length > 0) {
        this.bindEvents();
      }
    }

    bindEvents() {
      // Search functionality
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.filterPublications(e.target.value);
        });
      }

      // Filter buttons
      this.filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const filter = e.target.dataset.filter;
          this.filterByCategory(filter);
          this.updateActiveFilter(e.target);
        });
      });
    }

    filterPublications(searchTerm) {
      const term = searchTerm.toLowerCase();
      
      this.publicationCards.forEach(card => {
        const title = card.querySelector('.publication__title')?.textContent.toLowerCase() || '';
        const abstract = card.querySelector('.publication__abstract')?.textContent.toLowerCase() || '';
        const authors = card.querySelector('.publication__authors')?.textContent.toLowerCase() || '';
        
        const matches = title.includes(term) || abstract.includes(term) || authors.includes(term);
        
        card.style.display = matches ? 'block' : 'none';
      });
    }

    filterByCategory(category) {
      this.publicationCards.forEach(card => {
        if (category === 'all') {
          card.style.display = 'block';
        } else {
          const cardCategory = card.dataset.category;
          card.style.display = cardCategory === category ? 'block' : 'none';
        }
      });
    }

    updateActiveFilter(activeButton) {
      this.filterButtons.forEach(btn => btn.classList.remove('active'));
      activeButton.classList.add('active');
    }
  }

  // ===== UTILITY FUNCTIONS =====
  class Utils {
    static debounce(func, wait) {
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

    static throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }

    static addLoadingAnimation(element) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100);
    }
  }

  // ===== ACADEMIC SYMBOLS MANAGER =====
  class AcademicSymbolsManager {
    constructor() {
      this.symbols = [
        '∑', 'π', '∫', 'Ω', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'λ', 'μ', 'ν', 'ξ', 'ρ', 'σ', 'τ', 'φ', 'χ', 'ψ', 'ω',
        '∇', '∂', '∞', '±', '×', '÷', '√', '∝', '∈', '∉', '⊂', '⊃', '∪', '∩', '∅', '∀', '∃', '¬', '∧', '∨', '→', '↔',
        'ℝ', 'ℂ', 'ℕ', 'ℤ', 'ℚ', 'ℙ', 'ℍ', '𝕊', '𝔸', '𝔹', 'ℰ', 'ℱ', '𝒢', 'ℋ', 'ℐ', '𝒥', '𝒦', 'ℒ', 'ℳ', '𝒩', '𝒪', '𝒫', '𝒬', 'ℛ', '𝒮', '𝒯', '𝒰', '𝒱', '𝒲', '𝒳', '𝒴', '𝒵'
      ];
      this.container = document.getElementById('academicSymbols');
      this.init();
    }

    init() {
      if (this.container) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
          this.createSymbols();
          this.startAnimation();
        }
      }
    }

    createSymbols() {
      // Create 20-30 symbols for a subtle effect
      const symbolCount = 25;
      
      for (let i = 0; i < symbolCount; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'academic-symbol';
        symbol.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        
        // Random positioning
        symbol.style.left = Math.random() * 100 + '%';
        symbol.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
        
        // Random rotation for variety
        symbol.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        this.container.appendChild(symbol);
      }
    }

    startAnimation() {
      // Restart animations periodically to keep symbols flowing
      setInterval(() => {
        const symbols = this.container.querySelectorAll('.academic-symbol');
        symbols.forEach(symbol => {
          // Randomly reposition some symbols
          if (Math.random() < 0.3) {
            symbol.style.left = Math.random() * 100 + '%';
            symbol.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
          }
        });
      }, 10000); // Every 10 seconds
    }
  }

  // ===== INITIALIZATION =====
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    new ThemeManager();
    new NavigationManager();
    new AnimationManager();
    new ContactFormManager();
    new PublicationsFilterManager();
    new AcademicSymbolsManager();

    // Add fade-in class to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      section.classList.add('fade-in');
    });

    // Add scale-on-hover to cards
    const cards = document.querySelectorAll('.card, .publication-card, .project-card');
    cards.forEach(card => {
      card.classList.add('scale-on-hover');
    });

    // Handle external links
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
      if (!link.hasAttribute('target')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // Add skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView();
        }
      });
    }

    // Progress bars animation
    const progressBars = document.querySelectorAll('.progress-bar__fill');
    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const width = bar.classList.contains('progress-bar__fill--advanced') ? '90%' :
                       bar.classList.contains('progress-bar__fill--intermediate') ? '70%' : '50%';
          setTimeout(() => {
            bar.style.width = width;
          }, 200);
        }
      });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => {
      progressObserver.observe(bar);
    });

    console.log('🎓 Kianoosh Vadaei\'s Academic Homepage loaded successfully!');
  });

  // ===== ERROR HANDLING =====
  window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
  });

  // ===== PERFORMANCE MONITORING =====
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`Page loaded in ${loadTime}ms`);
    });
  }

})();
