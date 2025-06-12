/**
 * Nexo Artistico - Animaciones al Scroll
 * Sistema de animaciones sutiles que se activan al hacer scroll
 */

class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll("[data-animate]")
    this.options = {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }

    this.init()
  }

  init() {
    // Verificar soporte para IntersectionObserver
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Si no hay soporte o el usuario prefiere reducir el movimiento, mostrar todo sin animaciones
      this.showAllElements()
      return
    }

    // Crear el observer
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options)

    // Observar todos los elementos
    this.animatedElements.forEach((element) => {
      this.observer.observe(element)
    })

    // Manejar cambios en la preferencia de reducción de movimiento
    this.setupReducedMotionListener()
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Añadir clase para animar
        entry.target.classList.add("animated")

        // Dejar de observar este elemento
        this.observer.unobserve(entry.target)

        // Disparar evento personalizado
        const event = new CustomEvent("elementAnimated", {
          detail: { element: entry.target },
        })
        document.dispatchEvent(event)
      }
    })
  }

  showAllElements() {
    this.animatedElements.forEach((element) => {
      element.classList.add("animated")
    })
  }

  setupReducedMotionListener() {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    // Función para manejar cambios en la preferencia
    const handleReducedMotionChange = (e) => {
      if (e.matches) {
        // Si el usuario prefiere reducir el movimiento, mostrar todo sin animaciones
        this.showAllElements()

        // Desconectar el observer
        if (this.observer) {
          this.observer.disconnect()
        }
      } else {
        // Reiniciar las animaciones
        this.init()
      }
    }

    // Añadir listener para cambios en la preferencia
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", handleReducedMotionChange)
    } else if (motionQuery.addListener) {
      // Para compatibilidad con navegadores antiguos
      motionQuery.addListener(handleReducedMotionChange)
    }
  }

  // Método para añadir animaciones a nuevos elementos (útil para contenido cargado dinámicamente)
  addElements(elements) {
    if (!this.observer) return

    elements.forEach((element) => {
      if (element.hasAttribute("data-animate")) {
        this.observer.observe(element)
      }
    })
  }
}

// Inicializar animaciones cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Añadir atributos de animación a elementos específicos
  const setupAnimationAttributes = () => {
    // Elementos de la biblioteca
    document.querySelectorAll(".book-card").forEach((card, index) => {
      card.setAttribute("data-animate", "")
      card.classList.add("slide-up")
      card.classList.add(`delay-${(index % 5) * 100}`)
    })

    document.querySelectorAll(".pinterest-board").forEach((board, index) => {
      board.setAttribute("data-animate", "")
      board.classList.add("zoom-in")
      board.classList.add(`delay-${(index % 3) * 100}`)
    })

    // Elementos de cabecera
    const pageHeader = document.querySelector(".page-header-compact")
    if (pageHeader) {
      pageHeader.setAttribute("data-animate", "")
      pageHeader.classList.add("fade-in")
    }

    // Elementos de búsqueda
    const searchSection = document.querySelector(".search-section")
    if (searchSection) {
      searchSection.setAttribute("data-animate", "")
      searchSection.classList.add("slide-up")
    }

    // Pestañas
    document.querySelectorAll(".tab-btn").forEach((tab, index) => {
      tab.setAttribute("data-animate", "")
      tab.classList.add("slide-down")
      tab.classList.add(`delay-${index * 100}`)
    })

    // Miembros
    document.querySelectorAll(".member-card").forEach((member, index) => {
      member.setAttribute("data-animate", "")
      member.classList.add("fade-in")
      member.classList.add(`delay-${(index % 4) * 100}`)
    })

    // Centro de mejora
    document.querySelectorAll(".learning-card").forEach((card, index) => {
      card.setAttribute("data-animate", "")
      card.classList.add("slide-up")
      card.classList.add(`delay-${(index % 3) * 100}`)
    })
  }

  // Configurar atributos de animación
  setupAnimationAttributes()

  // Inicializar el sistema de animaciones
  window.scrollAnimations = new ScrollAnimations()

  console.log("Animaciones al scroll inicializadas")
})
