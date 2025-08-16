/**
 * ===================================
 * GENERADOR DE CÓDIGO - JAVASCRIPT
 * ===================================
 *
 * Este archivo maneja toda la funcionalidad del generador:
 * - Extracción de información de URLs de YouTube y Pinterest
 * - Generación de código HTML para cada tipo de contenido
 * - Vista previa en tiempo real
 * - Copia al portapapeles
 * - Validación de formularios
 */

class GeneradorCodigo {
  constructor() {
    // Elementos del DOM con verificación de existencia
    this.tabButtons = document.querySelectorAll(".tab-btn")
    this.tabContents = document.querySelectorAll(".tab-content")
    this.loadingModal = document.getElementById("loading-modal")
    this.successToast = document.getElementById("success-toast")
    this.errorToast = document.getElementById("error-toast")

    // Verificar elementos críticos
    if (!this.loadingModal) {
      // console.warn("Elemento loading-modal no encontrado")
    }
    if (!this.successToast) {
      // console.warn("Elemento success-toast no encontrado")
    }
    if (!this.errorToast) {
      // console.warn("Elemento error-toast no encontrado")
    }

    // Generadores específicos
    this.playlistGenerator = new PlaylistGenerator(this)
    this.videoGenerator = new VideoGenerator(this)
    this.pinterestGenerator = new PinterestGenerator(this)
    this.libroGenerator = new LibroGenerator(this)
    this.softwareGenerator = new SoftwareGenerator(this) // Added software generator
    this.miembroGenerator = new MiembroGenerator(this)
    this.artworkGenerator = new ArtworkGenerator(this)
    this.supportGenerator = new SupportGenerator(this)
    this.featuredGenerator = new FeaturedGenerator(this)
    this.resourceGenerator = new ResourceGenerator(this)

    // Inicializar
    this.init()
  }

  init() {
    this.bindEvents()
    // console.log("Generador de Código inicializado correctamente")
  }

  bindEvents() {
    // Navegación entre tabs
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabId = button.getAttribute("data-tab")
        this.switchTab(tabId)
      })
    })

    // Botones de copia
    document.querySelectorAll(".btn-copy").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-target")
        this.copyToClipboard(targetId)
      })
    })

    // Cerrar modal de carga al hacer clic fuera
    if (this.loadingModal) {
      this.loadingModal.addEventListener("click", (e) => {
        if (e.target === this.loadingModal) {
          this.hideLoading()
        }
      })
    }

    if (this.successToast) {
      this.successToast.addEventListener("click", () => {
        this.hideToast("success")
      })
    }

    if (this.errorToast) {
      this.errorToast.addEventListener("click", () => {
        this.hideToast("error")
      })
    }
  }

  switchTab(tabId) {
    // Remover clase active de todos los botones y contenidos
    this.tabButtons.forEach((button) => {
      if (button) button.classList.remove("active")
    })
    this.tabContents.forEach((content) => {
      if (content) content.classList.remove("active")
    })

    // Agregar clase active al botón y contenido seleccionado
    const activeButton = document.querySelector(`[data-tab="${tabId}"]`)
    const activeContent = document.getElementById(tabId)

    if (activeButton) activeButton.classList.add("active")
    if (activeContent) activeContent.classList.add("active")
  }

  showLoading(message = "Procesando...") {
    if (this.loadingModal) {
      const messageElement = this.loadingModal.querySelector("h3")
      if (messageElement) messageElement.textContent = message
      this.loadingModal.style.display = "flex"
      this.loadingModal.classList.add("active")
    }
  }

  hideLoading() {
    if (this.loadingModal) {
      this.loadingModal.classList.remove("active")
      setTimeout(() => {
        if (this.loadingModal && !this.loadingModal.classList.contains("active")) {
          this.loadingModal.style.display = "none"
        }
      }, 300)
    }
  }

  showToast(type, message) {
    let toast
    if (type === "success" && this.successToast) {
      toast = this.successToast
    } else if (type === "error" && this.errorToast) {
      toast = this.errorToast
    }

    if (!toast) {
      // console.warn(`Toast de tipo ${type} no encontrado, mostrando en consola:`, message)
      // if (type === "error") {
      //   console.error(message)
      // } else {
      //   console.log(message)
      // }
      return
    }

    const messageElement = toast.querySelector("span")
    if (messageElement) messageElement.textContent = message

    toast.classList.add("active")

    if (toast.hideTimeout) {
      clearTimeout(toast.hideTimeout)
    }

    toast.hideTimeout = setTimeout(() => {
      toast.classList.remove("active")
    }, 3000)
  }

  hideToast(type) {
    let toast
    if (type === "success" && this.successToast) {
      toast = this.successToast
    } else if (type === "error" && this.errorToast) {
      toast = this.errorToast
    }

    if (toast) {
      toast.classList.remove("active")
      if (toast.hideTimeout) {
        clearTimeout(toast.hideTimeout)
        toast.hideTimeout = null
      }
    }
  }

  async copyToClipboard(targetId) {
    const element = document.getElementById(targetId)
    if (!element) {
      this.showToast("error", "Elemento no encontrado para copiar")
      return
    }

    try {
      if (!navigator.clipboard) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement("textarea")
        textArea.value = element.textContent
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        this.showToast("success", "Código copiado al portapapeles")
      } else {
        await navigator.clipboard.writeText(element.textContent)
        this.showToast("success", "Código copiado al portapapeles")
      }
    } catch (error) {
      // console.error("Error al copiar:", error)
      this.showToast("error", "Error al copiar el código")
    }
  }

  extractYouTubeVideoId(url) {
    if (!url || typeof url !== "string") {
      return null
    }

    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  async getVideoInfo(videoId) {
    if (!videoId) {
      return null
    }

    try {
      // Intentar usar oEmbed primero
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        return {
          title: data.title || `Video ${videoId}`,
          author_name: data.author_name || "Canal de YouTube",
          thumbnail_url: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        }
      }
    } catch (error) {
      // console.warn(`Error obteniendo info del video ${videoId} via oEmbed:`, error)
    }

    // Fallback con información básica
    return {
      title: `Video ${videoId}`,
      author_name: "Canal de YouTube",
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    }
  }

  // Utilidad para validar URL
  isValidUrl(string) {
    if (!string || typeof string !== "string") {
      return false
    }

    try {
      const url = new URL(string.trim())
      return url.protocol === "http:" || url.protocol === "https:"
    } catch (_) {
      return false
    }
  }

  // Utilidad para limpiar texto
  sanitizeText(text) {
    if (!text || typeof text !== "string") {
      return ""
    }
    return text.replace(/[<>]/g, "").trim()
  }

  // Función para obtener información de video usando oEmbed
  async getVideoInfoOld(videoId) {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      )
      if (!response.ok) throw new Error("Video no encontrado")
      return await response.json()
    } catch (error) {
      // console.warn(`Error obteniendo info del video ${videoId}:`, error)
      return null
    }
  }

  // Función para obtener duración del video desde la página
  async getVideoDuration(videoId) {
    try {
      // Intentar obtener la duración desde la página de YouTube
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        mode: "no-cors",
      })
      // Como no podemos leer la respuesta por CORS, usaremos un método alternativo
      // Por ahora retornamos null y manejaremos esto en el código que llama
      return null
    } catch (error) {
      return null
    }
  }

  // Función para parsear duración ISO 8601 a formato MM:SS
  parseISO8601Duration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return "0:00"

    const hours = Number.parseInt(match[1] || 0)
    const minutes = Number.parseInt(match[2] || 0)
    const seconds = Number.parseInt(match[3] || 0)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
  }
}

/**
 * ===================================
 * GENERADOR DE PLAYLIST
 * ===================================
 */
class PlaylistGenerator {
  constructor(generador) {
    this.generador = generador
    this.videos = [] // Array to store playlist videos

    this.form = {
      title: document.getElementById("playlist-title"),
      author: document.getElementById("playlist-author"),
      thumbnail: document.getElementById("playlist-thumbnail"),
      category: document.getElementById("playlist-category"),
      level: document.getElementById("playlist-level"),
      description: document.getElementById("playlist-description"),
    }

    // Video input elements
    this.videoInputs = {
      url: document.getElementById("video-url-input"),
      title: document.getElementById("video-title-input"),
      description: document.getElementById("video-description-input"),
    }

    // UI elements
    this.addVideoBtn = document.getElementById("add-video-btn")
    this.videosList = document.getElementById("videos-list")
    this.generateBtn = document.getElementById("generate-playlist")
    this.previewSection = document.getElementById("playlist-preview")
    this.previewContainer = document.getElementById("playlist-preview-container")
    this.codeSection = document.getElementById("playlist-code")
    this.codeContent = document.getElementById("playlist-code-content")

    // Verificar elementos críticos
    this.checkRequiredElements()
    this.bindEvents()
  }

  checkRequiredElements() {
    const requiredElements = [
      { name: "addVideoBtn", element: this.addVideoBtn },
      { name: "generateBtn", element: this.generateBtn },
      { name: "videosList", element: this.videosList },
    ]

    requiredElements.forEach(({ name, element }) => {
      if (!element) {
        // console.warn(`Elemento ${name} no encontrado en PlaylistGenerator`)
      }
    })
  }

