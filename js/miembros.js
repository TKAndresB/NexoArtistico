// ===================================
// MIEMBROS - JAVASCRIPT
// ===================================

// Script mejorado para la visualización de obras
document.addEventListener("DOMContentLoaded", () => {
  console.log("Script de miembros cargado correctamente")

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
            const workCount =
              otherButton.getAttribute("data-work-count") || otherButton.textContent.match(/\d+/)?.[0] || "0"
            otherButton.innerHTML = `<i class="fas fa-images"></i> Ver Obras (${workCount})`
          }
        }
      })

      // Alternar la sección actual
      if (isActive) {
        worksSection.classList.remove("active")
        const workCount = this.getAttribute("data-work-count") || this.textContent.match(/\d+/)?.[0] || "0"
        this.innerHTML = `<i class="fas fa-images"></i> Ver Obras (${workCount})`
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
    const memberCard = worksSection.closest(".member-card, .founder-card")
    const memberName = memberCard.querySelector("h3").textContent
    const memberId = memberCard.getAttribute("data-member-id")

    workItems.forEach((workItem, index) => {
      // Solo añadir listener si no lo tiene ya
      if (!workItem.hasAttribute("data-listener-added")) {
        workItem.addEventListener("click", () => {
          openWorkModal(workItem, memberName, memberId, index, workItems)
        })
        workItem.setAttribute("data-listener-added", "true")
      }
    })
  }

  // Variables globales para el modal
  let currentZoom = 1
  let isDragging = false
  let startX = 0
  let startY = 0
  let translateX = 0
  let translateY = 0
  let currentWorkItems = []
  let currentWorkIndex = 0

  // Función para abrir el modal con navegación mejorada
  function openWorkModal(workItem, memberName, memberId, index, allWorkItems) {
    // Guardar referencia a todas las obras del autor
    currentWorkItems = Array.from(allWorkItems)
    currentWorkIndex = index

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

    // Contenido del modal con navegación
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="work-modal-content">
        <button class="work-modal-close" aria-label="Cerrar">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="work-modal-image-container">
          <img id="modal-work-image" class="work-modal-image" src="${image}" alt="${title}">
          
          <div class="modal-nav-controls">
            <button class="modal-nav-btn prev" id="prev-work" aria-label="Obra anterior">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="modal-nav-btn next" id="next-work" aria-label="Obra siguiente">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div class="zoom-controls">
            <button class="zoom-btn" id="zoom-out" aria-label="Alejar">
              <i class="fas fa-search-minus"></i>
            </button>
            <button class="zoom-btn" id="zoom-reset" aria-label="Restablecer zoom">
              <i class="fas fa-expand-arrows-alt"></i>
            </button>
            <button class="zoom-btn" id="zoom-in" aria-label="Acercar">
              <i class="fas fa-search-plus"></i>
            </button>
          </div>
          
          <div class="modal-counter">${index + 1} / ${allWorkItems.length}</div>
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

    // Event listeners para navegación
    const prevButton = modal.querySelector("#prev-work")
    const nextButton = modal.querySelector("#next-work")

    prevButton.addEventListener("click", showPreviousWork)
    nextButton.addEventListener("click", showNextWork)

    // Actualizar estado de los botones de navegación
    updateNavigationButtons()

    // Event listeners para zoom
    setupZoomControls()

    // Event listeners para arrastrar la imagen cuando está ampliada
    setupDragControls()
  }

  // Función para mostrar la obra anterior
  function showPreviousWork() {
    if (currentWorkIndex > 0) {
      currentWorkIndex--
      updateWorkModal()
    }
  }

  // Función para mostrar la obra siguiente
  function showNextWork() {
    if (currentWorkIndex < currentWorkItems.length - 1) {
      currentWorkIndex++
      updateWorkModal()
    }
  }

  // Función para actualizar el modal con la obra actual
  function updateWorkModal() {
    const workItem = currentWorkItems[currentWorkIndex]
    const modal = document.getElementById("work-modal")

    if (!workItem || !modal) return

    // Obtener datos de la obra
    const title = workItem.querySelector(".work-title").textContent
    const technique = workItem
      .querySelector(".work-technique")
      .textContent.replace(/^\s*\S+\s*/, "")
      .trim()
    const description = workItem.querySelector(".work-description")?.textContent || ""
    const image = workItem.querySelector(".work-image img").src
    const memberName = workItem.querySelector(".work-author").textContent.trim()

    // Actualizar contenido del modal
    modal.querySelector(".work-modal-title").textContent = title
    modal.querySelector(".work-modal-author span").textContent = memberName
    modal.querySelector(".work-modal-technique span").textContent = technique
    modal.querySelector(".work-modal-description").textContent = description

    const modalImage = modal.querySelector("#modal-work-image")
    modalImage.src = image
    modalImage.alt = title

    // Actualizar contador
    modal.querySelector(".modal-counter").textContent = `${currentWorkIndex + 1} / ${currentWorkItems.length}`

    // Actualizar estado de los botones de navegación
    updateNavigationButtons()

    // Resetear zoom
    resetZoom()
  }

  // Función para actualizar el estado de los botones de navegación
  function updateNavigationButtons() {
    const modal = document.getElementById("work-modal")
    if (!modal) return

    const prevButton = modal.querySelector("#prev-work")
    const nextButton = modal.querySelector("#next-work")

    prevButton.disabled = currentWorkIndex === 0
    nextButton.disabled = currentWorkIndex === currentWorkItems.length - 1
  }

  // Función para cerrar el modal
  function closeWorkModal() {
    const modal = document.getElementById("work-modal")
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = ""

      // Resetear variables
      currentZoom = 1
      isDragging = false
      translateX = 0
      translateY = 0
    }
  }

  // Configurar controles de zoom
  function setupZoomControls() {
    const zoomIn = document.getElementById("zoom-in")
    const zoomOut = document.getElementById("zoom-out")
    const zoomReset = document.getElementById("zoom-reset")
    const modalImage = document.getElementById("modal-work-image")

    if (zoomIn) {
      zoomIn.addEventListener("click", () => {
        currentZoom *= 1.5
        updateZoom()
      })
    }

    if (zoomOut) {
      zoomOut.addEventListener("click", () => {
        currentZoom /= 1.5
        updateZoom()
      })
    }

    if (zoomReset) {
      zoomReset.addEventListener("click", resetZoom)
    }

    if (modalImage) {
      // Doble clic para zoom
      modalImage.addEventListener("dblclick", (e) => {
        if (currentZoom > 1) {
          resetZoom()
        } else {
          // Zoom en el punto donde se hizo doble clic
          const rect = modalImage.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height

          currentZoom = 2.5
          updateZoom(x, y)
        }
      })

      // Zoom con rueda del ratón
      modalImage.addEventListener("wheel", (e) => {
        e.preventDefault()

        // Determinar la dirección del scroll
        const delta = e.deltaY > 0 ? 0.8 : 1.2

        // Calcular el punto de origen para el zoom
        const rect = modalImage.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height

        // Aplicar zoom
        currentZoom *= delta
        updateZoom(x, y)
      })
    }
  }

  // Función para actualizar el zoom
  function updateZoom(originX = 0.5, originY = 0.5) {
    const modalImage = document.getElementById("modal-work-image")
    if (!modalImage) return

    // Limitar el zoom
    currentZoom = Math.max(1, Math.min(5, currentZoom))

    // Aplicar transformación
    modalImage.style.transformOrigin = `${originX * 100}% ${originY * 100}%`

    if (currentZoom > 1) {
      modalImage.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`
      modalImage.classList.add("zoomed")
      modalImage.classList.add("draggable")
    } else {
      modalImage.style.transform = "scale(1)"
      modalImage.classList.remove("zoomed")
      modalImage.classList.remove("draggable")

      // Resetear posición
      translateX = 0
      translateY = 0
    }
  }

  // Función para resetear el zoom
  function resetZoom() {
    currentZoom = 1
    translateX = 0
    translateY = 0
    updateZoom()
  }

  // Configurar controles de arrastre para cuando la imagen está ampliada
  function setupDragControls() {
    const modalImage = document.getElementById("modal-work-image")
    if (!modalImage) return

    // Mouse events
    modalImage.addEventListener("mousedown", startDrag)
    window.addEventListener("mousemove", drag)
    window.addEventListener("mouseup", endDrag)

    // Touch events
    modalImage.addEventListener("touchstart", startDrag)
    window.addEventListener("touchmove", drag)
    window.addEventListener("touchend", endDrag)
  }

  // Iniciar arrastre
  function startDrag(e) {
    const modalImage = document.getElementById("modal-work-image")
    if (!modalImage || currentZoom <= 1) return

    e.preventDefault()

    isDragging = true
    modalImage.classList.add("dragging")

    // Guardar posición inicial
    if (e.type === "touchstart") {
      startX = e.touches[0].clientX - translateX
      startY = e.touches[0].clientY - translateY
    } else {
      startX = e.clientX - translateX
      startY = e.clientY - translateY
    }
  }

  // Arrastrar
  function drag(e) {
    const modalImage = document.getElementById("modal-work-image")
    if (!isDragging || !modalImage) return

    e.preventDefault()

    // Calcular nueva posición
    if (e.type === "touchmove") {
      translateX = e.touches[0].clientX - startX
      translateY = e.touches[0].clientY - startY
    } else {
      translateX = e.clientX - startX
      translateY = e.clientY - startY
    }

    // Limitar el arrastre
    const maxTranslate = 100 * (currentZoom - 1)
    translateX = Math.max(-maxTranslate, Math.min(maxTranslate, translateX))
    translateY = Math.max(-maxTranslate, Math.min(maxTranslate, translateY))

    // Aplicar transformación
    modalImage.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`
  }

  // Finalizar arrastre
  function endDrag() {
    const modalImage = document.getElementById("modal-work-image")
    if (!modalImage) return

    isDragging = false
    modalImage.classList.remove("dragging")
  }

  // Escape para cerrar el modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeWorkModal()
    } else if (e.key === "ArrowLeft") {
      showPreviousWork()
    } else if (e.key === "ArrowRight") {
      showNextWork()
    } else if (e.key === "+" || e.key === "=") {
      currentZoom *= 1.2
      updateZoom()
    } else if (e.key === "-") {
      currentZoom /= 1.2
      updateZoom()
    } else if (e.key === "0") {
      resetZoom()
    }
  })

  // Inicializar filtros avanzados
  initAdvancedFilters()
})

