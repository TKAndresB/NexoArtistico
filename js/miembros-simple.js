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
    this.workModal = null
    this.workModalClose = null
    this.modalBackdrop = null

    this.init()
  }

  init() {
    this.createWorkModal()
    this.bindEvents()
    this.updateStats()
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

  createWorkModal() {
    // Crear modal si no existe
    if (document.getElementById("work-modal")) {
      document.getElementById("work-modal").remove()
    }

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

    // Cerrar todas las otras secciones de obras ANTES de procesar la actual
    document.querySelectorAll(".member-works.active").forEach((section) => {
      if (section !== worksSection) {
        section.classList.remove("active")
        const btn = section.closest(".member-card, .founder-card").querySelector(".btn-view-works")
        if (btn) {
          btn.innerHTML = '<i class="fas fa-images"></i> Ver Obras'
        }
      }
    })

    // Si no existe la sección de obras, la creamos
    if (!worksSection) {
      worksSection = this.createWorksSection(memberCard)
    }

    const isActive = worksSection.classList.contains("active")

    // Toggle la sección actual
    if (isActive) {
      worksSection.classList.remove("active")
      button.innerHTML = '<i class="fas fa-images"></i> Ver Obras'
    } else {
      // SIEMPRE activar la sección
      worksSection.classList.add("active")
      button.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Obras'

      // Si la sección ya tiene contenido (como el fundador), no cargar dinámicamente
      const existingWorks = worksSection.querySelector(".works-grid .work-item")
      if (!existingWorks) {
        // Solo cargar dinámicamente si no hay obras ya presentes
        this.loadWorks(worksSection, memberCard)
      } else {
        // Si ya hay obras, actualizar el contador
        const memberName = memberCard.querySelector("h3").textContent
        const worksCount = worksSection.querySelector(`#works-count-${memberName.replace(/\s+/g, "-").toLowerCase()}`)
        const workItems = worksSection.querySelectorAll(".work-item")
        if (worksCount) {
          worksCount.textContent = `${workItems.length} obra${workItems.length !== 1 ? "s" : ""}`
        }

        // Agregar event listeners a las obras existentes si no los tienen
        this.setupExistingWorks(worksSection)
      }
    }
  }

  setupExistingWorks(worksSection) {
    const workItems = worksSection.querySelectorAll(".work-item")
    workItems.forEach((workItem, index) => {
      // Solo agregar listener si no lo tiene ya
      if (!workItem.hasAttribute("data-listener-added")) {
        workItem.addEventListener("click", () => {
          // Crear objeto obra desde el HTML existente
          const titleElement = workItem.querySelector(".work-title")
          const techniqueElement = workItem.querySelector(".work-technique")
          const imageElement = workItem.querySelector("img")

          const obra = {
            id: `existing-${index}`,
            titulo: titleElement ? titleElement.textContent : "Obra sin título",
            tecnica: techniqueElement ? techniqueElement.textContent : "Técnica no especificada",
            imagen: imageElement ? imageElement.src : "/placeholder.svg?height=400&width=600",
            descripcion: `Una obra de arte creada con ${techniqueElement ? techniqueElement.textContent.toLowerCase() : "técnica mixta"}.`,
            tags: ["arte", "creativo"],
          }

          this.openWorkModal(obra)
        })
        workItem.setAttribute("data-listener-added", "true")
      }
    })
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

    // Mostrar loading inicialmente
    worksGrid.innerHTML = `
      <div class="loading-works">
        <div class="loading-spinner"></div>
        <p>Cargando obras...</p>
      </div>
    `

    // Simular carga de obras
    setTimeout(() => {
      const obras = this.getObrasForMember(memberName)

      // SIEMPRE mostrar la sección, independientemente de si hay obras o no
      if (obras.length === 0) {
        worksGrid.innerHTML = `
          <div class="no-works" style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--members-card-bg); border-radius: var(--members-radius); border: 1px solid var(--members-border);">
            <i class="fas fa-paint-brush" style="font-size: 3rem; color: var(--members-text-light); margin-bottom: 1rem; display: block;"></i>
            <h4 style="color: var(--members-text); margin-bottom: 0.5rem;">Sin obras disponibles</h4>
            <p style="color: var(--members-text-light); margin: 0;">Este miembro aún no ha subido obras a la galería.</p>
          </div>
        `
      } else {
        worksGrid.innerHTML = obras
          .map(
            (obra) => `
          <div class="work-item" data-work-id="${obra.id}" style="cursor: pointer;">
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

      // Actualizar contador
      if (worksCount) {
        worksCount.textContent = `${obras.length} obra${obras.length !== 1 ? "s" : ""}`
      }
    }, 500) // Reducido el tiempo de carga
  }

  getObrasForMember(memberName) {
    // Datos de obras para los miembros reales
    const obrasData = {
      // Fundador
      TkAndresB: [
        {
          id: "tkandresb-1",
          titulo: "Kaneki",
          tecnica: "Tinta",
          imagen: "img/obras/admins/TkAndresB/Kaneki.jfif",
          descripcion: "Retrato detallado del personaje Kaneki de Tokyo Ghoul, realizado con técnica de tinta.",
          tags: ["manga", "tinta", "retrato", "tokyo ghoul"],
        },
        {
          id: "tkandresb-2",
          titulo: "Skull Knight",
          tecnica: "Detallismo a líneas",
          imagen: "img/obras/admins/TkAndresB/Sk.jfif",
          descripcion: "Ilustración detallada del Skull Knight de Berserk con técnica de líneas.",
          tags: ["manga", "líneas", "berserk", "detallismo"],
        },
        {
          id: "tkandresb-3",
          titulo: "Arima",
          tecnica: "Tinta",
          imagen: "img/obras/admins/TkAndresB/Arima.jfif",
          descripcion: "Retrato de perfil del personaje Arima con técnica de tinta.",
          tags: ["manga", "tinta", "retrato", "perfil"],
        },
        {
          id: "tkandresb-4",
          titulo: "Goku MUI",
          tecnica: "Tinta",
          imagen: "img/obras/admins/TkAndresB/Goku.jfif",
          descripcion: "Ilustración de Goku en su forma Ultra Instinto Maestro.",
          tags: ["manga", "tinta", "dragon ball", "goku"],
        },
      ],

      // Administradores
      Godjo: [
        {
          id: "godjo-1",
          titulo: "Retrato Realista",
          tecnica: "Carboncillo",
          imagen: "https://placehold.co/600x800/3b82f6/ffffff?text=Retrato+Realista",
          descripcion: "Un retrato realista ejecutado con técnica de carboncillo.",
          tags: ["retrato", "carboncillo", "realismo"],
        },
        {
          id: "godjo-2",
          titulo: "Paisaje Urbano",
          tecnica: "Acuarela",
          imagen: "https://placehold.co/600x800/8b5cf6/ffffff?text=Paisaje+Urbano",
          descripcion: "Representación de un paisaje urbano en acuarela.",
          tags: ["paisaje", "acuarela", "urbano"],
        },
        {
          id: "godjo-3",
          titulo: "Naturaleza Muerta",
          tecnica: "Óleo",
          imagen: "https://placehold.co/600x800/10b981/ffffff?text=Naturaleza+Muerta",
          descripcion: "Composición de naturaleza muerta en óleo sobre lienzo.",
          tags: ["naturaleza muerta", "óleo", "composición"],
        },
      ],

      Kvothe: [
        {
          id: "kvothe-1",
          titulo: "Ilustración Fantástica",
          tecnica: "Digital",
          imagen: "https://placehold.co/600x800/f59e0b/ffffff?text=Ilustracion+Fantastica",
          descripcion: "Una ilustración fantástica creada digitalmente.",
          tags: ["fantasía", "digital", "ilustración"],
        },
        {
          id: "kvothe-2",
          titulo: "Portada de Libro",
          tecnica: "Técnica mixta",
          imagen: "https://placehold.co/600x800/ef4444/ffffff?text=Portada+Libro",
          descripcion: "Diseño de portada para libro usando técnica mixta.",
          tags: ["portada", "libro", "mixta"],
        },
        {
          id: "kvothe-3",
          titulo: "Concept Art",
          tecnica: "Digital",
          imagen: "https://placehold.co/600x800/06b6d4/ffffff?text=Concept+Art",
          descripcion: "Arte conceptual digital para videojuego.",
          tags: ["concept", "digital", "videojuego"],
        },
        {
          id: "kvothe-4",
          titulo: "Storyboard",
          tecnica: "Lápiz",
          imagen: "https://placehold.co/600x800/8b5cf6/ffffff?text=Storyboard",
          descripcion: "Storyboard para secuencia animada.",
          tags: ["storyboard", "lápiz", "animación"],
        },
      ],

      Nico: [
        {
          id: "nico-1",
          titulo: "Personaje 3D",
          tecnica: "Blender",
          imagen: "https://placehold.co/600x800/10b981/ffffff?text=Personaje+3D",
          descripcion: "Modelado de personaje en Blender.",
          tags: ["3d", "blender", "personaje"],
        },
        {
          id: "nico-2",
          titulo: "Entorno Digital",
          tecnica: "Photoshop",
          imagen: "https://placehold.co/600x800/f59e0b/ffffff?text=Entorno+Digital",
          descripcion: "Entorno digital para videojuego.",
          tags: ["entorno", "photoshop", "digital"],
        },
        {
          id: "nico-3",
          titulo: "Matte Painting",
          tecnica: "Digital",
          imagen: "https://placehold.co/600x800/8b5cf6/ffffff?text=Matte+Painting",
          descripción: "Matte painting para efectos visuales.",
          tags: ["matte painting", "vfx", "digital"],
        },
      ],

      // Agregar más miembros con obras...
      Yoshio: [
        {
          id: "yoshio-1",
          titulo: "Cyberpunk",
          tecnica: "Digital",
          imagen: "img/obras/admins/Yoshio/Cyberpunk.jpg",
          descripcion: "Arte cyberpunk futurista con neones y tecnología.",
          tags: ["cyberpunk", "digital", "futurista"],
        },
        {
          id: "yoshio-2",
          titulo: "Samurai",
          tecnica: "Digital",
          imagen: "img/obras/admins/Yoshio/Samurai.jpg",
          descripcion: "Ilustración de samurai con estilo moderno.",
          tags: ["samurai", "digital", "japón"],
        },
        {
          id: "yoshio-3",
          titulo: "SpaceShip",
          tecnica: "Digital",
          imagen: "img/obras/admins/Yoshio/SpaceShip.jpg",
          descripcion: "Diseño de nave espacial futurista.",
          tags: ["nave", "digital", "sci-fi"],
        },
        {
          id: "yoshio-4",
          titulo: "Synthwave",
          tecnica: "Digital",
          imagen: "img/obras/admins/Yoshio/Synthwave.jpg",
          descripcion: "Arte synthwave con estética retro-futurista.",
          tags: ["synthwave", "digital", "retro"],
        },
      ],

      Adrian: [
        {
          id: "adrian-1",
          titulo: "DragonBall",
          tecnica: "Lápiz",
          imagen: "img/obras/admins/Adrian/DragonBall.jpg",
          descripcion: "Dibujo a lápiz de personajes de Dragon Ball.",
          tags: ["dragon ball", "lápiz", "manga"],
        },
        {
          id: "adrian-2",
          titulo: "Goku SSJ3",
          tecnica: "Lápiz",
          imagen: "img/obras/admins/Adrian/GokuSSJ3.jpg",
          descripcion: "Retrato de Goku en su transformación SSJ3.",
          tags: ["goku", "lápiz", "ssj3"],
        },
        {
          id: "adrian-3",
          titulo: "Goku SSJ4",
          tecnica: "Lápiz",
          imagen: "img/obras/admins/Adrian/GokuSSJ4.jpg",
          descripcion: "Ilustración de Goku en su forma SSJ4.",
          tags: ["goku", "lápiz", "ssj4"],
        },
      ],

      // Continuar con más miembros...
    }

    return obrasData[memberName] || []
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

    if (modalImage) {
      modalImage.src = obra.imagen
      modalImage.alt = obra.titulo
    }
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
        <div style="text-align: center; padding: 3rem; color: var(--members-text-light);">
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