  bindEvents() {
    if (this.addVideoBtn) {
      this.addVideoBtn.addEventListener("click", () => {
        this.addVideo()
      })
    }

    if (this.generateBtn) {
      this.generateBtn.addEventListener("click", () => {
        this.generatePlaylist()
      })
    }

    // Enter key support for video inputs
    Object.values(this.videoInputs).forEach((input) => {
      if (input) {
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            this.addVideo()
          }
        })
      }
    })
  }

  addVideo() {
    const url = this.videoInputs.url?.value.trim()
    const title = this.videoInputs.title?.value.trim()
    const description = this.videoInputs.description?.value.trim()

    if (!url) {
      this.generador.showToast("error", "La URL del video es requerida")
      return
    }

    const videoId = this.generador.extractYouTubeVideoId(url)
    if (!videoId) {
      this.generador.showToast("error", "URL de YouTube no válida")
      return
    }

    // Verificar si el video ya existe
    if (this.videos.some((video) => video.id === videoId)) {
      this.generador.showToast("error", "Este video ya está en la playlist")
      return
    }

    const video = {
      id: videoId,
      url: url,
      title: title || `Video ${this.videos.length + 1}`,
      description: description || "",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    }

    this.videos.push(video)
    this.updateVideosList()
    this.clearVideoInputs()
    this.generador.showToast("success", "Video agregado a la playlist")
  }

  removeVideo(index) {
    this.videos.splice(index, 1)
    this.updateVideosList()
    this.generador.showToast("success", "Video eliminado de la playlist")
  }

  updateVideosList() {
    if (!this.videosList) return

    if (this.videos.length === 0) {
      this.videosList.innerHTML =
        '<p class="no-videos-message">No hay videos agregados. Agrega el primer video usando el formulario de arriba.</p>'
      return
    }

    const videosHTML = this.videos
      .map(
        (video, index) => `
      <div class="video-item" data-index="${index}">
        <div class="video-thumbnail">
          <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://via.placeholder.com/120x68/333/fff?text=Video'">
          <div class="video-number">${index + 1}</div>
        </div>
        <div class="video-info">
          <h4>${video.title}</h4>
          <p>${video.description || "Sin descripción"}</p>
          <small>${video.url}</small>
        </div>
        <button class="btn-remove-video" onclick="generadorCodigo.playlistGenerator.removeVideo(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `,
      )
      .join("")

    this.videosList.innerHTML = `
      <div class="videos-header">
        <h4><i class="fas fa-list-ol"></i> Videos en la Playlist (${this.videos.length})</h4>
      </div>
      ${videosHTML}
    `
  }

  clearVideoInputs() {
    Object.values(this.videoInputs).forEach((input) => {
      if (input) input.value = ""
    })
  }

  validateForm() {
    let isValid = true

    if (!this.form.title?.value?.trim()) {
      this.generador.showToast("error", "El título de la playlist es requerido")
      isValid = false
    }

    if (this.videos.length === 0) {
      this.generador.showToast("error", "Agrega al menos un video a la playlist")
      isValid = false
    }

    return isValid
  }

  generatePlaylist() {
    if (!this.validateForm()) return

    this.generador.showLoading("Generando código de playlist...")

    try {
      const playlistData = {
        title: this.form.title?.value.trim() || "",
        author: this.form.author?.value.trim() || "",
        thumbnail: this.form.thumbnail?.value.trim() || "",
        category: this.form.category?.value || "fundamentos",
        level: this.form.level?.value || "principiante",
        description: this.form.description?.value.trim() || "",
        videos: this.videos,
      }

      this.showPreview(playlistData)
      this.generateCode(playlistData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de playlist generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de playlist")
      // console.error("Error:", error)
    }
  }

  showPreview(data) {
    if (!this.previewContainer) return

    const previewHTML = `
      <div class="playlist-preview-card">
        <div class="playlist-header">
          ${data.thumbnail ? `<img src="${data.thumbnail}" alt="${data.title}" class="playlist-thumbnail">` : ""}
          <div class="playlist-info">
            <h3>${data.title}</h3>
            <p class="playlist-author">Por: ${data.author}</p>
            <p class="playlist-meta">${data.category} • ${data.level} • ${data.videos.length} videos</p>
            <p class="playlist-description">${data.description}</p>
          </div>
        </div>
        <div class="playlist-videos-preview">
          ${data.videos
            .slice(0, 3)
            .map(
              (video, index) => `
            <div class="video-preview-item">
              <img src="${video.thumbnail}" alt="${video.title}">
              <div class="video-preview-info">
                <h5>${video.title}</h5>
                <small>${video.description}</small>
              </div>
            </div>
          `,
            )
            .join("")}
          ${data.videos.length > 3 ? `<p class="more-videos">Y ${data.videos.length - 3} videos más...</p>` : ""}
        </div>
      </div>
    `

    this.previewContainer.innerHTML = previewHTML
    if (this.previewSection) {
      this.previewSection.style.display = "block"
    }
  }

  generateCode(data) {
    const videosCode = data.videos
      .map(
        (video) => `
      <div class="video-item" data-video-id="${video.id}">
        <div class="video-thumbnail">
          <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
          <div class="play-overlay">
            <i class="fas fa-play"></i>
          </div>
        </div>
        <div class="video-info">
          <h4>${video.title}</h4>
          <p>${video.description}</p>
        </div>
      </div>`,
      )
      .join("")

    const code = `
<!-- Playlist: ${data.title} -->
<div class="playlist-card" data-category="${data.category}" data-level="${data.level}">
  <div class="playlist-header">
    ${data.thumbnail ? `<img src="${data.thumbnail}" alt="${data.title}" class="playlist-thumbnail">` : ""}
    <div class="playlist-info">
      <h3>${data.title}</h3>
      <p class="playlist-author">Por: ${data.author}</p>
      <div class="playlist-meta">
        <span class="category">${data.category}</span>
        <span class="level">${data.level}</span>
        <span class="video-count">${data.videos.length} videos</span>
      </div>
      <p class="playlist-description">${data.description}</p>
    </div>
  </div>
  <div class="playlist-videos">
    ${videosCode}
  </div>
</div>`

    if (this.codeContent) {
      this.codeContent.textContent = code
    }
    if (this.codeSection) {
      this.codeSection.style.display = "block"
    }
  }
}

/**
 * ===================================
 * GENERADOR DE VIDEO
 * ===================================
 */
class VideoGenerator {
  constructor(generador) {
    this.generador = generador

    this.form = {
      url: document.getElementById("video-url"),
      customTitle: document.getElementById("video-custom-title"),
      category: document.getElementById("video-category"),
      author: document.getElementById("video-author"),
      description: document.getElementById("video-description"),
      tags: document.getElementById("video-tags"),
    }

    this.generateBtn = document.getElementById("generate-video")
    this.previewSection = document.getElementById("video-preview")
    this.previewContainer = document.getElementById("video-preview-container")
    this.codeSection = document.getElementById("video-code")
    this.codeContent = document.getElementById("video-code-content")

    // Verificar elementos críticos
    if (!this.generateBtn) {
      // console.warn("Botón generate-video no encontrado")
    }

    this.bindEvents()
  }

  bindEvents() {
    if (this.generateBtn) {
      this.generateBtn.addEventListener("click", () => {
        this.generateVideo()
      })
    }

    if (this.form.url) {
      this.form.url.addEventListener("blur", () => {
        this.autoFillVideoData()
      })
    }
  }

  async autoFillVideoData() {
    const url = this.form.url?.value?.trim()
    if (!url) return

    try {
      const videoId = this.generador.extractYouTubeVideoId(url)
      if (videoId) {
        const videoInfo = await this.generador.getVideoInfo(videoId)
        if (videoInfo && this.form.author && !this.form.author.value) {
          this.form.author.value = videoInfo.author_name
        }
      }
    } catch (error) {
      // console.warn("No se pudo auto-completar los datos del video:", error)
    }
  }

  validateForm() {
    if (!this.form.url?.value?.trim()) {
      this.generador.showToast("error", "La URL del video es requerida")
      return false
    }

    const videoId = this.generador.extractYouTubeVideoId(this.form.url.value)
    if (!videoId) {
      this.generador.showToast("error", "URL de YouTube no válida")
      return false
    }

    return true
  }

