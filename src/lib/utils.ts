import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse text with markdown-style star patterns and return styled React elements
 * Supports:
 * - ***text*** → underlined
 * - **text** → italic
 * - *text* → bold
 */
export function parseStyledText(text: string): React.ReactNode[] {
  if (!text) return []

  const elements: React.ReactNode[] = []
  let lastIndex = 0

  // Pattern to match ***, **, or * followed by text and the same closing pattern
  const regex = /(\*{1,3})(.+?)\1/g
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index))
    }

    const stars = match[1]
    const content = match[2]

    if (stars === '***') {
      // Underline
      elements.push(
        React.createElement(
          'u',
          { key: `u-${elements.length}`, className: 'underline decoration-2 underline-offset-2' },
          content
        )
      )
    } else if (stars === '**') {
      // Italic
      elements.push(
        React.createElement(
          'em',
          { key: `em-${elements.length}`, className: 'italic' },
          content
        )
      )
    } else if (stars === '*') {
      // Bold
      elements.push(
        React.createElement(
          'strong',
          { key: `strong-${elements.length}`, className: 'font-semibold' },
          content
        )
      )
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex))
  }

  return elements.length > 0 ? elements : [text]
}
