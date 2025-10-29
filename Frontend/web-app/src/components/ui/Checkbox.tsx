'use client'

import { forwardRef } from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onChange, disabled = false, label, className = '' }, ref) => {
    return (
      <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          relative w-5 h-5 rounded border-2 transition-all
          ${checked
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-gray-300 hover:border-gray-400'
          }
          ${disabled ? '' : 'cursor-pointer'}
          peer-focus:ring-2 peer-focus:ring-blue-200
        `}>
          {checked && (
            <svg
              className="absolute inset-0 w-full h-full text-white p-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        {label && (
          <span className="ml-2 text-sm text-gray-700 select-none">
            {label}
          </span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
