"use client"

import { useEffect, useState } from "react"

export default function IframeHandler() {
  const [isInIframe, setIsInIframe] = useState(false)

  useEffect(() => {
    // Check if we're in an iframe
    setIsInIframe(window !== window.parent)

    // Function to send height updates to parent
    const sendHeightToParent = () => {
      if (window !== window.parent) {
        const height = document.body.scrollHeight
        window.parent.postMessage({ type: "RESIZE_IFRAME", height }, "*")
      }
    }

    // Set up resize observer to detect height changes
    const resizeObserver = new ResizeObserver(() => {
      sendHeightToParent()
    })

    // Observe the body element
    resizeObserver.observe(document.body)

    // Send initial height
    sendHeightToParent()

    // Set up message listener for parent communication
    const handleMessage = (event: MessageEvent) => {
      // Handle messages from parent
      if (event.data && event.data.type === "CHECK_READY") {
        // Send a message back to confirm the iframe is ready
        window.parent.postMessage(
          {
            type: "IFRAME_READY",
            height: document.body.scrollHeight,
          },
          "*",
        )
      }
    }

    window.addEventListener("message", handleMessage)

    // Clean up
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  // Send modal state changes to parent
  useEffect(() => {
    // Function to watch for modal elements being added/removed from DOM
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          // Check if any modals were added or removed
          const modalAdded = Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === 1 &&
              ((node as Element).classList?.contains("fixed") || (node as Element).querySelector(".fixed")),
          )

          const modalRemoved = Array.from(mutation.removedNodes).some(
            (node) =>
              node.nodeType === 1 &&
              ((node as Element).classList?.contains("fixed") || (node as Element).querySelector(".fixed")),
          )

          if (modalAdded) {
            window.parent.postMessage(
              {
                type: "MODAL_STATE_CHANGED",
                isOpen: true,
              },
              "*",
            )

            // Increase iframe height when modal is opened
            if (window !== window.parent) {
              window.parent.postMessage(
                {
                  type: "RESIZE_IFRAME",
                  height: Math.max(document.body.scrollHeight, 1200), // Ensure enough space for modal
                },
                "*",
              )
            }
          } else if (modalRemoved) {
            window.parent.postMessage(
              {
                type: "MODAL_STATE_CHANGED",
                isOpen: false,
              },
              "*",
            )

            // Reset height when modal is closed
            if (window !== window.parent) {
              window.parent.postMessage(
                {
                  type: "RESIZE_IFRAME",
                  height: document.body.scrollHeight,
                },
                "*",
              )
            }
          }
        }
      }
    })

    // Start observing the document body for modal changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null // This component doesn't render anything
}
