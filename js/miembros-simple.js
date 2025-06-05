/**
 * ===================================
 * MIEMBROS - JAVASCRIPT MEJORADO
 * ===================================
 *
 * Funcionalidades:
 * - Búsqueda de miembros
 * - Filtros por rol y especialidad
 * - Mostrar/ocultar obras con animaciones
 * - Modal para ver obras en grande
 * - Estadísticas dinámicas
 * - Responsive design
 */

class MiembrosManager {
  constructor() {
    this.searchInput = document.getElementById("member-search")
    this.roleFilter = document.getElementById("role-filter")
    this.specialtyFilter = document.getElementById("specialty-filter")
    this.memberCards = document.querySelectorAll(".member-card, .founder-card")
    this.viewWorksButtons = document.querySelectorAll(".btn-view-works")
    this.workModal = document.getElementById("work-modal")
    this.workModalClose = document.getElementById("work-modal-close")
    this.modalBackdrop = document.querySelector(".modal-backdrop")

    this.init()
  }

  init() {
    this.bindEvents()
    this.updateStats()
    this.setupWorkModal()
    this.debug()
    console.log("Miembros Manager inicializado correctamente")
  }

  bindEvents() {
    // Búsqueda
    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        this.debounce(this.filterMembers.bind(this), 300)()
      })
    }

    // Filtros
    if (this.roleFilter) {
      this.roleFilter.addEventListener("change", () => {
        this.filterMembers()
      })
    }

    if (this.specialtyFilter) {
      this.specialtyFilter.addEventListener("change", () => {
        this.filterMembers()
      })
    }

    // Botones de ver obras
    this.viewWorksButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.toggleWorks(button)
      })
    })

    // Cerrar modal con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.workModal && this.workModal.classList.contains("active")) {
        this.closeWorkModal()
      }
    })
  }

  filterMembers() {
    const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : ""
    const roleFilter = this.roleFilter ? this.roleFilter.value : "all"
    const specialtyFilter = this.specialtyFilter ? this.specialtyFilter.value : "all"

    let visibleCount = 0

    this.memberCards.forEach((card) => {
      const name = card.querySelector("h3").textContent.toLowerCase()
      const role = card.dataset.role || ""
      const specialty = card.dataset.specialty || ""

      // El fundador siempre se muestra, independientemente de los filtros
      const isFounder = role === "founder"

      const matchesSearch = name.includes(searchTerm)
      const matchesRole = roleFilter === "all" || role === roleFilter || isFounder
      const matchesSpecialty = specialtyFilter === "all" || specialty === specialtyFilter || isFounder

      if (matchesSearch && matchesRole && matchesSpecialty) {
        card.style.display = "block"
        card.style.opacity = "1"
        card.style.transform = "translateY(0)"
        visibleCount++
      } else {
        card.style.opacity = "0"
        card.style.transform = "translateY(20px)"
        setTimeout(() => {
          if (card.style.opacity === "0") {
            card.style.display = "none"
          }
        }, 300)
      }
    })

    this.updateStats(visibleCount)
    this.showNoResultsMessage(visibleCount === 0)
  }

  toggleWorks(button) {
    const memberCard = button.closest(".member-card, .founder-card")
    if (!memberCard) {
      console.error("No se encontró la tarjeta del miembro")
      return
    }

    let worksSection = memberCard.querySelector(".member-works")

    // Si no existe la sección de obras, la creamos
    if (!worksSection) {
      worksSection = this.createWorksSection(memberCard)
    }

    const isActive = worksSection.classList.contains("active")

    // Cerrar todas las otras secciones de obras
    document.querySelectorAll(".member-works.active").forEach((section) => {
      if (section !== worksSection) {
        section.classList.remove("active")
        const btn = section.closest(".member-card, .founder-card").querySelector(".btn-view-works")
        if (btn) {
          btn.innerHTML = '<i class="fas fa-images"></i> Ver Obras'
        }
      }
    })

    // Toggle la sección actual
    if (isActive) {
      worksSection.classList.remove("active")
      button.innerHTML = '<i class="fas fa-images"></i> Ver Obras'
    } else {
      worksSection.classList.add("active")
      button.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Obras'
      this.loadWorks(worksSection, memberCard)
    }
  }

  createWorksSection(memberCard) {
    const worksSection = document.createElement("div")
    worksSection.className = "member-works"

    const memberName = memberCard.querySelector("h3").textContent
    const memberRole = memberCard.dataset.role || "member"

    worksSection.innerHTML = `
      <div class="works-header">
        <div class="works-title">
          <i class="fas fa-palette"></i>
          Obras de ${memberName}
        </div>
        <div class="works-count">
          <span id="works-count-${memberName.replace(/\s+/g, "-").toLowerCase()}">0 obras</span>
        </div>
      </div>
      <div class="works-grid" id="works-grid-${memberName.replace(/\s+/g, "-").toLowerCase()}">
        <div class="loading-works">
          <div class="loading-spinner"></div>
          <p>Cargando obras...</p>
        </div>
      </div>
    `

    memberCard.appendChild(worksSection)
    return worksSection
  }

  loadWorks(worksSection, memberCard) {
    const memberName = memberCard.querySelector("h3").textContent
    const worksGrid = worksSection.querySelector(".works-grid")
    const worksCount = worksSection.querySelector(`#works-count-${memberName.replace(/\s+/g, "-").toLowerCase()}`)

    // Simular carga de obras (aquí conectarías con tu API)
    setTimeout(() => {
      const obras = this.getObrasForMember(memberName)

      if (obras.length === 0) {
        worksGrid.innerHTML = `
          <div class="no-works">
            <i class="fas fa-paint-brush" style="font-size: 3rem; color: var(--member-text-light); margin-bottom: 1rem;"></i>
            <h4>Sin obras disponibles</h4>
            <p>Este miembro aún no ha subido obras a la galería.</p>
          </div>
        `
      } else {
        worksGrid.innerHTML = obras
          .map(
            (obra) => `
          <div class="work-item" data-work-id="${obra.id}">
            <div class="work-image">
              <img src="${obra.imagen}" alt="${obra.titulo}" loading="lazy">
            </div>
            <div class="work-info">
              <h4 class="work-title">${obra.titulo}</h4>
              <p class="work-technique">${obra.tecnica}</p>
            </div>
            <div class="work-overlay">
              <h4>${obra.titulo}</h4>
              <p>${obra.tecnica}</p>
              <div class="work-tags">
                ${obra.tags.map((tag) => `<span class="work-tag">${tag}</span>`).join("")}
              </div>
            </div>
          </div>
        `,
          )
          .join("")

        // Agregar event listeners a las obras
        worksGrid.querySelectorAll(".work-item").forEach((workItem) => {
          workItem.addEventListener("click", () => {
            const workId = workItem.dataset.workId
            const obra = obras.find((o) => o.id === workId)
            if (obra) {
              this.openWorkModal(obra)
            }
          })
        })
      }

      if (worksCount) {
        worksCount.textContent = `${obras.length} obra${obras.length !== 1 ? "s" : ""}`
      }
    }, 1000)
  }

  getObrasForMember(memberName) {
    // Datos de ejemplo - aquí conectarías con tu base de datos
    const obrasData = {
      "Ana García": [
        {
          id: "ana-1",
          titulo: "Paisaje Urbano",
          tecnica: "Óleo sobre lienzo",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Una representación vibrante de la vida urbana moderna.",
          tags: ["óleo", "paisaje", "urbano"],
        },
        {
          id: "ana-2",
          titulo: "Retrato Expresivo",
          tecnica: "Acrílico",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Un retrato que captura la esencia emocional del sujeto.",
          tags: ["acrílico", "retrato", "expresivo"],
        },
        {
          id: "ana-3",
          titulo: "Naturaleza Muerta",
          tecnica: "Acuarela",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Una composición delicada de elementos naturales.",
          tags: ["acuarela", "naturaleza", "delicado"],
        },
      ],
      "Carlos Mendoza": [
        {
          id: "carlos-1",
          titulo: "Escultura Abstracta",
          tecnica: "Bronce",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Una exploración de formas y texturas en bronce.",
          tags: ["bronce", "abstracto", "escultura"],
        },
        {
          id: "carlos-2",
          titulo: "Figura Humana",
          tecnica: "Mármol",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Una representación clásica de la forma humana.",
          tags: ["mármol", "figura", "clásico"],
        },
      ],
      "María López": [
        {
          id: "maria-1",
          titulo: "Instalación Interactiva",
          tecnica: "Medios Mixtos",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Una obra que invita a la participación del espectador.",
          tags: ["interactivo", "mixtos", "participativo"],
        },
        {
          id: "maria-2",
          titulo: "Arte Digital",
          tecnica: "Proyección",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Una exploración de las posibilidades del arte digital.",
          tags: ["digital", "proyección", "tecnología"],
        },
        {
          id: "maria-3",
          titulo: "Performance",
          tecnica: "Arte Corporal",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Una performance que explora temas de identidad.",
          tags: ["performance", "corporal", "identidad"],
        },
      ],
      "David Ruiz": [
        {
          id: "david-1",
          titulo: "Fotografía Urbana",
          tecnica: "Fotografía Digital",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Capturando la esencia de la vida urbana contemporánea.",
          tags: ["fotografía", "urbano", "digital"],
        },
      ],
      "Laura Fernández": [
        {
          id: "laura-1",
          titulo: "Collage Experimental",
          tecnica: "Papel y Acrílico",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Una experimentación con texturas y colores.",
          tags: ["collage", "experimental", "texturas"],
        },
        {
          id: "laura-2",
          titulo: "Serie Abstracta",
          tecnica: "Técnica Mixta",
          imagen: "/placeholder.svg?height=300&width=400",
          descripcion: "Una serie que explora la abstracción contemporánea.",
          tags: ["abstracto", "serie", "contemporáneo"],
        },
      ],
    }

    return obrasData[memberName] || []
  }

  setupWorkModal() {
    // Crear modal si no existe
    if (!this.workModal) {
      this.createWorkModal()
    }

    // Event listeners para cerrar modal
    if (this.workModalClose) {
      this.workModalClose.addEventListener("click", () => {
        this.closeWorkModal()
      })
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener("click", () => {
        this.closeWorkModal()
      })
    }
  }

  createWorkModal() {
    const modal = document.createElement("div")
    modal.id = "work-modal"
    modal.className = "work-modal"
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="work-modal-content">
        <button class="work-modal-close" id="work-modal-close">
          <i class="fas fa-times"></i>
        </button>
        <div class="work-modal-image">
          <img id="modal-work-image" src="/placeholder.svg" alt="">
        </div>
        <div class="work-modal-info">
          <h3 class="work-modal-title" id="modal-work-title"></h3>
          <p class="work-modal-description" id="modal-work-description"></p>
          <div class="work-modal-meta">
            <span id="modal-work-technique"></span>
            <span id="modal-work-tags"></span>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Actualizar referencias
    this.workModal = modal
    this.workModalClose = modal.querySelector("#work-modal-close")
    this.modalBackdrop = modal.querySelector(".modal-backdrop")

    // Rebind events
    this.setupWorkModal()
  }

  openWorkModal(obra) {
    if (!this.workModal) {
      this.createWorkModal()
    }

    // Llenar datos del modal
    const modalImage = document.getElementById("modal-work-image")
    const modalTitle = document.getElementById("modal-work-title")
    const modalDescription = document.getElementById("modal-work-description")
    const modalTechnique = document.getElementById("modal-work-technique")
    const modalTags = document.getElementById("modal-work-tags")

    if (modalImage) modalImage.src = obra.imagen
    if (modalImage) modalImage.alt = obra.titulo
    if (modalTitle) modalTitle.textContent = obra.titulo
    if (modalDescription) modalDescription.textContent = obra.descripcion
    if (modalTechnique) modalTechnique.textContent = `Técnica: ${obra.tecnica}`
    if (modalTags) modalTags.textContent = `Tags: ${obra.tags.join(", ")}`

    // Mostrar modal
    this.workModal.classList.add("active")
    document.body.style.overflow = "hidden"
  }

  closeWorkModal() {
    if (this.workModal) {
      this.workModal.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  updateStats(visibleCount = null) {
    const totalMembers = this.memberCards.length
    const displayCount = visibleCount !== null ? visibleCount : totalMembers

    const statNumbers = document.querySelectorAll(".stat-number")
    if (statNumbers.length > 0) {
      statNumbers[0].textContent = displayCount
    }

    // Actualizar otras estadísticas si existen
    const adminCount = document.querySelectorAll('[data-role="admin"]').length
    const memberCount = document.querySelectorAll('[data-role="member"]').length

    if (statNumbers.length > 1) {
      statNumbers[1].textContent = adminCount
    }
    if (statNumbers.length > 2) {
      statNumbers[2].textContent = memberCount
    }
  }

  showNoResultsMessage(show) {
    let noResultsMessage = document.querySelector(".no-results-message")

    if (show && !noResultsMessage) {
      noResultsMessage = document.createElement("div")
      noResultsMessage.className = "no-results-message"
      noResultsMessage.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--member-text-light);">
          <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <h3>No se encontraron miembros</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      `

      const membersGrid = document.querySelector(".members-grid")
      if (membersGrid) {
        membersGrid.parentNode.insertBefore(noResultsMessage, membersGrid.nextSibling)
      }
    } else if (!show && noResultsMessage) {
      noResultsMessage.remove()
    }
  }

  debounce(func, wait) {
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

  debug() {
    console.log("=== DEBUG MIEMBROS MANAGER ===")
    console.log("Search input:", this.searchInput)
    console.log("Role filter:", this.roleFilter)
    console.log("Specialty filter:", this.specialtyFilter)
    console.log("Member cards:", this.memberCards.length)
    console.log("View works buttons:", this.viewWorksButtons.length)
    console.log("Work modal:", this.workModal)
    console.log("===============================")
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.miembrosManager = new MiembrosManager()
})

// Funciones globales para compatibilidad
function toggleWorks(button) {
  if (window.miembrosManager) {
    window.miembrosManager.toggleWorks(button)
  }
}

function openWorkModal(obra) {
  if (window.miembrosManager) {
    window.miembrosManager.openWorkModal(obra)
  }
}

function closeWorkModal() {
  if (window.miembrosManager) {
    window.miembrosManager.closeWorkModal()
  }
}
