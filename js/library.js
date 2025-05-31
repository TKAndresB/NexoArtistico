/**
 * ===================================
 * BIBLIOTECA - JAVASCRIPT
 * ===================================
 *
 * Este archivo maneja toda la funcionalidad de la Biblioteca:
 * - Filtrado de libros por etiquetas
 * - Búsqueda en tiempo real
 * - Modal de detalles del libro
 * - Sistema de favoritos
 * - Marcar como descargado
 * - Persistencia de datos en localStorage
 */

class Biblioteca {
  constructor() {
    // Elementos del DOM
    this.searchInput = document.getElementById("search-input")
    this.searchBtn = document.getElementById("search-btn")
    this.tagsFilter = document.getElementById("tags-filter")
    this.booksGrid = document.getElementById("books-grid")
    this.bookModal = document.getElementById("book-modal")
    this.modalClose = document.getElementById("modal-close")
    this.modalBackdrop = document.querySelector(".modal-backdrop")
    this.modalTitle = document.getElementById("modal-title")
    this.modalAuthor = document.getElementById("modal-author")
    this.modalCover = document.getElementById("modal-cover")
    this.modalTags = document.getElementById("modal-tags")
    this.modalSize = document.getElementById("modal-size")
    this.modalFormat = document.getElementById("modal-format")
    this.modalDescription = document.getElementById("modal-description")
    this.downloadBtn = document.getElementById("download-btn")
    this.favoriteBtn = document.getElementById("favorite-btn")
    this.downloadedBtn = document.getElementById("downloaded-btn")
    this.favoritesGrid = document.querySelector(".favorites-grid")
    this.emptyFavorites = document.querySelector(".empty-favorites")

    // Estado de la aplicación
    this.currentBookData = null
    this.favoriteBooks = new Set()
    this.downloadedBooks = new Set()
    this.activeTag = "all"

    // Inicializar
    this.init()
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.loadSavedData()
    this.bindEvents()
    this.updateFavoritesSection()
    console.log("Biblioteca inicializada correctamente")
  }

  /**
   * Carga datos guardados de localStorage
   */
  loadSavedData() {
    try {
      const savedFavorites = localStorage.getItem("nexo-artistico-favorite-books")
      if (savedFavorites) {
        this.favoriteBooks = new Set(JSON.parse(savedFavorites))
      }

      const savedDownloaded = localStorage.getItem("nexo-artistico-downloaded-books")
      if (savedDownloaded) {
        this.downloadedBooks = new Set(JSON.parse(savedDownloaded))
      }
    } catch (error) {
      console.warn("Error cargando datos guardados:", error)
      this.favoriteBooks = new Set()
      this.downloadedBooks = new Set()
    }
  }

  /**
   * Guarda datos en localStorage
   */
  saveData() {
    try {
      localStorage.setItem("nexo-artistico-favorite-books", JSON.stringify([...this.favoriteBooks]))
      localStorage.setItem("nexo-artistico-downloaded-books", JSON.stringify([...this.downloadedBooks]))
    } catch (error) {
      console.warn("Error guardando datos:", error)
    }
  }

