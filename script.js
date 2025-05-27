// Función para mostrar categorías en la biblioteca
function showCategory(categoryId) {
  // Ocultar todas las categorías
  const categories = document.querySelectorAll(".category-content")
  categories.forEach((category) => {
    category.classList.remove("active")
  })

  // Mostrar la categoría seleccionada
  document.getElementById(categoryId).classList.add("active")

  // Actualizar botones de tabs
  const tabBtns = document.querySelectorAll(".tab-btn")
  tabBtns.forEach((btn) => {
    btn.classList.remove("active")
  })

  // Activar el botón clickeado
  event.target.classList.add("active")
}

// Función para mostrar niveles en centro de mejora
function showLevel(levelId) {
  // Ocultar todos los niveles
  const levels = document.querySelectorAll(".level-content")
  levels.forEach((level) => {
    level.classList.remove("active")
  })

  // Mostrar el nivel seleccionado
  document.getElementById(levelId).classList.add("active")

  // Actualizar botones de tabs
  const tabBtns = document.querySelectorAll(".tab-btn")
  tabBtns.forEach((btn) => {
    btn.classList.remove("active")
  })

  // Activar el botón clickeado
  event.target.classList.add("active")
}

// Smooth scroll para enlaces internos
document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll para enlaces que empiezan con #
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Manejar formularios
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault()

      // Mostrar mensaje de éxito
      alert("¡Mensaje enviado con éxito! Te contactaremos pronto.")

      // Limpiar formulario
      form.reset()
    })
  })
})

// Función para validar formularios
function validateForm(form) {
  const inputs = form.querySelectorAll("input[required], textarea[required]")
  let isValid = true

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.style.borderColor = "#ef4444"
      isValid = false
    } else {
      input.style.borderColor = "#e5e7eb"
    }
  })

  return isValid
}

// Función para mostrar/ocultar elementos
function toggleElement(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.style.display = element.style.display === "none" ? "block" : "none"
  }
}

// ========== GLOBAL VARIABLES ==========
let currentGallerySlide = 0
let gallerySlides = []
let galleryDots = []
let galleryInterval

// ========== DOM CONTENT LOADED ==========
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// ========== INITIALIZE APP ==========
function initializeApp() {
  initMobileMenu()
  initSmoothScrolling()
  initTabs()
  initGallery()
  initContactForm()
  initScrollEffects()
  initCurrentYear()
  initExternalLinks()

  console.log("🎨 Nexo Artístico - Website initialized successfully!")
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const navMobile = document.getElementById("navMobile")
  const mobileLinks = document.querySelectorAll(".nav-mobile-link")

  if (!mobileMenuBtn || !navMobile) return

  // Toggle mobile menu
  mobileMenuBtn.addEventListener("click", () => {
    const isActive = navMobile.classList.contains("active")

    if (isActive) {
      closeMobileMenu()
    } else {
      openMobileMenu()
    }
  })

  // Close menu when clicking on links
  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu)
  })

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!mobileMenuBtn.contains(e.target) && !navMobile.contains(e.target)) {
      closeMobileMenu()
    }
  })

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu()
    }
  })
}

function openMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const navMobile = document.getElementById("navMobile")

  mobileMenuBtn.classList.add("active")
  navMobile.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const navMobile = document.getElementById("navMobile")

  mobileMenuBtn.classList.remove("active")
  navMobile.classList.remove("active")
  document.body.style.overflow = ""
}

// ========== SMOOTH SCROLLING ==========
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href")

      // Skip if it's just "#"
      if (href === "#") return

      e.preventDefault()

      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        const headerHeight = document.querySelector(".header").offsetHeight
        const targetPosition = targetElement.offsetTop - headerHeight - 20

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })

        // Close mobile menu if open
        closeMobileMenu()

        // Update active nav link
        updateActiveNavLink(targetId)
      }
    })
  })
}

function updateActiveNavLink(targetId) {
  const navLinks = document.querySelectorAll(".nav-link, .nav-mobile-link")

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")
    if (href === `#${targetId}`) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })
}

