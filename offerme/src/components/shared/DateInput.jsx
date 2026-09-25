import { useEffect, useRef, useState } from 'react'

export default function DateInput({ name, value, onChange, placeholder = 'Select date', min, id, className = '', required = false }) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const showPlaceholder = !value && !focused

  // Open the native picker only after the element has actually switched to
  // type="date" (a text input has no picker and showPicker() would throw).
  useEffect(() => {
    if (!focused || showPlaceholder) return
    const el = inputRef.current
    if (!el) return
    try {
      if (typeof el.showPicker === 'function') el.showPicker()
    } catch { /* ignore: browser refused to open the picker */ }
  }, [focused, showPlaceholder])

  const handleBlur = () => setFocused(false)

  const handleClick = () => {
    const wasFocused = focused
    setFocused(true)
    if (!wasFocused) return // onFocus → effect will open the picker
    const el = inputRef.current
    if (!el || el.type !== 'date') return
    try {
      if (typeof el.showPicker === 'function') el.showPicker()
    } catch { /* ignore: browser refused to open the picker */ }
  }

  return (
    <input
      ref={inputRef}
      id={id || name}
      name={name}
      type={showPlaceholder ? 'text' : 'date'}
      placeholder={showPlaceholder ? placeholder : ''}
      value={value || ''}
      min={min}
      required={required}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onClick={handleClick}
      className={className}
      autoComplete="off"
    />
  )
}
