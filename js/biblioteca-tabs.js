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