// Función para inicializar los filtros avanzados
function initAdvancedFilters() {
  // Elementos DOM
  const filterToggle = document.querySelector(".filter-toggle")
  const advancedFilters = document.querySelector(".advanced-filters")
  const applyFiltersBtn = document.querySelector(".filter-btn.apply")
  const resetFiltersBtn = document.querySelector(".filter-btn.reset")
  const memberCards = document.querySelectorAll(".member-card, .founder-card")
  const searchInput = document.getElementById("member-search")
  const roleFilter = document.getElementById("role-filter")
  const specialtyFilter = document.getElementById("specialty-filter")
  const yearFilter = document.getElementById("year-filter")
  const techniqueFilter = document.getElementById("technique-filter")
  const filterTags = document.querySelector(".filter-tags")

  // Si no existen los elementos, salir
  if (!filterToggle || !memberCards.length) return

  filterToggle?.addEventListener("click", () => {
    advancedFilters?.classList.toggle("active")
    const isActive = advancedFilters?.classList.contains("active")
    const icon = isActive ? "fas fa-chevron-up" : "fas fa-chevron-down"
    const text = isActive ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"
    filterToggle.innerHTML = `<i class="${icon}"></i> ${text}`
  })

  // Aplicar filtros
  applyFiltersBtn?.addEventListener("click", applyFilters)

  // Resetear filtros
  resetFiltersBtn?.addEventListener("click", resetFilters)

  // Filtrar al escribir en el buscador
  searchInput?.addEventListener("input", applyFilters)

  // Filtrar al cambiar los selectores básicos
  roleFilter?.addEventListener("change", applyFilters)
  specialtyFilter?.addEventListener("change", applyFilters)

  yearFilter?.addEventListener("change", applyFilters)
  techniqueFilter?.addEventListener("change", applyFilters)

  // Función para aplicar todos los filtros
  function applyFilters() {
    // Valores de los filtros
    const searchValue = searchInput?.value.toLowerCase() || ""
    const roleValue = roleFilter?.value || "all"
    const specialtyValue = specialtyFilter?.value || "all"
    const yearValue = yearFilter?.value || "all"
    const techniqueValue = techniqueFilter?.value || "all"

    // Limpiar tags de filtros
    if (filterTags) filterTags.innerHTML = ""

    // Añadir tags para filtros activos
    if (searchValue) {
      addFilterTag("Búsqueda", searchValue)
    }
    if (roleValue !== "all") {
      addFilterTag("Rol", roleFilter.options[roleFilter.selectedIndex].text)
    }
    if (specialtyValue !== "all") {
      addFilterTag("Especialidad", specialtyFilter.options[specialtyFilter.selectedIndex].text)
    }
    if (yearValue !== "all") {
      addFilterTag("Año", yearFilter.options[yearFilter.selectedIndex].text)
    }
    if (techniqueValue !== "all") {
      addFilterTag("Técnica", techniqueFilter.options[techniqueFilter.selectedIndex].text)
    }

    // Contador de resultados
    let visibleCount = 0

    // Aplicar filtros a cada tarjeta
    memberCards.forEach((card) => {
      // Datos de la tarjeta
      const name = card.querySelector("h3").textContent.toLowerCase()
      const role = card.getAttribute("data-role") || ""
      const specialty = card.getAttribute("data-specialty") || ""
      const memberSince = card.querySelector(".member-since, .founder-title")?.textContent.toLowerCase() || ""

      // Obtener técnicas de las obras (si existen)
      const techniques = Array.from(card.querySelectorAll(".work-technique")).map((el) => el.textContent.toLowerCase())

      // Comprobar si cumple todos los filtros
      const matchesSearch = searchValue === "" || name.includes(searchValue) || memberSince.includes(searchValue)

      const matchesRole = roleValue === "all" || role === roleValue

      const matchesSpecialty = specialtyValue === "all" || specialty.includes(specialtyValue)

      const matchesYear = yearValue === "all" || memberSince.includes(yearValue)

      const matchesTechnique =
        techniqueValue === "all" || techniques.some((t) => t.includes(techniqueValue.toLowerCase()))

      // Mostrar u ocultar según los filtros
      if (matchesSearch && matchesRole && matchesSpecialty && matchesYear && matchesTechnique) {
        card.style.display = ""
        visibleCount++
      } else {
        card.style.display = "none"
      }
    })

    // Actualizar contadores
    updateCounters(visibleCount)
  }

  // Función para resetear todos los filtros
  function resetFilters() {
    if (searchInput) searchInput.value = ""
    if (roleFilter) roleFilter.value = "all"
    if (specialtyFilter) specialtyFilter.value = "all"
    if (yearFilter) yearFilter.value = "all"
    if (techniqueFilter) techniqueFilter.value = "all"

    // Limpiar tags
    if (filterTags) filterTags.innerHTML = ""

    // Mostrar todas las tarjetas
    memberCards.forEach((card) => {
      card.style.display = ""
    })

    // Actualizar contadores
    updateCounters(memberCards.length)
  }

  // Función para añadir un tag de filtro
  function addFilterTag(type, value) {
    if (!filterTags) return

    const tag = document.createElement("div")
    tag.className = "filter-tag"
    tag.innerHTML = `
      <span>${type}: ${value}</span>
      <span class="filter-tag-remove"><i class="fas fa-times"></i></span>
    `

    // Eliminar filtro al hacer clic en el botón de cerrar
    tag.querySelector(".filter-tag-remove").addEventListener("click", () => {
      if (type === "Búsqueda" && searchInput) {
        searchInput.value = ""
      } else if (type === "Rol" && roleFilter) {
        roleFilter.value = "all"
      } else if (type === "Especialidad" && specialtyFilter) {
        specialtyFilter.value = "all"
      } else if (type === "Año" && yearFilter) {
        yearFilter.value = "all"
      } else if (type === "Técnica" && techniqueFilter) {
        techniqueFilter.value = "all"
      }

      applyFilters()
    })

    filterTags.appendChild(tag)
  }

  // Función para actualizar los contadores
  function updateCounters(visibleCount) {
    const totalMembers = document.getElementById("total-members")
    if (totalMembers) {
      totalMembers.textContent = visibleCount
    }

    // Contar admins visibles
    const visibleAdmins = Array.from(memberCards).filter(
      (card) =>
        card.style.display !== "none" &&
        (card.getAttribute("data-role") === "admin" || card.getAttribute("data-role") === "founder"),
    ).length

    const totalAdmins = document.getElementById("total-admins")
    if (totalAdmins) {
      totalAdmins.textContent = visibleAdmins
    }

    let visibleWorks = 0
    memberCards.forEach((card) => {
      if (card.style.display !== "none") {
        const worksButton = card.querySelector(".btn-view-works")
        if (worksButton) {
          const worksCount = worksButton.textContent.match(/\d+/)
          if (worksCount) {
            visibleWorks += Number.parseInt(worksCount[0])
          }
        }
      }
    })

    const totalWorks = document.getElementById("total-works")
    if (totalWorks) {
      totalWorks.textContent = visibleWorks || "Indefinido"
    }
  }
}