  async generateVideo() {
    if (!this.validateForm()) return

    this.generador.showLoading("Obteniendo información del video...")

    try {
      const videoData = await this.extractVideoData()
      this.showPreview(videoData)
      this.generateCode(videoData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de video generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de video")
      // console.error("Error:", error)
    }
  }

  async extractVideoData() {
    const url = this.form.url?.value.trim()
    const videoId = this.generador.extractYouTubeVideoId(url)

    return {
      id: videoId,
      url: url,
      title: this.form.customTitle?.value.trim() || `Video ${videoId}`,
      author: this.form.author?.value.trim() || "Canal de YouTube",
      category: this.form.category?.value || "tutorial",
      description: this.form.description?.value.trim() || "",
      tags: this.form.tags?.value.trim() || "",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    }
  }

  showPreview(data) {
    if (!this.previewContainer) return

    const previewHTML = `
      <div class="video-preview-card">
        <div class="video-thumbnail">
          <img src="${data.thumbnail}" alt="${data.title}">
          <div class="play-overlay">
            <i class="fas fa-play"></i>
          </div>
        </div>
        <div class="video-info">
          <h3>${data.title}</h3>
          <p class="video-author">Por: ${data.author}</p>
          <p class="video-category">Categoría: ${data.category}</p>
          <p class="video-description">${data.description}</p>
          ${
            data.tags
              ? `<div class="video-tags">${data.tags
                  .split(",")
                  .map((tag) => `<span class="tag">${tag.trim()}</span>`)
                  .join("")}</div>`
              : ""
          }
        </div>
      </div>
    `

    this.previewContainer.innerHTML = previewHTML
    if (this.previewSection) {
      this.previewSection.style.display = "block"
    }
  }

  generateCode(data) {
    const code = `
<!-- Video: ${data.title} -->
<div class="video-item" data-category="${data.category}" data-video-id="${data.id}">
  <div class="video-thumbnail">
    <img src="${data.thumbnail}" alt="${data.title}" loading="lazy">
    <div class="play-overlay">
      <i class="fas fa-play"></i>
    </div>
  </div>
  <div class="video-info">
    <h4>${data.title}</h4>
    <p class="video-author">Por: ${data.author}</p>
    <p class="video-description">${data.description}</p>
    ${
      data.tags
        ? `<div class="video-tags">${data.tags
            .split(",")
            .map((tag) => `<span class="tag">${tag.trim()}</span>`)
            .join("")}</div>`
        : ""
    }
  </div>
</div>`

    if (this.codeContent) {
      this.codeContent.textContent = code
    }
    if (this.codeSection) {
      this.codeSection.style.display = "block"
    }
  }
}

/**
 * ===================================
 * GENERADOR DE PINTEREST
 * ===================================
 */
class PinterestGenerator {
  constructor(generador) {
    this.generador = generador

    this.form = {
      url: document.getElementById("pinterest-url"),
      title: document.getElementById("pinterest-title"),
      description: document.getElementById("pinterest-description"),
      images: document.getElementById("pinterest-images"),
    }

    this.generateBtn = document.getElementById("generate-pinterest")
    this.previewSection = document.getElementById("pinterest-preview")
    this.previewContainer = document.getElementById("pinterest-preview-container")
    this.codeSection = document.getElementById("pinterest-code")
    this.codeContent = document.getElementById("pinterest-code-content")

    this.bindEvents()
  }

  bindEvents() {
    if (this.generateBtn) {
      this.generateBtn.addEventListener("click", () => {
        this.generatePinterest()
      })
    }
  }

