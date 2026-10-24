<script lang="ts">
  import { cn } from '#lib/utils.js';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'cream';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    children?: import('svelte').Snippet;
  }

  let {
    class: className = '',
    variant = 'default',
    size = 'default',
    children,
    ...restProps
  }: Props = $props();

  const variants = {
    default: 'bg-[#22396f] text-[#fcf1d0] hover:bg-[#2b488c] shadow-sm',
    cream: 'bg-[#fcf1d0] text-[#010736] font-bold hover:bg-[#ebdca6] shadow-md',
    outline: 'border border-[#22396f] text-[#fcf1d0] hover:bg-[#22396f]/30',
    secondary: 'bg-[#0d1c42] text-[#8fa2cb] hover:text-[#fcf1d0] border border-[#22396f]/40',
    ghost: 'hover:bg-[#22396f]/30 text-[#8fa2cb] hover:text-[#fcf1d0]',
    destructive: 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
  };

  const sizes = {
    default: 'h-9 px-4 py-2 text-xs',
    sm: 'h-7 px-2.5 text-xs',
    lg: 'h-10 px-5 text-sm',
    icon: 'h-8 w-8 p-0 flex items-center justify-center'
  };
</script>

<button
  class={cn(
    'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none font-mono',
    variants[variant],
    sizes[size],
    className
  )}
  {...restProps}
>
  {@render children?.()}
</button>
