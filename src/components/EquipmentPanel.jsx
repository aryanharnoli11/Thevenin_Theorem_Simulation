import Ammeter from './Ammeter.jsx'
import DigitalMultimeter from './DigitalMultimeter.jsx'
import Voltmeter from './Voltmeter.jsx'

const EquipmentPanel = ({
  connectedTerminalIds = [],
  highlightedTerminalIds = [],
  observationVth = null,
  powerOn,
  readings,
  experimentCase,
  showMultimeter,
}) => {
  const voltmeterConnected = ['1-endpoint', '2-endpoint'].every((terminalId) => (
    connectedTerminalIds.includes(terminalId)
  ))
  const hasObservationVth = (
    typeof observationVth === 'number'
    && Number.isFinite(observationVth)
  )

  return (
    <section className="equipment-panel" id="equipment-panel">

<Voltmeter
  connectedTerminalIds={connectedTerminalIds}
  highlightedTerminalIds={highlightedTerminalIds}
  value={voltmeterConnected && hasObservationVth ? observationVth : 0}
/>
<Ammeter
  connectedTerminalIds={connectedTerminalIds}
  highlightedTerminalIds={highlightedTerminalIds}
  label="A1"
  powerOn={powerOn}
  value={
    experimentCase === 3
      ? readings.il
      : 0
  }
/>

<DigitalMultimeter
  connectedTerminalIds={connectedTerminalIds}
  highlightedTerminalIds={highlightedTerminalIds}
  value={readings.rth}
  showValue={showMultimeter}
/>
    </section>
  )
}


export default EquipmentPanel