  async generatePinterest() {
    if (!this.validateForm()) return

    this.generador.showLoading("Generando código de Pinterest...")

    try {
      const pinterestData = this.extractPinterestData()
      this.showPreview(pinterestData)
      this.generateCode(pinterestData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de Pinterest generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de Pinterest")
      // console.error("Error:", error)
    }
  }

  validateForm() {
    let isValid = true

    if (!this.form.url?.value?.trim()) {
      this.showFieldError(this.form.url, "La URL es requerida")
      isValid = false
    } else if (!this.generador.isValidUrl(this.form.url.value.trim())) {
      this.showFieldError(this.form.url, "URL no válida")
      isValid = false
    } else {
      this.clearFieldError(this.form.url)
    }

    if (!this.form.title?.value?.trim()) {
      this.showFieldError(this.form.title, "El título es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.title)
    }

    if (!this.form.description?.value?.trim()) {
      this.showFieldError(this.form.description, "La descripción es requerida")
      isValid = false
    } else {
      this.clearFieldError(this.form.description)
    }

    const images =
      this.form.images?.value
        ?.trim()
        .split("\n")
        .filter((img) => img.trim()) || []
    if (images.length < 3) {
      this.showFieldError(this.form.images, "Se requieren al menos 3 URLs de imágenes")
      isValid = false
    } else {
      this.clearFieldError(this.form.images)
    }

    return isValid
  }

  showFieldError(field, message) {
    if (!field) {
      // console.warn("Campo no encontrado para mostrar error:", message)
      return
    }

    const inputGroup = field.closest(".input-group")
    if (!inputGroup) {
      // console.warn("Input group no encontrado para el campo")
      return
    }

    inputGroup.classList.add("error")
    inputGroup.classList.remove("success")

    let errorElement = inputGroup.querySelector(".error-message")
    if (!errorElement) {
      errorElement = document.createElement("small")
      errorElement.className = "error-message"
      inputGroup.appendChild(errorElement)
    }
    errorElement.textContent = message
  }

  clearFieldError(field) {
    if (!field) return

    const inputGroup = field.closest(".input-group")
    if (!inputGroup) return

    inputGroup.classList.remove("error")
    inputGroup.classList.add("success")

    const errorElement = inputGroup.querySelector(".error-message")
    if (errorElement) {
      errorElement.remove()
    }
  }

  extractPinterestData() {
    const images = this.form.images.value
      .trim()
      .split("\n")
      .filter((img) => img.trim())

    return {
      url: this.form.url.value.trim(),
      title: this.form.title.value.trim(),
      pins: this.form.pins.value || "50",
      description: this.form.description.value.trim(),
      mainImage: images[0],
      overlayImage1: images[1] || images[0],
      overlayImage2: images[2] || images[0],
    }
  }

  showPreview(data) {
    this.previewContainer.innerHTML = `
      <div class="preview-pinterest-board">
        <div class="preview-board-preview">
          <div class="preview-board-images">
            <img src="${data.mainImage}" alt="${data.title}" class="preview-main-image">
            <img src="${data.overlayImage1}" alt="${data.title} mini 1" class="preview-overlay-image preview-overlay-1">
            <img src="${data.overlayImage2}" alt="${data.title} mini 2" class="preview-overlay-image preview-overlay-2">
          </div>
          <div class="preview-board-overlay">
            <a href="${data.url}" target="_blank" class="preview-view-board-btn">
              <i class="fab fa-pinterest"></i>
              Ver Tablero
            </a>
          </div>
        </div>
        <div class="preview-board-info">
          <h3>${data.title}</h3>
          <p>${data.description}</p>
          <div class="preview-board-stats">
            <span><i class="fas fa-thumbtack"></i> ${data.pins}+ pins</span>
          </div>
        </div>
      </div>
    `

    this.previewSection.style.display = "block"
  }

  generateCode(data) {
    const code = `<!-- Pinterest Board: ${data.title} -->
<div class="pinterest-board">
    <div class="board-preview">
        <div class="board-images">
            <img src="${data.mainImage}" alt="${data.title}" class="main-image">
            <img src="${data.overlayImage1}" alt="${data.title} mini 1" class="overlay-image overlay-1">
            <img src="${data.overlayImage2}" alt="${data.title} mini 2" class="overlay-image overlay-2">
        </div>
        <div class="board-overlay">
            <a href="${data.url}" target="_blank" class="view-board-btn">
                <i class="fab fa-pinterest"></i>
                Ver Tablero
            </a>
        </div>
    </div>
    <div class="board-info">
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <div class="board-stats">
            <span><i class="fas fa-thumbtack"></i> ${data.pins}+ pins</span>
        </div>
    </div>
</div>`

    this.codeContent.textContent = code
    this.codeSection.style.display = "block"

    if (window.Prism) {
      window.Prism.highlightElement(this.codeContent)
    }
  }
}

/**
 * ===================================
 * GENERADOR DE LIBRO
 * ===================================
 */
class LibroGenerator {
  constructor(generador) {
    this.generador = generador
    this.form = {
      title: document.getElementById("libro-title"),
      author: document.getElementById("libro-author"),
      category: document.getElementById("libro-category"),
      download: document.getElementById("libro-download"),
      cover: document.getElementById("libro-cover"),
      tags: document.getElementById("libro-tags"),
    }

    this.generateBtn = document.getElementById("generate-libro")
    this.previewSection = document.getElementById("libro-preview")
    this.previewContainer = document.getElementById("libro-preview-container")
    this.codeSection = document.getElementById("libro-code")
    this.codeContent = document.getElementById("libro-code-content")

    this.bindEvents()
  }

  bindEvents() {
    this.generateBtn.addEventListener("click", () => {
      this.generateLibro()
    })
  }

  async generateLibro() {
    if (!this.validateForm()) return

    this.generador.showLoading("Generando código de libro...")

    try {
      const libroData = this.extractLibroData()
      this.showPreview(libroData)
      this.generateCode(libroData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de libro generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de libro")
      // console.error("Error:", error)
    }
  }

  validateForm() {
    let isValid = true

    if (!this.form.title.value.trim()) {
      this.showFieldError(this.form.title, "El título es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.title)
    }

    if (!this.form.author.value.trim()) {
      this.showFieldError(this.form.author, "El autor es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.author)
    }

    if (!this.form.download.value.trim()) {
      this.showFieldError(this.form.download, "La URL de descarga es requerida")
      isValid = false
    } else if (!this.generador.isValidUrl(this.form.download.value.trim())) {
      this.showFieldError(this.form.download, "URL de descarga no válida")
      isValid = false
    } else {
      this.clearFieldError(this.form.download)
    }

    if (!this.form.cover.value.trim()) {
      this.showFieldError(this.form.cover, "La URL de la portada es requerida")
      isValid = false
    } else if (!this.generador.isValidUrl(this.form.cover.value.trim())) {
      this.showFieldError(this.form.cover, "URL de portada no válida")
      isValid = false
    } else {
      this.clearFieldError(this.form.cover)
    }

    return isValid
  }

  showFieldError(field, message) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.add("error")
    inputGroup.classList.remove("success")

    let errorElement = inputGroup.querySelector(".error-message")
    if (!errorElement) {
      errorElement = document.createElement("small")
      errorElement.className = "error-message"
      inputGroup.appendChild(errorElement)
    }
    errorElement.textContent = message
  }

  clearFieldError(field) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.remove("error")
    inputGroup.classList.add("success")

    const errorElement = inputGroup.querySelector(".error-message")
    if (errorElement) {
      errorElement.remove()
    }
  }

  extractLibroData() {
    return {
      title: this.form.title.value.trim(),
      author: this.form.author.value.trim(),
      category: this.form.category.value,
      downloadUrl: this.form.download.value.trim(),
      coverUrl: this.form.cover.value.trim(),
      tags: this.form.tags.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }
  }

  showPreview(data) {
    const tagsHtml = data.tags.map((tag) => `<span class="preview-tag">${tag}</span>`).join("")

    this.previewContainer.innerHTML = `
      <div class="preview-book-card">
        <div class="preview-book-cover">
          <img src="${data.coverUrl}" alt="${data.title}">
          <div class="preview-book-overlay">
            <div class="preview-book-actions">
              <a href="${data.downloadUrl}" target="_blank" class="preview-download-btn">
                <i class="fas fa-download"></i>
                Descargar
              </a>
            </div>
          </div>
        </div>
        <div class="preview-book-info">
          <h3>${data.title}</h3>
          <p class="preview-book-author">${data.author}</p>
          <div class="preview-book-tags">
            ${tagsHtml}
          </div>
        </div>
      </div>
    `

    this.previewSection.style.display = "block"
  }

  generateCode(data) {
    const tagsHtml = data.tags.map((tag) => `<span class="tag">${tag}</span>`).join("\n                ")

    const code = `<!-- Libro: ${data.title} -->
<div class="book-card" data-category="${data.category}">
    <div class="book-cover">
        <img src="${data.coverUrl}" alt="${data.title}">
        <div class="book-overlay">
            <div class="book-actions">
                <a href="${data.downloadUrl}" target="_blank" class="download-btn">
                    <i class="fas fa-download"></i>
                    Descargar
                </a>
            </div>
        </div>
    </div>
    <div class="book-info">
        <h3>${data.title}</h3>
        <p class="book-author">${data.author}</p>
        <div class="book-tags">
            ${tagsHtml}
        </div>
    </div>
</div>`

    this.codeContent.textContent = code
    this.codeSection.style.display = "block"

    if (window.Prism) {
      window.Prism.highlightElement(this.codeContent)
    }
  }
}

class SoftwareGenerator {
  constructor(generador) {
    this.generador = generador
    this.form = {
      name: document.getElementById("software-name"),
      version: document.getElementById("software-version"),
      developer: document.getElementById("software-developer"),
      category: document.getElementById("software-category"),
      price: document.getElementById("software-price"),
      description: document.getElementById("software-description"),
      features: document.getElementById("software-features"),
      downloadUrl: document.getElementById("software-download-url"),
      officialUrl: document.getElementById("software-official-url"),
      image: document.getElementById("software-image"),
    }

    this.generateBtn = document.getElementById("generate-software")
    this.previewSection = document.getElementById("software-preview")
    this.previewContainer = document.getElementById("software-preview-container")
    this.codeSection = document.getElementById("software-code")
    this.codeContent = document.getElementById("software-code-content")

    this.bindEvents()
  }

  bindEvents() {
    if (this.generateBtn) {
      this.generateBtn.addEventListener("click", () => {
        this.generateSoftware()
      })
    }
  }

  validateForm() {
    if (!this.form.name?.value.trim()) {
      this.generador.showToast("error", "El nombre del software es requerido")
      return false
    }
    return true
  }

  generateSoftware() {
    if (!this.validateForm()) return

    this.generador.showLoading("Generando código de software...")

    try {
      const softwareData = this.extractSoftwareData()
      this.showPreview(softwareData)
      this.generateCode(softwareData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de software generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de software")
      // console.error("Error:", error)
    }
  }

  extractSoftwareData() {
    return {
      name: this.form.name?.value.trim() || "",
      version: this.form.version?.value.trim() || "",
      developer: this.form.developer?.value.trim() || "",
      category: this.form.category?.value || "diseño",
      price: this.form.price?.value.trim() || "",
      description: this.form.description?.value.trim() || "",
      features: this.form.features?.value.trim() || "",
      downloadUrl: this.form.downloadUrl?.value.trim() || "",
      officialUrl: this.form.officialUrl?.value.trim() || "",
      image: this.form.image?.value.trim() || "",
    }
  }

  showPreview(data) {
    if (!this.previewContainer) return

    const previewHTML = `
      <div class="software-preview-card">
        ${data.image ? `<img src="${data.image}" alt="${data.name}" class="software-image">` : ""}
        <div class="software-info">
          <h3>${data.name} ${data.version ? `v${data.version}` : ""}</h3>
          <p class="software-developer">Por: ${data.developer}</p>
          <p class="software-category">Categoría: ${data.category}</p>
          ${data.price ? `<p class="software-price">Precio: ${data.price}</p>` : ""}
          <p class="software-description">${data.description}</p>
          ${data.features ? `<div class="software-features"><strong>Características:</strong><br>${data.features}</div>` : ""}
        </div>
      </div>
    `

    this.previewContainer.innerHTML = previewHTML
    if (this.previewSection) {
      this.previewSection.style.display = "block"
    }
  }

  generateCode(data) {
    const code = `
<!-- Software: ${data.name} -->
<div class="software-item" data-category="${data.category}">
  ${data.image ? `<img src="${data.image}" alt="${data.name}" class="software-image">` : ""}
  <div class="software-info">
    <h4>${data.name} ${data.version ? `<span class="version">v${data.version}</span>` : ""}</h4>
    <p class="software-developer">Por: ${data.developer}</p>
    ${data.price ? `<p class="software-price">${data.price}</p>` : ""}
    <p class="software-description">${data.description}</p>
    ${data.features ? `<div class="software-features">${data.features}</div>` : ""}
    <div class="software-links">
      ${data.officialUrl ? `<a href="${data.officialUrl}" target="_blank" class="btn-official">Sitio Oficial</a>` : ""}
      ${data.downloadUrl ? `<a href="${data.downloadUrl}" target="_blank" class="btn-download">Descargar</a>` : ""}
    </div>
  </div>
</div>`

    if (this.codeContent) {
      this.codeContent.textContent = code
    }
    if (this.codeSection) {
      this.codeSection.style.display = "block"
    }
  }
}

/**
 * ===================================
 * GENERADOR DE MIEMBRO
 * ===================================
 */
class MiembroGenerator {
  constructor(generador) {
    this.generador = generador
    this.form = {
      nombre: document.getElementById("miembro-nombre"),
      especialidad: document.getElementById("miembro-especialidad"),
      nivel: document.getElementById("miembro-nivel"),
      fecha: document.getElementById("miembro-fecha"),
      descripcion: document.getElementById("miembro-descripcion"),
      tags: document.getElementById("miembro-tags"),
    }

    this.generateBtn = document.getElementById("generate-miembro")
    this.previewSection = document.getElementById("miembro-preview")
    this.previewContainer = document.getElementById("miembro-preview-container")
    this.codeSection = document.getElementById("miembro-code")
    this.codeContent = document.getElementById("miembro-code-content")

    // Contenedor de redes sociales
    this.socialNetworksContainer = document.getElementById("social-networks-container")
    this.addSocialBtn = document.getElementById("add-social-network")

    // Contador para IDs únicos
    this.socialNetworkCounter = 0

    // Redes sociales disponibles
    this.availableSocialNetworks = {
      instagram: { name: "Instagram", icon: "fab fa-instagram", placeholder: "@usuario o URL completa" },
      twitter: { name: "Twitter/X", icon: "fab fa-twitter", placeholder: "@usuario o URL completa" },
      youtube: { name: "YouTube", icon: "fab fa-youtube", placeholder: "URL del canal" },
      tiktok: { name: "TikTok", icon: "fab fa-tiktok", placeholder: "@usuario o URL completa" },
      behance: { name: "Behance", icon: "fab fa-behance", placeholder: "URL del perfil" },
      dribbble: { name: "Dribbble", icon: "fab fa-dribbble", placeholder: "URL del perfil" },
      artstation: { name: "ArtStation", icon: "fas fa-palette", placeholder: "URL del perfil" },
      deviantart: { name: "DeviantArt", icon: "fab fa-deviantart", placeholder: "URL del perfil" },
      portfolio: { name: "Portfolio/Web", icon: "fas fa-globe", placeholder: "URL del portfolio" },
      linkedin: { name: "LinkedIn", icon: "fab fa-linkedin", placeholder: "URL del perfil" },
      facebook: { name: "Facebook", icon: "fab fa-facebook", placeholder: "URL del perfil" },
      twitch: { name: "Twitch", icon: "fab fa-twitch", placeholder: "URL del canal" },
      discord: { name: "Discord", icon: "fab fa-discord", placeholder: "Usuario#1234 o servidor" },
      github: { name: "GitHub", icon: "fab fa-github", placeholder: "URL del perfil" },
    }

    this.bindEvents()
  }

  bindEvents() {
    this.generateBtn.addEventListener("click", () => {
      this.generateMiembro()
    })

    // Auto-completar fecha actual
    if (!this.form.fecha.value) {
      const today = new Date().toISOString().split("T")[0]
      this.form.fecha.value = today
    }

    // Generar tags automáticos basados en especialidad
    this.form.especialidad.addEventListener("change", () => {
      this.autoFillTags()
    })

    // Añadir red social
    this.addSocialBtn.addEventListener("click", () => {
      this.addSocialNetworkField()
    })

    // Añadir primera red social por defecto
    this.addSocialNetworkField()
  }

  addSocialNetworkField() {
    const socialId = `social-${this.socialNetworkCounter++}`

    const socialItem = document.createElement("div")
    socialItem.className = "social-network-item"
    socialItem.setAttribute("data-social-id", socialId)

    const selectOptions = Object.entries(this.availableSocialNetworks)
      .map(([key, network]) => `<option value="${key}">${network.name}</option>`)
      .join("")

    socialItem.innerHTML = `
      <div class="input-group social-network-select">
        <select id="${socialId}-type">
          <option value="">Seleccionar red social</option>
          ${selectOptions}
        </select>
      </div>
      <div class="input-group social-network-url">
        <input type="text" id="${socialId}-url" placeholder="URL o usuario">
      </div>
      <button type="button" class="btn-remove-social" data-social-id="${socialId}">
        <i class="fas fa-trash"></i>
      </button>
    `

    this.socialNetworksContainer.appendChild(socialItem)

    // Eventos para este campo específico
    const selectElement = socialItem.querySelector(`#${socialId}-type`)
    const inputElement = socialItem.querySelector(`#${socialId}-url`)
    const removeBtn = socialItem.querySelector(".btn-remove-social")

    // Cambiar placeholder según la red social seleccionada
    selectElement.addEventListener("change", () => {
      const selectedNetwork = this.availableSocialNetworks[selectElement.value]
      if (selectedNetwork) {
        inputElement.placeholder = selectedNetwork.placeholder
      } else {
        inputElement.placeholder = "URL o usuario"
      }
    })

    // Remover campo
    removeBtn.addEventListener("click", () => {
      socialItem.remove()
    })
  }

  getSocialNetworksData() {
    const socialNetworks = []
    const socialItems = this.socialNetworksContainer.querySelectorAll(".social-network-item")

    socialItems.forEach((item) => {
      const socialId = item.getAttribute("data-social-id")
      const typeSelect = item.querySelector(`#${socialId}-type`)
      const urlInput = item.querySelector(`#${socialId}-url`)

      if (typeSelect.value && urlInput.value.trim()) {
        const networkData = this.availableSocialNetworks[typeSelect.value]
        socialNetworks.push({
          type: typeSelect.value,
          name: networkData.name,
          icon: networkData.icon,
          url: this.processSocialUrl(typeSelect.value, urlInput.value.trim()),
        })
      }
    })

    return socialNetworks
  }

  processSocialUrl(type, input) {
    const cleanInput = input.trim()

    switch (type) {
      case "instagram":
        if (cleanInput.startsWith("@")) {
          return `https://instagram.com/${cleanInput.substring(1)}`
        } else if (cleanInput.includes("instagram.com")) {
          return cleanInput
        } else {
          return `https://instagram.com/${cleanInput}`
        }

      case "twitter":
        if (cleanInput.startsWith("@")) {
          return `https://twitter.com/${cleanInput.substring(1)}`
        } else if (cleanInput.includes("twitter.com") || cleanInput.includes("x.com")) {
          return cleanInput
        } else {
          return `https://twitter.com/${cleanInput}`
        }

      case "tiktok":
        if (cleanInput.startsWith("@")) {
          return `https://tiktok.com/@${cleanInput.substring(1)}`
        } else if (cleanInput.includes("tiktok.com")) {
          return cleanInput
        } else {
          return `https://tiktok.com/@${cleanInput}`
        }

      case "youtube":
        if (cleanInput.includes("youtube.com")) {
          return cleanInput
        } else {
          return `https://youtube.com/c/${cleanInput}`
        }

      case "discord":
        // Para Discord, mantener el formato usuario#1234 o URL del servidor
        return cleanInput

      default:
        // Para otras redes, si no es una URL completa, asumir que es un nombre de usuario
        if (cleanInput.startsWith("http")) {
          return cleanInput
        } else {
          // Intentar construir URL básica (esto puede necesitar ajustes por red social)
          return cleanInput
        }
    }
  }

  autoFillTags() {
    if (this.form.tags.value.trim()) return // No sobrescribir si ya hay tags

    const especialidad = this.form.especialidad.value
    const defaultTags = this.getDefaultTagsBySpecialty(especialidad)
    this.form.tags.value = defaultTags.join(", ")
  }

  getDefaultTagsBySpecialty(especialidad) {
    const tagsBySpecialty = {
      "Ilustración Digital": ["Digital Art", "Photoshop", "Procreate", "Ilustración"],
      "Arte Tradicional": ["Lápiz", "Acuarela", "Óleo", "Dibujo", "Pintura"],
      "Concept Art": ["Concept Design", "Environment Art", "Digital Painting", "Creatividad"],
      "Character Design": ["Personajes", "Character Art", "Diseño", "Anatomía"],
      Animación: ["Animation", "Motion Graphics", "After Effects", "Storytelling"],
      "3D Modeling": ["Blender", "Maya", "3D Art", "Modelado", "Texturizado"],
      Fotografía: ["Photography", "Lightroom", "Composición", "Retoque"],
      "Diseño Gráfico": ["Graphic Design", "Branding", "Typography", "Adobe Creative"],
      "Arte Mixto": ["Mixed Media", "Experimental", "Técnicas Mixtas", "Creatividad"],
    }

    return tagsBySpecialty[especialidad] || ["Arte", "Creatividad", "Diseño"]
  }

  async generateMiembro() {
    if (!this.validateForm()) return

    this.generador.showLoading("Generando código de miembro...")

    try {
      const miembroData = this.extractMiembroData()
      this.showPreview(miembroData)
      this.generateCode(miembroData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de miembro generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de miembro")
      // console.error("Error:", error)
    }
  }

  validateForm() {
    let isValid = true

    if (!this.form.nombre.value.trim()) {
      this.showFieldError(this.form.nombre, "El nombre es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.nombre)
    }

    if (!this.form.descripcion.value.trim()) {
      this.showFieldError(this.form.descripcion, "La descripción es requerida")
      isValid = false
    } else {
      this.clearFieldError(this.form.descripcion)
    }

    if (!this.form.fecha.value) {
      this.showFieldError(this.form.fecha, "La fecha de ingreso es requerida")
      isValid = false
    } else {
      this.clearFieldError(this.form.fecha)
    }

    return isValid
  }

  showFieldError(field, message) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.add("error")
    inputGroup.classList.remove("success")

    let errorElement = inputGroup.querySelector(".error-message")
    if (!errorElement) {
      errorElement = document.createElement("small")
      errorElement.className = "error-message"
      inputGroup.appendChild(errorElement)
    }
    errorElement.textContent = message
  }

  clearFieldError(field) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.remove("error")
    inputGroup.classList.add("success")

    const errorElement = inputGroup.querySelector(".error-message")
    if (errorElement) {
      errorElement.remove()
    }
  }

  extractMiembroData() {
    const nombre = this.form.nombre.value.trim()
    const nombreArchivo = this.generateFileName(nombre)

    // Obtener redes sociales
    const socialNetworks = this.getSocialNetworksData()

    // Procesar tags
    const tags = this.form.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    // Formatear fecha
    const fechaIngreso = new Date(this.form.fecha.value)
    const fechaFormateada = fechaIngreso.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const especialidadMapping = {
      "Ilustración Digital": "digital",
      "Arte Tradicional": "traditional",
      "Concept Art": "concept",
      "Character Design": "character",
      Animación: "animation",
      "3D Modeling": "3d",
      Fotografía: "photography",
      "Diseño Gráfico": "graphic",
      "Arte Mixto": "mixed",
    }

    const nivelToRole = {
      Principiante: "member",
      Intermedio: "member",
      Avanzado: "member",
      Profesional: "admin",
    }

    return {
      nombre: nombre,
      nombreArchivo: nombreArchivo,
      especialidad: this.form.especialidad.value,
      especialidadCode: especialidadMapping[this.form.especialidad.value] || "traditional",
      nivel: this.form.nivel.value.toLowerCase(),
      role: nivelToRole[this.form.nivel.value] || "member",
      fecha: this.form.fecha.value,
      fechaFormateada: fechaFormateada,
      year: new Date(this.form.fecha.value).getFullYear(),
      descripcion: this.form.descripcion.value.trim(),
      socialNetworks: socialNetworks,
      tags: tags,
      avatarPath: `img/pfp/${nivelToRole[this.form.nivel.value] === "admin" ? "admins" : "members"}/${nombreArchivo}/pfp.jpg`,
      memberId: this.generateMemberId(nombre),
    }
  }

  generateFileName(nombre) {
    return nombre
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[áàäâ]/g, "a")
      .replace(/[éèëê]/g, "e")
      .replace(/[íìïî]/g, "i")
      .replace(/[óòöô]/g, "o")
      .replace(/[úùüû]/g, "u")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9-]/g, "")
  }

  generateMemberId(nombre) {
    return nombre
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[áàäâ]/g, "a")
      .replace(/[éèëê]/g, "e")
      .replace(/[íìïî]/g, "i")
      .replace(/[óòöô]/g, "o")
      .replace(/[úùüû]/g, "u")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20)
  }

