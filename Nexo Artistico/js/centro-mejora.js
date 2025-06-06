/**
 * ===================================
 * CENTRO DE MEJORA - JAVASCRIPT
 * ===================================
 *
 * Este archivo maneja toda la funcionalidad del Centro de Mejora:
 * - Filtrado de cursos y videos
 * - Cambio entre vista de playlists y videos
 * - Modal de reproducción de videos
 * - Sistema de progreso
 * - Búsqueda en tiempo real
 * - Persistencia de datos en localStorage
 *
 * INSTRUCCIONES PARA AGREGAR NUEVOS VIDEOS:
 * 1. En el HTML, agrega un nuevo .playlist-card con la estructura existente
 * 2. Cambia data-category y data-level según corresponda
 * 3. En .playlist-videos, agrega .video-item con data-youtube-url
 * 4. El sistema extraerá automáticamente el ID del video de YouTube
 * 5. Las miniaturas se generarán automáticamente
 */

class CentroMejora {
  constructor() {
    // Elementos del DOM
    this.searchInput = document.getElementById("search-input")
    this.categoryFilter = document.getElementById("category-filter")
    this.levelFilter = document.getElementById("level-filter")
    this.viewModeSelect = document.getElementById("view-mode")
    this.playlistsView = document.getElementById("playlists-view")
    this.videosView = document.getElementById("videos-view")
    this.playlistsGrid = document.querySelector(".playlists-grid")
    this.videosGrid = document.querySelector(".videos-grid")
    this.videoModal = document.getElementById("video-modal")
    this.modalClose = document.getElementById("modal-close")
    this.modalBackdrop = document.querySelector(".modal-backdrop")
    this.youtubeFrame = document.getElementById("youtube-frame")
    this.modalTitle = document.getElementById("modal-title")
    this.modalDescription = document.getElementById("modal-description")
    this.modalAuthor = document.getElementById("modal-author")
    this.modalPlaylist = document.getElementById("modal-playlist")
    this.markCompletedBtn = document.getElementById("mark-completed")
    this.markIncompleteBtn = document.getElementById("mark-incomplete")

    // Elementos de progreso
    this.completedVideosSpan = document.getElementById("completed-videos")
    this.totalVideosSpan = document.getElementById("total-videos")
    this.completionPercentageSpan = document.getElementById("completion-percentage")
    this.overallProgressBar = document.getElementById("overall-progress")

    // Estado de la aplicación
    this.currentVideoData = null
    this.allPlaylists = []
    this.allVideos = []
    this.completedVideos = new Set()
    this.currentView = "playlists"
    this.currentPlaylistData = null

    // Inicializar
    this.init()
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.loadCompletedVideos()
    this.extractPlaylistsData()
    this.generateVideosView()
    this.updateProgressStats()
    this.bindEvents()
    this.applyFilters()

    console.log("Centro de Mejora inicializado correctamente")
  }

  /**
   * Extrae datos de las playlists del HTML
   */
  extractPlaylistsData() {
    const playlistCards = document.querySelectorAll(".playlist-card")
    this.allPlaylists = []
    this.allVideos = []

    playlistCards.forEach((card, playlistIndex) => {
      const playlistData = {
        element: card,
        title: card.querySelector("h3").textContent,
        author: card.querySelector(".playlist-author").textContent,
        description: card.querySelector(".playlist-description").textContent,
        category: card.dataset.category,
        level: card.dataset.level,
        thumbnail: card.querySelector(".playlist-thumbnail img").src,
        videos: [],
      }

      // Extraer videos de la playlist
      const videoItems = card.querySelectorAll(".video-item")
      videoItems.forEach((videoItem, videoIndex) => {
        const youtubeUrl = videoItem.dataset.youtubeUrl
        const videoId = this.extractVideoId(youtubeUrl)

        const videoData = {
          id: `${playlistIndex}-${videoIndex}`,
          title: videoItem.querySelector("h4").textContent,
          description: videoItem.querySelector("p").textContent,
          youtubeUrl: youtubeUrl,
          videoId: videoId,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          playlist: playlistData.title,
          author: playlistData.author,
          category: playlistData.category,
          level: playlistData.level,
          playlistIndex: playlistIndex,
          videoIndex: videoIndex,
        }

        playlistData.videos.push(videoData)
        this.allVideos.push(videoData)
      })

      // Actualizar contador de videos en la playlist
      const videoCount = card.querySelector(".video-count")
      if (videoCount) {
        videoCount.textContent = `${playlistData.videos.length} videos`
      }

      this.allPlaylists.push(playlistData)
    })

    console.log(`Extraídas ${this.allPlaylists.length} playlists con ${this.allVideos.length} videos totales`)
  }

