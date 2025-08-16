// Gallery functionality
document.addEventListener("DOMContentLoaded", () => {
  const searchFilter = document.getElementById("search-filter")
  const artistFilter = document.getElementById("artist-filter")
  const categoryFilter = document.getElementById("category-filter")
  const styleFilter = document.getElementById("style-filter")
  const yearFilter = document.getElementById("year-filter")
  const clearFiltersBtn = document.getElementById("clear-filters")
  const resultsCount = document.getElementById("results-count")
  const galleryGrid = document.getElementById("gallery-grid")

  initializeFavorites()

  // Filter functionality
  function filterArtworks() {
    const searchTerm = searchFilter.value.toLowerCase()
    const artistSearchTerm = artistFilter.value.toLowerCase()
    const selectedCategory = categoryFilter.value
    const selectedStyle = styleFilter.value
    const selectedYear = yearFilter.value

    const artworkCards = document.querySelectorAll(".artwork-card")
    let visibleCount = 0

    artworkCards.forEach((card) => {
      const title = card.querySelector(".artwork-title").textContent.toLowerCase()
      const description = card.querySelector(".artwork-description").textContent.toLowerCase()
      const artist = card.dataset.artist
      const category = card.dataset.category
      const style = card.dataset.style
      const year = card.dataset.year

      const matchesSearch = searchTerm === "" || title.includes(searchTerm) || description.includes(searchTerm)
      const matchesArtist = artistSearchTerm === "" || artist.toLowerCase().includes(artistSearchTerm)
      const matchesCategory = selectedCategory === "all" || category === selectedCategory
      const matchesStyle = selectedStyle === "all" || style === selectedStyle
      const matchesYear = selectedYear === "all" || year === selectedYear

      if (matchesSearch && matchesArtist && matchesCategory && matchesStyle && matchesYear) {
        card.style.display = "block"
        visibleCount++
      } else {
        card.style.display = "none"
      }
    })

    resultsCount.textContent = `${visibleCount} obras encontradas`
  }

  // Event listeners for filters
  searchFilter.addEventListener("input", filterArtworks)
  artistFilter.addEventListener("input", filterArtworks)
  categoryFilter.addEventListener("change", filterArtworks)
  styleFilter.addEventListener("change", filterArtworks)
  yearFilter.addEventListener("change", filterArtworks)

  // Clear filters
  clearFiltersBtn.addEventListener("click", () => {
    searchFilter.value = ""
    artistFilter.value = ""
    categoryFilter.value = "all"
    styleFilter.value = "all"
    yearFilter.value = "all"
    filterArtworks()
  })

  // Initialize filter count
  filterArtworks()
})

function initializeFavorites() {
  const favoriteButtons = document.querySelectorAll(".favorite-btn")
  const favorites = getFavorites()

  favoriteButtons.forEach((button) => {
    const artworkId = button.dataset.artwork
    if (favorites.includes(artworkId)) {
      updateFavoriteButton(button, true)
    }
  })
}

function getFavorites() {
  const favorites = localStorage.getItem("nexo-favorites")
  return favorites ? JSON.parse(favorites) : []
}

function saveFavorites(favorites) {
  localStorage.setItem("nexo-favorites", JSON.stringify(favorites))
}

function toggleFavorite(artworkId) {
  const favorites = getFavorites()
  const button = document.querySelector(`[data-artwork="${artworkId}"]`)

  if (favorites.includes(artworkId)) {
    // Remove from favorites
    const index = favorites.indexOf(artworkId)
    favorites.splice(index, 1)
    updateFavoriteButton(button, false)
  } else {
    // Add to favorites
    favorites.push(artworkId)
    updateFavoriteButton(button, true)
  }

  saveFavorites(favorites)
}

function updateFavoriteButton(button, isFavorite) {
  const icon = button.querySelector("i")
  const text = button.querySelector("span")

  if (isFavorite) {
    icon.className = "fas fa-heart"
    text.textContent = "En Favoritos"
    button.classList.add("favorited")
  } else {
    icon.className = "far fa-heart"
    text.textContent = "Añadir a Favoritos"
    button.classList.remove("favorited")
  }
}

function openArtworkModal(imageSrc, title) {
  const modal = document.getElementById("artwork-modal")

  // Only set the image source and alt text
  document.getElementById("modal-artwork-image").src = imageSrc
  document.getElementById("modal-artwork-image").alt = title

  modal.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeArtworkModal() {
  const modal = document.getElementById("artwork-modal")
  modal.classList.remove("active")
  document.body.style.overflow = "auto"
}

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeArtworkModal()
  }
})
