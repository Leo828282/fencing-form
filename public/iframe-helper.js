// Enhanced iframe helper script for better responsiveness and communication
;(() => {
  // Function to send height updates to parent
  function updateHeight() {
    const height = document.body.scrollHeight
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "resize", height: height }, "*")
    }
  }

  // Update height on load and whenever content changes
  window.addEventListener("load", () => {
    // Initial delay to ensure all content is rendered
    setTimeout(updateHeight, 300)
  })
  window.addEventListener("resize", updateHeight)

  // Set up a MutationObserver to detect DOM changes
  const observer = new MutationObserver(() => {
    // Small delay to ensure all DOM updates are complete
    setTimeout(updateHeight, 100)
  })

  // Start observing once DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    })
  })

  // Listen for form submission success
  document.addEventListener("formSubmitted", (e) => {
    // Notify parent window
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "formSubmitted", success: true }, "*")
    }
  })

  // Listen for modal open/close events to adjust height
  document.addEventListener("modalStateChanged", (e) => {
    updateHeight()
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "modalStateChanged",
          isOpen: e.detail.isOpen,
          modalType: e.detail.modalType,
        },
        "*",
      )
    }
  })

  // Expose a function to trigger form submission from parent
  window.submitFormFromParent = (formData) => {
    // Find the form in the iframe
    const form = document.querySelector("form")
    if (!form) return false

    // Fill in the form fields
    for (const key in formData) {
      const input = form.querySelector(`[name="${key}"]`)
      if (input) input.value = formData[key]
    }

    // Submit the form
    form.submit()
    return true
  }

  // Function to handle viewport adjustments for mobile
  function adjustForMobile() {
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      const meta = document.createElement("meta")
      meta.name = "viewport"
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      document.head.appendChild(meta)
    }
  }

  // Run mobile adjustments
  adjustForMobile()
})()
