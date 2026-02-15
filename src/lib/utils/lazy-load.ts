/**
 * lazy-load
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

/**
 * Image lazy loading utilities
 *
 * Provides utilities for lazy loading images and optimizing page load performance
 */

/**
 * Lazy load image when element enters viewport
 */
export function observeLazyImage(
  imgElement: HTMLImageElement,
  src: string,
  placeholder?: string
): () => void {
  // Create IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Load image
        imgElement.src = src
        imgElement.classList.remove('lazy-loading')

        // Stop observing this element
        observer.unobserve(imgElement)
      }
    })
  })

  // Add lazy-loading class
  imgElement.classList.add('lazy-loading')

  // Set placeholder
  if (placeholder) {
    imgElement.dataset.placeholder = placeholder
  }

  // Start observing
  observer.observe(imgElement)

  // Return cleanup function
  return () => {
    observer.disconnect()
  }
}

/**
 * Load all images in a container
 */
export function lazyLoadImages(container: HTMLElement, selector: string = 'img[data-lazy]'): void {
  const images = container.querySelectorAll(selector)

  images.forEach((img) => {
    const src = img.dataset.src
    const placeholder = img.dataset.placeholder

    if (!src) {
      console.warn('Image missing data-src attribute')
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement

          // Load image
          img.src = src
          img.onload = () => {
            img.classList.remove('lazy-loading')
          }

          observer.unobserve(img)
        }
      })
    })

    observer.observe(img)
  })
}

/**
 * Generate blurhash placeholder (data URL for performance)
 */
export function generateBlurhash(width: number, height: number): string {
  // This is a simplified implementation
  // In production, use a real blurhash service
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return 'data:image/svg+xml;base64,PHN2ZyBDOkQGZIebyB8gP6Y2R68h3a+3NyqB8+PyB8bm50N2+IDkvqGSk+AAAAAXNSoCoMAAD82RwA8MD8wMAA0=' // Simple placeholder
  }

  // Fill with light gray
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(0, 0, width, height)

  return canvas.toDataURL()
}

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()

      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))

      // Add cache busting
      const separator = url.includes('?') ? '&' : '?'
      const cacheBuster = `t=${Date.now()}`
      img.src = `${url}${url.includes('?') ? separator : '&'}${cacheBuster}`

      // Load after a short delay to avoid blocking
      setTimeout(() => {
        img.src = url
      }, Math.random() * 100)
    })
  })

  try {
    await Promise.race([Promise.all(promises), new Promise<void>((resolve) => setTimeout(resolve, 3000))])
  } catch (error) {
    console.error('Error preloading images:', error)
  }
}

/**
 * Get image priority based on viewport
 */
export function getResponsiveImageSrc(src: string): string {
  // Simple implementation - return same src
  // In production, you might have different URLs for different screen sizes
  return src
}

/**
 * Setup progressive image loading
 */
export function setupProgressiveImageLoading(imgElement: HTMLImageElement): void {
  const src = imgElement.dataset.src || ''

  if (!src) {
    console.warn('Image missing data-src attribute')
    return
  }

  // Load low quality first
  const lowQualitySrc = `${src}?q=10`
  const mediumQualitySrc = `${src}?q=50`
  const highQualitySrc = src

  imgElement.src = lowQualitySrc

  imgElement.onload = () => {
    imgElement.src = mediumQualitySrc

    setTimeout(() => {
      imgElement.src = highQualitySrc
    }, 200)
  }
}

/**
 * Calculate image aspect ratio
 */
export function getImageAspectRatio(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const ratio = img.width / img.height
      resolve(ratio)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => any>(
  func: T,
  wait: number
): (...args: unknown[]) => void {
  let timeout: ReturnType<typeof setTimeout>

  return (...args: unknown[]) => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      func(...args)
      timeout = undefined
    }, wait)
  }
}
