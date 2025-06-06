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
          <div class="no-works" style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--member-card-bg); border-radius: var(--member-radius); border: 1px solid var(--member-border);">
            <i class="fas fa-paint-brush" style="font-size: 3rem; color: var(--member-text-light); margin-bottom: 1rem; display: block;"></i>
            <h4 style="color: var(--member-text); margin-bottom: 0.5rem;">Sin obras disponibles</h4>
            <p style="color: var(--member-text-light); margin: 0;">Este miembro aún no ha subido obras a la galería.</p>
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
      Godjo: [  //aun falta subir sus obras
        {
          id: "godjo-1",
          titulo: "Retrato Realista",
          tecnica: "Carboncillo",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Un retrato realista ejecutado con técnica de carboncillo.",
          tags: ["retrato", "carboncillo", "realismo"],
        },
        {
          id: "godjo-2",
          titulo: "Paisaje Urbano",
          tecnica: "Acuarela",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Representación de un paisaje urbano en acuarela.",
          tags: ["paisaje", "acuarela", "urbano"],
        },
        {
          id: "godjo-3",
          titulo: "Naturaleza Muerta",
          tecnica: "Óleo",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Composición de naturaleza muerta en óleo sobre lienzo.",
          tags: ["naturaleza muerta", "óleo", "composición"],
        },
      ],

      Kvothe: [
        {
          id: "kvothe-1",
          titulo: "Ilustración Fantástica",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Una ilustración fantástica creada digitalmente.",
          tags: ["fantasía", "digital", "ilustración"],
        },
        {
          id: "kvothe-2",
          titulo: "Portada de Libro",
          tecnica: "Técnica mixta",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Diseño de portada para libro usando técnica mixta.",
          tags: ["portada", "libro", "mixta"],
        },
        {
          id: "kvothe-3",
          titulo: "Personaje Medieval",
          tecnica: "Acuarela",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Diseño de personaje medieval en acuarela.",
          tags: ["personaje", "medieval", "acuarela"],
        },
        {
          id: "kvothe-4",
          titulo: "Mapa Fantástico",
          tecnica: "Tinta y digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Mapa de mundo fantástico combinando tinta y técnicas digitales.",
          tags: ["mapa", "fantasía", "tinta", "digital"],
        },
      ],

      Yoshio: [
        {
          id: "yoshio-1",
          titulo: "Mundo Fantástico",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Concept art de un mundo fantástico.",
          tags: ["concept art", "fantasía", "digital"],
        },
        {
          id: "yoshio-2",
          titulo: "Diseño de Ambiente",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Diseño de ambiente para videojuego.",
          tags: ["ambiente", "videojuego", "digital"],
        },
        {
          id: "yoshio-3",
          titulo: "Vehículo Futurista",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Concept de vehículo futurista.",
          tags: ["vehículo", "futurista", "concept"],
        },
      ],

      Adrian: [
        {
          id: "adrian-1",
          titulo: "Arte Cyberpunk",
          tecnica: "Photoshop",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Ilustración cyberpunk creada en Photoshop.",
          tags: ["cyberpunk", "photoshop", "futurista"],
        },
        {
          id: "adrian-2",
          titulo: "Matte Painting",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Matte painting para efectos visuales.",
          tags: ["matte painting", "vfx", "digital"],
        },
        {
          id: "adrian-3",
          titulo: "Speedpaint",
          tecnica: "Procreate",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Speedpaint realizado en Procreate.",
          tags: ["speedpaint", "procreate", "rápido"],
        },
      ],

      Alan: [
        {
          id: "alan-1",
          titulo: "Personaje Anime",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Diseño de personaje estilo anime.",
          tags: ["anime", "personaje", "digital"],
        },
        {
          id: "alan-2",
          titulo: "Character Sheet",
          tecnica: "Clip Studio",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Hoja de personaje completa en Clip Studio.",
          tags: ["character sheet", "clip studio", "diseño"],
        },
      ],

      Fr: [
        {
          id: "fr-1",
          titulo: "Dibujo a Lápiz",
          tecnica: "Grafito",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Dibujo tradicional a lápiz grafito.",
          tags: ["lápiz", "grafito", "tradicional"],
        },
        {
          id: "fr-2",
          titulo: "Sketch Rápido",
          tecnica: "Lápiz",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Sketch rápido a lápiz.",
          tags: ["sketch", "lápiz", "rápido"],
        },
      ],

      Duvan: [
        {
          id: "duvan-1",
          titulo: "Ilustración Digital",
          tecnica: "Photoshop",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Ilustración digital creada en Photoshop.",
          tags: ["ilustración", "photoshop", "digital"],
        },
        {
          id: "duvan-2",
          titulo: "Personaje 3D",
          tecnica: "Blender",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Modelado de personaje en Blender.",
          tags: ["3d", "blender", "personaje"],
        },
      ],

      Skillet: [
        {
          id: "skillet-1",
          titulo: "Animación 2D",
          tecnica: "After Effects",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Animación 2D creada en After Effects.",
          tags: ["animación", "2d", "after effects"],
        },
        {
          id: "skillet-2",
          titulo: "Motion Graphics",
          tecnica: "Cinema 4D",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Motion graphics en Cinema 4D.",
          tags: ["motion graphics", "cinema 4d", "3d"],
        },
        {
          id: "skillet-3",
          titulo: "Walk Cycle",
          tecnica: "Toon Boom",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Ciclo de caminata en Toon Boom.",
          tags: ["walk cycle", "toon boom", "animación"],
        },
      ],

      Robe: [
        {
          id: "robe-1",
          titulo: "Ilustración Editorial",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Ilustración para editorial digital.",
          tags: ["editorial", "ilustración", "digital"],
        },
        {
          id: "robe-2",
          titulo: "Arte Conceptual",
          tecnica: "Procreate",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Arte conceptual en Procreate.",
          tags: ["concept art", "procreate", "digital"],
        },
      ],

      Sam: [
        {
          id: "sam-1",
          titulo: "Concept Sci-Fi",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Concept art de ciencia ficción.",
          tags: ["sci-fi", "concept", "digital"],
        },
        {
          id: "sam-2",
          titulo: "Diseño de Criatura",
          tecnica: "Photoshop",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Diseño de criatura fantástica.",
          tags: ["criatura", "diseño", "photoshop"],
        },
        {
          id: "sam-3",
          titulo: "Prop Design",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Diseño de props para videojuego.",
          tags: ["props", "videojuego", "digital"],
        },
      ],

      Arg_sebas_art: [
        {
          id: "arg-sebas-1",
          titulo: "Arte Tradicional",
          tecnica: "Lápiz y Tinta",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Obra de arte tradicional con lápiz y tinta.",
          tags: ["tradicional", "lápiz", "tinta"],
        },
        {
          id: "arg-sebas-2",
          titulo: "Sketch Conceptual",
          tecnica: "Grafito",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Sketch conceptual a grafito.",
          tags: ["sketch", "conceptual", "grafito"],
        },
      ],

      // Miembros regulares
      Victor: [
        {
          id: "victor-1",
          titulo: "Ilustración Narrativa",
          tecnica: "Acuarela digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Ilustración narrativa con acuarela digital.",
          tags: ["narrativa", "acuarela", "digital"],
        },
        {
          id: "victor-2",
          titulo: "Poster Conceptual",
          tecnica: "Ilustración digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Poster conceptual digital.",
          tags: ["poster", "conceptual", "digital"],
        },
      ],

      Jesus: [
        {
          id: "jesus-1",
          titulo: "Personaje RPG",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Diseño de personaje para RPG.",
          tags: ["rpg", "personaje", "digital"],
        },
        {
          id: "jesus-2",
          titulo: "Hoja de Modelo",
          tecnica: "Lápiz y digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Hoja de modelo de personaje.",
          tags: ["modelo", "personaje", "mixta"],
        },
        {
          id: "jesus-3",
          titulo: "Mascota Original",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Diseño de mascota original.",
          tags: ["mascota", "original", "digital"],
        },
      ],

      German: [
        {
          id: "german-1",
          titulo: "Dibujo a Lápiz",
          tecnica: "Grafito",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Dibujo tradicional a lápiz grafito.",
          tags: ["lápiz", "grafito", "tradicional"],
        },
        {
          id: "german-2",
          titulo: "Estudio Anatómico",
          tecnica: "Carboncillo",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Estudio anatómico en carboncillo.",
          tags: ["anatomía", "carboncillo", "estudio"],
        },
      ],

      Emma: [
        {
          id: "emma-1",
          titulo: "Animación 2D",
          tecnica: "After Effects",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Animación 2D en After Effects.",
          tags: ["animación", "2d", "after effects"],
        },
        {
          id: "emma-2",
          titulo: "Motion Graphics",
          tecnica: "Cinema 4D",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Motion graphics en Cinema 4D.",
          tags: ["motion", "graphics", "3d"],
        },
      ],

      Carlos: [
        {
          id: "carlos-1",
          titulo: "Arte Digital",
          tecnica: "Procreate",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Arte digital creado en Procreate.",
          tags: ["digital", "procreate", "arte"],
        },
        {
          id: "carlos-2",
          titulo: "Pintura Digital",
          tecnica: "Photoshop",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Pintura digital en Photoshop.",
          tags: ["pintura", "photoshop", "digital"],
        },
        {
          id: "carlos-3",
          titulo: "Concept Art",
          tecnica: "Digital",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Concept art digital.",
          tags: ["concept", "art", "digital"],
        },
      ],

      Lucia: [
        {
          id: "lucia-1",
          titulo: "Ilustración Botánica",
          tecnica: "Acuarela",
          imagen: "/placeholder.svg?height=400&width=600",
          descripcion: "Ilustración botánica en acuarela.",
          tags: ["botánica", "acuarela", "naturaleza"],
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
