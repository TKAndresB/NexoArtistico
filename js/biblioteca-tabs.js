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
      document.getElementById(`${tabId}-tab`).classList.add("active")
    })
  })

  // Search functionality
  const searchInput = document.getElementById("search-input")
  const searchClear = document.getElementById("search-clear")
  const categoryFilter = document.getElementById("category-filter")
  const levelFilter = document.getElementById("level-filter")
  const clearFiltersBtn = document.getElementById("clear-filters")
  const resetSearchBtn = document.getElementById("reset-search")
  const booksGrid = document.getElementById("books-grid")
  const noResults = document.getElementById("no-results")
  const resultsText = document.getElementById("results-text")
  const bookCards = document.querySelectorAll(".book-card-simple")
  const totalBooksElement = document.getElementById("total-books")

  // Update total books count
  totalBooksElement.textContent = bookCards.length

  // Search and filter function
  function filterBooks() {
    const searchTerm = searchInput.value.toLowerCase()
    const category = categoryFilter.value
    const level = levelFilter.value

    let visibleCount = 0

    bookCards.forEach((card) => {
      const title = card.querySelector("h4").textContent.toLowerCase()
      const author = card.querySelector(".book-author").textContent.toLowerCase()
      const cardCategory = card.getAttribute("data-category")
      const cardLevel = card.getAttribute("data-level")

      const matchesSearch = title.includes(searchTerm) || author.includes(searchTerm)
      const matchesCategory = category === "all" || cardCategory === category
      const matchesLevel = level === "all" || cardLevel === level

      if (matchesSearch && matchesCategory && matchesLevel) {
        card.style.display = "block"
        visibleCount++
      } else {
        card.style.display = "none"
      }
    })

    // Update results text and show/hide no results message
    if (visibleCount === 0) {
      booksGrid.style.display = "none"
      noResults.style.display = "block"
    } else {
      booksGrid.style.display = "grid"
      noResults.style.display = "none"

      if (visibleCount === bookCards.length) {
        resultsText.textContent = "Mostrando todos los libros"
      } else {
        resultsText.textContent = `Mostrando ${visibleCount} de ${bookCards.length} libros`
      }
    }

    // Show/hide clear button
    if (searchInput.value) {
      searchClear.style.display = "flex"
    } else {
      searchClear.style.display = "none"
    }
  }

  // Event listeners
  searchInput.addEventListener("input", filterBooks)
  categoryFilter.addEventListener("change", filterBooks)
  levelFilter.addEventListener("change", filterBooks)

  // Clear search
  searchClear.addEventListener("click", () => {
    searchInput.value = ""
    filterBooks()
  })

  // Clear all filters
  clearFiltersBtn.addEventListener("click", () => {
    searchInput.value = ""
    categoryFilter.value = "all"
    levelFilter.value = "all"
    filterBooks()
  })

  // Reset search from no results state
  resetSearchBtn.addEventListener("click", () => {
    searchInput.value = ""
    categoryFilter.value = "all"
    levelFilter.value = "all"
    filterBooks()
  })

  // Initialize
  filterBooks()
})
