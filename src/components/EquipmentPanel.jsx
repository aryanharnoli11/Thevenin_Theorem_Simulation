import Ammeter from './Ammeter.jsx'
import DigitalMultimeter from './DigitalMultimeter.jsx'
import Voltmeter from './Voltmeter.jsx'

const EquipmentPanel = ({
  connectedTerminalIds = [],
  highlightedTerminalIds = [],
  powerOn,
  readings,
  experimentCase,
  showMultimeter,
}) => (
  
  <section className="equipment-panel" id="equipment-panel">

<Voltmeter
  connectedTerminalIds={connectedTerminalIds}
  highlightedTerminalIds={highlightedTerminalIds}
  powerOn={powerOn}
  value={
    experimentCase === 2
      ? readings.vth
      : 0
  }
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


export default EquipmentPanel
