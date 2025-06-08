/**
 * ===================================
 * MIEMBROS - JAVASCRIPT PROFESIONAL
 * ===================================
 *
 * Funcionalidades:
 * - Búsqueda de miembros
 * - Filtros por rol y especialidad
 * - Mostrar/ocultar obras con animaciones
 * - Modal para ver obras en grande con zoom
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
    this.currentZoom = 1
    this.isZoomed = false

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
        <div class="work-modal-image-container">
          <img id="modal-work-image" class="work-modal-image" src="/placeholder.svg" alt="">
          <div class="zoom-controls">
            <button class="zoom-btn" id="zoom-out">
              <i class="fas fa-search-minus"></i>
            </button>
            <button class="zoom-btn" id="zoom-reset">
              <i class="fas fa-expand-arrows-alt"></i>
            </button>
            <button class="zoom-btn" id="zoom-in">
              <i class="fas fa-search-plus"></i>
            </button>
          </div>
        </div>
        <div class="work-modal-sidebar">
          <div class="work-modal-header">
            <h3 class="work-modal-title" id="modal-work-title"></h3>
            <div class="work-modal-author" id="modal-work-author">
              <i class="fas fa-user-circle"></i>
              <span></span>
            </div>
            <div class="work-modal-technique" id="modal-work-technique">
              <i class="fas fa-palette"></i>
              <span></span>
            </div>
          </div>
          <p class="work-modal-description" id="modal-work-description"></p>
          <div class="work-modal-meta">
            <div class="work-modal-tags" id="modal-work-tags">
              <div class="tag-label">
                <i class="fas fa-tags"></i>
                Etiquetas
              </div>
            </div>
            <div class="work-modal-info">
              <div class="work-modal-year" id="modal-work-date">2024</div>
              <div class="work-modal-year-label">Año de creación</div>
            </div>
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

    // Event listeners para zoom
    this.setupZoomControls()
  }

  setupZoomControls() {
    const zoomIn = document.getElementById("zoom-in")
    const zoomOut = document.getElementById("zoom-out")
    const zoomReset = document.getElementById("zoom-reset")
    const modalImage = document.getElementById("modal-work-image")

    if (zoomIn) {
      zoomIn.addEventListener("click", () => {
        this.zoomImage(1.2)
      })
    }

    if (zoomOut) {
      zoomOut.addEventListener("click", () => {
        this.zoomImage(0.8)
      })
    }

    if (zoomReset) {
      zoomReset.addEventListener("click", () => {
        this.resetZoom()
      })
    }

    if (modalImage) {
      modalImage.addEventListener("click", () => {
        this.toggleZoom()
      })

      // Zoom con rueda del mouse
      modalImage.addEventListener("wheel", (e) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        this.zoomImage(delta)
      })
    }
  }

  zoomImage(factor) {
    const modalImage = document.getElementById("modal-work-image")
    if (!modalImage) return

    this.currentZoom *= factor
    this.currentZoom = Math.max(0.5, Math.min(3, this.currentZoom))

    modalImage.style.transform = `scale(${this.currentZoom})`

    if (this.currentZoom > 1) {
      modalImage.classList.add("zoomed")
      this.isZoomed = true
    } else {
      modalImage.classList.remove("zoomed")
      this.isZoomed = false
    }
  }

  toggleZoom() {
    if (this.isZoomed) {
      this.resetZoom()
    } else {
      this.zoomImage(2)
    }
  }

  resetZoom() {
    const modalImage = document.getElementById("modal-work-image")
    if (!modalImage) return

    this.currentZoom = 1
    this.isZoomed = false
    modalImage.style.transform = "scale(1)"
    modalImage.classList.remove("zoomed")
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
      const parentCard = section.closest(".member-card, .founder-card")
      if (parentCard !== memberCard) {
        section.classList.remove("active")
        const btn = parentCard.querySelector(".btn-view-works")
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
      // Activar la sección
      worksSection.classList.add("active")
      button.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Obras'

      // Si la sección ya tiene contenido (como el fundador), configurar listeners
      const existingWorks = worksSection.querySelector(".works-grid .work-item")
      if (existingWorks) {
        // Si ya hay obras, configurar los event listeners
        this.setupExistingWorks(worksSection, memberCard)

        // Actualizar el contador si existe
        const memberName = memberCard.querySelector("h3").textContent
        const worksCount = worksSection.querySelector(".works-count")
        const workItems = worksSection.querySelectorAll(".work-item")
        if (worksCount) {
          worksCount.textContent = `${workItems.length} obra${workItems.length !== 1 ? "s" : ""}`
        }
      } else {
        // Solo cargar dinámicamente si no hay obras ya presentes
        this.loadWorks(worksSection, memberCard)
      }
    }
  }

  setupExistingWorks(worksSection, memberCard) {
    const workItems = worksSection.querySelectorAll(".work-item")
    const memberName = memberCard.querySelector("h3").textContent

    workItems.forEach((workItem, index) => {
      // Solo agregar listener si no lo tiene ya
      if (!workItem.hasAttribute("data-listener-added")) {
        workItem.addEventListener("click", () => {
          // Crear objeto obra desde el HTML existente
          const titleElement = workItem.querySelector(".work-title")
          const techniqueElement = workItem.querySelector(".work-technique")
          const imageElement = workItem.querySelector("img")
          const descriptionElement = workItem.querySelector(".work-description")

          const obra = {
            id: `existing-${index}`,
            titulo: titleElement ? titleElement.textContent : "Obra sin título",
            tecnica: techniqueElement
              ? techniqueElement.textContent.replace(/^\s*\S+\s*/, "").trim()
              : "Técnica no especificada",
            imagen: imageElement ? imageElement.src : "/placeholder.svg?height=400&width=600",
            descripcion: descriptionElement
              ? descriptionElement.textContent
              : `Una obra de arte creada con técnica mixta.`,
            tags: ["arte", "creativo"],
            autor: memberName,
            fecha: "2024",
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
        Galería de ${memberName}
      </div>
      <div class="works-count" id="works-count-${memberName.replace(/\s+/g, "-").toLowerCase()}">
        0 obras
      </div>
    </div>
    <div class="works-grid" id="works-grid-${memberName.replace(/\s+/g, "-").toLowerCase()}">
      <div class="loading-works">
        <div class="loading-spinner"></div>
        <p>Cargando obras...</p>
      </div>
    </div>
  `

    // Insertar la sección de obras al final de la tarjeta específica
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
          <div class="no-works" style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--members-card-bg); border-radius: var(--members-radius-lg); border: 1px solid var(--members-border);">
            <i class="fas fa-paint-brush" style="font-size: 4rem; color: var(--members-text-light); margin-bottom: 1.5rem; display: block;"></i>
            <h4 style="color: var(--members-text); margin-bottom: 0.75rem; font-size: 1.2rem;">Sin obras disponibles</h4>
            <p style="color: var(--members-text-light); margin: 0; font-size: 1rem;">Este miembro aún no ha subido obras a la galería.</p>
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
            <div class="work-content">
              <h4 class="work-title">${obra.titulo}</h4>
              <div class="work-technique">
                <i class="fas fa-palette"></i>
                ${obra.tecnica}
              </div>
              <p class="work-description">${obra.descripcion}</p>
              <div class="work-footer">
                <div class="work-author">
                  <i class="fas fa-user-circle"></i>
                  ${memberName}
                </div>
                <div class="work-action">
                  <i class="fas fa-expand"></i>
                  Ver detalle
                </div>
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
              // Agregar información del autor
              obra.autor = memberName
              obra.fecha = obra.fecha || "2024"
              this.openWorkModal(obra)
            }
          })
        })
      }

      // Actualizar contador
      if (worksCount) {
        worksCount.textContent = `${obras.length} obra${obras.length !== 1 ? "s" : ""}`
      }
    }, 800)
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
          descripcion:
            "Retrato detallado del personaje Kaneki de Tokyo Ghoul, realizado con técnica de tinta. Una obra que captura la dualidad y el sufrimiento del protagonista con trazos precisos y expresivos, mostrando la maestría técnica en el manejo de las luces y sombras.",
          tags: ["manga", "tinta", "retrato", "tokyo ghoul", "anime"],
          fecha: "2024",
        },
        {
          id: "tkandresb-2",
          titulo: "Skull Knight",
          tecnica: "Detallismo a líneas",
          imagen: "img/obras/admins/TkAndresB/Sk.jfif",
          descripcion:
            "Ilustración detallada del Skull Knight de Berserk con técnica de líneas. Cada trazo representa la complejidad y el misterio de este icónico personaje del manga de Kentaro Miura, demostrando un control excepcional del detalle.",
          tags: ["manga", "líneas", "berserk", "detallismo", "dark fantasy"],
          fecha: "2024",
        },
        {
          id: "tkandresb-3",
          titulo: "Arima",
          tecnica: "Tinta",
          imagen: "img/obras/admins/TkAndresB/Arima.jfif",
          descripcion:
            "Retrato de perfil del personaje Arima con técnica de tinta. Una representación elegante y minimalista que captura la serenidad y determinación del personaje con una economía de medios admirable.",
          tags: ["manga", "tinta", "retrato", "perfil", "tokyo ghoul"],
          fecha: "2024",
        },
        {
          id: "tkandresb-4",
          titulo: "Goku MUI",
          tecnica: "Tinta",
          imagen: "img/obras/admins/TkAndresB/Goku.jfif",
          descripcion:
            "Ilustración de Goku en su forma Ultra Instinto Maestro. Una obra que transmite la serenidad y el poder absoluto de esta transformación legendaria, capturando la esencia espiritual del personaje.",
          tags: ["manga", "tinta", "dragon ball", "goku", "ultra instinto"],
          fecha: "2024",
        },
      ],

      // Administradores
      Godjo: [
        {
          id: "godjo-1",
          titulo: "Retrato Realista",
          tecnica: "Carboncillo",
          imagen: "https://placehold.co/600x800/3b82f6/ffffff?text=Retrato+Realista",
          descripcion:
            "Un retrato realista ejecutado con técnica de carboncillo, mostrando un dominio excepcional de luces y sombras para crear profundidad y expresión. La obra demuestra una comprensión profunda de la anatomía facial.",
          tags: ["retrato", "carboncillo", "realismo", "claroscuro"],
          fecha: "2024",
        },
        {
          id: "godjo-2",
          titulo: "Paisaje Urbano",
          tecnica: "Acuarela",
          imagen: "https://placehold.co/600x800/8b5cf6/ffffff?text=Paisaje+Urbano",
          descripcion:
            "Representación de un paisaje urbano en acuarela, capturando la atmósfera y el dinamismo de la ciudad moderna con técnicas de transparencia y fluidez características de este medio.",
          tags: ["paisaje", "acuarela", "urbano", "arquitectura"],
          fecha: "2024",
        },
        {
          id: "godjo-3",
          titulo: "Naturaleza Muerta",
          tecnica: "Óleo",
          imagen: "https://placehold.co/600x800/10b981/ffffff?text=Naturaleza+Muerta",
          descripcion:
            "Composición de naturaleza muerta en óleo sobre lienzo, explorando la textura y el color en una disposición clásica de objetos cotidianos con una técnica refinada.",
          tags: ["naturaleza muerta", "óleo", "composición", "clásico"],
          fecha: "2024",
        },
      ],

      Kvothe: [
        {
          id: "kvothe-1",
          titulo: "Ilustración Fantástica",
          tecnica: "Digital",
          imagen: "https://placehold.co/600x800/f59e0b/ffffff?text=Ilustracion+Fantastica",
          descripcion:
            "Una ilustración fantástica creada digitalmente, combinando elementos mágicos y criaturas míticas en un mundo de ensueño lleno de color y detalle. La obra transporta al espectador a un universo paralelo.",
          tags: ["fantasía", "digital", "ilustración", "magia", "criaturas"],
          fecha: "2024",
        },
        {
          id: "kvothe-2",
          titulo: "Portada de Libro",
          tecnica: "Técnica mixta",
          imagen: "https://placehold.co/600x800/ef4444/ffffff?text=Portada+Libro",
          descripcion:
            "Diseño de portada para libro usando técnica mixta, combinando elementos tradicionales y digitales para crear una composición narrativa impactante que invita a la lectura.",
          tags: ["portada", "libro", "mixta", "diseño editorial"],
          fecha: "2024",
        },
        {
          id: "kvothe-3",
          titulo: "Concept Art",
          tecnica: "Digital",
          imagen: "https://placehold.co/600x800/06b6d4/ffffff?text=Concept+Art",
          descripcion:
            "Arte conceptual digital para videojuego, explorando diseños de personajes y ambientes con un enfoque en la funcionalidad y la estética, fundamental para el desarrollo visual.",
          tags: ["concept", "digital", "videojuego", "personajes"],
          fecha: "2024",
        },
        {
          id: "kvothe-4",
          titulo: "Storyboard",
          tecnica: "Lápiz",
          imagen: "https://placehold.co/600x800/8b5cf6/ffffff?text=Storyboard",
          descripcion:
            "Storyboard para secuencia animada, planificando la narrativa visual con bocetos expresivos que capturan el movimiento y la emoción de cada escena de manera efectiva.",
          tags: ["storyboard", "lápiz", "animación", "narrativa"],
          fecha: "2024",
        },
      ],

      Nico: [
        {
          id: "nico-1",
          titulo: "Personaje 3D",
          tecnica: "Blender",
          imagen: "https://placehold.co/600x800/10b981/ffffff?text=Personaje+3D",
          descripcion:
            "Modelado de personaje en Blender con atención al detalle en anatomía, texturizado y rigging para animación profesional. Una obra que demuestra dominio técnico en el arte 3D.",
          tags: ["3d", "blender", "personaje", "modelado", "texturizado"],
          fecha: "2024",
        },
        {
          id: "nico-2",
          titulo: "Entorno Digital",
          tecnica: "Photoshop",
          imagen: "https://placehold.co/600x800/f59e0b/ffffff?text=Entorno+Digital",
          descripcion:
            "Entorno digital para videojuego creado en Photoshop, combinando elementos fotográficos y pintados para crear atmósferas inmersivas que transportan al jugador.",
          tags: ["entorno", "photoshop", "digital", "videojuego", "atmósfera"],
          fecha: "2024",
        },
        {
          id: "nico-3",
          titulo: "Matte Painting",
          tecnica: "Digital",
          imagen: "https://placehold.co/600x800/8b5cf6/ffffff?text=Matte+Painting",
          descripcion:
            "Matte painting para efectos visuales, creando paisajes épicos y escenarios cinematográficos con técnicas de composición digital avanzada para producciones audiovisuales.",
          tags: ["matte painting", "vfx", "digital", "cinematográfico"],
          fecha: "2024",
        },
      ],

      Yoshio: [
        {
          id: "yoshio-1",
          titulo: "Cyberpunk",
          tecnica: "Digital",
          imagen: "img/obras/admins/Yoshio/Cyberpunk.jpg",
          descripcion:
            "Arte cyberpunk futurista con neones y tecnología, explorando temas de transhumanismo y distopía urbana en un estilo visual impactante que define el género.",
          tags: ["cyberpunk", "digital", "futurista", "neón", "sci-fi"],
          fecha: "2024",
        },
        {
          id: "yoshio-2",
          titulo: "Samurai",
          tecnica: "Digital",
          imagen: "img/obras/admins/Yoshio/Samurai.jpg",
          descripcion:
            "Ilustración de samurai con estilo moderno, fusionando la tradición japonesa con técnicas digitales contemporáneas para crear un puente entre pasado y presente.",
          tags: ["samurai", "digital", "japón", "tradición", "moderno"],
          fecha: "2024",
        },
        {
          id: "yoshio-3",
          titulo: "SpaceShip",
          tecnica: "Digital",
          imagen: "img/obras/admins/Yoshio/SpaceShip.jpg",
          descripcion:
            "Diseño de nave espacial futurista con atención al detalle técnico y funcional, imaginando tecnologías del futuro con base científica y estética innovadora.",
          tags: ["nave", "digital", "sci-fi", "diseño", "futurista"],
          fecha: "2024",
        },
        {
          id: "yoshio-4",
          titulo: "Synthwave",
          tecnica: "Digital",
          imagen: "img/obras/admins/Yoshio/Synthwave.jpg",
          descripcion:
            "Arte synthwave con estética retro-futurista, evocando la nostalgia de los años 80 con colores vibrantes y formas geométricas que definen este movimiento artístico.",
          tags: ["synthwave", "digital", "retro", "80s", "nostálgico"],
          fecha: "2024",
        },
      ],

      Adrian: [
        {
          id: "adrian-1",
          titulo: "DragonBall",
          tecnica: "Lápiz",
          imagen: "img/obras/admins/Adrian/DragonBall.jpg",
          descripcion:
            "Dibujo a lápiz de personajes de Dragon Ball, capturando el estilo dinámico y expresivo característico del manga de Akira Toriyama con fidelidad y energía.",
          tags: ["dragon ball", "lápiz", "manga", "toriyama", "anime"],
          fecha: "2024",
        },
        {
          id: "adrian-2",
          titulo: "Goku SSJ3",
          tecnica: "Lápiz",
          imagen: "img/obras/admins/Adrian/GokuSSJ3.jpg",
          descripcion:
            "Retrato de Goku en su transformación SSJ3, mostrando la intensidad y el poder de esta forma legendaria con trazos expresivos que capturan la esencia del personaje.",
          tags: ["goku", "lápiz", "ssj3", "transformación", "poder"],
          fecha: "2024",
        },
        {
          id: "adrian-3",
          titulo: "Goku SSJ4",
          tecnica: "Lápiz",
          imagen: "img/obras/admins/Adrian/GokuSSJ4.jpg",
          descripcion:
            "Ilustración de Goku en su forma SSJ4, explorando los detalles únicos de esta transformación con técnica de lápiz detallada que resalta cada característica distintiva.",
          tags: ["goku", "lápiz", "ssj4", "gt", "transformación"],
          fecha: "2024",
        },
      ],
    }

    return obrasData[memberName] || []
  }

  openWorkModal(obra) {
    if (!this.workModal) {
      this.createWorkModal()
    }

    // Reset zoom
    this.resetZoom()

    // Llenar datos del modal
    const modalImage = document.getElementById("modal-work-image")
    const modalTitle = document.getElementById("modal-work-title")
    const modalAuthor = document.getElementById("modal-work-author")
    const modalDescription = document.getElementById("modal-work-description")
    const modalTechnique = document.getElementById("modal-work-technique")
    const modalTags = document.getElementById("modal-work-tags")
    const modalDate = document.getElementById("modal-work-date")

    if (modalImage) {
      modalImage.src = obra.imagen
      modalImage.alt = obra.titulo
    }
    if (modalTitle) modalTitle.textContent = obra.titulo
    if (modalAuthor) {
      const authorSpan = modalAuthor.querySelector("span")
      if (authorSpan) authorSpan.textContent = obra.autor || "Artista desconocido"
    }
    if (modalDescription) modalDescription.textContent = obra.descripcion
    if (modalTechnique) {
      const techniqueSpan = modalTechnique.querySelector("span")
      if (techniqueSpan) techniqueSpan.textContent = obra.tecnica
    }
    if (modalDate) modalDate.textContent = obra.fecha || "2024"

    // Agregar tags
    if (modalTags && obra.tags) {
      const tagLabel = modalTags.querySelector(".tag-label")
      // Limpiar tags existentes excepto el label
      const existingTags = modalTags.querySelectorAll(".work-modal-tag")
      existingTags.forEach((tag) => tag.remove())

      // Agregar nuevos tags
      obra.tags.forEach((tag) => {
        const tagElement = document.createElement("span")
        tagElement.className = "work-modal-tag"
        tagElement.textContent = tag
        modalTags.appendChild(tagElement)
      })
    }

    // Mostrar modal
    this.workModal.classList.add("active")
    document.body.style.overflow = "hidden"
  }

  closeWorkModal() {
    if (this.workModal) {
      this.workModal.classList.remove("active")
      document.body.style.overflow = ""
      this.resetZoom()
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
    }
  }

  debounce(func, wait) {
    let timeout
    return function (...args) {
      
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  debug() {
    // Función de depuración para verificar el estado del objeto
    console.log("Estado actual de MiembrosManager:", this)
  }
}
