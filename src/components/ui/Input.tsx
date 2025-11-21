import * as React from 'react'

import { cn } from '@/lib/utils'
import type { InputProps } from '@/types/ui'

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, parentClassName, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1', parentClassName)}>
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-white/20 bg-[#0A0A0A]/80 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
            error && 'border-red-700 focus-visible:border-red-700'
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-red-700 text-sm">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }

