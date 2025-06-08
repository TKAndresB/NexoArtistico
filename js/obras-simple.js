// Script simplificado para mostrar/ocultar obras
document.addEventListener("DOMContentLoaded", () => {
  console.log("Script de obras cargado correctamente")

  // Obtener todos los botones de "Ver Obras"
  const botonesVerObras = document.querySelectorAll(".btn-view-works")

  // Añadir event listener a cada botón
  botonesVerObras.forEach((boton) => {
    boton.addEventListener("click", function (e) {
      e.preventDefault()

      // Encontrar la tarjeta del miembro
      const memberCard = this.closest(".member-card, .founder-card")
      if (!memberCard) return

      // Encontrar la sección de obras
      const worksSection = memberCard.querySelector(".member-works")
      if (!worksSection) return

      // Alternar la clase active
      const isActive = worksSection.classList.contains("active")

      // Cerrar todas las otras secciones de obras
      document.querySelectorAll(".member-works.active").forEach((section) => {
        if (section !== worksSection) {
          section.classList.remove("active")
          const otherButton = section.closest(".member-card, .founder-card").querySelector(".btn-view-works")
          if (otherButton) {
            otherButton.innerHTML = '<i class="fas fa-images"></i> Ver Obras'
          }
        }
      })

      // Alternar la sección actual
      if (isActive) {
        worksSection.classList.remove("active")
        this.innerHTML = '<i class="fas fa-images"></i> Ver Obras'
      } else {
        worksSection.classList.add("active")
        this.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Obras'

        // Configurar event listeners para las obras
        setupWorkItems(worksSection)
      }
    })
  })

  // Configurar event listeners para las obras
  function setupWorkItems(worksSection) {
    const workItems = worksSection.querySelectorAll(".work-item")
    const memberName = worksSection.closest(".member-card, .founder-card").querySelector("h3").textContent

    workItems.forEach((workItem) => {
      // Solo añadir listener si no lo tiene ya
      if (!workItem.hasAttribute("data-listener-added")) {
        workItem.addEventListener("click", () => {
          openWorkModal(workItem, memberName)
        })
        workItem.setAttribute("data-listener-added", "true")
      }
    })
  }

  // Función para abrir el modal
  function openWorkModal(workItem, memberName) {
    // Obtener datos de la obra
    const title = workItem.querySelector(".work-title").textContent
    const technique = workItem
      .querySelector(".work-technique")
      .textContent.replace(/^\s*\S+\s*/, "")
      .trim()
    const description = workItem.querySelector(".work-description")?.textContent || ""
    const image = workItem.querySelector(".work-image img").src

    // Crear o actualizar el modal
    let modal = document.getElementById("work-modal")
    if (!modal) {
      modal = document.createElement("div")
      modal.id = "work-modal"
      modal.className = "work-modal"
      document.body.appendChild(modal)
    }

    // Contenido del modal
    modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="work-modal-content">
                <button class="work-modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="work-modal-image-container">
                    <img id="modal-work-image" class="work-modal-image" src="${image}" alt="${title}">
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
                        <h3 class="work-modal-title">${title}</h3>
                        <div class="work-modal-author">
                            <i class="fas fa-user-circle"></i>
                            <span>${memberName}</span>
                        </div>
                        <div class="work-modal-technique">
                            <i class="fas fa-palette"></i>
                            <span>${technique}</span>
                        </div>
                    </div>
                    <p class="work-modal-description">${description}</p>
                    <div class="work-modal-meta">
                        <div class="work-modal-info">
                            <div class="work-modal-year">2024</div>
                            <div class="work-modal-year-label">Año de creación</div>
                        </div>
                    </div>
                </div>
            </div>
        `

    // Mostrar el modal
    modal.classList.add("active")
    document.body.style.overflow = "hidden"

    // Event listeners para cerrar el modal
    const closeButton = modal.querySelector(".work-modal-close")
    const backdrop = modal.querySelector(".modal-backdrop")

    closeButton.addEventListener("click", closeWorkModal)
    backdrop.addEventListener("click", closeWorkModal)

    // Event listeners para zoom
    setupZoomControls()
  }

  // Función para cerrar el modal
  function closeWorkModal() {
    const modal = document.getElementById("work-modal")
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  // Configurar controles de zoom
  function setupZoomControls() {
    const zoomIn = document.getElementById("zoom-in")
    const zoomOut = document.getElementById("zoom-out")
    const zoomReset = document.getElementById("zoom-reset")
    const modalImage = document.getElementById("modal-work-image")

    let currentZoom = 1

    if (zoomIn) {
      zoomIn.addEventListener("click", () => {
        currentZoom *= 1.2
        updateZoom()
      })
    }

    if (zoomOut) {
      zoomOut.addEventListener("click", () => {
        currentZoom *= 0.8
        updateZoom()
      })
    }

    if (zoomReset) {
      zoomReset.addEventListener("click", () => {
        currentZoom = 1
        updateZoom()
      })
    }

    if (modalImage) {
      modalImage.addEventListener("click", () => {
        currentZoom = currentZoom > 1 ? 1 : 2
        updateZoom()
      })

      modalImage.addEventListener("wheel", (e) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        currentZoom *= delta
        updateZoom()
      })
    }

    function updateZoom() {
      currentZoom = Math.max(0.5, Math.min(3, currentZoom))
      if (modalImage) {
        modalImage.style.transform = `scale(${currentZoom})`
        modalImage.classList.toggle("zoomed", currentZoom > 1)
      }
    }
  }

  // Escape para cerrar el modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeWorkModal()
    }
  })
})
