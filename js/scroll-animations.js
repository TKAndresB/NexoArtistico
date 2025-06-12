/**
 * Nexo Artistico - Sistema de Favoritos
 * Sistema básico para guardar libros favoritos usando localStorage
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

// Inicializar sistema de favoritos cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Solo inicializar en la página de biblioteca
  if (document.querySelector(".books-grid")) {
    window.favoritesSystem = new FavoritesSystem()
    console.log("Sistema de favoritos inicializado")
  }
})
