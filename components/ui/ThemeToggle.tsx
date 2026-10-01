'use client';

import React, { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { acentoDeRuta } from '@/lib/dashboard-accent';

type Theme = 'light' | 'dark';

/**
 * Suscripción al toggle de tema.
 *
 * El botón refleja el tema en vivo. El evento lo dispara el to
 *
 * El estado vive en el DOM (la clase `.dark` sobre <html>), no en un state de
 * React: el script inline de app/layout.tsx ya la aplica antes del primer
 * paint, así que el botón lee la realidad en vez de mantener una copia que se
 * puede desincronizar.
 */
const THEME_EVENT = 'omnibi:theme-change';

function subscribe(onChange: () => void): () => void {
  window.addEventListener(THEME_EVENT, onChange);
  // Cubre el caso de otra pestaña que cambia el tema.
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Durante SSR y en el primer render del cliente no hay DOM al que leer. */
function getServerSnapshot(): Theme {
  return 'light';
}

export function ThemeToggle() {
  // useSyncExternalStore reemplaza el clásico `useState` + `useEffect` con
  // `setMounted(true)`: resuelve el desajuste de hidratación sin disparar un
  // render en cascada desde un efecto. También elimina la lógica de
  // localStorage duplicada entre este componente y el script inline.
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.theme = next;
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const label = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  const acento = acentoDeRuta(usePathname());

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="tap-target w-8 h-8 rounded-lg border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 flex items-center justify-center shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? (
        <Sun className={`w-4 h-4 ${acento.text}`} />
      ) : (
        <Moon className={`w-4 h-4 ${acento.text}`} />
      )}
    </button>
  );
}