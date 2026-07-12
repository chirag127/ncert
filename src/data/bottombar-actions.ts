import type { BottomBarAction } from '~/components/BottomBar.astro'

export const bottomBarActions: BottomBarAction[] = [
  { icon: '⌂', label: 'Home', href: '/' },
  { icon: '☷', label: 'Classes', href: '/classes/' },
  { icon: '⌕', label: 'Search', href: '/search/' },
  { icon: '↓', label: 'Downloads', href: '/downloads/' },
  { icon: '☰', label: 'Menu', href: '#sb-toggle' },
]