  showPreview(data) {
    const socialLinksHtml = data.socialNetworks
      .map(
        (social) =>
          `<a href="${social.url}" target="_blank" class="member-social-link ${social.type}" title="${social.name}">
        <i class="${social.icon}"></i>
      </a>`,
      )
      .join("")

    const badgeIcon = data.role === "admin" ? "fas fa-star" : "fas fa-user"
    const badgeClass = data.role === "admin" ? "admin" : "member"

    this.previewContainer.innerHTML = `
      <div class="member-card" data-member-id="${data.memberId}" data-role="${data.role}" data-specialty="${data.especialidadCode}">
        <div class="member-badge ${badgeClass}">
          <i class="${badgeIcon}"></i>
        </div>
        <div class="member-main-content">
          <div class="member-avatar">
            <img src="/artist-portrait.png" alt="${data.nombre}">
          </div>
          <div class="member-info">
            <h3>${data.nombre}</h3>
            <p class="member-specialty">${data.especialidad}</p>
            <p class="member-since">${data.role === "admin" ? "Administrador" : "Miembro"} desde ${data.year}</p>
            <div class="member-social">
              ${socialLinksHtml}
            </div>
          </div>
        </div>
      </div>
    `

    this.previewSection.style.display = "block"
  }

  generateCode(data) {
    const socialLinksHtml = data.socialNetworks
      .map(
        (social) =>
          `                <a href="${social.url}" target="_blank" class="member-social-link ${social.type}" title="${social.name}">
                    <i class="${social.icon}"></i>
                </a>`,
      )
      .join("\n")

    const badgeIcon = data.role === "admin" ? "fas fa-star" : "fas fa-user"
    const badgeClass = data.role === "admin" ? "admin" : "member"
    const roleText = data.role === "admin" ? "Administrador" : "Miembro"

    const code = `<!-- ${roleText}: ${data.nombre} -->
<div class="member-card" data-member-id="${data.memberId}" data-role="${data.role}" data-specialty="${data.especialidadCode}">
    <div class="member-badge ${badgeClass}">
        <i class="${badgeIcon}"></i>
    </div>
    <div class="member-main-content">
        <div class="member-avatar">
            <img src="${data.avatarPath}" alt="${data.nombre}">
        </div>
        <div class="member-info">
            <h3>${data.nombre}</h3>
            <p class="member-specialty">${data.especialidad}</p>
            <p class="member-since">${roleText} desde ${data.year}</p>
            <div class="member-social">
${socialLinksHtml}
            </div>
        </div>
    </div>
</div>`

    this.codeContent.textContent = code
    this.codeSection.style.display = "block"

    if (window.Prism) {
      window.Prism.highlightElement(this.codeContent)
    }
  }
}

