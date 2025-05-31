/**
 * ===================================
 * MIEMBROS - JAVASCRIPT
 * ===================================
 *
 * Este archivo maneja toda la funcionalidad de la página de miembros:
 * - Filtrado de miembros por rol y especialidad
 * - Búsqueda en tiempo real
 * - Mostrar/ocultar obras de cada miembro
 * - Paginación
 */

class MiembrosManager {
  constructor() {
    // Elementos del DOM
    this.searchInput = document.getElementById("member-search")
    this.roleFilter = document.getElementById("role-filter")
    this.specialtyFilter = document.getElementById("specialty-filter")
    this.memberCards = document.querySelectorAll(".member-card, .founder-card")
    this.paginationButtons = document.querySelectorAll(".pagination-btn")
    this.viewWorksButtons = document.querySelectorAll(".btn-view-works")

    // Estado de la aplicación
    this.currentPage = 1
    this.itemsPerPage = 6
    this.activeFilters = {
      role: "all",
      specialty: "all",
      search: "",
    }

    // Inicializar
    this.init()
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.bindEvents()
    this.applyFilters()
    console.log("Miembros Manager inicializado correctamente")
  }

  /**
   * Vincula eventos a los elementos
   */
  bindEvents() {
    // Búsqueda en tiempo real
    this.searchInput.addEventListener("input", () => {
      this.activeFilters.search = this.searchInput.value.toLowerCase()
      this.currentPage = 1
      this.applyFilters()
    })

    // Filtros
    this.roleFilter.addEventListener("change", () => {
      this.activeFilters.role = this.roleFilter.value
      this.currentPage = 1
      this.applyFilters()
    })

    this.specialtyFilter.addEventListener("change", () => {
      this.activeFilters.specialty = this.specialtyFilter.value
      this.currentPage = 1
      this.applyFilters()
    })

    // Paginación
    this.paginationButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        if (button.classList.contains("next")) {
          this.currentPage++
        } else {
          this.currentPage = index + 1
        }
        this.applyFilters()
        this.updatePaginationUI()
      })
    })

    // Botones para ver obras
    this.viewWorksButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()
        const memberCard = button.closest(".member-card, .founder-card")
        this.toggleWorks(memberCard)
      })
    })

    // Hacer que toda la tarjeta sea clickeable
    this.memberCards.forEach((card) => {
      card.addEventListener("click", () => {
        this.toggleWorks(card)
      })
    })
  }

  /**
   * Alterna la visibilidad de las obras de un miembro
   */
  toggleWorks(memberCard) {
    const worksSection = memberCard.querySelector(".member-works")
    const button = memberCard.querySelector(".btn-view-works")

    if (worksSection.classList.contains("active")) {
      worksSection.classList.remove("active")
      button.innerHTML = '<i class="fas fa-images"></i> Ver Obras'
    } else {
      // Cerrar todas las obras abiertas primero
      document.querySelectorAll(".member-works.active").forEach((works) => {
        works.classList.remove("active")
        const btn = works.closest(".member-card, .founder-card").querySelector(".btn-view-works")
        btn.innerHTML = '<i class="fas fa-images"></i> Ver Obras'
      })

      // Abrir las obras del miembro seleccionado
      worksSection.classList.add("active")
      button.innerHTML = '<i class="fas fa-times"></i> Cerrar'

      // Scroll suave hasta las obras
      setTimeout(() => {
        worksSection.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 100)
    }
  }

  /**
   * Aplica los filtros a las tarjetas de miembros
   */
  applyFilters() {
    let visibleCount = 0
    let totalVisible = 0

    // Primero filtramos por rol y especialidad
    this.memberCards.forEach((card) => {
      const role = card.dataset.role || "member"
      const specialty = card.dataset.specialty || "all"
      const name = card.querySelector("h3").textContent.toLowerCase()

      const matchesRole = this.activeFilters.role === "all" || role === this.activeFilters.role
      const matchesSpecialty = this.activeFilters.specialty === "all" || specialty === this.activeFilters.specialty
      const matchesSearch = !this.activeFilters.search || name.includes(this.activeFilters.search)

      if (matchesRole && matchesSpecialty && matchesSearch) {
        card.classList.remove("filtered-out")
        totalVisible++

        // Aplicar paginación
        const startIndex = (this.currentPage - 1) * this.itemsPerPage
        const endIndex = startIndex + this.itemsPerPage

        if (totalVisible > startIndex && totalVisible <= endIndex) {
          card.style.display = "block"
          visibleCount++
        } else {
          card.style.display = "none"
        }
      } else {
        card.classList.add("filtered-out")
        card.style.display = "none"
      }
    })

    // Actualizar UI de paginación
    this.updatePaginationUI(totalVisible)

    // Mostrar mensaje si no hay resultados
    this.showNoResults(visibleCount === 0)
  }

  /**
   * Actualiza la UI de paginación
   */
  updatePaginationUI(totalVisible = 0) {
    const totalPages = Math.ceil(totalVisible / this.itemsPerPage) || 1

    // Actualizar botones de paginación
    this.paginationButtons.forEach((button, index) => {
      if (button.classList.contains("next")) {
        button.style.display = this.currentPage < totalPages ? "flex" : "none"
      } else {
        const pageNum = index + 1
        button.style.display = pageNum <= totalPages ? "flex" : "none"
        button.classList.toggle("active", pageNum === this.currentPage)
      }
    })

    // Scroll al inicio de la sección
    window.scrollTo({
      top: document.querySelector(".members-section").offsetTop - 100,
      behavior: "smooth",
    })
  }

  /**
   * Muestra mensaje cuando no hay resultados
   */
  showNoResults(show) {
    let noResultsElement = document.querySelector(".no-results")

    if (show && !noResultsElement) {
      noResultsElement = document.createElement("div")
      noResultsElement.className = "no-results"
      noResultsElement.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>No se encontraron miembros</h3>
        <p>Intenta ajustar los filtros o términos de búsqueda</p>
      `

      const membersGrid = document.querySelector(".members-section .members-grid")
      membersGrid.appendChild(noResultsElement)
    } else if (!show && noResultsElement) {
      noResultsElement.remove()
    }
  }
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  window.miembrosManager = new MiembrosManager()
})

/**
 * ===================================
 * INSTRUCCIONES PARA AÑADIR NUEVOS MIEMBROS
 * ===================================
 *
 * Para añadir un nuevo miembro, copia y pega el siguiente bloque HTML
 * dentro del div con clase "members-grid" en la sección correspondiente:
 *
 * <div class="member-card" data-member-id="ID_UNICO" data-role="member" data-specialty="ESPECIALIDAD">
 *     <div class="member-badge member">
 *         <i class="fas fa-user"></i>
 *         <span>Miembro</span>
 *     </div>
 *     <div class="member-avatar">
 *         <img src="RUTA_IMAGEN" alt="NOMBRE">
 *     </div>
 *     <div class="member-info">
 *         <h3>NOMBRE</h3>
 *         <p class="member-specialty">ESPECIALIDAD</p>
 *         <p class="member-since">Miembro desde AÑO</p>
 *     </div>
 *     <div class="view-works">
 *         <button class="btn-view-works">
 *             <i class="fas fa-images"></i>
 *             Ver Obras
 *         </button>
 *     </div>
 *     <div class="member-works">
 *         <div class="works-grid">
 *             <div class="work-item">
 *                 <img src="RUTA_OBRA_1" alt="Obra 1">
 *                 <div class="work-overlay">
 *                     <h4>TITULO_OBRA_1</h4>
 *                     <p>DESCRIPCION_OBRA_1</p>
 *                 </div>
 *             </div>
 *             <div class="work-item">
 *                 <img src="RUTA_OBRA_2" alt="Obra 2">
 *                 <div class="work-overlay">
 *                     <h4>TITULO_OBRA_2</h4>
 *                     <p>DESCRIPCION_OBRA_2</p>
 *                 </div>
 *             </div>
 *         