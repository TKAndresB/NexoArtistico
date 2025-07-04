class PlantillasRedes {
  constructor() {
    this.currentTemplate = "torneo"
    this.isDarkMode = true
    this.canvas = document.getElementById("previewCanvas")
    this.ctx = this.canvas.getContext("2d")
    this.finalCanvas = document.getElementById("finalCanvas")
    this.finalCtx = this.finalCanvas.getContext("2d")

    this.images = {
      torneo: null,
      torneoPerfil: null,
      publicacion: [],
      publicacionPerfil: null,
      entrevista: null,
    }

    this.qaCount = 1
    this.animationFrame = 0

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.updateCanvasSize()
    document.body.setAttribute("data-theme", "dark")
    document.getElementById("themeToggle").innerHTML = '<i class="fas fa-sun"></i><span>Modo Claro</span>'
    this.updatePreview()
  }

  setupEventListeners() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchTemplate(e.target.dataset.template)
      })
    })

    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })

    document.getElementById("canvas-aspect").addEventListener("change", () => {
      this.updateCanvasSize()
      this.updatePreview()
    })

    document.getElementById("downloadBtn").addEventListener("click", () => {
      this.downloadImage()
    })

    document.getElementById("torneo-imagen").addEventListener("change", (e) => {
      this.handleImageUpload(e, "torneo")
    })

    document.getElementById("torneo-perfil").addEventListener("change", (e) => {
      this.handleImageUpload(e, "torneoPerfil")
    })

    document.getElementById("publicacion-perfil").addEventListener("change", (e) => {
      this.handleImageUpload(e, "publicacionPerfil")
    })

    document.getElementById("entrevista-foto").addEventListener("change", (e) => {
      this.handleImageUpload(e, "entrevista")
    })

    document.getElementById("publicacion-mosaico").addEventListener("change", (e) => {
      this.updatePublicacionImageInputs(Number.parseInt(e.target.value))
    })

    document.getElementById("add-qa-btn").addEventListener("click", () => {
      this.addQAPair()
    })

    document.querySelectorAll("input, select, textarea").forEach((input) => {
      input.addEventListener("input", () => {
        this.updatePreview()
      })
    })

    this.updatePublicacionImageInputs(1)
  }

  updateCanvasSize() {
    const aspectRatio = document.getElementById("canvas-aspect").value
    let canvasWidth, canvasHeight

    switch (aspectRatio) {
      case "4:3":
        canvasWidth = 1200
        canvasHeight = 900
        break
      case "16:9":
        canvasWidth = 1600
        canvasHeight = 900
        break
      case "1:1":
        canvasWidth = 1080
        canvasHeight = 1080
        break
      case "9:16":
        canvasWidth = 1080
        canvasHeight = 1920
        break
      case "3:4":
        canvasWidth = 1080
        canvasHeight = 1440
        break
      default:
        canvasWidth = 1200
        canvasHeight = 900
    }

    this.canvas.width = canvasWidth
    this.canvas.height = canvasHeight
    this.finalCanvas.width = canvasWidth
    this.finalCanvas.height = canvasHeight
  }

  switchTemplate(template) {
    this.currentTemplate = template

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-template="${template}"]`).classList.add("active")

    document.querySelectorAll(".template-config").forEach((config) => {
      config.classList.remove("active")
    })
    document.getElementById(`${template}-config`).classList.add("active")

    this.updateCanvasSize()
    this.updatePreview()
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode
    const body = document.body
    const themeToggle = document.getElementById("themeToggle")

    if (this.isDarkMode) {
      body.setAttribute("data-theme", "dark")
      themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Modo Claro</span>'
    } else {
      body.removeAttribute("data-theme")
      themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Modo Oscuro</span>'
    }

    this.updatePreview()
  }

  handleImageUpload(event, type) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        if (type.startsWith("publicacion-imagen-")) {
          const index = Number.parseInt(type.split("-")[2]) - 1
          this.images.publicacion[index] = img
        } else {
          this.images[type] = img
        }
        this.updatePreview()
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)

    const display = event.target.nextElementSibling
    display.innerHTML = `<i class="fas fa-check"></i><span>${file.name}</span>`
  }

  updatePublicacionImageInputs(count) {
    const container = document.getElementById("publicacion-imagenes")
    container.innerHTML = ""
    this.images.publicacion = []

    for (let i = 1; i <= count; i++) {
      const div = document.createElement("div")
      div.className = "form-group image-input-group"
      div.innerHTML = `
        <label>Imagen ${i}</label>
        <div class="file-input-wrapper">
          <input type="file" id="publicacion-imagen-${i}" accept="image/*">
          <div class="file-input-display">
            <i class="fas fa-upload"></i>
            <span>Seleccionar imagen ${i}</span>
          </div>
        </div>
      `
      container.appendChild(div)

      document.getElementById(`publicacion-imagen-${i}`).addEventListener("change", (e) => {
        this.handleImageUpload(e, `publicacion-imagen-${i}`)
      })
    }

    this.updatePreview()
  }

  addQAPair() {
    this.qaCount++
    const container = document.getElementById("entrevista-qa-container")

    const div = document.createElement("div")
    div.className = "qa-pair"
    div.setAttribute("data-index", this.qaCount - 1)
    div.innerHTML = `
      <button type="button" class="remove-qa-btn" onclick="this.parentElement.remove(); app.updatePreview();">
        <i class="fas fa-times"></i>
      </button>
      <div class="form-group">
        <label>Pregunta ${this.qaCount}</label>
        <input type="text" class="entrevista-pregunta" placeholder="Pregunta de la entrevista">
      </div>
      <div class="form-group">
        <label>Respuesta ${this.qaCount}</label>
        <textarea class="entrevista-respuesta" rows="3" placeholder="Respuesta del artista"></textarea>
      </div>
    `
    container.appendChild(div)

    div.querySelectorAll("input, textarea").forEach((input) => {
      input.addEventListener("input", () => {
        this.updatePreview()
      })
    })

    this.updatePreview()
  }

  updatePreview() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.animationFrame++

    switch (this.currentTemplate) {
      case "torneo":
        this.renderTorneoTemplate()
        break
      case "publicacion":
        this.renderPublicacionTemplate()
        break
      case "entrevista":
        this.renderEntrevistaTemplate()
        break
    }
  }

  renderTorneoTemplate() {
    const data = this.getTorneoData()

    // Clean modern background
    this.drawModernBackground()

    // Determine layout based on canvas aspect ratio
    const aspectRatio = this.canvas.width / this.canvas.height

    if (aspectRatio > 1.2) {
      // Horizontal layout (4:3, 16:9)
      this.renderHorizontalLayout(data)
    } else {
      // Vertical layout (9:16, 3:4, 1:1)
      this.renderVerticalLayout(data)
    }
  }

  renderHorizontalLayout(data) {
    const margin = 40

    // Definir dimensiones exactas basadas en la imagen de referencia
    const totalWidth = this.canvas.width - margin * 2
    const totalHeight = this.canvas.height - margin * 2

    // Imagen ocupa aproximadamente 60% del ancho
    const imageAreaWidth = totalWidth * 0.6
    const imageAreaHeight = totalHeight
    const imageAreaX = margin
    const imageAreaY = margin

    // Panel derecho ocupa el 40% restante
    const panelWidth = totalWidth * 0.38
    const panelHeight = totalHeight
    const panelX = imageAreaX + imageAreaWidth + margin * 0.5
    const panelY = margin

    // Dibujar el marco de la imagen
    this.drawModernImageFrame(imageAreaX, imageAreaY, imageAreaWidth, imageAreaHeight, data.aspecto)

    // Dibujar el panel derecho
    this.drawHorizontalRightPanel(panelX, panelY, panelWidth, panelHeight, data)

    // Logo en la esquina inferior izquierda
    this.drawModernLogo(margin, this.canvas.height - margin - 10)
  }

  drawHorizontalRightPanel(x, y, width, height, data) {
    const scale = Math.min(width / 350, height / 800, 1)

    // Badge de posición en la parte superior (más grande)
    const badgeHeight = 70 * scale
    this.drawModernPositionBadge(x, y, width, badgeHeight, data.posicion, scale)

    // Métricas en el medio
    const metricsStartY = y + badgeHeight + 20 * scale
    const metricsHeight = height * 0.4 // Reduced from 0.45 to give more space
    this.drawHorizontalScoreMetrics(x, metricsStartY, width, metricsHeight, data, scale)

    // Círculo de puntuación total - positioned in the gap
    const gapStartY = metricsStartY + metricsHeight + 15 * scale
    const profileStartY = y + height - 140 * scale // Fixed position from bottom
    const gapCenterY = gapStartY + (profileStartY - gapStartY) / 2
    this.drawModernTotalScore(x + width / 2, gapCenterY, data.total, scale)

    // Perfil del artista en la parte inferior - moved down
    const profileHeight = 130 * scale
    this.drawHorizontalArtistProfile(x, profileStartY, width, profileHeight, data, scale)
  }

  drawVerticalLayout(data) {
    const margin = Math.min(this.canvas.width * 0.05, 40)
    const contentWidth = this.canvas.width - margin * 2

    // Main image area (top section)
    const imageAreaHeight = this.canvas.height * 0.45
    this.drawModernImageFrame(margin, margin, contentWidth, imageAreaHeight, data.aspecto)

    // Info panel (bottom section)
    const panelY = margin + imageAreaHeight + margin
    const panelHeight = this.canvas.height - panelY - margin * 2

    this.drawVerticalInfoPanel(margin, panelY, contentWidth, panelHeight, data)

    // Logo at bottom
    this.drawModernLogo(margin, this.canvas.height - margin)
  }

  renderPublicacionTemplate() {
    const data = this.getPublicacionData()
    const mosaico = Number.parseInt(document.getElementById("publicacion-mosaico").value)

    // Fondo artístico elegante
    this.drawArtisticElegantBackground()

    // Efectos de luz sutiles
    this.drawSubtleLighting()

    // Mosaico elegante
    const margin = 60
    const availableWidth = this.canvas.width - margin * 2
    const availableHeight = this.canvas.height - 220

    this.drawElegantMosaico(margin, margin, availableWidth, availableHeight, mosaico)

    // Badge de artista elegante
    const badgeWidth = Math.min(320, this.canvas.width * 0.3)
    const badgeX = this.canvas.width - badgeWidth - 60
    const badgeY = this.canvas.height - 200

    this.drawElegantFloatingArtistBadge(badgeX, badgeY, badgeWidth, data, this.images.publicacionPerfil)

    // Logo elegante
    this.drawElegantGalleryLogo(60, this.canvas.height - 60)
  }

  renderEntrevistaTemplate() {
    const data = this.getEntrevistaData()

    // Fondo de entrevista elegante
    this.drawElegantInterviewBackground()

    // Iluminación sutil
    this.drawSubtleStudioLighting()

    // Título elegante
    this.drawElegantTitle("Conociendo al Artista", this.canvas.width / 2, 120)

    // Sección de perfil elegante
    const centerX = this.canvas.width / 2
    const profileY = 240

    this.drawElegantProfileSection(centerX, profileY, data, this.images.entrevista)

    // Sección Q&A elegante
    let currentY = profileY + 380
    const qaData = this.getQAData()

    qaData.forEach((qa, index) => {
      if (qa.pregunta.trim() && qa.respuesta.trim()) {
        currentY = this.drawElegantQASection(qa.pregunta, qa.respuesta, currentY, data.nombre, index)
        currentY += 80
      }
    })

    // Logo elegante
    this.drawElegantInterviewLogo(60, this.canvas.height - 60)
  }

  drawModernBackground() {
    // Clean gradient background matching the reference
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height)
    gradient.addColorStop(0, "#2D1B69")
    gradient.addColorStop(0.5, "#1E1B4B")
    gradient.addColorStop(1, "#0F0F23")

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawModernImageFrame(x, y, width, height, aspectRatio) {
    // Modern card frame
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    this.ctx.shadowBlur = 20
    this.ctx.shadowOffsetY = 10

    // Card background
    this.ctx.fillStyle = "#374151"
    this.roundRect(this.ctx, x, y, width, height, 20)
    this.ctx.fill()
    this.ctx.restore()

    // Inner content area
    const padding = Math.min(width * 0.03, 20)
    const contentX = x + padding
    const contentY = y + padding
    const contentWidth = width - padding * 2
    const contentHeight = height - padding * 2

    // Calculate image dimensions based on aspect ratio
    const ratio = this.getAspectRatio(aspectRatio)
    let imageWidth, imageHeight, imageX, imageY

    if (ratio >= 1) {
      if (ratio > contentWidth / contentHeight) {
        imageWidth = contentWidth
        imageHeight = contentWidth / ratio
      } else {
        imageHeight = contentHeight
        imageWidth = contentHeight * ratio
      }
    } else {
      if (ratio < contentWidth / contentHeight) {
        imageHeight = contentHeight
        imageWidth = contentHeight * ratio
      } else {
        imageWidth = contentWidth
        imageHeight = contentWidth / ratio
      }
    }

    imageX = contentX + (contentWidth - imageWidth) / 2
    imageY = contentY + (contentHeight - imageHeight) / 2

    // Draw image or placeholder
    this.ctx.save()
    this.roundRect(this.ctx, imageX, imageY, imageWidth, imageHeight, 15)
    this.ctx.clip()

    if (this.images.torneo) {
      this.drawImageFit(this.images.torneo, imageX, imageY, imageWidth, imageHeight)
    } else {
      // Placeholder
      this.ctx.fillStyle = "#4B5563"
      this.ctx.fill()

      this.ctx.fillStyle = "#9CA3AF"
      this.ctx.font = `${Math.min(width * 0.02, 24)}px Inter`
      this.ctx.textAlign = "center"
      this.ctx.fillText("📸 Sube una imagen", imageX + imageWidth / 2, imageY + imageHeight / 2)
    }
    this.ctx.restore()
  }

  drawModernRightPanel(x, y, width, height, data) {
    const scale = Math.min(width / 380, height / 840, 1)

    // Position badge at top
    this.drawModernPositionBadge(x + width * 0.05, y + height * 0.03, width * 0.9, data.posicion, scale)

    // Score metrics section
    const metricsY = y + height * 0.15
    const metricsHeight = height * 0.45
    this.drawModernScoreMetrics(x + width * 0.05, metricsY, width * 0.9, metricsHeight, data, scale)

    // Total score circle
    const totalScoreY = y + height * 0.65
    this.drawModernTotalScore(x + width / 2, totalScoreY, data, scale)

    // Artist profile at bottom
    const profileY = y + height * 0.8
    this.drawModernArtistProfile(x + width * 0.05, profileY, width * 0.9, data, scale)
  }

  drawVerticalInfoPanel(x, y, width, height, data) {
    const scale = Math.min(width / 600, height / 600, 1)

    // Position badge at top
    this.drawModernPositionBadge(x, y, width, height * 0.15, data.posicion, scale)

    // Score metrics in two columns
    const metricsY = y + height * 0.2
    const metricsHeight = height * 0.4
    this.drawVerticalScoreMetrics(x, metricsY, width, metricsHeight, data, scale)

    // Total score and artist profile side by side
    const bottomY = y + height * 0.65
    const bottomHeight = height * 0.3

    // Total score (left side)
    this.drawModernTotalScore(x + width * 0.25, bottomY + bottomHeight / 2, data.total, scale)

    // Artist profile (right side)
    this.drawModernArtistProfile(x + width * 0.5, bottomY, width * 0.45, data, scale)
  }

  drawModernPositionBadge(x, y, width, height, position, scale = 1) {
    const badgeHeight = Math.max(height, 60 * scale)

    // Get position styling
    const style = this.getPositionStyle(position)

    // Badge background
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    this.ctx.shadowBlur = 10 * scale
    this.ctx.shadowOffsetY = 5 * scale

    const gradient = this.ctx.createLinearGradient(x, y, x + width, y + badgeHeight)
    gradient.addColorStop(0, style.gradientStart)
    gradient.addColorStop(1, style.gradientEnd)

    this.ctx.fillStyle = gradient
    this.roundRect(this.ctx, x, y, width, badgeHeight, 30 * scale)
    this.ctx.fill()
    this.ctx.restore()

    // Badge content
    this.ctx.save()
    this.ctx.fillStyle = style.textColor
    this.ctx.textAlign = "center"

    if (style.icon) {
      // Draw icon and text
      this.ctx.font = `${24 * scale}px Arial`
      this.ctx.fillText(style.icon, x + 40 * scale, y + badgeHeight / 2 + 8 * scale)

      this.ctx.font = `bold ${16 * scale}px Inter`
      this.ctx.fillText(style.text, x + width / 2 + 10 * scale, y + badgeHeight / 2 + 5 * scale)
    } else {
      this.ctx.font = `bold ${18 * scale}px Inter`
      this.ctx.fillText(style.text, x + width / 2, y + badgeHeight / 2 + 5 * scale)
    }
    this.ctx.restore()
  }

  drawModernScoreMetrics(x, y, width, height, data, scale = 1) {
    const metrics = [
      { label: "Impacto Escénico", value: data.impacto, color: "#10B981" },
      { label: "Ambientación", value: data.ambientacion, color: "#8B5CF6" },
      { label: "Originalidad", value: data.originalidad, color: "#F59E0B" },
      { label: "Color/Delineado", value: data.coloreo, color: "#EF4444" },
      { label: "Dificultad", value: data.dificultad, color: "#06B6D4" },
      { label: "Dinamismo", value: data.dinamismo, color: "#84CC16" },
    ]

    const itemHeight = height / metrics.length

    metrics.forEach((metric, index) => {
      const itemY = y + index * itemHeight
      this.drawModernMetricItem(x, itemY, width, itemHeight, metric, scale)
    })
  }

  drawVerticalScoreMetrics(x, y, width, height, data, scale = 1) {
    const metrics = [
      { label: "Impacto Escénico", value: data.impacto, color: "#10B981" },
      { label: "Ambientación", value: data.ambientacion, color: "#8B5CF6" },
      { label: "Originalidad", value: data.originalidad, color: "#F59E0B" },
      { label: "Color/Delineado", value: data.coloreo, color: "#EF4444" },
      { label: "Dificultad", value: data.dificultad, color: "#06B6D4" },
      { label: "Dinamismo", value: data.dinamismo, color: "#84CC16" },
    ]

    const itemHeight = height / 3
    const itemWidth = width / 2

    metrics.forEach((metric, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      const itemX = x + col * itemWidth
      const itemY = y + row * itemHeight

      this.drawModernMetricItem(itemX, itemY, itemWidth, itemHeight, metric, scale)
    })
  }

  drawModernMetricItem(x, y, width, height, metric, scale = 1) {
    const fontSize = Math.min(16 * scale, width * 0.04)

    // Metric label
    this.ctx.save()
    this.ctx.fillStyle = "#FFFFFF"
    this.ctx.font = `bold ${fontSize}px Inter`
    this.ctx.textAlign = "left"
    this.ctx.fillText(metric.label, x, y + height / 2 + fontSize / 3)
    this.ctx.restore()

    // Progress bar background
    const barWidth = Math.min(120 * scale, width * 0.3)
    const barHeight = Math.max(8 * scale, 6)
    const barX = x + width - barWidth - 50 * scale
    const barY = y + height / 2 - barHeight / 2

    this.ctx.save()
    this.ctx.fillStyle = "#374151"
    this.roundRect(this.ctx, barX, barY, barWidth, barHeight, 4 * scale)
    this.ctx.fill()
    this.ctx.restore()

    // Progress bar fill
    const progress = (metric.value / 10) * barWidth
    this.ctx.save()
    this.ctx.fillStyle = metric.color
    this.roundRect(this.ctx, barX, barY, progress, barHeight, 4 * scale)
    this.ctx.fill()
    this.ctx.restore()

    // Score value
    this.ctx.save()
    this.ctx.fillStyle = "#FFFFFF"
    this.ctx.font = `bold ${fontSize}px Inter`
    this.ctx.textAlign = "right"
    this.ctx.fillText(metric.value, x + width - 10 * scale, y + height / 2 + fontSize / 3)
    this.ctx.restore()
  }

  drawModernTotalScore(centerX, centerY, score, scale = 1) {
    const radius = 60 * scale

    // Circle background
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    this.ctx.shadowBlur = 15 * scale
    this.ctx.shadowOffsetY = 8 * scale

    this.ctx.fillStyle = "#1F2937"
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.restore()

    // Progress ring background
    this.ctx.save()
    this.ctx.lineWidth = 8 * scale
    this.ctx.strokeStyle = "#374151"
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius - 15 * scale, 0, Math.PI * 2)
    this.ctx.stroke()
    this.ctx.restore()

    // Progress ring
    const progress = score / 10
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + progress * 2 * Math.PI

    this.ctx.save()
    this.ctx.lineWidth = 8 * scale
    this.ctx.lineCap = "round"
    this.ctx.strokeStyle = "#8B5CF6"
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius - 15 * scale, startAngle, endAngle)
    this.ctx.stroke()
    this.ctx.restore()

    // Score text
    this.ctx.save()
    this.ctx.fillStyle = "#FFFFFF"
    this.ctx.font = `bold ${32 * scale}px Inter`
    this.ctx.textAlign = "center"
    this.ctx.fillText(score, centerX, centerY + 5 * scale)

    this.ctx.font = `${14 * scale}px Inter`
    this.ctx.fillStyle = "#9CA3AF"
    this.ctx.fillText("/ 10", centerX, centerY + 25 * scale)
    this.ctx.restore()
  }

  drawModernArtistProfile(x, y, width, data, scale = 1) {
    const profileHeight = Math.max(100 * scale, width * 0.2)

    // Profile card background
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    this.ctx.shadowBlur = 10 * scale
    this.ctx.shadowOffsetY = 5 * scale

    this.ctx.fillStyle = "#1F2937"
    this.roundRect(this.ctx, x, y, width, profileHeight, 15 * scale)
    this.ctx.fill()
    this.ctx.restore()

    // Profile picture
    const profileSize = Math.min(70 * scale, profileHeight * 0.7)
    const profileX = x + 15 * scale
    const profileY = y + (profileHeight - profileSize) / 2

    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2)
    this.ctx.clip()

    if (this.images.torneoPerfil) {
      this.drawImageFit(this.images.torneoPerfil, profileX, profileY, profileSize, profileSize)
    } else {
      this.ctx.fillStyle = "#4B5563"
      this.ctx.fill()
    }
    this.ctx.restore()

    // Profile ring
    this.ctx.save()
    this.ctx.strokeStyle = "#8B5CF6"
    this.ctx.lineWidth = 3 * scale
    this.ctx.beginPath()
    this.ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2 + 2 * scale, 0, Math.PI * 2)
    this.ctx.stroke()
    this.ctx.restore()

    // Artist info
    const fontSize = Math.min(20 * scale, width * 0.05)

    this.ctx.save()
    this.ctx.fillStyle = "#FFFFFF"
    this.ctx.font = `bold ${fontSize}px Inter`
    this.ctx.textAlign = "left"
    this.ctx.fillText(data.artista, profileX + profileSize + 20 * scale, y + profileHeight / 2 - 5 * scale)

    this.ctx.font = `${fontSize * 0.7}px Inter`
    this.ctx.fillStyle = "#9CA3AF"
    this.ctx.fillText(data.especialidad, profileX + profileSize + 20 * scale, y + profileHeight / 2 + 15 * scale)
    this.ctx.restore()
  }

  drawModernLogo(x, y) {
    const scale = Math.min(this.canvas.width / 1200, 1)

    // Logo background
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    this.ctx.shadowBlur = 10 * scale
    this.ctx.shadowOffsetY = 5 * scale

    this.ctx.fillStyle = "#1F2937"
    this.roundRect(this.ctx, x - 10 * scale, y - 30 * scale, 280 * scale, 45 * scale, 20 * scale)
    this.ctx.fill()
    this.ctx.restore()

    // Logo text
    this.ctx.save()
    this.ctx.fillStyle = "#FFFFFF"
    this.ctx.font = `bold ${20 * scale}px Inter`
    this.ctx.textAlign = "left"
    this.ctx.fillText("🎨 Nexo Artistico", x, y)
    this.ctx.restore()
  }

  drawHorizontalScoreMetrics(x, y, width, height, data, scale = 1) {
    const metrics = [
      { label: "Impacto Escénico", value: data.impacto, color: "#10B981" },
      { label: "Ambientación", value: data.ambientacion, color: "#8B5CF6" },
      { label: "Originalidad", value: data.originalidad, color: "#F59E0B" },
      { label: "Color/Delineado", value: data.coloreo, color: "#EF4444" },
      { label: "Dificultad", value: data.dificultad, color: "#06B6D4" },
      { label: "Dinamismo", value: data.dinamismo, color: "#84CC16" },
    ]

    const itemHeight = height / metrics.length
    const fontSize = Math.min(22 * scale, width * 0.06)

    metrics.forEach((metric, index) => {
      const itemY = y + index * itemHeight
      const centerY = itemY + itemHeight / 2

      // Etiqueta de la métrica
      this.ctx.save()
      this.ctx.fillStyle = "#FFFFFF"
      this.ctx.font = `bold ${fontSize}px Inter`
      this.ctx.textAlign = "left"
      this.ctx.fillText(metric.label, x, centerY + fontSize / 3)

      // Barra de progreso
      const barWidth = width * 0.35
      const barHeight = 8 * scale
      const barX = x + width * 0.45
      const barY = centerY - barHeight / 2

      // Fondo de la barra
      this.ctx.fillStyle = "#374151"
      this.roundRect(this.ctx, barX, barY, barWidth, barHeight, 4 * scale)
      this.ctx.fill()

      // Progreso de la barra
      const progress = (metric.value / 10) * barWidth
      this.ctx.fillStyle = metric.color
      this.roundRect(this.ctx, barX, barY, progress, barHeight, 4 * scale)
      this.ctx.fill()

      // Valor numérico alineado a la derecha
      this.ctx.fillStyle = "#FFFFFF"
      this.ctx.font = `bold ${fontSize}px Inter`
      this.ctx.textAlign = "right"
      this.ctx.fillText(metric.value, x + width - 10 * scale, centerY + fontSize / 3)
      this.ctx.restore()
    })
  }

  drawHorizontalArtistProfile(x, y, width, height, data, scale = 1) {
    // Aumentar la altura del perfil
    const profileCardHeight = Math.max(height * 1.3, 120 * scale)

    // Fondo del perfil
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    this.ctx.shadowBlur = 10 * scale
    this.ctx.shadowOffsetY = 5 * scale

    this.ctx.fillStyle = "#1F2937"
    this.roundRect(this.ctx, x, y, width, profileCardHeight, 15 * scale)
    this.ctx.fill()
    this.ctx.restore()

    // Foto de perfil más grande
    const profileSize = Math.min(profileCardHeight * 0.65, 90 * scale)
    const profileX = x + 15 * scale
    const profileY = y + (profileCardHeight - profileSize) / 2

    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2)
    this.ctx.clip()

    if (this.images.torneoPerfil) {
      this.drawImageFit(this.images.torneoPerfil, profileX, profileY, profileSize, profileSize)
    } else {
      this.ctx.fillStyle = "#8B5CF6"
      this.ctx.fill()
    }
    this.ctx.restore()

    // Anillo del perfil
    this.ctx.save()
    this.ctx.strokeStyle = "#8B5CF6"
    this.ctx.lineWidth = 4 * scale
    this.ctx.beginPath()
    this.ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2 + 3 * scale, 0, Math.PI * 2)
    this.ctx.stroke()
    this.ctx.restore()

    // Información del artista con texto más grande
    const fontSize = Math.min(32 * scale, width * 0.08)
    const textX = profileX + profileSize + 20 * scale

    this.ctx.save()
    this.ctx.fillStyle = "#FFFFFF"
    this.ctx.font = `bold ${fontSize}px Inter`
    this.ctx.textAlign = "left"
    this.ctx.fillText(data.artista, textX, y + profileCardHeight / 2 - 8 * scale)

    this.ctx.font = `${fontSize * 0.8}px Inter`
    this.ctx.fillStyle = "#9CA3AF"
    this.ctx.fillText(data.especialidad, textX, y + profileCardHeight / 2 + 25 * scale)
    this.ctx.restore()
  }

  // Métodos de dibujo elegantes para otras plantillas
  drawArtisticElegantBackground() {
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height) / 2,
    )

    if (this.isDarkMode) {
      gradient.addColorStop(0, "#1e1b4b")
      gradient.addColorStop(0.4, "#312e81")
      gradient.addColorStop(0.8, "#1e293b")
      gradient.addColorStop(1, "#0f172a")
    } else {
      gradient.addColorStop(0, "#fdf4ff")
      gradient.addColorStop(0.4, "#f3e8ff")
      gradient.addColorStop(0.8, "#e0e7ff")
      gradient.addColorStop(1, "#c7d2fe")
    }

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawSubtleLighting() {
    // Efectos de iluminación muy sutiles
    const lightSources = [
      { x: 150, y: 150, color: "#8b5cf6", intensity: 0.15 },
      { x: this.canvas.width - 150, y: 200, color: "#ec4899", intensity: 0.12 },
      { x: 200, y: this.canvas.height - 350, color: "#10b981", intensity: 0.1 },
    ]

    lightSources.forEach((light) => {
      this.ctx.save()
      this.ctx.globalAlpha = light.intensity

      const lightGradient = this.ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 100)
      lightGradient.addColorStop(0, light.color)
      lightGradient.addColorStop(1, "transparent")

      this.ctx.fillStyle = lightGradient
      this.ctx.beginPath()
      this.ctx.arc(light.x, light.y, 100, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.restore()
    })
  }

  drawElegantMosaico(x, y, width, height, count) {
    const spacing = 15

    if (count === 1) {
      this.drawElegantFrame(x, y, width, height, 0)
    } else if (count === 2) {
      const halfWidth = (width - spacing) / 2
      this.drawElegantFrame(x, y, halfWidth, height, 0)
      this.drawElegantFrame(x + halfWidth + spacing, y, halfWidth, height, 1)
    } else if (count === 3) {
      const halfHeight = (height - spacing) / 2
      const halfWidth = (width - spacing) / 2
      this.drawElegantFrame(x, y, halfWidth, height, 0)
      this.drawElegantFrame(x + halfWidth + spacing, y, halfWidth, halfHeight, 1)
      this.drawElegantFrame(x + halfWidth + spacing, y + halfHeight + spacing, halfWidth, halfHeight, 2)
    } else if (count === 4) {
      const halfWidth = (width - spacing) / 2
      const halfHeight = (height - spacing) / 2
      this.drawElegantFrame(x, y, halfWidth, halfHeight, 0)
      this.drawElegantFrame(x + halfWidth + spacing, y, halfWidth, halfHeight, 1)
      this.drawElegantFrame(x, y + halfHeight + spacing, halfWidth, halfHeight, 2)
      this.drawElegantFrame(x + halfWidth + spacing, y + halfHeight + spacing, halfWidth, halfHeight, 3)
    }
  }

  drawElegantFrame(x, y, width, height, index) {
    // Marco elegante
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    this.ctx.shadowBlur = 15
    this.ctx.shadowOffsetY = 8

    const frameGradient = this.ctx.createLinearGradient(x, y, x + width, y + height)
    frameGradient.addColorStop(0, this.isDarkMode ? "#374151" : "#ffffff")
    frameGradient.addColorStop(1, this.isDarkMode ? "#1f2937" : "#f8fafc")

    this.ctx.fillStyle = frameGradient
    this.roundRect(this.ctx, x, y, width, height, 20)
    this.ctx.fill()
    this.ctx.restore()

    // Imagen
    const imageMargin = 10
    const imageX = x + imageMargin
    const imageY = y + imageMargin
    const imageWidth = width - imageMargin * 2
    const imageHeight = height - imageMargin * 2

    if (this.images.publicacion[index]) {
      this.ctx.save()
      this.roundRect(this.ctx, imageX, imageY, imageWidth, imageHeight, 15)
      this.ctx.clip()
      this.drawImageFit(this.images.publicacion[index], imageX, imageY, imageWidth, imageHeight)
      this.ctx.restore()
    } else {
      this.ctx.save()
      this.ctx.fillStyle = this.isDarkMode ? "rgba(75, 85, 99, 0.4)" : "rgba(229, 231, 235, 0.6)"
      this.roundRect(this.ctx, imageX, imageY, imageWidth, imageHeight, 15)
      this.ctx.fill()

      this.ctx.fillStyle = this.isDarkMode ? "#9ca3af" : "#6b7280"
      this.ctx.font = "24px Inter"
      this.ctx.textAlign = "center"
      this.ctx.fillText(`🖼️ ${index + 1}`, imageX + imageWidth / 2, imageY + imageHeight / 2)
      this.ctx.restore()
    }

    // Borde elegante
    this.ctx.save()
    this.ctx.strokeStyle = this.isDarkMode ? "rgba(139, 92, 246, 0.3)" : "rgba(124, 58, 237, 0.2)"
    this.ctx.lineWidth = 1.5
    this.roundRect(this.ctx, x, y, width, height, 20)
    this.ctx.stroke()
    this.ctx.restore()
  }

  drawElegantFloatingArtistBadge(x, y, width, data, profileImage) {
    const badgeHeight = 120

    // Fondo elegante
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.25)"
    this.ctx.shadowBlur = 20
    this.ctx.shadowOffsetY = 10

    const badgeGradient = this.ctx.createLinearGradient(x, y, x + width, y + badgeHeight)
    if (this.isDarkMode) {
      badgeGradient.addColorStop(0, "rgba(30, 41, 59, 0.95)")
      badgeGradient.addColorStop(1, "rgba(15, 23, 42, 0.9)")
    } else {
      badgeGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)")
      badgeGradient.addColorStop(1, "rgba(249, 250, 251, 0.9)")
    }

    this.ctx.fillStyle = badgeGradient
    this.roundRect(this.ctx, x, y, width, badgeHeight, 25)
    this.ctx.fill()
    this.ctx.restore()

    // Borde elegante
    this.ctx.save()
    this.ctx.strokeStyle = this.isDarkMode ? "rgba(139, 92, 246, 0.4)" : "rgba(124, 58, 237, 0.3)"
    this.ctx.lineWidth = 2
    this.roundRect(this.ctx, x, y, width, badgeHeight, 25)
    this.ctx.stroke()
    this.ctx.restore()

    // Contenido del badge
    const profileSize = 80
    const profileX = x + 20
    const profileY = y + 20

    // Foto de perfil
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    this.ctx.shadowBlur = 10
    this.ctx.beginPath()
    this.ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2)
    this.ctx.clip()

    if (profileImage) {
      this.drawImageFit(profileImage, profileX, profileY, profileSize, profileSize)
    } else {
      const profileGradient = this.ctx.createRadialGradient(
        profileX + profileSize / 2,
        profileY + profileSize / 2,
        0,
        profileX + profileSize / 2,
        profileY + profileSize / 2,
        profileSize / 2,
      )
      profileGradient.addColorStop(0, this.isDarkMode ? "#475569" : "#e5e7eb")
      profileGradient.addColorStop(1, this.isDarkMode ? "#334155" : "#d1d5db")
      this.ctx.fillStyle = profileGradient
      this.ctx.fill()
    }
    this.ctx.restore()

    // Anillo de perfil elegante
    this.ctx.save()
    this.ctx.strokeStyle = this.isDarkMode ? "#ec4899" : "#db2777"
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2 + 2, 0, Math.PI * 2)
    this.ctx.stroke()
    this.ctx.restore()

    // Información del artista
    this.ctx.save()
    this.ctx.fillStyle = this.isDarkMode ? "#f1f5f9" : "#1f2937"
    this.ctx.font = "bold 22px Inter"
    this.ctx.textAlign = "left"
    this.ctx.fillText(data.artista, profileX + profileSize + 20, y + 50)

    const badge = this.getRoleBadge(data.rol)
    this.ctx.font = "16px Inter"
    this.ctx.fillStyle = this.isDarkMode ? "#cbd5e1" : "#6b7280"
    this.ctx.fillText(data.especialidad || badge.text, profileX + profileSize + 20, y + 75)
    this.ctx.restore()
  }

  drawElegantGalleryLogo(x, y) {
    // Logo elegante
    this.ctx.save()
    this.ctx.fillStyle = this.isDarkMode ? "#f1f5f9" : "#1f2937"
    this.ctx.font = "bold 24px Inter"
    this.ctx.textAlign = "left"
    this.ctx.fillText("🎨 Nexo Artistico", x, y)
    this.ctx.restore()
  }

  // Métodos para plantilla de entrevista elegante
  drawElegantInterviewBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)

    if (this.isDarkMode) {
      gradient.addColorStop(0, "#0f0f23")
      gradient.addColorStop(0.3, "#1a1a3a")
      gradient.addColorStop(0.6, "#2d1b69")
      gradient.addColorStop(1, "#0f172a")
    } else {
      gradient.addColorStop(0, "#fef7ff")
      gradient.addColorStop(0.3, "#faf5ff")
      gradient.addColorStop(0.6, "#f3e8ff")
      gradient.addColorStop(1, "#e9d5ff")
    }

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawSubtleStudioLighting() {
    // Iluminación muy sutil
    const spotlights = [
      { x: this.canvas.width * 0.2, y: 200, intensity: 0.2 },
      { x: this.canvas.width * 0.8, y: 300, intensity: 0.15 },
      { x: this.canvas.width * 0.5, y: 150, intensity: 0.1 },
    ]

    spotlights.forEach((light) => {
      this.ctx.save()
      this.ctx.globalAlpha = light.intensity

      const lightGradient = this.ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 150)
      lightGradient.addColorStop(0, this.isDarkMode ? "rgba(139, 92, 246, 0.4)" : "rgba(255, 255, 255, 0.6)")
      lightGradient.addColorStop(1, "transparent")

      this.ctx.fillStyle = lightGradient
      this.ctx.beginPath()
      this.ctx.arc(light.x, light.y, 150, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.restore()
    })
  }

  drawElegantTitle(text, x, y) {
    // Título elegante
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    this.ctx.shadowBlur = 15
    this.ctx.shadowOffsetY = 6

    const titleGradient = this.ctx.createLinearGradient(x - 320, y - 45, x + 320, y + 25)
    titleGradient.addColorStop(0, this.isDarkMode ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)")
    titleGradient.addColorStop(1, this.isDarkMode ? "rgba(15, 23, 42, 0.85)" : "rgba(249, 250, 251, 0.85)")

    this.ctx.fillStyle = titleGradient
    this.roundRect(this.ctx, x - 340, y - 55, 680, 80, 35)
    this.ctx.fill()
    this.ctx.restore()

    // Borde elegante
    this.ctx.save()
    this.ctx.strokeStyle = this.isDarkMode ? "rgba(139, 92, 246, 0.4)" : "rgba(124, 58, 237, 0.3)"
    this.ctx.lineWidth = 2
    this.roundRect(this.ctx, x - 340, y - 55, 680, 80, 35)
    this.ctx.stroke()
    this.ctx.restore()

    // Texto del título
    this.ctx.save()
    this.ctx.fillStyle = this.isDarkMode ? "#f1f5f9" : "#1f2937"
    this.ctx.font = "bold 46px Inter"
    this.ctx.textAlign = "center"
    this.ctx.fillText(text, x, y)
    this.ctx.restore()
  }

  drawElegantProfileSection(centerX, centerY, data, profileImage) {
    const profileSize = 180

    // Imagen de perfil elegante
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    this.ctx.shadowBlur = 20
    this.ctx.shadowOffsetY = 10

    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, profileSize / 2, 0, Math.PI * 2)
    this.ctx.clip()

    if (profileImage) {
      this.drawImageFit(profileImage, centerX - profileSize / 2, centerY - profileSize / 2, profileSize, profileSize)
    } else {
      const profileGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, profileSize / 2)
      profileGradient.addColorStop(0, this.isDarkMode ? "#374151" : "#e5e7eb")
      profileGradient.addColorStop(1, this.isDarkMode ? "#1f2937" : "#d1d5db")
      this.ctx.fillStyle = profileGradient
      this.ctx.fill()
    }
    this.ctx.restore()

    // Anillo de perfil elegante
    this.ctx.save()
    this.ctx.strokeStyle = this.isDarkMode ? "#8b5cf6" : "#7c3aed"
    this.ctx.lineWidth = 6
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, profileSize / 2 + 4, 0, Math.PI * 2)
    this.ctx.stroke()
    this.ctx.restore()

    // Badge de rol
    const badge = this.getRoleBadge(data.rol)
    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
    this.ctx.shadowBlur = 8
    this.ctx.fillStyle = badge.color
    this.ctx.beginPath()
    this.ctx.arc(centerX + 70, centerY - 70, 30, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.strokeStyle = this.isDarkMode ? "#0f172a" : "#ffffff"
    this.ctx.lineWidth = 3
    this.ctx.stroke()
    this.ctx.restore()

    // Información del artista
    this.ctx.save()
    this.ctx.fillStyle = this.isDarkMode ? "#f1f5f9" : "#1f2937"
    this.ctx.font = "bold 40px Inter"
    this.ctx.textAlign = "center"
    this.ctx.fillText(data.nombre, centerX, centerY + 140)

    this.ctx.font = "26px Inter"
    this.ctx.fillStyle = this.isDarkMode ? "#cbd5e1" : "#6b7280"
    this.ctx.fillText(data.especialidad, centerX, centerY + 175)

    // Descripción
    this.ctx.font = "22px Inter"
    this.drawWrappedText(data.descripcion, centerX, centerY + 220, 800, 30, this.isDarkMode ? "#94a3b8" : "#9ca3af")
    this.ctx.restore()
  }

  drawElegantQASection(pregunta, respuesta, startY, artistName, index) {
    const margin = 100
    const bubbleWidth = this.canvas.width - margin * 2
    const bubblePadding = 35

    // Pregunta elegante
    const questionHeight = this.calculateTextHeight(pregunta, bubbleWidth - bubblePadding * 2, 26) + 100

    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    this.ctx.shadowBlur = 15
    this.ctx.shadowOffsetY = 6

    const questionGradient = this.ctx.createLinearGradient(
      margin,
      startY,
      margin + bubbleWidth,
      startY + questionHeight,
    )
    if (this.isDarkMode) {
      questionGradient.addColorStop(0, "rgba(55, 65, 81, 0.9)")
      questionGradient.addColorStop(1, "rgba(31, 41, 55, 0.85)")
    } else {
      questionGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)")
      questionGradient.addColorStop(1, "rgba(248, 250, 252, 0.85)")
    }

    this.ctx.fillStyle = questionGradient
    this.roundRect(this.ctx, margin, startY, bubbleWidth, questionHeight, 25)
    this.ctx.fill()
    this.ctx.restore()

    // Borde elegante
    this.ctx.save()
    this.ctx.strokeStyle = this.isDarkMode ? "rgba(139, 92, 246, 0.4)" : "rgba(124, 58, 237, 0.3)"
    this.ctx.lineWidth = 2
    this.roundRect(this.ctx, margin, startY, bubbleWidth, questionHeight, 25)
    this.ctx.stroke()
    this.ctx.restore()

    // Emisor de la pregunta
    this.ctx.save()
    this.ctx.fillStyle = "#8b5cf6"
    this.ctx.font = "bold 22px Inter"
    this.ctx.textAlign = "left"
    this.ctx.fillText("🎨 Nexo Artistico", margin + bubblePadding, startY + 40)
    this.ctx.restore()

    // Texto de la pregunta
    this.ctx.save()
    this.ctx.fillStyle = this.isDarkMode ? "#f1f5f9" : "#1f2937"
    this.ctx.font = "26px Inter"
    this.drawWrappedText(pregunta, margin + bubblePadding, startY + 75, bubbleWidth - bubblePadding * 2, 34)
    this.ctx.restore()

    // Respuesta elegante
    const answerY = startY + questionHeight + 40
    const answerHeight = this.calculateTextHeight(respuesta, bubbleWidth - bubblePadding * 2, 26) + 100

    this.ctx.save()
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    this.ctx.shadowBlur = 15
    this.ctx.shadowOffsetY = 6

    const answerGradient = this.ctx.createLinearGradient(margin, answerY, margin + bubbleWidth, answerY + answerHeight)
    if (this.isDarkMode) {
      answerGradient.addColorStop(0, "rgba(30, 58, 138, 0.9)")
      answerGradient.addColorStop(1, "rgba(30, 64, 175, 0.85)")
    } else {
      answerGradient.addColorStop(0, "rgba(219, 234, 254, 0.9)")
      answerGradient.addColorStop(1, "rgba(191, 219, 254, 0.85)")
    }

    this.ctx.fillStyle = answerGradient
    this.roundRect(this.ctx, margin, answerY, bubbleWidth, answerHeight, 25)
    this.ctx.fill()
    this.ctx.restore()

    // Borde elegante
    this.ctx.save()
    this.ctx.strokeStyle = this.isDarkMode ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.3)"
    this.ctx.lineWidth = 2
    this.roundRect(this.ctx, margin, answerY, bubbleWidth, answerHeight, 25)
    this.ctx.stroke()
    this.ctx.restore()

    // Emisor de la respuesta
    this.ctx.save()
    this.ctx.fillStyle = "#3b82f6"
    this.ctx.font = "bold 22px Inter"
    this.ctx.textAlign = "left"
    this.ctx.fillText(`👤 ${artistName}`, margin + bubblePadding, answerY + 40)
    this.ctx.restore()

    // Texto de la respuesta
    this.ctx.save()
    this.ctx.fillStyle = this.isDarkMode ? "#f1f5f9" : "#1f2937"
    this.ctx.font = "26px Inter"
    this.drawWrappedText(respuesta, margin + bubblePadding, answerY + 75, bubbleWidth - bubblePadding * 2, 34)
    this.ctx.restore()

    return answerY + answerHeight
  }

  drawElegantInterviewLogo(x, y) {
    // Logo elegante
    this.ctx.save()
    this.ctx.fillStyle = this.isDarkMode ? "#f1f5f9" : "#1f2937"
    this.ctx.font = "bold 24px Inter"
    this.ctx.textAlign = "left"
    this.ctx.fillText("💬 Nexo Artistico", x, y)
    this.ctx.restore()
  }

  // Métodos auxiliares
  getAspectRatio(aspectString) {
    const [width, height] = aspectString.split(":").map(Number)
    return width / height
  }

  getTorneoData() {
    return {
      artista: document.getElementById("torneo-artista").value,
      posicion: document.getElementById("torneo-posicion").value,
      total: document.getElementById("torneo-total").value,
      impacto: document.getElementById("torneo-impacto").value,
      ambientacion: document.getElementById("torneo-ambientacion").value,
      originalidad: document.getElementById("torneo-originalidad").value,
      coloreo: document.getElementById("torneo-coloreo").value,
      dificultad: document.getElementById("torneo-dificultad").value,
      dinamismo: document.getElementById("torneo-dinamismo").value,
      rol: document.getElementById("torneo-rol").value,
      especialidad: document.getElementById("torneo-especialidad").value,
      aspecto: document.getElementById("torneo-aspecto").value,
    }
  }

  getPublicacionData() {
    return {
      artista: document.getElementById("publicacion-artista").value,
      rol: document.getElementById("publicacion-rol").value,
      especialidad: document.getElementById("publicacion-especialidad").value,
    }
  }

  getEntrevistaData() {
    return {
      nombre: document.getElementById("entrevista-artista").value,
      rol: document.getElementById("entrevista-rol").value,
      especialidad: document.getElementById("entrevista-especialidad").value,
      descripcion: document.getElementById("entrevista-descripcion").value,
    }
  }

  getQAData() {
    const qaData = []
    document.querySelectorAll(".qa-pair").forEach((pair) => {
      const pregunta = pair.querySelector(".entrevista-pregunta").value
      const respuesta = pair.querySelector(".entrevista-respuesta").value
      qaData.push({ pregunta, respuesta })
    })

    return qaData
  }

  getRoleBadge(rol) {
    const badges = {
      founder: { text: "Fundador", color: "#fbbf24", icon: "👑" },
      admin: { text: "Admin", color: "#8b5cf6", icon: "⭐" },
      member: { text: "Miembro", color: "#3b82f6", icon: "👤" },
    }
    return badges[rol] || badges.member
  }

  getPositionStyle(position) {
    const getColorForPosition = (pos) => {
      const posNum = Number.parseInt(pos.replace(/\D/g, ""))

      if (posNum <= 3) {
        if (posNum === 1)
          return {
            gradientStart: "#FFD700",
            gradientEnd: "#FFA500",
            textColor: "#8B4513",
            hasBorder: true,
            borderColor: "#FFD700",
            hasShadow: true,
            shadowColor: "rgba(255, 215, 0, 0.5)",
          }
        if (posNum === 2)
          return {
            gradientStart: "#C0C0C0",
            gradientEnd: "#A8A8A8",
            textColor: "#2F4F4F",
            hasBorder: true,
            borderColor: "#C0C0C0",
            hasShadow: true,
            shadowColor: "rgba(192, 192, 192, 0.5)",
          }
        if (posNum === 3)
          return {
            gradientStart: "#CD7F32",
            gradientEnd: "#B87333",
            textColor: "#FFFFFF",
            hasBorder: true,
            borderColor: "#CD7F32",
            hasShadow: true,
            shadowColor: "rgba(205, 127, 50, 0.5)",
          }
      } else if (posNum <= 10) {
        const ratio = (posNum - 4) / 6
        return {
          gradientStart: `hsl(${270 - ratio * 30}, 70%, 60%)`,
          gradientEnd: `hsl(${270 - ratio * 30}, 70%, 45%)`,
          textColor: "#FFFFFF",
        }
      } else if (posNum <= 20) {
        const ratio = (posNum - 11) / 9
        return {
          gradientStart: `hsl(${240 - ratio * 60}, 70%, 55%)`,
          gradientEnd: `hsl(${240 - ratio * 60}, 70%, 40%)`,
          textColor: "#FFFFFF",
        }
      } else if (posNum <= 30) {
        const ratio = (posNum - 21) / 9
        return {
          gradientStart: `hsl(${120 + ratio * 60}, 70%, 50%)`,
          gradientEnd: `hsl(${120 + ratio * 60}, 70%, 35%)`,
          textColor: "#FFFFFF",
        }
      } else {
        const ratio = (posNum - 31) / 9
        return {
          gradientStart: `hsl(${30 - ratio * 15}, 70%, 55%)`,
          gradientEnd: `hsl(${30 - ratio * 15}, 70%, 40%)`,
          textColor: "#FFFFFF",
        }
      }
    }

    const styles = {
      "1er": {
        icon: "🥇",
        text: "PRIMER LUGAR",
        fontSize: 18,
        ...getColorForPosition("1er"),
      },
      "2do": {
        icon: "🥈",
        text: "SEGUNDO LUGAR",
        fontSize: 17,
        ...getColorForPosition("2do"),
      },
      "3er": {
        icon: "🥉",
        text: "TERCER LUGAR",
        fontSize: 17,
        ...getColorForPosition("3er"),
      },
    }

    const posNum = Number.parseInt(position.replace(/\D/g, ""))
    if (posNum >= 4 && posNum <= 40 && !styles[position]) {
      const colors = getColorForPosition(position)
      return {
        icon: posNum <= 10 ? "🏅" : "",
        text: position.toUpperCase().replace(/(\d+)/, "$1°") + " LUGAR",
        fontSize: posNum <= 10 ? 17 : 16,
        gradientStart: colors.gradientStart,
        gradientEnd: colors.gradientEnd,
        textColor: colors.textColor,
        hasBorder: false,
        hasShadow: false,
      }
    }

    return (
      styles[position] || {
        icon: "",
        text: position.toUpperCase() + " LUGAR",
        gradientStart: "#6B7280",
        gradientEnd: "#4B5563",
        textColor: "#FFFFFF",
        fontSize: 16,
        hasBorder: false,
        hasShadow: false,
      }
    )
  }

  calculateTextHeight(text, maxWidth, fontSize) {
    this.ctx.font = `${fontSize}px Inter`
    const words = text.split(" ")
    let line = ""
    let lineCount = 1

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " "
      const metrics = this.ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        line = words[n] + " "
        lineCount++
      } else {
        line = testLine
      }
    }

    return lineCount * (fontSize + 8)
  }

  drawImageFit(img, x, y, width, height) {
    const imgRatio = img.width / img.height
    const areaRatio = width / height

    let drawWidth, drawHeight, drawX, drawY

    if (imgRatio > areaRatio) {
      drawHeight = height
      drawWidth = height * imgRatio
      drawX = x - (drawWidth - width) / 2
      drawY = y
    } else {
      drawWidth = width
      drawHeight = width / imgRatio
      drawX = x
      drawY = y - (drawHeight - height) / 2
    }

    this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
  }

  drawWrappedText(text, x, y, maxWidth, lineHeight, color = null) {
    if (color) this.ctx.fillStyle = color

    const words = text.split(" ")
    let line = ""
    let currentY = y

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " "
      const metrics = this.ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        this.ctx.fillText(line, x, currentY)
        line = words[n] + " "
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    this.ctx.fillText(line, x, currentY)
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  downloadImage() {
    this.finalCtx.clearRect(0, 0, this.finalCanvas.width, this.finalCanvas.height)

    const originalCanvas = this.canvas
    const originalCtx = this.ctx
    this.canvas = this.finalCanvas
    this.ctx = this.finalCtx

    this.updatePreview()

    const link = document.createElement("a")
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const aspectRatio = document.getElementById("canvas-aspect").value.replace(":", "x")
    link.download = `nexo-${this.currentTemplate}-${aspectRatio}-${timestamp}.png`
    link.href = this.finalCanvas.toDataURL("image/png", 1.0)
    link.click()

    this.canvas = originalCanvas
    this.ctx = originalCtx

    this.showSuccessMessage("¡Imagen descargada exitosamente!")
  }

  showSuccessMessage(message) {
    const messageEl = document.createElement("div")
    messageEl.className = "success-message"
    messageEl.textContent = message
    document.body.appendChild(messageEl)

    setTimeout(() => messageEl.classList.add("show"), 100)
    setTimeout(() => {
      messageEl.classList.remove("show")
      setTimeout(() => document.body.removeChild(messageEl), 300)
    }, 3000)
  }
}

// Initialize when DOM is loaded
let app
document.addEventListener("DOMContentLoaded", () => {
  app = new PlantillasRedes()
})