/**
 * ===================================
 * GENERADOR DE ARTWORK
 * ===================================
 */
class ArtworkGenerator {
  constructor(generador) {
    this.generador = generador
    this.form = {
      title: document.getElementById("artwork-title"),
      artist: document.getElementById("artwork-artist"),
      category: document.getElementById("artwork-category"),
      style: document.getElementById("artwork-style"),
      year: document.getElementById("artwork-year"),
      image: document.getElementById("artwork-image"),
      description: document.getElementById("artwork-description"),
    }

    this.generateBtn = document.getElementById("generate-artwork")
    this.previewSection = document.getElementById("artwork-preview")
    this.previewContainer = document.getElementById("artwork-preview-container")
    this.codeSection = document.getElementById("artwork-code")
    this.codeContent = document.getElementById("artwork-code-content")

    this.bindEvents()
  }

  bindEvents() {
    this.generateBtn.addEventListener("click", () => {
      this.generateArtwork()
    })

    // Auto-completar año actual
    if (!this.form.year.value) {
      this.form.year.value = new Date().getFullYear()
    }
  }

  async generateArtwork() {
    if (!this.validateForm()) return

    this.generador.showLoading("Generando código de obra de arte...")

    try {
      const artworkData = this.extractArtworkData()
      this.showPreview(artworkData)
      this.generateCode(artworkData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de obra de arte generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de obra de arte")
      // console.error("Error:", error)
    }
  }

  validateForm() {
    let isValid = true

    if (!this.form.title.value.trim()) {
      this.showFieldError(this.form.title, "El título es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.title)
    }

    if (!this.form.artist.value.trim()) {
      this.showFieldError(this.form.artist, "El artista es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.artist)
    }

    if (!this.form.image.value.trim()) {
      this.showFieldError(this.form.image, "La URL de la imagen es requerida")
      isValid = false
    } else if (!this.generador.isValidUrl(this.form.image.value.trim())) {
      this.showFieldError(this.form.image, "URL de imagen no válida")
      isValid = false
    } else {
      this.clearFieldError(this.form.image)
    }

    if (!this.form.year.value) {
      this.showFieldError(this.form.year, "El año es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.year)
    }

    return isValid
  }

  showFieldError(field, message) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.add("error")
    inputGroup.classList.remove("success")

    let errorElement = inputGroup.querySelector(".error-message")
    if (!errorElement) {
      errorElement = document.createElement("small")
      errorElement.className = "error-message"
      inputGroup.appendChild(errorElement)
    }
    errorElement.textContent = message
  }

  clearFieldError(field) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.remove("error")
    inputGroup.classList.add("success")

    const errorElement = inputGroup.querySelector(".error-message")
    if (errorElement) {
      errorElement.remove()
    }
  }

  extractArtworkData() {
    const title = this.form.title.value.trim()
    const artist = this.form.artist.value.trim()

    // Generar ID único para favoritos basado en el título
    const artworkId = this.generateArtworkId(title)

    return {
      title: title,
      artist: artist,
      category: this.form.category.value,
      style: this.form.style.value,
      year: this.form.year.value,
      imageUrl: this.form.image.value.trim(),
      description: this.form.description.value.trim() || `Obra de arte "${title}" creada por ${artist}`,
      artworkId: artworkId,
    }
  }

  generateArtworkId(title) {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[áàäâ]/g, "a")
      .replace(/[éèëê]/g, "e")
      .replace(/[íìïî]/g, "i")
      .replace(/[óòöô]/g, "o")
      .replace(/[úùüû]/g, "u")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 50) // Limitar longitud
  }

  showPreview(data) {
    this.previewContainer.innerHTML = `
      <div class="preview-artwork-card">
        <div class="preview-artwork-image">
          <img src="${data.imageUrl}" alt="${data.title}" loading="lazy">
          <div class="preview-artwork-overlay">
            <button class="preview-view-artwork-btn">
              <i class="fas fa-expand"></i>
            </button>
          </div>
          <button class="preview-favorite-btn-compact">
            <i class="far fa-heart"></i>
          </button>
        </div>
        <div class="preview-artwork-info-compact">
          <h3 class="preview-artwork-title-compact">${data.title}</h3>
          <div class="preview-artwork-artist-compact">
            <i class="fas fa-user-circle"></i>
            <span>${data.artist}</span>
          </div>
          <div class="preview-artwork-meta">
            <span class="preview-category">${this.getCategoryDisplayName(data.category)}</span>
            <span class="preview-style">${this.getStyleDisplayName(data.style)}</span>
            <span class="preview-year">${data.year}</span>
          </div>
        </div>
      </div>
    `

    this.previewSection.style.display = "block"
  }

  getCategoryDisplayName(category) {
    const categoryLabels = {
      anime: "Anime/Manga",
      retrato: "Retratos",
      fantasia: "Fantasía",
      abstracto: "Arte Abstracto",
      paisaje: "Paisajes",
      digital: "Arte Digital",
    }
    return categoryLabels[category] || category
  }

  getStyleDisplayName(style) {
    const styleLabels = {
      tinta: "Tinta",
      detallismo: "Detallismo a líneas",
      acuarela: "Acuarela",
      oleo: "Óleo",
      digital: "Digital",
      lapiz: "Lápiz",
      mixta: "Técnica Mixta",
    }
    return styleLabels[style] || style
  }

  generateCode(data) {
    const code = `<!-- Obra: ${data.title} -->
<div class="artwork-card" data-artist="${data.artist}" data-category="${data.category}" data-style="${data.style}" data-year="${data.year}">
    <div class="artwork-image">
        <img src="${data.imageUrl}" alt="${data.title}">
        <div class="artwork-overlay">
            <!-- Simplified modal to only show enlarged image -->
            <button class="view-artwork-btn" onclick="openArtworkModal('${data.imageUrl}', '${data.title}')">
                <i class="fas fa-expand"></i>
            </button>
        </div>
        <button class="favorite-btn-compact" onclick="toggleFavorite('${data.artworkId}')" data-artwork="${data.artworkId}">
            <i class="far fa-heart"></i>
        </button>
    </div>
    <div class="artwork-info-compact">
        <h3 class="artwork-title-compact">${data.title}</h3>
        <div class="artwork-artist-compact">
            <i class="fas fa-user-circle"></i>
            <span>${data.artist}</span>
        </div>
    </div>
</div>`

    this.codeContent.textContent = code
    this.codeSection.style.display = "block"

    if (window.Prism) {
      window.Prism.highlightElement(this.codeContent)
    }
  }
}