// ========== TABS SYSTEM ==========
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab")
      const tabContainer = this.closest(".tabs-container")

      if (!tabContainer) return

      // Remove active class from all buttons in this container
      const containerButtons = tabContainer.querySelectorAll(".tab-btn")
      containerButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      this.classList.add("active")

      // Hide all tab panels in this container
      const tabPanels = tabContainer.querySelectorAll(".tab-panel")
      tabPanels.forEach((panel) => {
        panel.classList.remove("active")
        panel.style.display = "none"
      })

      // Show target tab panel
      const targetPanel = document.getElementById(tabId)
      if (targetPanel) {
        targetPanel.classList.add("active")
        targetPanel.style.display = "block"

        // Add fade in animation
        targetPanel.style.opacity = "0"
        setTimeout(() => {
          targetPanel.style.opacity = "1"
        }, 10)
      }
    })
  })
}

// ========== GALLERY ==========
function initGallery() {
  const gallery = document.getElementById("gallery")
  if (!gallery) return

  gallerySlides = gallery.querySelectorAll(".gallery-slide")
  const galleryDotsContainer = document.getElementById("galleryDots")
  const prevBtn = document.getElementById("galleryPrev")
  const nextBtn = document.getElementById("galleryNext")

  if (gallerySlides.length === 0) return

  // Create dots
  createGalleryDots(galleryDotsContainer)

  // Add event listeners
  if (prevBtn) {
    prevBtn.addEventListener("click", () => changeGallerySlide(-1))
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => changeGallerySlide(1))
  }

  // Start auto-play
  startGalleryAutoPlay()

  // Pause on hover
  gallery.addEventListener("mouseenter", stopGalleryAutoPlay)
  gallery.addEventListener("mouseleave", startGalleryAutoPlay)

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      changeGallerySlide(-1)
    } else if (e.key === "ArrowRight") {
      changeGallerySlide(1)
    }
  })
}

function createGalleryDots(container) {
  if (!container) return

  container.innerHTML = ""
  galleryDots = []

  gallerySlides.forEach((_, index) => {
    const dot = document.createElement("button")
    dot.classList.add("gallery-dot")
    dot.setAttribute("aria-label", `Ir a imagen ${index + 1}`)

    if (index === 0) {
      dot.classList.add("active")
    }

    dot.addEventListener("click", () => goToGallerySlide(index))

    container.appendChild(dot)
    galleryDots.push(dot)
  })
}

function changeGallerySlide(direction) {
  const newSlide = currentGallerySlide + direction

  if (newSlide >= gallerySlides.length) {
    goToGallerySlide(0)
  } else if (newSlide < 0) {
    goToGallerySlide(gallerySlides.length - 1)
  } else {
    goToGallerySlide(newSlide)
  }
}

function goToGallerySlide(index) {
  if (index < 0 || index >= gallerySlides.length) return

  // Remove active class from current slide and dot
  gallerySlides[currentGallerySlide].classList.remove("active")
  if (galleryDots[currentGallerySlide]) {
    galleryDots[currentGallerySlide].classList.remove("active")
  }

  // Update current slide
  currentGallerySlide = index

  // Add active class to new slide and dot
  gallerySlides[currentGallerySlide].classList.add("active")
  if (galleryDots[currentGallerySlide]) {
    galleryDots[currentGallerySlide].classList.add("active")
  }
}

function startGalleryAutoPlay() {
  stopGalleryAutoPlay()
  galleryInterval = setInterval(() => {
    changeGallerySlide(1)
  }, 5000)
}

function stopGalleryAutoPlay() {
  if (galleryInterval) {
    clearInterval(galleryInterval)
    galleryInterval = null
  }
}

// ========== CONTACT FORM ==========
function initContactForm() {
  const contactForm = document.getElementById("contactForm")

  if (!contactForm) return

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    }

    // Validate form
    if (!validateContactForm(data)) {
      return
    }

    // Simulate form submission
    submitContactForm(data)
  })
}

