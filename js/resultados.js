// ===================================
// RESULTADOS - JAVASCRIPT
// ===================================

// Resultados page functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeParticipantFilters()
  initializeViewToggle()
  initializeImageViewer()
  initializeLoadMore()
  animateOnScroll()
})

// Initialize participant filters
function initializeParticipantFilters() {
  const filterButtons = document.querySelectorAll(".participant-filters .filter-btn")
  const participantCards = document.querySelectorAll(".participant-card")

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter")

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Filter participants
      filterParticipants(filter, participantCards)
    })
  })
}

// Filter participants by technique
function filterParticipants(filter, participantCards) {
  let visibleCount = 0

  participantCards.forEach((card) => {
    const technique = card.getAttribute("data-technique")

    if (filter === "all" || technique === filter) {
      card.style.display = ""
      card.classList.add("show")
      visibleCount++
    } else {
      card.style.display = "none"
      card.classList.remove("show")
    }
  })

  // Update showing count
  updateShowingCount(visibleCount)
}

// Initialize view toggle
function initializeViewToggle() {
  const viewButtons = document.querySelectorAll(".view-btn")
  const participantsContainer = document.querySelector(".participants-container")

  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const view = this.getAttribute("data-view")

      // Update active button
      viewButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Update container class
      participantsContainer.className = `participants-container ${view}-view`
    })
  })
}

// Initialize image viewer
function initializeImageViewer() {
  const viewButtons = document.querySelectorAll(".view-full-btn")

  viewButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation()
      const card = this.closest(".participant-card")
      const img = card.querySelector(".participant-image img")
      const title = card.querySelector(".work-title").textContent
      const artist = card.querySelector("h4").textContent

      openImageModal(img.src, title, artist)
    })
  })

  // Also add click to winner images
  const winnerImages = document.querySelectorAll(".winner-image img")
  winnerImages.forEach((img) => {
    img.addEventListener("click", function () {
      const card = this.closest(".winner-card")
      const title = card.querySelector(".work-title").textContent
      const artist = card.querySelector("h3").textContent

      openImageModal(this.src, title, artist)
    })
  })

  // Add click to mention images
  const mentionImages = document.querySelectorAll(".mention-content img")
  mentionImages.forEach((img) => {
    img.addEventListener("click", function () {
      const card = this.closest(".mention-card")
      const title = card.querySelector(".mention-info p").textContent
      const artist = card.querySelector(".mention-info h4").textContent

      openImageModal(this.src, title, artist)
    })
  })
}

// Open image modal
function openImageModal(src, title, artist) {
  // Create modal if it doesn't exist
  let modal = document.getElementById("image-modal")
  if (!modal) {
    modal = document.createElement("div")
    modal.id = "image-modal"
    modal.className = "image-modal"
    document.body.appendChild(modal)
  }

  modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <button class="modal-close" aria-label="Cerrar">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-image-container">
                <img src="${src}" alt="${title}">
            </div>
            <div class="modal-info">
                <h3>${title}</h3>
                <p>Por ${artist}</p>
            </div>
        </div>
    `

  // Show modal
  modal.classList.add("active")
  document.body.style.overflow = "hidden"

  // Close modal events
  const closeBtn = modal.querySelector(".modal-close")
  const backdrop = modal.querySelector(".modal-backdrop")

  closeBtn.addEventListener("click", closeImageModal)
  backdrop.addEventListener("click", closeImageModal)

  // Close on escape
  document.addEventListener("keydown", handleEscapeKey)
}

// Close image modal
function closeImageModal() {
  const modal = document.getElementById("image-modal")
  if (modal) {
    modal.classList.remove("active")
    document.body.style.overflow = ""
    document.removeEventListener("keydown", handleEscapeKey)
  }
}

// Handle escape key
function handleEscapeKey(e) {
  if (e.key === "Escape") {
    closeImageModal()
  }
}

// Initialize load more functionality
function initializeLoadMore() {
  const loadMoreBtn = document.querySelector(".load-more-btn")
  const participantCards = document.querySelectorAll(".participant-card")
  let currentlyShowing = 6

  // Initially hide cards beyond the first 6
  participantCards.forEach((card, index) => {
    if (index >= currentlyShowing) {
      card.style.display = "none"
    }
  })

  updateShowingCount(Math.min(currentlyShowing, participantCards.length))

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      const hiddenCards = Array.from(participantCards).filter(
        (card) =>
          card.style.display === "none" &&
          (document.querySelector(".filter-btn.active").getAttribute("data-filter") === "all" ||
            card.getAttribute("data-technique") ===
              document.querySelector(".filter-btn.active").getAttribute("data-filter")),
      )

      // Show next 6 cards
      const cardsToShow = hiddenCards.slice(0, 6)
      cardsToShow.forEach((card) => {
        card.style.display = ""
        card.classList.add("show")
      })

      currentlyShowing += cardsToShow.length
      updateShowingCount(currentlyShowing)

      // Hide button if no more cards
      if (hiddenCards.length <= 6) {
        this.style.display = "none"
      }
    })
  }
}

// Update showing count
function updateShowingCount(showing) {
  const showingCount = document.querySelector(".showing-count")
  const totalCards = document.querySelectorAll(".participant-card").length

  if (showingCount) {
    showingCount.textContent = `Mostrando ${showing} de ${totalCards} obras`
  }
}

// Animate elements on scroll
function animateOnScroll() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe elements
  const elementsToAnimate = document.querySelectorAll(
    ".winner-card, .mention-card, .participant-card, .stat-card, .back-card",
  )

  elementsToAnimate.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })
}

// Add CSS for image modal
const modalStyles = `
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.image-modal.active {
    opacity: 1;
    visibility: visible;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 90vw;
    max-height: 90vh;
    background: var(--bg-primary);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-xl);
}

.modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
}

.modal-image-container {
    max-height: 70vh;
    overflow: hidden;
}

.modal-image-container img {
    width: 100%;
    height: auto;
    display: block;
}

.modal-info {
    padding: 1.5rem;
    text-align: center;
}

.modal-info h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.modal-info p {
    color: var(--text-secondary);
    margin: 0;
}

@media (max-width: 768px) {
    .modal-content {
        max-width: 95vw;
        max-height: 95vh;
    }
    
    .modal-info {
        padding: 1rem;
    }
}
`

// Inject modal styles
const styleSheet = document.createElement("style")
styleSheet.textContent = modalStyles
document.head.appendChild(styleSheet)