// Exponer la función resetFilters globalmente para el botón en el mensaje de no resultados
window.resetFilters = () => {
  const resetFiltersBtn = document.querySelector(".filter-btn.reset")
  if (resetFiltersBtn) {
    resetFiltersBtn.click()
  } else {
    // Fallback si no existe el botón
    const memberCards = document.querySelectorAll(".member-card, .founder-card")
    memberCards.forEach((card) => {
      card.style.display = ""
    })

    const noResults = document.getElementById("no-results")
    if (noResults) {
      noResults.style.display = "none"
    }

    // Resetear inputs y selects
    const searchInput = document.getElementById("member-search")
    const roleFilter = document.getElementById("role-filter")
    const specialtyFilter = document.getElementById("specialty-filter")
    const yearFilter = document.getElementById("year-filter")
    const techniqueFilter = document.getElementById("technique-filter")

    if (searchInput) searchInput.value = ""
    if (roleFilter) roleFilter.value = "all"
    if (specialtyFilter) specialtyFilter.value = "all"
    if (yearFilter) yearFilter.value = "all"
    if (techniqueFilter) techniqueFilter.value = "all"

    // Limpiar tags
    const filterTags = document.querySelector(".filter-tags")
    if (filterTags) filterTags.innerHTML = ""
  }
}
