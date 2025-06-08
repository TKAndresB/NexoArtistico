// Utility functions
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const throttle = (func, limit) => {
  let inThrottle
  return function () {
    const args = arguments
    
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Performance observer for animations
const observePerformance = () => {
  if ("IntersectionObserver" in window) {
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
            animationObserver.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    // Observe elements for animation
    document.querySelectorAll(".stat-card, .project-card, .testimonial-card, .card").forEach((el) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(30px)"
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
      animationObserver.observe(el)
    })
  }
}

// Theme management
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem("theme") || "light"
    this.init()
  }

  init() {
    this.applyTheme()
    this.bindEvents()
  }

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.theme)
    this.updateThemeIcons()
  }

  updateThemeIcons() {
    const themeButtons = document.querySelectorAll(".theme-toggle")
    themeButtons.forEach((button) => {
      const icon = button.querySelector("i")
      if (icon) {
        icon.className = this.theme === "dark" ? "fas fa-sun" : "fas fa-moon"
      }
    })
  }

  toggle() {
    this.theme = this.theme === "light" ? "dark" : "light"
    localStorage.setItem("theme", this.theme)
    this.applyTheme()

    // Add transition effect
    document.body.style.transition = "background-color 0.3s ease, color 0.3s ease"
    setTimeout(() => {
      document.body.style.transition = ""
    }, 300)
  }

  bindEvents() {
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.addEventListener("click", () => this.toggle())
    })
  }
}

// Mobile menu management
class MobileMenu {
  constructor() {
    this.menu = document.querySelector(".mobile-menu")
    this.toggleBtn = document.querySelector(".menu-toggle")
    this.closeBtn = document.querySelector(".mobile-menu-close")
    this.links = document.querySelectorAll(".mobile-menu a")
    this.isOpen = false
    this.init()
  }

  init() {
    this.bindEvents()
  }

  open() {
    this.menu.classList.add("active")
    document.body.style.overflow = "hidden"
    this.isOpen = true

    // Focus management for accessibility
    this.closeBtn.focus()
    this.trapFocus()
  }

  close() {
    this.menu.classList.remove("active")
    document.body.style.overflow = ""
    this.isOpen = false
    this.toggleBtn.focus()
  }

  trapFocus() {
    const focusableElements = this.menu.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    this.menu.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    })
  }

  bindEvents() {
    this.toggleBtn?.addEventListener("click", () => this.open())
    this.closeBtn?.addEventListener("click", () => this.close())

    // Close on link click
    this.links.forEach((link) => {
      link.addEventListener("click", () => this.close())
    })

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close()
      }
    })

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (this.isOpen && !this.menu.contains(e.target) && !this.toggleBtn.contains(e.target)) {
        this.close()
      }
    })
  }
}

// Header scroll effects
class HeaderManager {
  constructor() {
    this.header = document.querySelector("header")
    this.lastScrollTop = 0
    this.scrollThreshold = 100
    this.init()
  }

  init() {
    this.bindEvents()
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Add scrolled class for styling
    if (scrollTop > this.scrollThreshold) {
      this.header.classList.add("scrolled")
    } else {
      this.header.classList.remove("scrolled")
    }

    this.lastScrollTop = scrollTop
  }

  bindEvents() {
    window.addEventListener(
      "scroll",
      throttle(() => this.handleScroll(), 16),
    )
  }
}

// Smooth scrolling for anchor links
class SmoothScroll {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => this.handleClick(e))
    })
  }

  handleClick(e) {
    e.preventDefault()
    const targetId = e.currentTarget.getAttribute("href")

    if (targetId === "#") return

    const targetElement = document.querySelector(targetId)
    if (targetElement) {
      const headerHeight = document.querySelector("header").offsetHeight
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })

      // Update URL without triggering scroll
      history.pushState(null, null, targetId)
    }
  }
}

// Tab functionality
class TabManager {
  constructor() {
    this.tabGroups = document.querySelectorAll(".tabs, .library-tabs, .learning-tabs")
    this.init()
  }

  init() {
    this.tabGroups.forEach((group) => this.initTabGroup(group))
  }

