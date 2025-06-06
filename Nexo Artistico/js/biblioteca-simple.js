/**
 * ===================================
 * BIBLIOTECA SIMPLE - JAVASCRIPT
 * ===================================
 *
 * Sistema de biblioteca estática con funcionalidad de búsqueda y filtros
 */

class BibliotecaSimple {
  constructor() {
    this.currentView = "grid"
    this.allBooks = []
    this.filteredBooks = []

    this.init()
  }

  init() {
    // Obtener todos los libros del DOM
    this.getAllBooks()

    // Configurar eventos
    this.bindEvents()

    // Mostrar todos los libros inicialmente
    this.showAllBooks()

    console.log("Biblioteca Simple inicializada")
  }

  getAllBooks() {
    const bookCards = document.querySelectorAll(".book-card")
    this.allBooks = Array.from(bookCards)
    this.filteredBooks = [...this.allBooks]
  }

  bindEvents() {
    // Búsqueda
    const searchInput = document.getElementById("search-input")
    const searchClear = document.getElementById("search-clear")

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.handleSearch(e.target.value)
        this.updateSearchClearButton(e.target.value)
      })
    }

    if (searchClear) {
      searchClear.addEventListener("click", () => {
        searchInput.value = ""
        this.handleSearch("")
        this.updateSearchClearButton("")
      })
    }

    // Filtros
    const categoryFilter = document.getElementById("category-filter")
    const levelFilter = document.getElementById("level-filter")
    const languageFilter = document.getElementById("language-filter")

    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => this.applyFilters())
    }

    if (levelFilter) {
      levelFilter.addEventListener("change", () => this.applyFilters())
    }

    if (languageFilter) {
      languageFilter.addEventListener("change", () => this.applyFilters())
    }

    // Ordenación
    const sortSelect = document.getElementById("sort-select")
    if (sortSelect) {
      sortSelect.addEventListener("change", () => this.applySorting())
    }

    // Vista
    const viewButtons = document.querySelectorAll(".view-btn")
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setView(btn.dataset.view)
      })
    })

    // Limpiar filtros
    const clearFiltersBtn = document.getElementById("clear-filters")
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => this.clearFilters())
    }

    // Reset búsqueda
    const resetSearchBtn = document.getElementById("reset-search")
    if (resetSearchBtn) {
      resetSearchBtn.addEventListener("click", () => this.resetSearch())
    }

    // Toggle filtros avanzados
    const filtersToggle = document.getElementById("search-filters-toggle")
    const advancedFilters = document.getElementById("advanced-filters")

    if (filtersToggle && advancedFilters) {
      filtersToggle.addEventListener("click", () => {
        advancedFilters.classList.toggle("active")
        filtersToggle.classList.toggle("active")
      })
    }
  }

  updateSearchClearButton(value) {
    const searchClear = document.getElementById("search-clear")
    if (searchClear) {
      searchClear.style.display = value.length > 0 ? "block" : "none"
    }
  }

  handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim()

    this.filteredBooks = this.allBooks.filter((book) => {
      const title = book.querySelector(".book-title")?.textContent.toLowerCase() || ""
      const author = book.querySelector(".book-author")?.textContent.toLowerCase() || ""
      const description = book.querySelector(".book-description")?.textContent.toLowerCase() || ""
      const category = book.querySelector(".book-category")?.textContent.toLowerCase() || ""

      return title.includes(term) || author.includes(term) || description.includes(term) || category.includes(term)
    })

    this.applyFilters()
  }

  applyFilters() {
    const categoryFilter = document.getElementById("category-filter")?.value || "all"
    const levelFilter = document.getElementById("level-filter")?.value || "all"
    const languageFilter = document.getElementById("language-filter")?.value || "all"

    this.filteredBooks = this.filteredBooks.filter((book) => {
      // Filtro por categoría
      if (categoryFilter !== "all") {
        const bookCategory = book.dataset.category
        if (bookCategory !== categoryFilter) return false
      }

      // Filtro por nivel
      if (levelFilter !== "all") {
        const bookLevel = book.dataset.level
        if (bookLevel !== levelFilter) return false
      }

      // Filtro por idioma
      if (languageFilter !== "all") {
        const bookLanguage = book.dataset.language
        if (bookLanguage !== languageFilter) return false
      }

      return true
    })

    this.applySorting()
    this.updateDisplay()
  }

  applySorting() {
    const sortSelect = document.getElementById("sort-select")
    const sortValue = sortSelect?.value || "title-asc"

    this.filteredBooks.sort((a, b) => {
      const titleA = a.querySelector(".book-title")?.textContent || ""
      const titleB = b.querySelector(".book-title")?.textContent || ""
      const authorA = a.querySelector(".book-author")?.textContent || ""
      const authorB = b.querySelector(".book-author")?.textContent || ""
      const categoryA = a.querySelector(".book-category")?.textContent || ""
      const categoryB = b.querySelector(".book-category")?.textContent || ""

      switch (sortValue) {
        case "title-asc":
          return titleA.localeCompare(titleB)
        case "title-desc":
          return titleB.localeCompare(titleA)
        case "author-asc":
          return authorA.localeCompare(authorB)
        case "category-asc":
          return categoryA.localeCompare(categoryB)
        default:
          return 0
      }
    })
  }

  updateDisplay() {
    const booksGrid = document.getElementById("books-grid")
    const noResults = document.getElementById("no-results")
    const resultsText = document.getElementById("results-text")

    // Limpiar grid
    booksGrid.innerHTML = ""

    // Mostrar libros filtrados
    if (this.filteredBooks.length > 0) {
      this.filteredBooks.forEach((book) => {
        booksGrid.appendChild(book.cloneNode(true))
      })

      booksGrid.style.display = "grid"
      noResults.style.display = "none"

      // Actualizar texto de resultados
      if (resultsText) {
        if (this.filteredBooks.length === this.allBooks.length) {
          resultsText.textContent = `Mostrando todos los libros (${this.filteredBooks.length})`
        } else {
          resultsText.textContent = `Mostrando ${this.filteredBooks.length} de ${this.allBooks.length} libros`
        }
      }
    } else {
      booksGrid.style.display = "none"
      noResults.style.display = "block"

      if (resultsText) {
        resultsText.textContent = "No se encontraron resultados"
      }
    }

    // Aplicar vista actual
    booksGrid.className = `books-grid view-${this.currentView}`
  }

  setView(view) {
    this.currentView = view

    // Actualizar botones de vista
    const viewButtons = document.querySelectorAll(".view-btn")
    viewButtons.forEach((btn) => {
      if (btn.dataset.view === view) {
        btn.classList.add("active")
      } else {
        btn.classList.remove("active")
      }
    })

    // Actualizar clase del grid
    const booksGrid = document.getElementById("books-grid")
    if (booksGrid) {
      booksGrid.className = `books-grid view-${view}`
    }
  }

  clearFilters() {
    // Resetear filtros
    const categoryFilter = document.getElementById("category-filter")
    const levelFilter = document.getElementById("level-filter")
    const languageFilter = document.getElementById("language-filter")

    if (categoryFilter) categoryFilter.value = "all"
    if (levelFilter) levelFilter.value = "all"
    if (languageFilter) languageFilter.value = "all"

    // Reaplicar filtros
    this.filteredBooks = [...this.allBooks]
    this.applyFilters()
  }

  resetSearch() {
    const searchInput = document.getElementById("search-input")
    if (searchInput) {
      searchInput.value = ""
      this.updateSearchClearButton("")
    }

    this.clearFilters()
    this.showAllBooks()
  }

  showAllBooks() {
    this.filteredBooks = [...this.allBooks]
    this.updateDisplay()
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.bibliotecaSimple = new BibliotecaSimple()
})
