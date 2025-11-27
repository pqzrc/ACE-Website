# Style Guide - ACE 2025

## Palette de Couleurs

### Couleurs Principales

| Nom | Code Hex | Variable CSS | Description |
|-----|----------|--------------|-------------|
| Deep Navy | `#050511` | `--color-deep-navy` | Couleur de fond principale (noir bleuté) |
| Midnight Blue | `#0f0e4a` | `--color-midnight-blue` | Bleu foncé pour les surfaces |
| Neon Rose | `#fc10ca` | `--color-neon-rose` | Rose néon pour les accents |
| Sky Aqua | `#09c7df` | `--color-sky-aqua` | Cyan/bleu clair pour les accents |
| Lavender Mist | `#f6f2f9` | `--color-lavender-mist` | Lavande clair |

### Variations de Surface

| Nom | Valeur | Variable CSS | Description |
|-----|--------|--------------|-------------|
| Surface | `rgba(15, 14, 74, 0.6)` | `--color-surface` | Surface principale avec transparence |
| Surface Light | `rgba(255, 255, 255, 0.05)` | `--color-surface-light` | Surface claire avec transparence |
| Surface Dark | `rgba(0, 0, 0, 0.3)` | `--color-surface-dark` | Surface sombre avec transparence |

### Couleurs de Statut

| Nom | Code Hex | Variable CSS | Description |
|-----|----------|--------------|-------------|
| Success | `#00ff9d` | `--color-status-success` | Vert pour les succès |
| Error | `#ff0055` | `--color-status-error` | Rouge pour les erreurs |
| Warning | `#ffbe0b` | `--color-status-warning` | Jaune pour les avertissements |

### Couleurs de Base

| Nom | Code Hex | Variable CSS | Description |
|-----|----------|--------------|-------------|
| Background | `#050511` | `--background` | Fond par défaut |
| Foreground | `#ffffff` | `--foreground` | Texte par défaut (blanc) |

### Ombres Personnalisées

| Nom | Valeur | Variable CSS | Description |
|-----|--------|--------------|-------------|
| Neon Shadow | `0 0 20px rgba(252, 16, 202, 0.5)` | `--shadow-neon` | Ombre néon rose |
| Neon Blue Shadow | `0 0 20px rgba(9, 199, 223, 0.5)` | `--shadow-neon-blue` | Ombre néon bleu |
| Glass Shadow | `0 8px 32px 0 rgba(0, 0, 0, 0.37)` | `--shadow-glass` | Ombre effet verre |

## Polices

### Polices Principales

| Nom | Variable CSS | Usage | Source |
|-----|--------------|-------|--------|
| **Inter** | `--font-inter` | Police principale (sans-serif) | Google Fonts |
| **Space Grotesk** | `--font-space` | Police d'affichage (display) | Google Fonts |

### Classes Tailwind

| Classe | Police | Usage |
|-------|--------|-------|
| `font-sans` | Inter | Texte général, corps de texte |
| `font-display` | Space Grotesk | Titres, éléments d'affichage |
| `font-mono` | Monospace (système) | Code, identifiants, données techniques |

### Configuration

Les polices sont chargées via Next.js Font Optimization :

```typescript
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space",
});
```

### Utilisation dans le Code

- **Corps de texte** : `font-sans` (Inter)
- **Titres et éléments d'affichage** : `font-display` (Space Grotesk)
- **Code et données techniques** : `font-mono` (Monospace système)

## Notes de Design

- Le thème utilise un fond sombre (`deep-navy`) avec des accents néon (`neon-rose`, `sky-aqua`)
- Les surfaces utilisent un effet de verre (glass morphism) avec transparence
- Les ombres néon créent un effet lumineux pour les éléments interactifs
- Les polices Inter et Space Grotesk créent un contraste moderne entre lisibilité et style