  /**
   * Extrae el ID del video de una URL de YouTube
   * @param {string} url - URL de YouTube
   * @returns {string} - ID del video
   */
  extractVideoId(url) {
    if (!url) return "dQw4w9WgXcQ" // Video por defecto

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? match[2] : "dQw4w9WgXcQ"
  }

  /**
   * Genera la vista de videos individuales
   */
  generateVideosView() {
    this.videosGrid.innerHTML = ""

    this.allVideos.forEach((video) => {
      const videoCard = this.createVideoCard(video)
      this.videosGrid.appendChild(videoCard)
    })
  }

  /**
   * Crea una tarjeta de video individual
   * @param {Object} videoData - Datos del video
   * @returns {HTMLElement} - Elemento de la tarjeta
   */
  createVideoCard(videoData) {
    const card = document.createElement("div")
    card.className = "video-card"
    card.dataset.category = videoData.category
    card.dataset.level = videoData.level
    card.dataset.videoId = videoData.id

    // Marcar como completado si está en la lista
    if (this.completedVideos.has(videoData.id)) {
      card.classList.add("completed")
    }

    card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${videoData.thumbnail}" alt="${videoData.title}" loading="lazy">
                <div class="video-duration">10:30</div>
            </div>
            <div class="video-info">
                <h4>${videoData.title}</h4>
                <p>${videoData.description}</p>
                <div class="video-meta">
                    <span class="video-author">${videoData.author}</span>
                    <span class="video-playlist">${videoData.playlist}</span>
                </div>
            </div>
        `

    // Event listener para abrir el modal
    card.addEventListener("click", () => {
      this.openVideoModal(videoData)
    })

    return card
  }

  /**
   * Vincula eventos a los elementos
   */
  bindEvents() {
    // Búsqueda en tiempo real
    this.searchInput.addEventListener("input", () => {
      this.debounce(this.applyFilters.bind(this), 300)()
    })

    // Filtros
    this.categoryFilter.addEventListener("change", () => this.applyFilters())
    this.levelFilter.addEventListener("change", () => this.applyFilters())

    // Cambio de vista
    this.viewModeSelect.addEventListener("change", () => this.switchView())

    // Modal
    this.modalClose.addEventListener("click", () => this.closeVideoModal())
    this.modalBackdrop.addEventListener("click", () => this.closeVideoModal())

    // Botones de progreso
    this.markCompletedBtn.addEventListener("click", () => this.markVideoCompleted())
    this.markIncompleteBtn.addEventListener("click", () => this.markVideoIncomplete())

    // Cerrar modal con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.videoModal.classList.contains("active")) {
        this.closeVideoModal()
      }
    })

    // Click en playlists
    document.querySelectorAll(".playlist-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".playlist-progress")) {
          const playlistIndex = Array.from(this.playlistsGrid.children).indexOf(card)
          const playlist = this.allPlaylists[playlistIndex]
          this.openPlaylistModal(playlist)
        }
      })
    })
  }

  /**
   * Aplica filtros a las playlists y videos
   */
  applyFilters() {
    const searchTerm = this.searchInput.value.toLowerCase()
    const categoryFilter = this.categoryFilter.value
    const levelFilter = this.levelFilter.value

    if (this.currentView === "playlists") {
      this.filterPlaylists(searchTerm, categoryFilter, levelFilter)
    } else {
      this.filterVideos(searchTerm, categoryFilter, levelFilter)
    }
  }

  /**
   * Filtra las playlists
   */
  filterPlaylists(searchTerm, categoryFilter, levelFilter) {
    const playlistCards = document.querySelectorAll(".playlist-card")
    let visibleCount = 0

    playlistCards.forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase()
      const description = card.querySelector(".playlist-description").textContent.toLowerCase()
      const author = card.querySelector(".playlist-author").textContent.toLowerCase()
      const category = card.dataset.category
      const level = card.dataset.level

      const matchesSearch =
        !searchTerm || title.includes(searchTerm) || description.includes(searchTerm) || author.includes(searchTerm)

      const matchesCategory = categoryFilter === "all" || category === categoryFilter
      const matchesLevel = levelFilter === "all" || level === levelFilter

      if (matchesSearch && matchesCategory && matchesLevel) {
        card.classList.remove("hidden")
        visibleCount++
      } else {
        card.classList.add("hidden")
      }
    })

    this.showNoResults(visibleCount === 0, "playlists")
  }

  /**
   * Filtra los videos
   */
  filterVideos(searchTerm, categoryFilter, levelFilter) {
    const videoCards = document.querySelectorAll(".video-card")
    let visibleCount = 0

    videoCards.forEach((card) => {
      const title = card.querySelector("h4").textContent.toLowerCase()
      const description = card.querySelector("p").textContent.toLowerCase()
      const author = card.querySelector(".video-author").textContent.toLowerCase()
      const playlist = card.querySelector(".video-playlist").textContent.toLowerCase()
      const category = card.dataset.category
      const level = card.dataset.level

      const matchesSearch =
        !searchTerm ||
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        author.includes(searchTerm) ||
        playlist.includes(searchTerm)

      const matchesCategory = categoryFilter === "all" || category === categoryFilter
      const matchesLevel = levelFilter === "all" || level === levelFilter

      if (matchesSearch && matchesCategory && matchesLevel) {
        card.classList.remove("hidden")
        visibleCount++
      } else {
        card.classList.add("hidden")
      }
    })

    this.showNoResults(visibleCount === 0, "videos")
  }

  /**
   * Muestra mensaje cuando no hay resultados
   */
  showNoResults(show, viewType) {
    const container = viewType === "playlists" ? this.playlistsGrid : this.videosGrid
    let noResultsElement = container.querySelector(".no-results")

    if (show && !noResultsElement) {
      noResultsElement = document.createElement("div")
      noResultsElement.className = "no-results"
      noResultsElement.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No se encontraron resultados</h3>
                <p>Intenta ajustar los filtros o términos de búsqueda</p>
            `
      container.appendChild(noResultsElement)
    } else if (!show && noResultsElement) {
      noResultsElement.remove()
    }
  }

  /**
   * Cambia entre vista de playlists y videos
   */
  switchView() {
    const newView = this.viewModeSelect.value

    if (newView === this.currentView) return

    this.currentView = newView

    if (newView === "playlists") {
      this.playlistsView.classList.add("active")
      this.videosView.classList.remove("active")
    } else {
      this.playlistsView.classList.remove("active")
      this.videosView.classList.add("active")
    }

    this.applyFilters()
  }

  /**
   * Abre el modal de playlist (muestra el primer video)
   */
  openVideoModal(videoData) {
    this.currentVideoData = videoData

    // Actualizar contenido del modal
    this.modalTitle.textContent = videoData.title
    this.modalDescription.textContent = videoData.description
    this.modalAuthor.textContent = videoData.author
    this.modalPlaylist.textContent = `Curso: ${videoData.playlist}`

    // Cargar video de YouTube
    const embedUrl = `https://www.youtube.com/embed/${videoData.videoId}?autoplay=1&rel=0`
    this.youtubeFrame.src = embedUrl

    // Actualizar botones según el estado
    this.updateModalButtons()

    // Mostrar modal
    this.videoModal.classList.add("active")
    document.body.style.overflow = "hidden"

    // Focus para accesibilidad
    this.modalClose.focus()
  }

  /**
   * Abre el modal de playlist completa
   * @param {Object} playlistData - Datos de la playlist
   */
  openPlaylistModal(playlistData) {
    this.currentPlaylistData = playlistData

    // Actualizar contenido del modal
    this.modalTitle.textContent = playlistData.title
    this.modalDescription.textContent = playlistData.description
    this.modalAuthor.textContent = playlistData.author
    this.modalPlaylist.textContent = `Curso: ${playlistData.title}`

    // Crear lista de videos de la playlist
    this.createPlaylistView(playlistData)

    // Mostrar modal
    this.videoModal.classList.add("active")
    document.body.style.overflow = "hidden"

    // Focus para accesibilidad
    this.modalClose.focus()
  }

  /**
   * Crea la vista de playlist completa en el modal
   */
  createPlaylistView(playlistData) {
    const modalBody = document.querySelector(".modal-body")

    modalBody.innerHTML = `
      <div class="playlist-view">
        <div class="playlist-header">
          <h2>${playlistData.title}</h2>
          <p class="playlist-meta">${playlistData.videos.length} videos • ${playlistData.author}</p>
          <p class="playlist-description">${playlistData.description}</p>
        </div>
        <div class="playlist-videos-list">
          ${playlistData.videos
            .map(
              (video, index) => `
            <div class="playlist-video-item ${this.completedVideos.has(video.id) ? "completed" : ""}" 
                 data-video-id="${video.id}">
              <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="play-overlay">
                  <i class="fas fa-play"></i>
                </div>
                ${this.completedVideos.has(video.id) ? '<div class="completed-badge"><i class="fas fa-check"></i></div>' : ""}
              </div>
              <div class="video-details">
                <h4>${video.title}</h4>
                <p>${video.description}</p>
                <div class="video-actions">
                  <button class="btn-play-video" data-video-url="${video.youtubeUrl}">
                    <i class="fas fa-play"></i> Reproducir
                  </button>
                  <button class="btn-toggle-completed ${this.completedVideos.has(video.id) ? "completed" : ""}" 
                          data-video-id="${video.id}">
                    <i class="fas ${this.completedVideos.has(video.id) ? "fa-check-circle" : "fa-circle"}"></i>
                    ${this.completedVideos.has(video.id) ? "Completado" : "Marcar completado"}
                  </button>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `

    // Añadir event listeners para los videos
    modalBody.querySelectorAll(".btn-play-video").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const videoUrl = e.target.dataset.videoUrl
        const videoId = this.extractVideoId(videoUrl)
        this.playVideoInModal(videoId)
      })
    })

    modalBody.querySelectorAll(".btn-toggle-completed").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const videoId = e.target.dataset.videoId
        this.toggleVideoCompleted(videoId)
      })
    })
  }

  /**
   * Reproduce un video específico en el modal
   */
  playVideoInModal(videoId) {
    const modalBody = document.querySelector(".modal-body")
    modalBody.innerHTML = `
      <div class="video-player">
        <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
                frameborder="0" allowfullscreen></iframe>
        <button class="btn-back-to-playlist">
          <i class="fas fa-arrow-left"></i> Volver a la playlist
        </button>
      </div>
    `

    modalBody.querySelector(".btn-back-to-playlist").addEventListener("click", () => {
      this.createPlaylistView(this.currentPlaylistData)
    })
  }

  /**
   * Cierra el modal de video
   */
  closeVideoModal() {
    this.videoModal.classList.remove("active")
    document.body.style.overflow = ""

    // Detener video
    this.youtubeFrame.src = ""
    this.currentVideoData = null
  }

  /**
   * Actualiza los botones del modal según el estado del video
   */
  updateModalButtons() {
    if (!this.currentVideoData) return

    const isCompleted = this.completedVideos.has(this.currentVideoData.id)

    if (isCompleted) {
      this.markCompletedBtn.style.display = "none"
      this.markIncompleteBtn.style.display = "flex"
    } else {
      this.markCompletedBtn.style.display = "flex"
      this.markIncompleteBtn.style.display = "none"
    }
  }

  /**
   * Marca un video como completado
   */
  markVideoCompleted() {
    if (!this.currentVideoData) return

    this.completedVideos.add(this.currentVideoData.id)
    this.saveCompletedVideos()
    this.updateVideoCardState(this.currentVideoData.id, true)
    this.updatePlaylistProgress(this.currentVideoData.playlistIndex)
    this.updateProgressStats()
    this.updateModalButtons()

    // Cerrar modal después de marcar como completado
    setTimeout(() => this.closeVideoModal(), 1000)
  }

  /**
   * Marca un video como incompleto
   */
  markVideoIncomplete() {
    if (!this.currentVideoData) return

    this.completedVideos.delete(this.currentVideoData.id)
    this.saveCompletedVideos()
    this.updateVideoCardState(this.currentVideoData.id, false)
    this.updatePlaylistProgress(this.currentVideoData.playlistIndex)
    this.updateProgressStats()
    this.updateModalButtons()
  }

  /**
   * Actualiza el estado visual de una tarjeta de video
   */
  updateVideoCardState(videoId, completed) {
    // Actualizar en vista de videos
    const videoCard = document.querySelector(`.video-card[data-video-id="${videoId}"]`)
    if (videoCard) {
      if (completed) {
        videoCard.classList.add("completed")
      } else {
        videoCard.classList.remove("completed")
      }
    }
  }

  /**
   * Actualiza el progreso de una playlist
   */
  updatePlaylistProgress(playlistIndex) {
    const playlist = this.allPlaylists[playlistIndex]
    if (!playlist) return

    const completedCount = playlist.videos.filter((video) => this.completedVideos.has(video.id)).length

    const totalCount = playlist.videos.length
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    // Actualizar barra de progreso
    const progressBar = playlist.element.querySelector(".progress-fill")
    const progressText = playlist.element.querySelector(".progress-text")

    if (progressBar) {
      progressBar.style.width = `${percentage}%`
      progressBar.dataset.progress = percentage
    }

    if (progressText) {
      progressText.textContent = `${completedCount}/${totalCount} completados`
    }
  }

  /**
   * Actualiza las estadísticas generales de progreso
   */
  updateProgressStats() {
    const totalVideos = this.allVideos.length
    const completedCount = this.completedVideos.size
    const percentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0

    // Actualizar elementos del DOM
    this.completedVideosSpan.textContent = completedCount
    this.totalVideosSpan.textContent = totalVideos
    this.completionPercentageSpan.textContent = `${percentage}%`
    this.overallProgressBar.style.width = `${percentage}%`

    // Actualizar progreso de todas las playlists
    this.allPlaylists.forEach((playlist, index) => {
      this.updatePlaylistProgress(index)
    })
  }

  /**
   * Carga videos completados desde localStorage
   */
  loadCompletedVideos() {
    try {
      const saved = localStorage.getItem("nexo-artistico-completed-videos")
      if (saved) {
        this.completedVideos = new Set(JSON.parse(saved))
      }
    } catch (error) {
      console.warn("Error cargando videos completados:", error)
      this.completedVideos = new Set()
    }
  }

  /**
   * Guarda videos completados en localStorage
   */
  saveCompletedVideos() {
    try {
      localStorage.setItem("nexo-artistico-completed-videos", JSON.stringify([...this.completedVideos]))
    } catch (error) {
      console.warn("Error guardando videos completados:", error)
    }
  }

  /**
   * Función debounce para optimizar búsquedas
   */
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * Marca un video como completado/incompleto desde la vista de playlist
   */
  toggleVideoCompleted(videoId) {
    const isCompleted = this.completedVideos.has(videoId)

    if (isCompleted) {
      this.completedVideos.delete(videoId)
    } else {
      this.completedVideos.add(videoId)
    }

    this.saveCompletedVideos()
    this.updateVideoCardState(videoId, !isCompleted)

    // Actualizar la vista de la playlist
    this.createPlaylistView(this.currentPlaylistData)
    this.updateProgressStats()
  }
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  // Esperar un poco para asegurar que todos los elementos estén cargados
  setTimeout(() => {
    window.centroMejora = new CentroMejora()
  }, 100)
})

/**
 * ===================================
 * INSTRUCCIONES PARA AGREGAR CONTENIDO
 * ===================================
 *
 * PARA AGREGAR UN NUEVO CURSO/PLAYLIST:
 *
 * 1. Copia el bloque .playlist-card en el HTML
 * 2. Modifica estos atributos:
 *    - data-category: "anatomia", "arte-digital", "perspectiva", etc.
 *    - data-level: "principiante", "intermedio", "avanzado"
 *
 * 3. Actualiza el contenido:
 *    - Título del curso (h3)
 *    - Autor (.playlist-author)
 *    - Descripción (.playlist-description)
 *    - Imagen de miniatura (src de img)
 *
 * 4. Agrega videos en .playlist-videos:
 *    <div class="video-item" data-youtube-url="https://www.youtube.com/watch?v=VIDEO_ID">
 *        <h4>Título del Video</h4>
 *        <p>Descripción del video</p>
 *    </div>
 *
 * 5. El sistema automáticamente:
 *    - Extraerá el ID del video de YouTube
 *    - Generará las miniaturas
 *    - Actualizará el contador de videos
 *    - Aplicará los filtros correspondientes
 *
 * CATEGORÍAS DISPONIBLES:
 * - fundamentos
 * - anatomia
 * - arte-digital
 * - perspectiva
 * - color
 * - animacion
 * - tradicional
 * - composicion
 *
 * NIVELES DISPONIBLES:
 * - principiante
 * - intermedio
 * - avanzado
 *
 * ¡El sistema es completamente automático una vez agregado el HTML!
 */
