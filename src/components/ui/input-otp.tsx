import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputOTPProps {
  value?: string
  onChange?: (value: string) => void
  maxLength?: number
  pattern?: RegExp
  className?: string
  disabled?: boolean
}

const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  ({ className, value = "", onChange, maxLength = 6, pattern, disabled = false }, ref) => {
    const [otp, setOtp] = React.useState(value)
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    React.useEffect(() => {
      setOtp(value)
    }, [value])

    const handleChange = (index: number, newValue: string) => {
      if (pattern && !pattern.test(newValue)) {
        return
      }

      const newOtp = otp.split("")
      newOtp[index] = newValue
      const updatedOtp = newOtp.join("").slice(0, maxLength)
      
      setOtp(updatedOtp)
      onChange?.(updatedOtp)

      // Auto-focus next input
      if (newValue && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text").slice(0, maxLength)
      
      if (pattern) {
        const filteredData = pastedData.split("").filter(char => pattern.test(char)).join("")
        setOtp(filteredData)
        onChange?.(filteredData)
      } else {
        setOtp(pastedData)
        onChange?.(pastedData)
      }

      // Focus the last filled input or the first empty one
      const lastFilledIndex = Math.min(pastedData.length - 1, maxLength - 1)
      inputRefs.current[lastFilledIndex]?.focus()
    }

    return (
      <div ref={ref} className="flex gap-2 justify-center">
        {Array.from({ length: maxLength }, (_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg border border-input bg-background text-center text-lg font-semibold transition-colors",
              "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:border-primary/50",
              className
            )}
          />
        ))}
      </div>
    )
  }
)
InputOTP.displayName = "InputOTP"

export { InputOTP }
