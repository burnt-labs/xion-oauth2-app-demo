import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { buttonVariants } from '../components/ui/button-variants'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  fullWidth?: boolean
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  parentClassName?: string
}
