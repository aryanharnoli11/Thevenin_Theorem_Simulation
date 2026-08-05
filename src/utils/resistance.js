export const OHMS_PER_KILOHM = 1000

export const RESISTANCE_SLIDER_CONFIG = {
  load: {
    initial: 500,
    max: 1500,
    min: 500,
    step: 500,
  },
  network: {
    initial: 1000,
    max: 5000,
    min: 1000,
    step: 1000,
  },
}

export const ohmsToKilohms = (value) => Number(value) / OHMS_PER_KILOHM

export const kilohmsToOhms = (value) => Number(value) * OHMS_PER_KILOHM

export const formatKilohms = (value, fractionDigits = 1) => (
  ohmsToKilohms(value).toFixed(fractionDigits)
)
