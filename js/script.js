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

// Mobile menu management
class MobileMenu {
  constructor() {
    this.menu = document.querySelector(".mobile-menu")
    this.toggleBtn = document.querySelector(".menu-toggle")
    this.closeBtn = document.querySelector(".mobile-menu-close")
    this.links = document.querySelectorAll(".mobile-menu a")
    this.overlay = document.querySelector(".mobile-menu-overlay")
    this.isOpen = false
    this.init()
  }

  init() {
    if (!this.menu || !this.toggleBtn) {
      return
    }
    this.bindEvents()
  }

  open() {
    if (this.menu && this.overlay) {
      this.menu.classList.add("active")
      this.overlay.classList.add("active")
      document.body.style.overflow = "hidden"
      this.isOpen = true

      // Focus management for accessibility
      if (this.closeBtn) {
        this.closeBtn.focus()
      }
      this.trapFocus()
    }
  }

  close() {
    if (this.menu && this.overlay) {
      this.menu.classList.remove("active")
      this.overlay.classList.remove("active")
      document.body.style.overflow = ""
      this.isOpen = false
      if (this.toggleBtn) {
        this.toggleBtn.focus()
      }
    }
  }

  trapFocus() {
    if (!this.menu) return

    const focusableElements = this.menu.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    if (focusableElements.length === 0) return

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
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", () => this.open())
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close())
    }

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
    if (this.overlay) {
      this.overlay.addEventListener("click", () => this.close())
    }

    // Prevent body scroll when menu is open
    if (this.menu) {
      this.menu.addEventListener("touchmove", (e) => {
        e.stopPropagation()
      })
    }
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
      this.header.style.background = "rgba(255, 255, 255, 0.98)"
      this.header.style.backdropFilter = "blur(20px)"
    } else {
      this.header.classList.remove("scrolled")
      this.header.style.background = "rgba(255, 255, 255, 0.95)"
      this.header.style.backdropFilter = "blur(20px)"
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
    this.tabGroups = document.querySelectorAll(".tabs, .library-tabs, .learning-tabs, .generator-tabs")
    this.init()
  }

  init() {
    this.tabGroups.forEach((group) => this.initTabGroup(group))
    this.initGeneratorTabs()
  }

  initTabGroup(tabGroup) {
    const buttons = tabGroup.querySelectorAll(".tab-btn")
    const panes = tabGroup.querySelectorAll(".tab-content")

    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        const tabId = button.dataset.tab

        if (!tabId) return

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

  initGeneratorTabs() {
    const generatorTabsContainer = document.querySelector(".generator-tabs")
    if (!generatorTabsContainer) return

    const tabButtons = generatorTabsContainer.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".generator-content .tab-content")

    tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        const tabId = button.getAttribute("data-tab")

        if (!tabId) return

        // Remove active from all buttons and contents
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tabContents.forEach((content) => content.classList.remove("active"))

        // Add active to clicked button
        button.classList.add("active")

        // Add active to corresponding content
        const targetContent = document.getElementById(tabId)
        if (targetContent) {
          targetContent.classList.add("active")
        }

        // Update ARIA attributes
        tabButtons.forEach((btn) => {
          btn.setAttribute("aria-selected", btn === button ? "true" : "false")
        })
      })

      // Set initial ARIA attributes
      button.setAttribute("role", "tab")
      button.setAttribute("aria-selected", button.classList.contains("active") ? "true" : "false")
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
    document
      .querySelectorAll(".stat-card, .project-card, .testimonial-card, .card, .past-project-item")
      .forEach((el) => {
        el.style.opacity = "0"
        el.style.transform = "translateY(30px)"
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
        animationObserver.observe(el)
      })
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
    this.mobileMenu = new MobileMenu()
    this.headerManager = new HeaderManager()
    this.smoothScroll = new SmoothScroll()
    this.tabManager = new TabManager()
    this.lazyLoader = new LazyLoader()
    this.formValidator = new FormValidator()
    this.buttonEffects = new ButtonEffects()
    this.accessibilityManager = new AccessibilityManager()

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
    const track = document.getElementById("carousel-track")
    const slides = document.querySelectorAll(".carousel-slide")
    const nextBtn = document.getElementById("carousel-next")
    const prevBtn = document.getElementById("carousel-prev")
    const indicators = document.querySelectorAll(".indicator")

    if (!track || slides.length === 0) return

    let currentSlide = 0
    const totalSlides = slides.length
    let autoplayInterval
    let isTransitioning = false

    // Variables para touch mejorado
    let startX = 0
    let startY = 0
    let endX = 0
    let endY = 0
    let isDragging = false
    let startTime = 0

    // Update carousel display
    function updateCarousel() {
      if (isTransitioning) return

      isTransitioning = true

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
      if (prevBtn) prevBtn.disabled = false
      if (nextBtn) nextBtn.disabled = false

      // Reset transition flag after animation
      setTimeout(() => {
        isTransitioning = false
      }, 300)
    }

    // Next slide
    function nextSlide() {
      if (isTransitioning) return

      if (currentSlide < totalSlides - 1) {
        currentSlide++
      } else {
        currentSlide = 0 // Loop back to first slide
      }
      updateCarousel()
    }

    // Previous slide
    function prevSlide() {
      if (isTransitioning) return

      if (currentSlide > 0) {
        currentSlide--
      } else {
        currentSlide = totalSlides - 1 // Loop to last slide
      }
      updateCarousel()
    }

    // Go to specific slide
    function goToSlide(index) {
      if (isTransitioning || index === currentSlide) return

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

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide()
        stopAutoplay()
      } else if (e.key === "ArrowRight") {
        nextSlide()
        stopAutoplay()
      }
    })

    // Touch/swipe support MEJORADO
    track.addEventListener("touchstart", handleTouchStart, { passive: false })
    track.addEventListener("touchmove", handleTouchMove, { passive: false })
    track.addEventListener("touchend", handleTouchEnd, { passive: false })

    // Mouse drag support para desktop
    track.addEventListener("mousedown", handleMouseStart)
    track.addEventListener("mousemove", handleMouseMove)
    track.addEventListener("mouseup", handleMouseEnd)
    track.addEventListener("mouseleave", handleMouseEnd)

    function handleTouchStart(e) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      startTime = Date.now()
      isDragging = true
      stopAutoplay()
    }

    function handleTouchMove(e) {
      if (!isDragging) return

      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY
      const diffX = Math.abs(currentX - startX)
      const diffY = Math.abs(currentY - startY)

      // Si el movimiento es más horizontal que vertical, prevenir scroll
      if (diffX > diffY) {
        e.preventDefault()
      }
    }

    function handleTouchEnd(e) {
      if (!isDragging) return

      endX = e.changedTouches[0].clientX
      endY = e.changedTouches[0].clientY
      isDragging = false

      handleSwipe()
    }

    function handleMouseStart(e) {
      startX = e.clientX
      startY = e.clientY
      startTime = Date.now()
      isDragging = true
      stopAutoplay()
      e.preventDefault()
    }

    function handleMouseMove(e) {
      if (!isDragging) return
      e.preventDefault()
    }

    function handleMouseEnd(e) {
      if (!isDragging) return

      endX = e.clientX
      endY = e.clientY
      isDragging = false

      handleSwipe()
    }

    function handleSwipe() {
      const threshold = 50
      const timeThreshold = 300
      const diffX = startX - endX
      const diffY = Math.abs(startY - endY)
      const timeDiff = Date.now() - startTime

      // Solo procesar si es un swipe horizontal rápido
      if (Math.abs(diffX) > threshold && diffY < 100 && timeDiff < timeThreshold) {
        if (diffX > 0) {
          nextSlide()
        } else {
          prevSlide()
        }
      }

      // Reiniciar autoplay después de un momento
      setTimeout(startAutoplay, 2000)
    }

    // Autoplay
    function startAutoplay() {
      stopAutoplay()
      autoplayInterval = setInterval(nextSlide, 5000)
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval)
    }

    // Pause autoplay on hover/focus
    const carouselContainer = document.querySelector(".carousel-container")
    if (carouselContainer) {
      carouselContainer.addEventListener("mouseenter", stopAutoplay)
      carouselContainer.addEventListener("mouseleave", startAutoplay)
      carouselContainer.addEventListener("focusin", stopAutoplay)
      carouselContainer.addEventListener("focusout", startAutoplay)
    }

    // Pause autoplay when page is not visible
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay()
      } else {
        startAutoplay()
      }
    })

    // Initialize
    updateCarousel()
    startAutoplay()
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

// Set current year in footer
document.addEventListener("DOMContentLoaded", () => {
  const yearElements = document.querySelectorAll("#current-year")
  yearElements.forEach((element) => {
    element.textContent = new Date().getFullYear()
  })
})