  initTabGroup(tabGroup) {
    const buttons = tabGroup.querySelectorAll(".tab-btn")
    const panes = tabGroup.querySelectorAll(".tab-pane")

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabId = button.dataset.tab

        // Remove active classes
        buttons.forEach((btn) => btn.classList.remove("active"))
        panes.forEach((pane) => pane.classList.remove("active"))

        // Add active classes
        button.classList.add("active")
        const targetPane = document.getElementById(tabId)
        if (targetPane) {
          targetPane.classList.add("active")
        }

        // Announce to screen readers
        button.setAttribute("aria-selected", "true")
        buttons.forEach((btn) => {
          if (btn !== button) btn.setAttribute("aria-selected", "false")
        })
      })

      // Initialize ARIA attributes
      button.setAttribute("role", "tab")
      button.setAttribute("aria-selected", button.classList.contains("active"))
    })

    // Initialize pane ARIA attributes
    panes.forEach((pane) => {
      pane.setAttribute("role", "tabpanel")
    })
  }
}

// Lazy loading for images
class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll("img[data-src]")
    this.init()
  }

  init() {
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target)
              this.observer.unobserve(entry.target)
            }
          })
        },
        {
          rootMargin: "50px 0px",
        },
      )

      this.images.forEach((img) => this.observer.observe(img))
    } else {
      // Fallback for browsers without IntersectionObserver
      this.images.forEach((img) => this.loadImage(img))
    }
  }

  loadImage(img) {
    img.src = img.dataset.src
    img.classList.add("loaded")
    img.removeAttribute("data-src")
  }
}

// Form validation
class FormValidator {
  constructor() {
    this.forms = document.querySelectorAll("form")
    this.init()
  }

  init() {
    this.forms.forEach((form) => this.initForm(form))
  }

  initForm(form) {
    const inputs = form.querySelectorAll("input, textarea, select")

    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input))
      input.addEventListener(
        "input",
        debounce(() => this.validateField(input), 300),
      )
    })

    form.addEventListener("submit", (e) => this.handleSubmit(e))
  }

  validateField(field) {
    const value = field.value.trim()
    let isValid = true
    let message = ""

    // Required field validation
    if (field.hasAttribute("required") && !value) {
      isValid = false
      message = "Este campo es obligatorio"
    }

    // Email validation
    if (field.type === "email" && value && !this.isValidEmail(value)) {
      isValid = false
      message = "Por favor, introduce un email válido"
    }

    // Minimum length validation
    const minLength = field.getAttribute("minlength")
    if (minLength && value.length < Number.parseInt(minLength)) {
      isValid = false
      message = `Mínimo ${minLength} caracteres`
    }

    this.updateFieldState(field, isValid, message)
    return isValid
  }

  updateFieldState(field, isValid, message) {
    const errorElement = field.parentNode.querySelector(".error-message")

    if (isValid) {
      field.classList.remove("error")
      field.classList.add("valid")
      if (errorElement) errorElement.remove()
    } else {
      field.classList.remove("valid")
      field.classList.add("error")

      if (!errorElement) {
        const errorDiv = document.createElement("div")
        errorDiv.className = "error-message"
        errorDiv.textContent = message
        field.parentNode.appendChild(errorDiv)
      } else {
        errorElement.textContent = message
      }
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  handleSubmit(e) {
    const form = e.target
    const inputs = form.querySelectorAll("input, textarea, select")
    let isFormValid = true

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false
      }
    })

    if (!isFormValid) {
      e.preventDefault()
      const firstError = form.querySelector(".error")
      if (firstError) {
        firstError.focus()
      }
    }
  }
}

// Button hover effects
class ButtonEffects {
  constructor() {
    this.buttons = document.querySelectorAll(".btn")
    this.init()
  }

  init() {
    this.buttons.forEach((button) => {
      button.addEventListener("mouseenter", () => this.handleMouseEnter(button))
      button.addEventListener("mouseleave", () => this.handleMouseLeave(button))
      button.addEventListener("focus", () => this.handleFocus(button))
      button.addEventListener("blur", () => this.handleBlur(button))
    })
  }

  handleMouseEnter(button) {
    if (!button.disabled) {
      button.style.transform = "translateY(-2px)"
    }
  }

  handleMouseLeave(button) {
    if (!button.disabled) {
      button.style.transform = "translateY(0)"
    }
  }

  handleFocus(button) {
    button.style.outline = "2px solid var(--color-primary)"
    button.style.outlineOffset = "2px"
  }

  handleBlur(button) {
    button.style.outline = ""
    button.style.outlineOffset = ""
  }
}

// Parallax effects
class ParallaxManager {
  constructor() {
    this.elements = document.querySelectorAll("[data-parallax]")
    this.init()
  }

