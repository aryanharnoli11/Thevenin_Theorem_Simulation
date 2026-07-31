import { Fragment } from 'react'
import {
  getTerminalConnectedClass,
  getTerminalHighlightClass,
  getTerminalNumberHighlightClass,
} from '../utils/terminalHighlight.js'
import circuitImage from '../assets/circuit.png'
const terminalLabels = [
  {
    id: '9-endpoint',
    label: '9',
    polarity: 'plus',
  },
  {
    id: '10-endpoint',
    label: '10',
    polarity: 'minus',
  },
  {
    id: '11-endpoint',
    label: '11',
    polarity: 'plus',
  },
  {
    id: '12-endpoint',
    label: '12',
    polarity: 'minus',
  },
  {
    id: '13-endpoint',
    label: '13',
    polarity: 'plus',
  },
  {
    id: '14-endpoint',
    label: '14',
    polarity: 'minus',
  },
]

const CircuitDiagram = ({
  className = '',
  connectedTerminalIds = [],
  highlightedTerminalIds = [],
  r1,
  r2,
  r3,
  rl,
}) => (
  <section className={`circuit-panel ${className}`} id="circuit-panel">
    <div className="circuit-panel__stage">
      <img alt="Kirchhoff current law circuit diagram" className="circuit-panel__image" src={circuitImage} />

      {terminalLabels.map(({ id, label, polarity }) => (
        <Fragment key={id}>
          <span
            id={id}
className={`connection-terminal connection-terminal--circuit connection-terminal--endpoint-${label}${getTerminalConnectedClass(connectedTerminalIds, id)}${getTerminalHighlightClass(highlightedTerminalIds, id)}`}
            data-polarity={polarity}
            aria-label={`Circuit terminal ${label}`}
          />
          <span
className={`terminal-number-label terminal-number-label--circuit terminal-number-label--endpoint-${label}${getTerminalNumberHighlightClass(highlightedTerminalIds, id)}`}
            data-terminal-id={id}
          >
            {label}
          </span>
        </Fragment>
      ))}

     <span className="resistor-value left-[89px] top-[170px]">{r1} &Omega;</span>

<span className="resistor-value left-[282px] top-[220px]">{r2} &Omega;</span>

<span className="resistor-value left-[300px] top-[164px]">{r3} &Omega;</span>

<span className="resistor-value left-[390px] top-[220px]">
  {rl}&Omega;
</span>
    </div>
  </section>
)

export default CircuitDiagram
