import { useState } from 'react'
import {
  formatKilohms,
  RESISTANCE_SLIDER_CONFIG,
} from '../utils/resistance.js'

const ResistanceSlider = ({ disabled = false, label, onChange, value }) => {
  const isRL = label === 'RL'
  const config = isRL
    ? RESISTANCE_SLIDER_CONFIG.load
    : RESISTANCE_SLIDER_CONFIG.network

  const normalizeResistance = (inputValue) => {
    const number = Number(inputValue)

    const bounded = Math.min(
      Math.max(
        Number.isFinite(number) ? number : config.min,
        config.min,
      ),
      config.max,
    )

    return bounded
  }

  const [draftValue, setDraftValue] = useState(value)
  const [isEditing, setIsEditing] = useState(false)

  const sliderValue = isEditing ? draftValue : value

  const commitValue = () => {
    const committedValue = normalizeResistance(sliderValue)

    setDraftValue(committedValue)
    setIsEditing(false)
    onChange(committedValue)
  }

  return (
    <div className={`resistance-slider ${disabled ? 'resistance-slider--locked' : ''}`}>
      <label className="resistance-slider__label" htmlFor={`${label}-slider`}>
        {label.slice(0, 1)}
        <sub>{label.slice(1)}</sub> (k&Omega;)
      </label>

      <div className="resistance-slider__control">
        <input
          aria-label={`${label} resistance`}
          className="resistance-slider__input"
          disabled={disabled}
          id={`${label}-slider`}
          max={config.max}
          min={config.min}
          onBlur={commitValue}
          onChange={(event) => {
            setIsEditing(true)
            setDraftValue(Number(event.target.value))
          }}
          onKeyUp={commitValue}
          onPointerCancel={commitValue}
          onPointerUp={commitValue}
          step={config.step}
          type="range"
          value={sliderValue}
        />
      </div>

      <span className="resistance-slider__value">
        {Number(formatKilohms(sliderValue, isRL ? 1 : 0))}
      </span>
    </div>
  )
}

export default ResistanceSlider