  init() {
    if (this.elements.length > 0) {
      window.addEventListener(
        "scroll",
        throttle(() => this.handleScroll(), 16),
      )
    }
  }

  handleScroll() {
    const scrolled = window.pageYOffset

    this.elements.forEach((element) => {
      const speed = element.dataset.parallax || 0.5
      const yPos = -(scrolled * speed)
      element.style.transform = `translateY(${yPos}px)`
    })
  }
}

// Accessibility improvements
class AccessibilityManager {
  constructor() {
    this.init()
  }

  init() {
    this.addSkipLink()
    this.improveKeyboardNavigation()
    this.addAriaLabels()
    this.handleReducedMotion()
  }

  addSkipLink() {
    const skipLink = document.createElement("a")
    skipLink.href = "#main-content"
    skipLink.textContent = "Saltar al contenido principal"
    skipLink.className = "skip-link sr-only"
    skipLink.addEventListener("focus", () => skipLink.classList.remove("sr-only"))
    skipLink.addEventListener("blur", () => skipLink.classList.add("sr-only"))

    document.body.insertBefore(skipLink, document.body.firstChild)
  }

  improveKeyboardNavigation() {
    // Add visible focus indicators
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation")
      }
    })

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-navigation")
    })
  }

  addAriaLabels() {
    // Add aria-labels to buttons without text
    document.querySelectorAll("button:not([aria-label])").forEach((button) => {
      const icon = button.querySelector("i")
      if (icon && !button.textContent.trim()) {
        const iconClass = icon.className
        if (iconClass.includes("fa-bars")) {
          button.setAttribute("aria-label", "Abrir menú")
        } else if (iconClass.includes("fa-times")) {
          button.setAttribute("aria-label", "Cerrar menú")
        } else if (iconClass.includes("fa-moon") || iconClass.includes("fa-sun")) {
          button.setAttribute("aria-label", "Cambiar tema")
        }
      }
    })
  }

  handleReducedMotion() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

    if (prefersReducedMotion.matches) {
      document.documentElement.style.setProperty("--transition-fast", "0ms")
      document.documentElement.style.setProperty("--transition-normal", "0ms")
      document.documentElement.style.setProperty("--transition-slow", "0ms")
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.init()
  }

  init() {
    if ("PerformanceObserver" in window) {
      this.observeLCP()
      this.observeFID()
      this.observeCLS()
    }
  }

  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log("LCP:", lastEntry.startTime)
    })
    observer.observe({ entryTypes: ["largest-contentful-paint"] })
  }

  observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        console.log("FID:", entry.processingStart - entry.startTime)
      })
    })
    observer.observe({ entryTypes: ["first-input"] })
  }

  observeCLS() {
    let clsValue = 0
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      console.log("CLS:", clsValue)
    })
    observer.observe({ entryTypes: ["layout-shift"] })
  }
}

