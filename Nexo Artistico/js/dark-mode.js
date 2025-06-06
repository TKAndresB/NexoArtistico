// ===================================
// MODO OSCURO - FUNCIONALIDAD MEJORADA
// ===================================

class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme() || this.getSystemTheme()
    this.init()
  }

  init() {
    // Aplicar tema inicial
    this.applyTheme(this.theme)

    // Configurar botones de tema
    this.setupThemeToggles()

    // Escuchar cambios en el sistema
    this.listenToSystemChanges()

    console.log("🎨 Theme Manager initialized:", this.theme)
  }

  getStoredTheme() {
    try {
      return localStorage.getItem("theme")
    } catch (e) {
      console.warn("localStorage not available")
      return null
    }
  }

  getSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark"
    }
    return "light"
  }

  applyTheme(theme) {
    const html = document.documentElement
    const body = document.body

    // Remover clases anteriores
    html.removeAttribute("data-theme")
    body.classList.remove("light-theme", "dark-theme")

    // Aplicar nuevo tema
    if (theme === "dark") {
      html.setAttribute("data-theme", "dark")
      body.classList.add("dark-theme")
    } else {
      html.setAttribute("data-theme", "light")
      body.classList.add("light-theme")
    }

    this.theme = theme
    this.updateThemeIcons()
    this.storeTheme(theme)

    console.log("🎨 Theme applied:", theme)
  }

  updateThemeIcons() {
    const themeToggles = document.querySelectorAll(".theme-toggle")

    themeToggles.forEach((toggle) => {
      const icon = toggle.querySelector("i")
      if (icon) {
        if (this.theme === "dark") {
          icon.className = "fas fa-sun"
          toggle.setAttribute("aria-label", "Cambiar a modo claro")
          toggle.setAttribute("title", "Cambiar a modo claro")
        } else {
          icon.className = "fas fa-moon"
          toggle.setAttribute("aria-label", "Cambiar a modo oscuro")
          toggle.setAttribute("title", "Cambiar a modo oscuro")
        }
      }
    })
  }

  setupThemeToggles() {
    const themeToggles = document.querySelectorAll(".theme-toggle")

    themeToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        this.toggleTheme()
      })
    })

    console.log("🎨 Theme toggles configured:", themeToggles.length)
  }

  toggleTheme() {
    const newTheme = this.theme === "dark" ? "light" : "dark"
    this.applyTheme(newTheme)

    // Animación suave
    document.body.style.transition = "background-color 0.3s ease, color 0.3s ease"
    setTimeout(() => {
      document.body.style.transition = ""
    }, 300)
  }

  storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme)
    } catch (e) {
      console.warn("Could not store theme preference")
    }
  }

  listenToSystemChanges() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", (e) => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? "dark" : "light")
        }
      })
    }
  }

  // Método público para cambiar tema programáticamente
  setTheme(theme) {
    if (theme === "dark" || theme === "light") {
      this.applyTheme(theme)
    }
  }

  // Método público para obtener tema actual
  getCurrentTheme() {
    return this.theme
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.themeManager = new ThemeManager()
})

// También inicializar inmediatamente para evitar flash
if (document.readyState === "loading") {
  // DOM aún cargando
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.themeManager) {
      window.themeManager = new ThemeManager()
    }
  })
} else {
  // DOM ya cargado
  if (!window.themeManager) {
    window.themeManager = new ThemeManager()
  }
}

// Exportar para uso global
window.ThemeManager = ThemeManager
