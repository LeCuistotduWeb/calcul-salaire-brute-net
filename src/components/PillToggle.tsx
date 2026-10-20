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
  return (
    <fieldset className="border-0 p-0 m-0 min-w-0">
      <legend className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
        {legend}
      </legend>
      <div role="radiogroup" className="flex rounded-xl bg-muted p-1 gap-0.5">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap',
              value === opt.value
                ? 'bg-[var(--bg-surface-strong)] text-[var(--text-base)] shadow-sm'
                : 'text-[var(--text-soft)] hover:text-[var(--text-base)]',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
