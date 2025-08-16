// ===================================
// BIBLIOTECA DIGITAL - JAVASCRIPT
// ===================================

document.addEventListener("DOMContentLoaded", () => {
  // Tab Navigation
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab")

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      button.classList.add("active")
      document.getElementById(tabId).classList.add("active")
    })
  })

  // Search functionality for each tab
  initializeSearch("libros")
  initializeSearch("recursos")
  initializeSearch("videos")
  initializeSearch("software")

  // Configurar videos de YouTube
  setupYouTubeVideos()

  // Inicializar sistema de favoritos
  if (document.querySelector(".books-grid")) {
    window.favoritesSystem = new FavoritesSystem()
    console.log("Sistema de favoritos inicializado")
  }
})

function initializeSearch(tabName) {
  const searchInput = document.getElementById(`${tabName}-search`)
  const categoryFilter = document.getElementById(`${tabName}-filter`)
  const grid = document.getElementById(`${tabName}-grid`)

  if (!searchInput || !grid) return

  function filterItems() {
    const searchTerm = searchInput.value.toLowerCase()
    const category = categoryFilter ? categoryFilter.value : "all"

    const cards = grid.children
    let visibleCount = 0

    Array.from(cards).forEach((card) => {
      if (card.classList.contains("no-results")) return

      const title = card.querySelector("h3")?.textContent.toLowerCase() || ""
      const description = card.querySelector("p")?.textContent.toLowerCase() || ""
      const cardCategory = card.getAttribute("data-category")

      const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm)
      const matchesCategory = category === "all" || cardCategory === category

      if (matchesSearch && matchesCategory) {
        card.style.display = "block"
        visibleCount++
      } else {
        card.style.display = "none"
      }
    })

    // Show/hide no results message
    showNoResults(grid, visibleCount === 0)
  }

  // Event listeners
  searchInput.addEventListener("input", filterItems)
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterItems)
  }

  // Initialize
  filterItems()
}

function showNoResults(container, show) {
  let noResultsEl = container.querySelector(".no-results")

  if (show && !noResultsEl) {
    noResultsEl = document.createElement("div")
    noResultsEl.className = "no-results"
    noResultsEl.innerHTML = `
      <i class="fas fa-search"></i>
      <h3>No se encontraron resultados</h3>
      <p>Intenta con otros términos de búsqueda o cambia los filtros.</p>
    `
    container.appendChild(noResultsEl)
  } else if (!show && noResultsEl) {
    noResultsEl.remove()
  }
}

// Función para extraer ID de video de YouTube y generar miniatura
function setupYouTubeVideos() {
  const videoCards = document.querySelectorAll(".video-card[data-youtube]")

  videoCards.forEach((card) => {
    const youtubeUrl = card.getAttribute("data-youtube")
    const videoId = extractYouTubeId(youtubeUrl)

    if (videoId) {
      const thumbnail = card.querySelector(".video-thumbnail img")
      const playBtn = card.querySelector(".play-btn")

      // Actualizar la miniatura
      if (thumbnail) {
        thumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

        // Fallback a imagen de menor calidad si la HD no existe
        thumbnail.onerror = function () {
          this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        }
      }

      // Actualizar el enlace del botón de play
      if (playBtn) {
        playBtn.href = youtubeUrl
      }

      // Hacer toda la tarjeta clickeable
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".play-btn")) {
          window.open(youtubeUrl, "_blank")
        }
      })
    }
  })
}

// Función para extraer ID de video de YouTube de diferentes formatos de URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * ===================================
 * SISTEMA DE FAVORITOS
 * ===================================
 */
class FavoritesSystem {
  constructor() {
    this.storageKey = "nexo_artistico_favorites"
    this.favorites = this.loadFavorites()
    this.isFilterActive = false

    this.init()
  }

  init() {
    // Inicializar botones de favoritos
    this.setupFavoriteButtons()

    // Añadir filtro de favoritos
    this.addFavoritesFilter()

    // Añadir mensaje de no favoritos
    this.addNoFavoritesMessage()

    // Añadir tooltip para notificaciones
    this.createTooltip()

    // Actualizar contador de favoritos
    this.updateFavoritesCount()
  }