// Main application initialization
class App {
  constructor() {
    this.init()
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initializeComponents())
    } else {
      this.initializeComponents()
    }
  }

  initializeComponents() {
    // Set current year in footer
    const yearElement = document.getElementById("current-year")
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear()
    }

    // Initialize all components
    this.themeManager = new ThemeManager()
    this.mobileMenu = new MobileMenu()
    this.headerManager = new HeaderManager()
    this.smoothScroll = new SmoothScroll()
    this.tabManager = new TabManager()
    this.lazyLoader = new LazyLoader()
    this.formValidator = new FormValidator()
    this.buttonEffects = new ButtonEffects()
    this.parallaxManager = new ParallaxManager()
    this.accessibilityManager = new AccessibilityManager()

    // Initialize performance monitoring in development
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      this.performanceMonitor = new PerformanceMonitor()
    }

    // Initialize animations
    observePerformance()

    // Add loading animation
    window.addEventListener("load", () => {
      document.body.classList.add("loaded")
      this.initializeLoadedFeatures()
    })

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pauseAnimations()
      } else {
        this.resumeAnimations()
      }
    })
  }

  initializeLoadedFeatures() {
    // Features that need the page to be fully loaded
    this.initializeGallery()
    this.initializeCounters()
  }

  initializeGallery() {
    const galleryItems = document.querySelectorAll(".gallery-item")
    const galleryDots = document.querySelectorAll(".gallery-dot")
    const prevBtn = document.querySelector(".gallery-nav.prev")
    const nextBtn = document.querySelector(".gallery-nav.next")

    if (galleryItems.length === 0) return

    let currentIndex = 0
    let interval

    const showSlide = (index) => {
      galleryItems.forEach((item) => item.classList.remove("active"))
      galleryDots.forEach((dot) => dot.classList.remove("active"))

      if (galleryItems[index]) {
        galleryItems[index].classList.add("active")
      }
      if (galleryDots[index]) {
        galleryDots[index].classList.add("active")
      }
      currentIndex = index
    }

    const nextSlide = () => {
      let newIndex = currentIndex + 1
      if (newIndex >= galleryItems.length) {
        newIndex = 0
      }
      showSlide(newIndex)
    }

    const prevSlide = () => {
      let newIndex = currentIndex - 1
      if (newIndex < 0) {
        newIndex = galleryItems.length - 1
      }
      showSlide(newIndex)
    }

    const startAutoplay = () => {
      interval = setInterval(nextSlide, 5000)
    }

    const stopAutoplay = () => {
      clearInterval(interval)
    }

    // Initialize autoplay
    startAutoplay()

    // Event listeners
    prevBtn?.addEventListener("click", () => {
      prevSlide()
      stopAutoplay()
    })

    nextBtn?.addEventListener("click", () => {
      nextSlide()
      stopAutoplay()
    })

    galleryDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index)
        stopAutoplay()
      })
    })

    // Pause autoplay on hover
    const gallery = document.querySelector(".gallery")
    if (gallery) {
      gallery.addEventListener("mouseenter", stopAutoplay)
      gallery.addEventListener("mouseleave", startAutoplay)
    }
  }

  initializeCounters() {
    const counters = document.querySelectorAll(".stat-card h3")

    counters.forEach((counter) => {
      const target = Number.parseInt(counter.textContent.replace(/\D/g, ""))
      if (target) {
        this.animateCounter(counter, target)
      }
    })
  }

  animateCounter(element, target) {
    let current = 0
    const increment = target / 100
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        element.textContent = `+${target}`
        clearInterval(timer)
      } else {
        element.textContent = `+${Math.floor(current)}`
      }
    }, 20)
  }

  pauseAnimations() {
    document.body.classList.add("animations-paused")
  }

  resumeAnimations() {
    document.body.classList.remove("animations-paused")
  }
}

// Initialize the application
new App()

// Add CSS for animations
const animationStyles = `
  .animate-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }

  .keyboard-navigation *:focus {
    outline: 2px solid var(--color-primary) !important;
    outline-offset: 2px !important;
  }

  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--color-primary);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 1000;
  }

  .skip-link:focus {
    top: 6px;
  }

  .error-message {
    color: var(--error-500);
    font-size: var(--font-size-sm);
    margin-top: var(--space-xs);
  }

  .error {
    border-color: var(--error-500) !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }

  .valid {
    border-color: var(--success-500) !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
  }

  .loaded {
    opacity: 1;
  }

  .animations-paused * {
    animation-play-state: paused !important;
  }

  img.loaded {
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  img[data-src] {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-in {
      transition: none !important;
    }
  }
`

// Inject animation styles
const styleSheet = document.createElement("style")
styleSheet.textContent = animationStyles
document.head.appendChild(styleSheet)
document.addEventListener("DOMContentLoaded", initializeComponents)

function initializeComponents() {
  // Set current year in footer
  const yearElements = document.querySelectorAll("#current-year")
  yearElements.forEach((element) => {
    element.textContent = new Date().getFullYear()
  })
}

// ===================================
// NEXO ARTISTICO - MAIN JAVASCRIPT
// ===================================

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all components
  initMobileMenu()
  initScrollAnimations()
  initCarousel()
  initSmoothScrolling()

  console.log("Nexo Artistico initialized successfully")
})

// ===================================
// MOBILE MENU FUNCTIONALITY
// ===================================
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle")
  const mobileMenu = document.querySelector(".mobile-menu")
  const mobileMenuClose = document.querySelector(".mobile-menu-close i")

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.add("active")
      document.body.style.overflow = "hidden"
    })
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener("click", () => {
      mobileMenu.classList.remove("active")
      document.body.style.overflow = ""
    })
  }

  // Close menu when clicking outside
  if (mobileMenu) {
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove("active")
        document.body.style.overflow = ""
      }
    })
  }

  // Close menu when clicking on links
  const mobileMenuLinks = document.querySelectorAll(".mobile-menu a")
  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active")
      document.body.style.overflow = ""
    })
  })
}

