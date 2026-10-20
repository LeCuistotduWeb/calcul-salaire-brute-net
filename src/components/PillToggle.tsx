import { useId, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface PillOption<T> {
  value: T
  label: string
}

interface PillToggleProps<T extends string | number> {
  legend: string
  options: PillOption<T>[]
  value: T
  onChange: (v: T) => void
}

export function PillToggle<T extends string | number>({
  legend,
  options,
  value,
  onChange,
}: PillToggleProps<T>) {
  const legendId = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  // Navigation clavier d'un radiogroup : flèches pour changer d'option.
  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const dir =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0
    if (dir === 0) return
    e.preventDefault()
    const next = (index + dir + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <fieldset className="border-0 p-0 m-0 min-w-0">
      <legend
        id={legendId}
        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5"
      >
        {legend}
      </legend>
      <div
        role="radiogroup"
        aria-labelledby={legendId}
        className="flex rounded-xl bg-muted p-1 gap-0.5"
      >
        {options.map((opt, i) => {
          const selected = value === opt.value
          return (
            <button
              key={String(opt.value)}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(opt.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={cn(
                'flex-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap',
                selected
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-soft hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