  loadFavorites() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error al cargar favoritos:", error)
      return []
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.favorites))
    } catch (error) {
      console.error("Error al guardar favoritos:", error)
      this.showTooltip("Error al guardar favoritos", "error")
    }
  }

  setupFavoriteButtons() {
    const bookCards = document.querySelectorAll(".book-card")

    bookCards.forEach((card) => {
      // Obtener ID único del libro (usando título como fallback)
      const bookId = card.dataset.id || card.querySelector("h3")?.textContent.trim()
      if (!bookId) return

      // Crear botón de favorito
      const favoriteBtn = document.createElement("button")
      favoriteBtn.className = "favorite-btn"
      favoriteBtn.setAttribute("aria-label", "Añadir a favoritos")
      favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>'

      // Verificar si ya está en favoritos
      if (this.favorites.includes(bookId)) {
        favoriteBtn.classList.add("active")
        favoriteBtn.setAttribute("aria-label", "Quitar de favoritos")
      }

      // Añadir evento de click
      favoriteBtn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.toggleFavorite(bookId, favoriteBtn, card)
      })

      // Añadir botón a la tarjeta
      card.querySelector(".book-cover").appendChild(favoriteBtn)

      // Guardar ID en la tarjeta para referencia
      card.dataset.id = bookId
    })
  }

  toggleFavorite(bookId, button, card) {
    const isFavorite = this.favorites.includes(bookId)

    if (isFavorite) {
      // Quitar de favoritos
      this.favorites = this.favorites.filter((id) => id !== bookId)
      button.classList.remove("active")
      button.setAttribute("aria-label", "Añadir a favoritos")

      // Si el filtro está activo, ocultar la tarjeta
      if (this.isFilterActive) {
        card.style.display = "none"
        setTimeout(() => {
          this.checkNoFavorites()
        }, 300)
      }

      this.showTooltip("Eliminado de favoritos")
    } else {
      // Añadir a favoritos
      this.favorites.push(bookId)
      button.classList.add("active")
      button.setAttribute("aria-label", "Quitar de favoritos")
      this.showTooltip("Añadido a favoritos")
    }

    // Guardar cambios
    this.saveFavorites()

    // Actualizar contador
    this.updateFavoritesCount()
  }

  addFavoritesFilter() {
    const filterContainer = document.querySelector(".filter-options")
    if (!filterContainer) return

    const favoritesFilter = document.createElement("div")
    favoritesFilter.className = "favorites-filter"
    favoritesFilter.innerHTML = `
      <i class="fas fa-heart"></i>
      <span>Favoritos</span>
      <span class="favorites-count">0</span>
    `

    favoritesFilter.addEventListener("click", () => {
      this.toggleFavoritesFilter(favoritesFilter)
    })

    filterContainer.appendChild(favoritesFilter)
    this.favoritesFilter = favoritesFilter
  }

  toggleFavoritesFilter(filterButton) {
    this.isFilterActive = !this.isFilterActive

    // Actualizar estado del botón
    filterButton.classList.toggle("active", this.isFilterActive)

    // Filtrar libros
    const bookCards = document.querySelectorAll(".book-card")
    bookCards.forEach((card) => {
      const bookId = card.dataset.id
      if (!bookId) return

      if (this.isFilterActive) {
        // Mostrar solo favoritos
        card.style.display = this.favorites.includes(bookId) ? "block" : "none"
      } else {
        // Mostrar todos
        card.style.display = "block"
      }
    })

    // Verificar si hay favoritos para mostrar
    this.checkNoFavorites()
  }

  addNoFavoritesMessage() {
    const booksGrid = document.getElementById("books-grid")
    if (!booksGrid) return

    const noFavoritesMessage = document.createElement("div")
    noFavoritesMessage.className = "no-favorites"
    noFavoritesMessage.innerHTML = `
      <i class="fas fa-heart-broken"></i>
      <h3>No tienes favoritos</h3>
      <p>Marca libros como favoritos para encontrarlos fácilmente después.</p>
    `

    booksGrid.appendChild(noFavoritesMessage)
    this.noFavoritesMessage = noFavoritesMessage
  }

  checkNoFavorites() {
    if (!this.noFavoritesMessage || !this.isFilterActive) {
      if (this.noFavoritesMessage) {
        this.noFavoritesMessage.classList.remove("visible")
      }
      return
    }

    // Verificar si hay algún libro visible
    const visibleBooks = document.querySelectorAll('.book-card[style="display: block;"]')
    if (visibleBooks.length === 0) {
      this.noFavoritesMessage.classList.add("visible")
    } else {
      this.noFavoritesMessage.classList.remove("visible")
    }
  }

  updateFavoritesCount() {
    const countElement = document.querySelector(".favorites-count")
    if (countElement) {
      countElement.textContent = this.favorites.length
    }
  }

  createTooltip() {
    const tooltip = document.createElement("div")
    tooltip.className = "favorite-tooltip"
    document.body.appendChild(tooltip)
    this.tooltip = tooltip
  }

  showTooltip(message, type = "success") {
    if (!this.tooltip) return

    // Configurar icono según el tipo
    let icon = "fa-heart"
    if (type === "error") icon = "fa-exclamation-circle"

    this.tooltip.innerHTML = `<i class="fas ${icon}"></i>${message}`
    this.tooltip.classList.add("show")

    // Ocultar después de un tiempo
    clearTimeout(this.tooltipTimeout)
    this.tooltipTimeout = setTimeout(() => {
      this.tooltip.classList.remove("show")
    }, 2000)
  }
}