/**
 * ===================================
 * GENERADOR DE SUPPORT
 * ===================================
 */
class SupportGenerator {
  constructor(generador) {
    this.generador = generador
    this.form = {
      name: document.getElementById("support-name"),
      icon: document.getElementById("support-icon"),
      description: document.getElementById("support-description"),
      benefits: document.getElementById("support-benefits"),
      url: document.getElementById("support-url"),
      buttonText: document.getElementById("support-button-text"),
      qr: document.getElementById("support-qr"),
    }

    this.generateBtn = document.getElementById("generate-support")
    this.previewSection = document.getElementById("support-preview")
    this.previewContainer = document.getElementById("support-preview-container")
    this.codeSection = document.getElementById("support-code")
    this.codeContent = document.getElementById("support-code-content")

    this.bindEvents()
  }

  bindEvents() {
    this.generateBtn.addEventListener("click", () => {
      this.generateSupport()
    })
  }

  async generateSupport() {
    if (!this.validateForm()) return

    this.generador.showLoading("Generando código de método de apoyo...")

    try {
      const supportData = this.extractSupportData()
      this.showPreview(supportData)
      this.generateCode(supportData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de método de apoyo generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de método de apoyo")
      // console.error("Error:", error)
    }
  }

  validateForm() {
    let isValid = true

    if (!this.form.name.value.trim()) {
      this.showFieldError(this.form.name, "El nombre del método es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.name)
    }

    if (!this.form.description.value.trim()) {
      this.showFieldError(this.form.description, "La descripción es requerida")
      isValid = false
    } else {
      this.clearFieldError(this.form.description)
    }

    if (!this.form.benefits.value.trim()) {
      this.showFieldError(this.form.benefits, "Los beneficios son requeridos")
      isValid = false
    } else {
      this.clearFieldError(this.form.benefits)
    }

    if (!this.form.url.value.trim()) {
      this.showFieldError(this.form.url, "La URL es requerida")
      isValid = false
    } else if (!this.generador.isValidUrl(this.form.url.value.trim())) {
      this.showFieldError(this.form.url, "URL no válida")
      isValid = false
    } else {
      this.clearFieldError(this.form.url)
    }

    if (!this.form.buttonText.value.trim()) {
      this.showFieldError(this.form.buttonText, "El texto del botón es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.buttonText)
    }

    return isValid
  }

  showFieldError(field, message) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.add("error")
    inputGroup.classList.remove("success")

    let errorElement = inputGroup.querySelector(".error-message")
    if (!errorElement) {
      errorElement = document.createElement("small")
      errorElement.className = "error-message"
      inputGroup.appendChild(errorElement)
    }
    errorElement.textContent = message
  }

  clearFieldError(field) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.remove("error")
    inputGroup.classList.add("success")

    const errorElement = inputGroup.querySelector(".error-message")
    if (errorElement) {
      errorElement.remove()
    }
  }

  extractSupportData() {
    const benefits = this.form.benefits.value
      .trim()
      .split("\n")
      .filter((benefit) => benefit.trim())

    return {
      name: this.form.name.value.trim(),
      icon: this.form.icon.value.trim() || "fas fa-heart",
      description: this.form.description.value.trim(),
      benefits: benefits,
      url: this.form.url.value.trim(),
      buttonText: this.form.buttonText.value.trim(),
      qrUrl: this.form.qr.value.trim(),
    }
  }

  showPreview(data) {
    const benefitsHtml = data.benefits.map((benefit) => `<li>${benefit}</li>`).join("")

    const qrSection = data.qrUrl
      ? `<div class="card-qr">
          <div class="qr-container">
            <img src="${data.qrUrl}" alt="QR Code para ${data.name}" class="qr-image">
            <p>Escanea para acceder</p>
          </div>
        </div>`
      : `<div class="card-qr">
          <div class="qr-container">
            <div class="qr-placeholder">
              <i class="fas fa-qrcode"></i>
              <p>Escanea para acceder</p>
            </div>
          </div>
        </div>`

    this.previewContainer.innerHTML = `
      <div class="support-card">
        <div class="card-content">
          <div class="card-main">
            <div class="support-icon">
              <i class="${data.icon}"></i>
            </div>
            <h3>${data.name}</h3>
            <p class="support-description">${data.description}</p>
            <div class="support-benefits">
              <h4>¿Cómo nos ayudas?</h4>
              <ul>
                ${benefitsHtml}
              </ul>
            </div>
            <div class="support-actions">
              <a href="${data.url}" class="btn btn-primary" target="_blank">
                <i class="fas fa-external-link-alt"></i>
                ${data.buttonText}
              </a>
            </div>
          </div>
          ${qrSection}
        </div>
      </div>
    `

    this.previewSection.style.display = "block"
  }

  generateCode(data) {
    const benefitsHtml = data.benefits.map((benefit) => `                    <li>${benefit}</li>`).join("\n")

    const qrSection = data.qrUrl
      ? `                        <div class="card-qr">
                            <div class="qr-container">
                                <img src="${data.qrUrl}" alt="QR Code para ${data.name}" class="qr-image">
                                <p>Escanea para acceder</p>
                            </div>
                        </div>`
      : `                        <div class="card-qr">
                            <div class="qr-container">
                                <div class="qr-placeholder">
                                    <i class="fas fa-qrcode"></i>
                                    <p>Escanea para acceder</p>
                                </div>
                            </div>
                        </div>`

    const code = `<!-- Método de Apoyo: ${data.name} -->
<div class="support-card">
    <div class="card-content">
        <div class="card-main">
            <div class="support-icon">
                <i class="${data.icon}"></i>
            </div>
            <h3>${data.name}</h3>
            <p class="support-description">
                ${data.description}
            </p>
            <div class="support-benefits">
                <h4>¿Cómo nos ayudas?</h4>
                <ul>
${benefitsHtml}
                </ul>
            </div>
            <div class="support-actions">
                <a href="${data.url}" class="btn btn-primary" target="_blank">
                    <i class="fas fa-external-link-alt"></i>
                    ${data.buttonText}
                </a>
            </div>
        </div>
${qrSection}
    </div>
</div>`

    this.codeContent.textContent = code
    this.codeSection.style.display = "block"

    if (window.Prism) {
      window.Prism.highlightElement(this.codeContent)
    }
  }
}

/**
 * ===================================
 * GENERADOR DE FEATURED
 * ===================================
 */
class FeaturedGenerator {
  constructor(generador) {
    this.generador = generador
    this.form = {
      title: document.getElementById("featured-title"),
      author: document.getElementById("featured-author"),
      description: document.getElementById("featured-description"),
      image: document.getElementById("featured-image"),
      tags: document.getElementById("featured-tags"),
    }

    this.generateBtn = document.getElementById("generate-featured")
    this.previewSection = document.getElementById("featured-preview")
    this.previewContainer = document.getElementById("featured-preview-container")
    this.codeSection = document.getElementById("featured-code")
    this.codeContent = document.getElementById("featured-code-content")

    this.bindEvents()
  }

  bindEvents() {
    this.generateBtn.addEventListener("click", () => {
      this.generateFeatured()
    })
  }

