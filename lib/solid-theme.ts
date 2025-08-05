export const solidTheme = {
  // Background colors (solid, no transparency)
  backgrounds: {
    primary: '#ffffff',           // Pure white background
    secondary: '#f8fafc',         // Light gray background
    tertiary: '#f1f5f9',          // Slightly darker gray
    surface: '#ffffff',           // Card/surface background
    muted: '#f8fafc',            // Muted background
    accent: '#e2e8f0',           // Accent background
    sidebar: '#1e293b',          // Dark sidebar
    header: '#ffffff'            // Header background
  },
  
  // Text colors
  text: {
    primary: '#0f172a',          // Dark text
    secondary: '#475569',        // Medium gray text
    muted: '#64748b',           // Light gray text
    inverse: '#ffffff',         // White text for dark backgrounds
    accent: '#3b82f6',          // Blue accent text
    success: '#059669',         // Green text
    warning: '#d97706',         // Orange text
    error: '#dc2626'            // Red text
  },
  
  // Border colors
  borders: {
    default: '#e2e8f0',         // Default border
    light: '#f1f5f9',           // Light border
    medium: '#cbd5e1',          // Medium border
    dark: '#94a3b8',            // Dark border
    accent: '#3b82f6'           // Accent border
  },
  
  // Component specific colors
  components: {
    card: {
      background: '#ffffff',
      border: '#e2e8f0',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    },
    button: {
      primary: {
        background: '#3b82f6',
        hover: '#2563eb',
        text: '#ffffff'
      },
      secondary: {
        background: '#f1f5f9',
        hover: '#e2e8f0',
        text: '#475569'
      },
      success: {
        background: '#059669',
        hover: '#047857',
        text: '#ffffff'
      },
      warning: {
        background: '#d97706',
        hover: '#b45309',
        text: '#ffffff'
      },
      danger: {
        background: '#dc2626',
        hover: '#b91c1c',
        text: '#ffffff'
      }
    },
    input: {
      background: '#ffffff',
      border: '#d1d5db',
      focus: '#3b82f6',
      placeholder: '#9ca3af'
    },
    sidebar: {
      background: '#1e293b',
      hover: '#334155',
      active: '#3b82f6',
      text: '#e2e8f0',
      textHover: '#ffffff'
    },
    metrics: {
      sales: {
        background: '#dcfdf7',
        border: '#10b981',
        text: '#065f46'
      },
      purchases: {
        background: '#dbeafe',
        border: '#3b82f6',
        text: '#1e40af'
      },
      profit: {
        background: '#f3e8ff',
        border: '#8b5cf6',
        text: '#6b21a8'
      },
      inventory: {
        background: '#fef3c7',
        border: '#f59e0b',
        text: '#92400e'
      }
    }
  },
  
  // Chart colors
  charts: {
    primary: '#3b82f6',
    secondary: '#10b981',
    tertiary: '#f59e0b',
    quaternary: '#ef4444',
    quinary: '#8b5cf6',
    senary: '#06b6d4'
  }
}

// CSS custom properties for the theme
export const generateCSSVariables = () => {
  return `
    :root {
      /* Background colors */
      --bg-primary: ${solidTheme.backgrounds.primary};
      --bg-secondary: ${solidTheme.backgrounds.secondary};
      --bg-tertiary: ${solidTheme.backgrounds.tertiary};
      --bg-surface: ${solidTheme.backgrounds.surface};
      --bg-muted: ${solidTheme.backgrounds.muted};
      --bg-accent: ${solidTheme.backgrounds.accent};
      --bg-sidebar: ${solidTheme.backgrounds.sidebar};
      --bg-header: ${solidTheme.backgrounds.header};
      
      /* Text colors */
      --text-primary: ${solidTheme.text.primary};
      --text-secondary: ${solidTheme.text.secondary};
      --text-muted: ${solidTheme.text.muted};
      --text-inverse: ${solidTheme.text.inverse};
      --text-accent: ${solidTheme.text.accent};
      --text-success: ${solidTheme.text.success};
      --text-warning: ${solidTheme.text.warning};
      --text-error: ${solidTheme.text.error};
      
      /* Border colors */
      --border-default: ${solidTheme.borders.default};
      --border-light: ${solidTheme.borders.light};
      --border-medium: ${solidTheme.borders.medium};
      --border-dark: ${solidTheme.borders.dark};
      --border-accent: ${solidTheme.borders.accent};
      
      /* Component colors */
      --card-bg: ${solidTheme.components.card.background};
      --card-border: ${solidTheme.components.card.border};
      --card-shadow: ${solidTheme.components.card.shadow};
    }
  `
}

// Tailwind theme extension
export const tailwindThemeExtension = {
  colors: {
    background: {
      primary: solidTheme.backgrounds.primary,
      secondary: solidTheme.backgrounds.secondary,
      tertiary: solidTheme.backgrounds.tertiary,
      surface: solidTheme.backgrounds.surface,
      muted: solidTheme.backgrounds.muted,
      accent: solidTheme.backgrounds.accent,
      sidebar: solidTheme.backgrounds.sidebar,
      header: solidTheme.backgrounds.header
    },
    text: {
      primary: solidTheme.text.primary,
      secondary: solidTheme.text.secondary,
      muted: solidTheme.text.muted,
      inverse: solidTheme.text.inverse,
      accent: solidTheme.text.accent,
      success: solidTheme.text.success,
      warning: solidTheme.text.warning,
      error: solidTheme.text.error
    },
    border: {
      default: solidTheme.borders.default,
      light: solidTheme.borders.light,
      medium: solidTheme.borders.medium,
      dark: solidTheme.borders.dark,
      accent: solidTheme.borders.accent
    }
  }
}
