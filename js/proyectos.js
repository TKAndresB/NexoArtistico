// ===================================
// PROYECTOS - JAVASCRIPT
// ===================================

// Projects page functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeProjectFilters()
  initializeProjectSearch()
  animateStatistics()
  animateOnScroll()
})

// Initialize project filters
function initializeProjectFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn")
  const projectCards = document.querySelectorAll(".past-project-card")

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter")

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Filter projects
      filterProjects(filter, projectCards)
    })
  })
}

// Filter projects by category
function filterProjects(filter, projectCards) {
  let visibleCount = 0

  projectCards.forEach((card) => {
    const category = card.getAttribute("data-category")

    if (filter === "all" || category === filter) {
      card.style.display = ""
      card.classList.add("show")
      visibleCount++
    } else {
      card.style.display = "none"
      card.classList.remove("show")
    }
  })

  // Show/hide no results message
  toggleNoResultsMessage(visibleCount)
}

// Initialize project search
function initializeProjectSearch() {
  const searchInput = document.getElementById("project-search")
  const projectCards = document.querySelectorAll(".past-project-card")

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      let visibleCount = 0

      projectCards.forEach((card) => {
        const title = card.querySelector("h3").textContent.toLowerCase()
        const description = card.querySelector(".project-description").textContent.toLowerCase()
        const activeFilter = document.querySelector(".filter-btn.active").getAttribute("data-filter")
        const category = card.getAttribute("data-category")

        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm)
        const matchesFilter = activeFilter === "all" || category === activeFilter

        if (matchesSearch && matchesFilter) {
          card.style.display = ""
          card.classList.add("show")
          visibleCount++
        } else {
          card.style.display = "none"
          card.classList.remove("show")
        }
      })

      // Show/hide no results message
      toggleNoResultsMessage(visibleCount)
    })
  }
}

// Toggle no results message
function toggleNoResultsMessage(visibleCount) {
  const noResultsMessage = document.getElementById("no-projects-found")
  const projectsGrid = document.querySelector(".past-projects-grid")

  if (noResultsMessage) {
    if (visibleCount === 0) {
      noResultsMessage.style.display = "block"
      projectsGrid.style.display = "none"
    } else {
      noResultsMessage.style.display = "none"
      projectsGrid.style.display = "grid"
    }
  }
}

// Reset project filters
function resetProjectFilters() {
  const allButton = document.querySelector('.filter-btn[data-filter="all"]')
  const searchInput = document.getElementById("project-search")

  if (allButton) {
    allButton.click()
  }

  if (searchInput) {
    searchInput.value = ""
    searchInput.dispatchEvent(new Event("input"))
  }
}

// Animate statistics on scroll
function animateStatistics() {
  const statNumbers = document.querySelectorAll(".stat-card h3")

  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target
        const finalValue = Number.parseInt(target.textContent)
        animateNumber(target, 0, finalValue, 2000)
        observer.unobserve(target)
      }
    })
  }, observerOptions)

  statNumbers.forEach((stat) => {
    observer.observe(stat)
  })
}

// Animate number counting
function animateNumber(element, start, end, duration) {
  const startTime = performance.now()
  const range = end - start

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const current = Math.floor(start + range * easeOutQuart)

    element.textContent = current.toLocaleString()

    if (progress < 1) {
      requestAnimationFrame(updateNumber)
    } else {
      element.textContent = end.toLocaleString()
    }
  }

  requestAnimationFrame(updateNumber)
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
  const elementsToAnimate = document.querySelectorAll(".project-card, .past-project-card, .stat-card, .whatsapp-card")

  elementsToAnimate.forEach((el, index) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`
    observer.observe(el)
  })
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

// Add smooth scroll to hero buttons
document.addEventListener("DOMContentLoaded", () => {
  const heroButtons = document.querySelectorAll('.hero-buttons a[href^="#"]')

  heroButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href").substring(1)
      scrollToSection(targetId)
    })
  })
})