  /**
   * Vincula eventos a los elementos
   */
  bindEvents() {
    // Búsqueda en tiempo real
    this.searchInput.addEventListener("input", () => this.filterBooks())
    this.searchBtn.addEventListener("click", () => this.filterBooks())

    // Filtro por etiquetas
    this.tagsFilter.addEventListener("click", (e) => {
      if (e.target.classList.contains("tag")) {
        this.filterByTag(e.target.dataset.tag)
      }
    })

    // Modal
    this.modalClose.addEventListener("click", () => this.closeBookModal())
    this.modalBackdrop.addEventListener("click", () => this.closeBookModal())

    // Botones de acción
    this.favoriteBtn.addEventListener("click", () => this.toggleFavorite())
    this.downloadedBtn.addEventListener("click", () => this.toggleDownloaded())

    // Ver detalles del libro
    document.querySelectorAll(".view-details-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const bookCard = e.target.closest(".book-card")
        if (bookCard) {
          this.openBookModal(bookCard)
        }
      })
    })

    // Cerrar modal con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.bookModal.classList.contains("active")) {
        this.closeBookModal()
      }
    })
  }

  /**
   * Filtra libros por etiqueta
   */
  filterByTag(tag) {
    this.activeTag = tag

    // Actualizar UI de etiquetas
    const tags = this.tagsFilter.querySelectorAll(".tag")
    tags.forEach((tagEl) => {
      if (tagEl.dataset.tag === tag) {
        tagEl.classList.add("active")
      } else {
        tagEl.classList.remove("active")
      }
    })

    this.filterBooks()
  }

  /**
   * Filtra libros por búsqueda y etiqueta activa
   */
  filterBooks() {
    const searchTerm = this.searchInput.value.toLowerCase()
    const bookCards = document.querySelectorAll(".book-card")

    bookCards.forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase()
      const author = card.querySelector(".book-author").textContent.toLowerCase()
      const tags = card.dataset.tags ? card.dataset.tags.split(" ") : []

      const matchesSearch = !searchTerm || title.includes(searchTerm) || author.includes(searchTerm)
      const matchesTag = this.activeTag === "all" || tags.includes(this.activeTag)

      if (matchesSearch && matchesTag) {
        card.style.display = "block"
      } else {
        card.style.display = "none"
      }
    })
  }

  /**
   * Abre el modal con los detalles del libro
   */
  openBookModal(bookCard) {
    // Extraer datos del libro
    const title = bookCard.querySelector("h3").textContent
    const author = bookCard.querySelector(".book-author").textContent
    const tags = bookCard.querySelectorAll(".book-tags .tag")
    const size = bookCard.querySelector(".book-size").textContent
    const format = bookCard.querySelector(".book-format").textContent

    // Datos ocultos
    const bookData = bookCard.querySelector(".book-data")
    const description = bookData.querySelector(".book-description").textContent
    const downloadUrl = bookData.querySelector(".book-download-url").textContent
    const coverLarge = bookData.querySelector(".book-cover-large").textContent

    // ID único para el libro (usamos el título como ID)
    const bookId = title

    // Guardar datos del libro actual
    this.currentBookData = {
      id: bookId,
      title,
      author,
      description,
      downloadUrl,
      coverLarge,
      size,
      format,
    }

    // Actualizar contenido del modal
    this.modalTitle.textContent = title
    this.modalAuthor.textContent = author
    this.modalCover.src = coverLarge
    this.modalCover.alt = title
    this.modalSize.textContent = size
    this.modalFormat.textContent = format
    this.modalDescription.textContent = description
    this.downloadBtn.href = downloadUrl

    // Limpiar y añadir etiquetas
    this.modalTags.innerHTML = ""
    tags.forEach((tag) => {
      const tagClone = tag.cloneNode(true)
      this.modalTags.appendChild(tagClone)
    })

    // Actualizar estado de los botones
    this.updateButtonStates()

    // Mostrar modal
    this.bookModal.classList.add("active")
    document.body.style.overflow = "hidden"
  }

  /**
   * Cierra el modal de detalles
   */
  closeBookModal() {
    this.bookModal.classList.remove("active")
    document.body.style.overflow = ""
    this.currentBookData = null
  }

  /**
   * Actualiza el estado de los botones según los datos guardados
   */
  updateButtonStates() {
    if (!this.currentBookData) return

    // Botón de favoritos
    if (this.favoriteBooks.has(this.currentBookData.id)) {
      this.favoriteBtn.classList.add("active")
      this.favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Quitar de favoritos'
    } else {
      this.favoriteBtn.classList.remove("active")
      this.favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Añadir a favoritos'
    }

    // Botón de descargado
    if (this.downloadedBooks.has(this.currentBookData.id)) {
      this.downloadedBtn.classList.add("active")
      this.downloadedBtn.innerHTML = '<i class="fas fa-check-circle"></i> Descargado'
    } else {
      this.downloadedBtn.classList.remove("active")
      this.downloadedBtn.innerHTML = '<i class="far fa-check-circle"></i> Marcar como descargado'
    }
  }

  /**
   * Alterna el estado de favorito del libro actual
   */
  toggleFavorite() {
    if (!this.currentBookData) return

    if (this.favoriteBooks.has(this.currentBookData.id)) {
      this.favoriteBooks.delete(this.currentBookData.id)
    } else {
      this.favoriteBooks.add(this.currentBookData.id)
    }

    this.updateButtonStates()
    this.saveData()
    this.updateFavoritesSection()
  }

  /**
   * Alterna el estado de descargado del libro actual
   */
  toggleDownloaded() {
    if (!this.currentBookData) return

    if (this.downloadedBooks.has(this.currentBookData.id)) {
      this.downloadedBooks.delete(this.currentBookData.id)
    } else {
      this.downloadedBooks.add(this.currentBookData.id)
    }

    this.updateButtonStates()
    this.saveData()
    this.updateBookCardState(this.currentBookData.id)
  }

  /**
   * Actualiza el estado visual de una tarjeta de libro
   */
  updateBookCardState(bookId) {
    const bookCards = document.querySelectorAll(".book-card")
    bookCards.forEach((card) => {
      const title = card.querySelector("h3").textContent
      if (title === bookId) {
        if (this.downloadedBooks.has(bookId)) {
          card.classList.add("downloaded")
        } else {
          card.classList.remove("downloaded")
        }
      }
    })
  }

  /**
   * Actualiza la sección de favoritos
   */
  updateFavoritesSection() {
    if (this.favoriteBooks.size === 0) {
      this.emptyFavorites.style.display = "block"
      this.favoritesGrid.style.display = "none"
      return
    }

    this.emptyFavorites.style.display = "none"
    this.favoritesGrid.style.display = "grid"
    this.favoritesGrid.innerHTML = ""

    // Clonar las tarjetas de libros favoritos
    const bookCards = document.querySelectorAll(".book-card")
    bookCards.forEach((card) => {
      const title = card.querySelector("h3").textContent
      if (this.favoriteBooks.has(title)) {
        const cardClone = card.cloneNode(true)
        this.favoritesGrid.appendChild(cardClone)

        // Añadir evento al botón de detalles del clon
        const detailsBtn = cardClone.querySelector(".view-details-btn")
        detailsBtn.addEventListener("click", () => {
          this.openBookModal(cardClone)
        })
      }
    })
  }
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  window.biblioteca = new Biblioteca()
})