function validateContactForm(data) {
  const errors = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres")
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Por favor ingresa un email válido")
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push("El mensaje debe tener al menos 10 caracteres")
  }

  if (errors.length > 0) {
    showNotification("Error: " + errors.join(", "), "error")
    return false
  }

  return true
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function submitContactForm(data) {
  // Show loading state
  const submitBtn = document.querySelector('#contactForm button[type="submit"]')
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = '<span class="btn-text">Enviando...</span>'
  submitBtn.disabled = true

  // Simulate API call
  setTimeout(() => {
    // Reset form
    document.getElementById("contactForm").reset()

    // Reset button
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false

    // Show success message
    showNotification("¡Mensaje enviado con éxito! Te contactaremos pronto.", "success")

    console.log("Form submitted:", data)
  }, 2000)
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => notification.remove())

  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `

  // Add styles
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "16px 20px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    zIndex: "10000",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    maxWidth: "400px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
  })

  // Set background color based on type
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
    warning: "#f59e0b",
  }

  notification.style.backgroundColor = colors[type] || colors.info

  // Add close functionality
  const closeBtn = notification.querySelector(".notification-close")
  closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    `

  closeBtn.addEventListener("click", () => {
    hideNotification(notification)
  })

  // Add to DOM
  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 10)

  // Auto hide after 5 seconds
  setTimeout(() => {
    hideNotification(notification)
  }, 5000)
}

function hideNotification(notification) {
  notification.style.transform = "translateX(100%)"
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 300)
}

// ========== SCROLL EFFECTS ==========
function initScrollEffects() {
  // Header scroll effect
  let lastScrollY = window.scrollY

  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header")
    const currentScrollY = window.scrollY

    if (currentScrollY > 100) {
      header.style.background = "rgba(255, 255, 255, 0.95)"
      header.style.backdropFilter = "blur(10px)"
    } else {
      header.style.background = "rgba(255, 255, 255, 0.95)"
    }

    // Hide/show header on scroll
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      header.style.transform = "translateY(-100%)"
    } else {
      header.style.transform = "translateY(0)"
    }

    lastScrollY = currentScrollY

    // Update active section in navigation
    updateActiveSection()
  })

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-up")
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    ".feature-card, .resource-card, .testimonial-card, .project-card, .learning-category",
  )
  animatedElements.forEach((el) => observer.observe(el))
}

function updateActiveSection() {
  const sections = document.querySelectorAll("section[id]")
  const navLinks = document.querySelectorAll(".nav-link")
  const scrollPosition = window.scrollY + 100

  sections.forEach((section) => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.offsetHeight
    const sectionId = section.getAttribute("id")

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove("active")
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active")
        }
      })
    }
  })
}

// ========== UTILITY FUNCTIONS ==========
function initCurrentYear() {
  const yearElements = document.querySelectorAll("#current-year")
  const currentYear = new Date().getFullYear()

  yearElements.forEach((element) => {
    element.textContent = currentYear
  })
}

// ========== EXTERNAL LINK HANDLING ==========
function initExternalLinks() {
  const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="https://"]')

  externalLinks.forEach((link) => {
    // Add external link indicator
    if (!link.querySelector(".external-icon")) {
      const icon = document.createElement("span")
      icon.className = "external-icon"
      icon.innerHTML = "↗"
      icon.style.marginLeft = "4px"
      link.appendChild(icon)
    }

    // Add security attributes
    link.setAttribute("rel", "noopener noreferrer")
  })
}

// ========== ERROR HANDLING ==========
window.addEventListener("error", (e) => {
  console.error("JavaScript Error:", e.error)

  // Show user-friendly error message in development
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    showNotification("Se produjo un error. Revisa la consola para más detalles.", "error")
  }
})

// ========== PERFORMANCE MONITORING ==========
window.addEventListener("load", () => {
  // Log performance metrics
  if ("performance" in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    console.log(`🚀 Page loaded in ${loadTime}ms`)
  }
})

// ========== ACCESSIBILITY ENHANCEMENTS ==========
function initAccessibility() {
  // Skip to main content link
  const skipLink = document.createElement("a")
  skipLink.href = "#main"
  skipLink.textContent = "Saltar al contenido principal"
  skipLink.className = "sr-only"
  skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10001;
        transition: top 0.3s;
    `

  skipLink.addEventListener("focus", function () {
    this.style.top = "6px"
  })

  skipLink.addEventListener("blur", function () {
    this.style.top = "-40px"
  })

  document.body.insertBefore(skipLink, document.body.firstChild)

  // Add main landmark
  const main = document.querySelector("main")
  if (main) {
    main.id = "main"
  }
}

// Initialize accessibility features
document.addEventListener("DOMContentLoaded", initAccessibility)

// ========== EXPORT FOR TESTING ==========
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeApp,
    validateContactForm,
    isValidEmail,
    showNotification,
    hideNotification,
  }
}
