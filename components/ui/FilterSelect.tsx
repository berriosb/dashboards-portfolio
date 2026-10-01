'use client';

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

export interface FilterSelectOption {
  label: string;
  value: string;
}

export interface FilterSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: FilterSelectOption[];
  placeholder?: string;
  allLabel?: string;
  /**
   * Texto a mostrar cuando `value` no corresponde a ninguna opción.
   *
   * Sin esto, un valor fuera del catálogo (por ejemplo un rango de fechas
   * deep-linkeado) deja el trigger con un `<span>` vacío: Radix sóloinjecta el
   * texto del `Item` seleccionado y, si no hay `Item` que coincida, no escribe
   * nada. El control queda mostrando sólo el ícono.
   */
  fallbackLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: 'blue' | 'emerald' | 'amber';
  ariaLabel: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  allLabel,
  fallbackLabel,
  icon: Icon,
  accentColor = 'blue',
  ariaLabel,
  className = '',
}: FilterSelectProps) {
  const iconColorClass = {
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
  }[accentColor];

  const internalValue = value ?? '__all__';

  const handleValueChange = (newVal: string) => {
    onChange(newVal === '__all__' ? null : newVal);
  };

  /**
   * Texto que se dibuja SIEMPRE dentro del trigger.
   *
   * `SelectPrimitive.Value` sin `children` depende de que el `Item` activo le
   * inyecte su `ItemText` por portal: si el valor no corresponde a ningún `Item`
   * (caso del rango de fechas, que no tiene item "todos"), el portal no inyecta
   * nada y el span queda vacío. Al pasar `children` explícitos el control nunca
   * puede renderizarse sin etiqueta.
   */
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel =
    value === null
      ? (allLabel ?? fallbackLabel ?? placeholder)
      : (selectedOption?.label ?? fallbackLabel ?? placeholder);

  return (
    <SelectPrimitive.Root value={internalValue} onValueChange={handleValueChange}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={`inline-flex items-center justify-between gap-2 text-xs min-h-11 pl-2.5 pr-2 rounded-lg border border-border/80 bg-background text-foreground font-medium transition-all shadow-2xs hover:bg-muted/40 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer select-none ${className}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${iconColorClass}`} />}
          <SelectPrimitive.Value placeholder={placeholder}>{displayLabel}</SelectPrimitive.Value>
        </div>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-70" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={5}
          className="z-50 min-w-[10rem] max-h-[19rem] overflow-hidden rounded-xl border border-border/80 bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <SelectPrimitive.Viewport className="p-0.5">
            {allLabel && (
              <SelectPrimitive.Item
                value="__all__"
                className="relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-2 pr-7 text-xs font-medium outline-none transition-colors hover:bg-muted data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
              >
                <SelectPrimitive.ItemText>{allLabel}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            )}

            {options.map((opt, idx) => (
              <SelectPrimitive.Item
                key={`${opt.value}-${idx}`}
                value={opt.value}
                className="relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-2 pr-7 text-xs font-medium outline-none transition-colors hover:bg-muted data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
