import { useEffect, useRef, useState } from 'react'
import { useLabAlerts } from '../alerts/useLabAlerts.js'
import CircuitDiagram from './CircuitDiagram.jsx'
import EquipmentPanel from './EquipmentPanel.jsx'
import PowerSupply from './PowerSupply.jsx'
import { EXPERIMENT_ALERTS } from '../alerts/experimentStepAlerts.js'
import {
  addAllEndpoints,
  deleteConnectionsForTerminal,
  hasConnectionBetween,
  lockJsPlumbCircuit,
  resolveJsPlumb,
 validateTheveninConnections,
 autoConnectTheveninCircuit,
  wireHoverPaintStyles,
  wirePaintStyles,

} from '../utils/jsPlumbWiring.js'

const getJsPlumbZoom = (scale) => (
  Number.isFinite(scale) && scale > 0 ? scale : 1
)

const isRetainedPowerConnection = (connection) => {
  const source = connection.sourceId || connection.source?.id
  const target = connection.targetId || connection.target?.id

  return (
    (source === '7-endpoint' && target === '9-endpoint') ||
    (source === '9-endpoint' && target === '7-endpoint') ||
    (source === '8-endpoint' && target === '10-endpoint') ||
    (source === '10-endpoint' && target === '8-endpoint')
  )
}

const ConnectionLab = ({
  checkRequest,
  experimentCase,
  onCheckConnections,
  powerOn,
  r1,
  r2,
  r3,
  rl,
  readings,
  resetRequest,
  scale = 1,
  onTogglePower,
  setVoltage,
  voltageLocked,
  voltage,
  resistancesConfigured,
  autoConnectRequest,
  aiGuidePlaying,
  showRth,
  showMultimeter,
  playStepById,
   case1ConnectionsRemoved,
setCase1ConnectionsRemoved,
case2ConnectionsRemoved,
setCase2ConnectionsRemoved,
setShowRth,
  setShowMultimeter,
  highlightedTerminalIds = [],
}) => {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)
  const onCheckConnectionsRef = useRef(onCheckConnections)
  const scaleRef = useRef(getJsPlumbZoom(scale))
  const { showStepAlert } = useLabAlerts()
  const [isLocked, setIsLocked] = useState(false)
  const experimentCaseRef = useRef(experimentCase)
  const autoConnectingRef = useRef(false)
  const aiGuidePlayingRef = useRef(aiGuidePlaying)
  const [connectedTerminalIds, setConnectedTerminalIds] = useState([])

  useEffect(() => {
    onCheckConnectionsRef.current = onCheckConnections
  }, [onCheckConnections])