// ===================================
// CAROUSEL FUNCTIONALITY
// ===================================
function initCarousel() {
  const track = document.getElementById("carousel-track")
  const slides = document.querySelectorAll(".carousel-slide")
  const nextBtn = document.getElementById("carousel-next")
  const prevBtn = document.getElementById("carousel-prev")
  const indicators = document.querySelectorAll(".indicator")

  if (!track || slides.length === 0) return

  let currentSlide = 0
  const totalSlides = slides.length
  let autoplayInterval

  // Update carousel display
  function updateCarousel() {
    // Update track position
    const translateX = -currentSlide * (100 / totalSlides)
    track.style.transform = `translateX(${translateX}%)`

    // Update active slide
    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === currentSlide)
    })

    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentSlide)
    })

    // Update button states
    if (prevBtn) prevBtn.disabled = currentSlide === 0
    if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1
  }

  // Next slide
  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      currentSlide++
    } else {
      currentSlide = 0 // Loop back to first slide
    }
    updateCarousel()
  }

  // Previous slide
  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--
    } else {
      currentSlide = totalSlides - 1 // Loop to last slide
    }
    updateCarousel()
  }

  // Go to specific slide
  function goToSlide(index) {
    currentSlide = index
    updateCarousel()
  }

  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener("click", nextSlide)
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prevSlide)
  }

  // Indicator clicks
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToSlide(index))
  })
  document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.mobile-menu-close i');

    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide()
    } else if (e.key === "ArrowRight") {
      nextSlide()
    }
  })

  // Touch/swipe support
  let startX = 0
  let endX = 0

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX
  })

  track.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX
    handleSwipe()
  })

  function handleSwipe() {
    const threshold = 50
    const diff = startX - endX

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
    }
  }

  // Autoplay
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000)
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval)
  }

  // Pause autoplay on hover
  const carouselContainer = document.querySelector(".carousel-container")
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", stopAutoplay)
    carouselContainer.addEventListener("mouseleave", startAutoplay)
  }

  // Initialize
  updateCarousel()
  startAutoplay()
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-slide-in-bottom")
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animateElements = document.querySelectorAll(".stat-card, .project-card, .testimonial-card, .book-item")
  animateElements.forEach((el) => observer.observe(el))

  // Counter animation for statistics
  const counters = document.querySelectorAll(".stat-card h3")
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target)
        counterObserver.unobserve(entry.target)
      }
    })
  }, observerOptions)

  counters.forEach((counter) => counterObserver.observe(counter))
}

// ===================================
// COUNTER ANIMATION
// ===================================
function animateCounter(element) {
  const target = Number.parseInt(element.textContent.replace(/\D/g, ""))
  const duration = 2000
  const step = target / (duration / 16)
  let current = 0

  const timer = setInterval(() => {
    current += step
    if (current >= target) {
      current = target
      clearInterval(timer)
    }

    const prefix = element.textContent.includes("+") ? "+" : ""
    element.textContent = prefix + Math.floor(current)
  }, 16)
}

// ===================================
// SMOOTH SCROLLING
// ===================================
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()

      const targetId = link.getAttribute("href")
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        const headerHeight = document.querySelector("header").offsetHeight
        const targetPosition = targetElement.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })
}

// ===================================
// HEADER SCROLL EFFECT
// ===================================
window.addEventListener("scroll", () => {
  const header = document.querySelector("header")
  if (header) {
    if (window.scrollY > 100) {
      header.style.background = "rgba(255, 255, 255, 0.98)"
      header.style.backdropFilter = "blur(20px)"
    } else {
      header.style.background = "rgba(255, 255, 255, 0.95)"
      header.style.backdropFilter = "blur(20px)"
    }
  }
})

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Debounce function for performance optimization
function debounceFunc(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// Add loading state to buttons
function addLoadingState(button, text = "Cargando...") {
  const originalText = button.textContent
  button.textContent = text
  button.disabled = true
  button.classList.add("loading")

  return () => {
    button.textContent = originalText
    button.disabled = false
    button.classList.remove("loading")
  }
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: var(--primary-color);
        color: white;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remove after delay
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// ===================================
// ERROR HANDLING
// ===================================
window.addEventListener("error", (e) => {
  console.error("JavaScript Error:", e.error)
})

// ===================================
// PERFORMANCE MONITORING
// ===================================
if ("performance" in window) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType("navigation")[0]
      console.log("Page Load Time:", perfData.loadEventEnd - perfData.loadEventStart, "ms")
    }, 0)
  })
}