  async generateFeatured() {
    if (!this.validateForm()) return

    this.generador.showLoading("Generando código de obra destacada...")

    try {
      const featuredData = this.extractFeaturedData()
      this.showPreview(featuredData)
      this.generateCode(featuredData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de obra destacada generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de obra destacada")
      // console.error("Error:", error)
    }
  }

  validateForm() {
    let isValid = true

    if (!this.form.title.value.trim()) {
      this.showFieldError(this.form.title, "El título es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.title)
    }

    if (!this.form.author.value.trim()) {
      this.showFieldError(this.form.author, "El autor es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.author)
    }

    if (!this.form.description.value.trim()) {
      this.showFieldError(this.form.description, "La descripción es requerida")
      isValid = false
    } else {
      this.clearFieldError(this.form.description)
    }

    if (!this.form.image.value.trim()) {
      this.showFieldError(this.form.image, "La URL de la imagen es requerida")
      isValid = false
    } else if (!this.generador.isValidUrl(this.form.image.value.trim())) {
      this.showFieldError(this.form.image, "URL de imagen no válida")
      isValid = false
    } else {
      this.clearFieldError(this.form.image)
    }

    return isValid
  }

  showFieldError(field, message) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.add("error")
    inputGroup.classList.remove("success")

    let errorElement = inputGroup.querySelector(".error-message")
    if (!errorElement) {
      errorElement = document.createElement("small")
      errorElement.className = "error-message"
      inputGroup.appendChild(errorElement)
    }
    errorElement.textContent = message
  }

  clearFieldError(field) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.remove("error")
    inputGroup.classList.add("success")

    const errorElement = inputGroup.querySelector(".error-message")
    if (errorElement) {
      errorElement.remove()
    }
  }

  extractFeaturedData() {
    return {
      title: this.form.title.value.trim(),
      author: this.form.author.value.trim(),
      description: this.form.description.value.trim(),
      imageUrl: this.form.image.value.trim(),
      tags: this.form.tags.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }
  }

  showPreview(data) {
    const tagsHtml = data.tags.map((tag) => `<span class="preview-tag">${tag}</span>`).join("")

    this.previewContainer.innerHTML = `
      <div class="preview-carousel-slide">
        <div class="preview-featured-work">
          <img src="${data.imageUrl}" alt="${data.title}" loading="lazy">
          <div class="preview-work-info">
            <h3>${data.title}</h3>
            <p class="preview-work-author">Por ${data.author}</p>
            <p class="preview-work-description">${data.description}</p>
            <div class="preview-work-tags">
              ${tagsHtml}
            </div>
          </div>
        </div>
      </div>
    `

    this.previewSection.style.display = "block"
  }

  generateCode(data) {
    const tagsHtml = data.tags.map((tag) => `                          <span class="tag">${tag}</span>`).join("\n")

    const code = `<!-- Obra Destacada: ${data.title} -->
<div class="carousel-slide">
    <div class="featured-work">
        <img src="${data.imageUrl}" alt="${data.title}">
        <div class="work-info">
            <h3>${data.title}</h3>
            <p class="work-author">Por ${data.author}</p>
            <p class="work-description">${data.description}</p>
            <div class="work-tags">
${tagsHtml}
            </div>
        </div>
    </div>
</div>`

    this.codeContent.textContent = code
    this.codeSection.style.display = "block"

    if (window.Prism) {
      window.Prism.highlightElement(this.codeContent)
    }
  }
}

/**
 * ===================================
 * GENERADOR DE RESOURCE
 * ===================================
 */
class ResourceGenerator {
  constructor(generador) {
    this.generador = generador
    this.form = {
      title: document.getElementById("resource-title"),
      description: document.getElementById("resource-description"),
      link: document.getElementById("resource-link"),
      image: document.getElementById("resource-image"),
      type: document.getElementById("resource-type"),
      tags: document.getElementById("resource-tags"),
    }

    this.generateBtn = document.getElementById("generate-resource")
    this.previewSection = document.getElementById("resource-preview")
    this.previewContainer = document.getElementById("resource-preview-container")
    this.codeSection = document.getElementById("resource-code")
    this.codeContent = document.getElementById("resource-code-content")

    this.bindEvents()
  }

  bindEvents() {
    this.generateBtn.addEventListener("click", () => {
      this.generateResource()
    })
  }

  async generateResource() {
    if (!this.validateForm()) return

    this.generador.showLoading("Generando código de resource...")

    try {
      const resourceData = this.extractResourceData()
      this.showPreview(resourceData)
      this.generateCode(resourceData)

      this.generador.hideLoading()
      this.generador.showToast("success", "Código de resource generado correctamente")
    } catch (error) {
      this.generador.hideLoading()
      this.generador.showToast("error", "Error al generar el código de resource")
      // console.error("Error:", error)
    }
  }

  validateForm() {
    let isValid = true

    if (!this.form.title.value.trim()) {
      this.showFieldError(this.form.title, "El título es requerido")
      isValid = false
    } else {
      this.clearFieldError(this.form.title)
    }

    if (!this.form.description.value.trim()) {
      this.showFieldError(this.form.description, "La descripción es requerida")
      isValid = false
    } else {
      this.clearFieldError(this.form.description)
    }

    if (!this.form.link.value.trim()) {
      this.showFieldError(this.form.link, "El enlace es requerido")
      isValid = false
    } else if (!this.generador.isValidUrl(this.form.link.value.trim())) {
      this.showFieldError(this.form.link, "Enlace no válido")
      isValid = false
    } else {
      this.clearFieldError(this.form.link)
    }

    if (!this.form.image.value.trim()) {
      this.showFieldError(this.form.image, "La URL de la imagen es requerida")
      isValid = false
    } else if (!this.generador.isValidUrl(this.form.image.value.trim())) {
      this.showFieldError(this.form.image, "URL de imagen no válida")
      isValid = false
    } else {
      this.clearFieldError(this.form.image)
    }

    return isValid
  }

  showFieldError(field, message) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.add("error")
    inputGroup.classList.remove("success")

    let errorElement = inputGroup.querySelector(".error-message")
    if (!errorElement) {
      errorElement = document.createElement("small")
      errorElement.className = "error-message"
      inputGroup.appendChild(errorElement)
    }
    errorElement.textContent = message
  }

  clearFieldError(field) {
    const inputGroup = field.closest(".input-group")
    inputGroup.classList.remove("error")
    inputGroup.classList.add("success")

    const errorElement = inputGroup.querySelector(".error-message")
    if (errorElement) {
      errorElement.remove()
    }
  }

  extractResourceData() {
    return {
      title: this.form.title.value.trim(),
      description: this.form.description.value.trim(),
      link: this.form.link.value.trim(),
      imageUrl: this.form.image.value.trim(),
      type: this.form.type.value,
      tags: this.form.tags.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }
  }

  showPreview(data) {
    const tagsHtml = data.tags.map((tag) => `<span class="preview-tag">${tag}</span>`).join("")

    this.previewContainer.innerHTML = `
      <div class="preview-resource-card">
        <a href="${data.link}" target="_blank">
          <img src="${data.imageUrl}" alt="${data.title}" loading="lazy">
        </a>
        <div class="preview-resource-info">
          <h3>${data.title}</h3>
          <p class="preview-resource-description">${data.description}</p>
          <span class="preview-resource-type">${data.type}</span>
          <div class="preview-resource-tags">
            ${tagsHtml}
          </div>
        </div>
      </div>
    `

    this.previewSection.style.display = "block"
  }

  generateCode(data) {
    const tagsHtml = data.tags.map((tag) => `<span class="tag">${tag}</span>`).join("\n                ")

    const code = `<!-- Resource: ${data.title} -->
<div class="resource-card">
    <a href="${data.link}" target="_blank">
        <img src="${data.imageUrl}" alt="${data.title}" loading="lazy">
    </a>
    <div class="resource-info">
        <h3>${data.title}</h3>
        <p class="resource-description">${data.description}</p>
        <span class="resource-type">${data.type}</span>
        <div class="resource-tags">
            ${tagsHtml}
        </div>
    </div>
</div>`

    this.codeContent.textContent = code
    this.codeSection.style.display = "block"

    if (window.Prism) {
      window.Prism.highlightElement(this.codeContent)
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.generador = new GeneradorCodigo()
})

// Funciones de utilidad globales
window.generadorUtils = {
  // Función para limpiar formularios
  clearForm: (formSelector) => {
    const form = document.querySelector(formSelector)
    if (form) {
      form.reset()
      // Limpiar errores
      form.querySelectorAll(".input-group").forEach((group) => {
        group.classList.remove("error", "success")
        const errorMsg = group.querySelector(".error-message")
        if (errorMsg) errorMsg.remove()
      })
      // Ocultar preview y código
      const previewSection = form.closest(".tab-content").querySelector(".preview-section")
      const codeSection = form.closest(".tab-content").querySelector(".code-section")
      if (previewSection) previewSection.style.display = "none"
      if (codeSection) codeSection.style.display = "none"
    }
  },

  // Función para exportar código como archivo
  exportCode: (code, filename) => {
    const blob = new Blob([code], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    window.generadorCodigo = new GeneradorCodigo()
    // console.log("Generador de Código inicializado correctamente")
  } catch (error) {
    // console.error("Error al inicializar el Generador de Código:", error)
  }
})

class GeneratorManager {
  constructor() {
    // this.loadingModal = document.getElementById("loading-modal")
    // this.successToast = document.getElementById("success-toast")
    // this.errorToast = document.getElementById("error-toast")

    // Verificar elementos críticos - eliminado completamente

    this.initializeGenerators()
    this.setupEventListeners()
  }

  initializeGenerators() {
    this.playlistGenerator = new PlaylistGenerator()
    this.videoGenerator = new VideoGenerator()
    this.pinterestGenerator = new PinterestGenerator()
    this.libroGenerator = new LibroGenerator()
    this.softwareGenerator = new SoftwareGenerator()
    this.miembroGenerator = new MiembroGenerator()
    this.artworkGenerator = new ArtworkGenerator()
    this.supportGenerator = new SupportGenerator()
    this.featuredGenerator = new FeaturedGenerator()
    this.resourceGenerator = new ResourceGenerator()
  }

  setupEventListeners() {
    // Tab switching
    const tabBtns = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab")

        // Remove active class from all tabs and contents
        tabBtns.forEach((b) => b.classList.remove("active"))
        tabContents.forEach((c) => c.classList.remove("active"))

        // Add active class to clicked tab and corresponding content
        btn.classList.add("active")
        const targetContent = document.getElementById(targetTab)
        if (targetContent) {
          targetContent.classList.add("active")
        }
      })
    })

    // Copy buttons
    const copyBtns = document.querySelectorAll(".btn-copy")
    copyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target")
        this.copyToClipboard(target)
      })
    })

    // Cerrar modal de carga al hacer clic fuera - eliminado completamente
  }

  // showLoading(message = "Generando código...") - eliminado completamente
  // hideLoading() - eliminado completamente
  // showToast(type, message) - eliminado completamente

  async copyToClipboard(targetId) {
    const element = document.getElementById(targetId)
    if (!element) {
      return
    }

    try {
      if (!navigator.clipboard) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement("textarea")
        textArea.value = element.textContent
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      } else {
        await navigator.clipboard.writeText(element.textContent)
      }
    } catch (error) {}
  }
}
