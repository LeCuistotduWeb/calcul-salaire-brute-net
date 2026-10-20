import { Sun, Moon } from 'lucide-react'

interface DarkModeToggleProps {
  dark: boolean
  onToggle: () => void
}

export function DarkModeToggle({ dark, onToggle }: DarkModeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="mt-1 flex-shrink-0 w-9 h-9 rounded-xl island-shell flex items-center justify-center cursor-pointer text-soft hover:text-foreground transition-colors"
    >
      {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  )
}