useEffect(() => {
  experimentCaseRef.current = experimentCase
}, [experimentCase])
useEffect(() => {
  aiGuidePlayingRef.current = aiGuidePlaying
}, [aiGuidePlaying])
  useEffect(() => {
    let cancelled = false
    
    const initJsPlumb = async () => {
      const jsPlumbModule = await import('jsplumb')
      const jsPlumb = resolveJsPlumb(jsPlumbModule)
  

      if (cancelled || !containerRef.current || !jsPlumb?.getInstance) {
        return
      }

      instanceRef.current?.reset()

      containerRef.current.classList.remove('connection-lab--locked')
      setIsLocked(false)
      

      const instance = jsPlumb.getInstance({
        Container: containerRef.current,
        ConnectionsDetachable: true,
        ReattachConnections: true,
        Connector: ['Bezier', { curviness: 72 }],
        PaintStyle: {
          ...wirePaintStyles.positive,
        },
        HoverPaintStyle: {
          ...wireHoverPaintStyles.positive,
        },
        Endpoint: ['Dot', { radius: 5 }],
      })

      instanceRef.current = instance
      instance.setZoom?.(scaleRef.current)

      instance.registerConnectionTypes({
        positive: {
          paintStyle: {
            ...wirePaintStyles.positive,
          },
          hoverPaintStyle: {
            ...wireHoverPaintStyles.positive,
          },
        },
        negative: {
          paintStyle: {
            ...wirePaintStyles.negative,
          },
          hoverPaintStyle: {
            ...wireHoverPaintStyles.negative,
          },
        },
      })

      instance.setSuspendDrawing(true)

     addAllEndpoints(
 instance,
  () => {
    console.log("RESISTANCE CHECK =", resistancesConfigured)
    return resistancesConfigured
  },
  () => {
  showStepAlert(EXPERIMENT_ALERTS.resistanceRequired)
}
)

      instance.setSuspendDrawing(false, true)
 let wrongConnectionPlaying = false

instance.bind('connection', (info) => {
  if (autoConnectingRef.current) {
  return
}
  const source = info.sourceId
  const target = info.targetId

  
  
  
  setConnectedTerminalIds((prev) => [
  ...new Set([...prev, source, target]),
])
  console.log('CONNECTED:', source, '→', target)

  const isPair = (a, b) =>
    (source === a && target === b) ||
    (source === b && target === a)

  //
  // CASE 1
  //
  if (experimentCaseRef.current === 1) {
    if (isPair('5-endpoint', '11-endpoint')) {
      playStepById?.(6)
      return
    }

    if (isPair('6-endpoint', '13-endpoint')) {
      playStepById?.(7)
      return
    }

   if (isPair('9-endpoint', '10-endpoint')) {

  const result = validateTheveninConnections(
    instanceRef.current,
    1,
  )

  if (result.totalConnections !== 3) {
    return
  }

  if (result.isCorrect) {
    playStepById?.(8)
  }

  return
}

    if (!wrongConnectionPlaying) {
      wrongConnectionPlaying = true

      playStepById?.(9)
      showStepAlert(
        EXPERIMENT_ALERTS.connectionsWrong,
        aiGuidePlayingRef.current ? { audio: '#' } : {},
      )
      setTimeout(() => {
        wrongConnectionPlaying = false
      }, 1800)
    }

    return
  }

  //
  // CASE 2
  //
  if (experimentCaseRef.current === 2) {
    const result = validateTheveninConnections(
      instanceRef.current,
      2,
    )

    if (result.isCorrect) {
      playStepById?.(21)
      return
    }

    const isRequiredCase2Pair =
      isPair('7-endpoint', '9-endpoint')
      || isPair('8-endpoint', '10-endpoint')
      || isPair('1-endpoint', '11-endpoint')
      || isPair('2-endpoint', '13-endpoint')

    if (isRequiredCase2Pair) {
      if (!hasConnectionBetween(instanceRef.current, '7-endpoint', '9-endpoint')) {
        playStepById?.(17)
      } else if (!hasConnectionBetween(instanceRef.current, '8-endpoint', '10-endpoint')) {
        playStepById?.(18)
      } else if (!hasConnectionBetween(instanceRef.current, '1-endpoint', '11-endpoint')) {
        playStepById?.(19)
      } else if (!hasConnectionBetween(instanceRef.current, '2-endpoint', '13-endpoint')) {
        playStepById?.(20)
      }
      return
    }

    if (!wrongConnectionPlaying) {
      wrongConnectionPlaying = true

      playStepById?.(9)
      showStepAlert(
        EXPERIMENT_ALERTS.connectionsWrong,
        aiGuidePlayingRef.current ? { audio: '#' } : {},
      )
console.log("CURRENT CASE =", experimentCase)
      setTimeout(() => {
        wrongConnectionPlaying = false
      }, 1800)
    }

    return
  }


  //
// CASE 3
//
if (experimentCaseRef.current === 3) {
    const result = validateTheveninConnections(
      instanceRef.current,
      3,
    )

    if (result.isCorrect) {
      playStepById?.(29)
      return
    }

    const isRequiredCase3Pair =
      isPair('3-endpoint', '11-endpoint')
      || isPair('4-endpoint', '12-endpoint')
      || isPair('13-endpoint', '14-endpoint')

    if (isRequiredCase3Pair) {
      if (!hasConnectionBetween(instanceRef.current, '3-endpoint', '11-endpoint')) {
        playStepById?.(26)
      } else if (!hasConnectionBetween(instanceRef.current, '4-endpoint', '12-endpoint')) {
        playStepById?.(27)
      } else if (!hasConnectionBetween(instanceRef.current, '13-endpoint', '14-endpoint')) {
        playStepById?.(28)
      }
      return
    }

    if (!wrongConnectionPlaying) {
        wrongConnectionPlaying = true

        playStepById?.(9)
        showStepAlert(
          EXPERIMENT_ALERTS.connectionsWrong,
          {
            ...(aiGuidePlayingRef.current ? { audio: '#' } : {}),
            description:
              'Connections are wrong. Please follow the circuit diagram and try again.',
          },
        )
        setTimeout(() => {
            wrongConnectionPlaying = false
        }, 1800)
    }

    return
}
})
      window.setTimeout(() => {
        instance.repaintEverything()
      }, 100)
    }

    initJsPlumb()

    const handleResize = () => {
      window.setTimeout(() => {
        instanceRef.current?.repaintEverything()
      }, 100)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelled = true
      window.removeEventListener('resize', handleResize)

      instanceRef.current?.reset()
      instanceRef.current = null
    }
  }, [resetRequest,resistancesConfigured])

  useEffect(() => {
    const instance = instanceRef.current
    const zoom = getJsPlumbZoom(scale)

    scaleRef.current = zoom

    if (!instance?.setZoom) {
      return
    }

    instance.setZoom(zoom, true)

    window.setTimeout(() => {
      instance.repaintEverything?.()
    }, 0)
  }, [scale])

  useEffect(() => {
    if (experimentCase !== 3 || !instanceRef.current) {
      return
    }

    instanceRef.current
      .getAllConnections()
      .filter(isRetainedPowerConnection)
      .forEach((connection) => {
        connection.setDetachable?.(false)
      })
  }, [experimentCase])

  

  useEffect(() => {
    if (checkRequest === 0 || !instanceRef.current) {
      return
    }

    const result = validateTheveninConnections(
  instanceRef.current,
  experimentCase
)

    if (experimentCase === 3 && result.isCorrect) {
      lockJsPlumbCircuit(instanceRef.current, containerRef.current)
      setIsLocked(true)
    }

    onCheckConnectionsRef.current?.(result)
  }, [checkRequest])

  const handleLabelClick = (event) => {
    const label = event.target.closest('.terminal-number-label')

    if (!label || !containerRef.current?.contains(label)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    if (isLocked) {
      return
    }

    const terminalId = label.dataset.terminalId

    if (!terminalId || !instanceRef.current) {
      return
    }

    if (
      experimentCase === 3 &&
      ['7-endpoint', '8-endpoint', '9-endpoint', '10-endpoint'].includes(terminalId)
    ) {
      return
    }

    deleteConnectionsForTerminal(instanceRef.current, terminalId)
    const terminals = new Set()

instanceRef.current
  .getAllConnections()
  .forEach((connection) => {
    terminals.add(connection.sourceId)
    terminals.add(connection.targetId)
  })

setConnectedTerminalIds([...terminals])
    instanceRef.current.repaintEverything?.()
    const remainingConnections =
  instanceRef.current.getAllConnections()

// --------------------
// CASE 1 → CASE 2
// --------------------

if (
  experimentCase === 2 &&
  remainingConnections.length ===0 &&
  !case1ConnectionsRemoved
) {
  setCase1ConnectionsRemoved(true)
  setShowMultimeter(false)
  setShowRth(false)
}

// --------------------
// CASE 2 → CASE 3
// --------------------

const has79 = remainingConnections.some(
  (c) =>
    (c.sourceId === '7-endpoint' &&
      c.targetId === '9-endpoint') ||
    (c.sourceId === '9-endpoint' &&
      c.targetId === '7-endpoint')
)

const has810 = remainingConnections.some(
  (c) =>
    (c.sourceId === '8-endpoint' &&
      c.targetId === '10-endpoint') ||
    (c.sourceId === '10-endpoint' &&
      c.targetId === '8-endpoint')
)

const result = validateTheveninConnections(
  instanceRef.current,
  2
)

if (
  experimentCase === 3 &&
  result.totalConnections === 2 &&
  has79 &&
  has810 &&
  !case2ConnectionsRemoved
) {
  setCase2ConnectionsRemoved(true)
}
  }

const meterReadings = {
  il: readings.il ?? 0,
  rth: readings.rth ?? 0,
   showRth,
}

useEffect(() => {
  if (
    autoConnectRequest === 0 ||
    !instanceRef.current
  ) {
    return
  }

  if (!resistancesConfigured) {
    showStepAlert(EXPERIMENT_ALERTS.resistanceRequiredForAutoConnect)
    return
  }
autoConnectingRef.current = true
const result =
  autoConnectTheveninCircuit(
    instanceRef.current,
    experimentCase
  )

if (!result?.success) {
  autoConnectingRef.current = false

  showStepAlert({
    title: 'Remove Existing Connections',
    description:
      'Please remove all current wire connections before proceeding to the next case.',
    type: 'warning',
  })

  return
}

  instanceRef.current.repaintEverything?.()
  playStepById?.(11)
  showStepAlert(
    EXPERIMENT_ALERTS.autoConnectCompleted,
    aiGuidePlayingRef.current ? { audio: '#' } : {},
  )
  setTimeout(() => {
  autoConnectingRef.current = false
}, 500)

}, [
  autoConnectRequest,
])

  return (
    <div className="connection-lab" onClick={handleLabelClick} ref={containerRef}>
 <EquipmentPanel
  onTogglePower={onTogglePower}
  powerOn={powerOn}
  readings={meterReadings}
  experimentCase={experimentCase}
  setVoltage={setVoltage}
  voltage={voltage}
   showMultimeter={showMultimeter}
    connectedTerminalIds={connectedTerminalIds}
  highlightedTerminalIds={highlightedTerminalIds}
   
/>

     <div className="circuit-workspace">

    <div className="circuit-power-supply">
 <PowerSupply
  connectedTerminalIds={connectedTerminalIds}
  highlightedTerminalIds={highlightedTerminalIds}
  onTogglePower={onTogglePower}
  powerOn={powerOn}
  setVoltage={setVoltage}
  voltage={voltage}
  voltageLocked={voltageLocked}
/>
</div>

    <CircuitDiagram
    connectedTerminalIds={connectedTerminalIds}
  highlightedTerminalIds={highlightedTerminalIds}
      r1={r1}
      r2={r2}
      r3={r3}
      rl={rl}
    />

  </div>
    </div>
  )
}

export default ConnectionLab
