import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './ConnectionEndpoints.css'
import ConnectionLab from './components/ConnectionLab.jsx'
import ActionButtons from './components/ActionButtons.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import HeaderBoard from './components/HeaderBoard.jsx'
import WalkthroughStartButton from './walkthrough/components/WalkthroughStartButton.jsx'
import { EXPERIMENT_ALERTS } from './alerts/experimentStepAlerts.js'
import { useLabAlerts } from './alerts/useLabAlerts.js'
import { useAiGuideNarration } from './aiGuide/useAiGuideNarration.js'
import CalculationPanel from './components/CalculationPanel.jsx'
 import { useWalkthrough } from './walkthrough/useWalkthrough.js'
import { calculateReadings } from './utils/circuitMath.js'
import { generateTheveninReport } from './utils/theveninReportGenerator.js'
 
const BASE_WIDTH = 1440
const BASE_HEIGHT = 960
const DEFAULT_CONTENT_HEIGHT = 1800
const PANEL_MAX_SCALE = 1
const PANEL_VIEWPORT_MARGIN = 24
const MIN_OBSERVATION_READINGS = 1
const MAX_OBSERVATIONS = 10


const getObservationSignature = ({ vth, rth, il }) => (
  [
    Number(vth).toFixed(3),
    Number(rth).toFixed(3),
    Number(il).toFixed(3),
  ].join('|')
)

const getScale = () => {
  if (typeof window === 'undefined') {
    return 1
  }

  const widthScale = (window.innerWidth - PANEL_VIEWPORT_MARGIN) / BASE_WIDTH
  const heightScale = (window.innerHeight - PANEL_VIEWPORT_MARGIN) / BASE_HEIGHT

  return Math.max(Math.min(widthScale, heightScale, PANEL_MAX_SCALE), 0.1)
}



const App = () => {
  const { clearAlerts, confirmAlert, showStepAlert } = useLabAlerts()
  const [scale, setScale] = useState(getScale)
  const [contentHeight, setContentHeight] = useState(DEFAULT_CONTENT_HEIGHT)
  const postSimulationContentRef = useRef(null)
const [r1, setR1] = useState(0.1)
const [r2, setR2] = useState(0.1)
const [r3, setR3] = useState(0.1)
  const [rl, setRl] = useState(100)
const [voltage, setVoltage] = useState(1)
  const [powerOn, setPowerOn] = useState(false)
  const [voltageLocked, setVoltageLocked] = useState(false)
  const [observations, setObservations] = useState([])
const [calculationDone, setCalculationDone] = useState(false)
const [calculatedValues, setCalculatedValues] = useState(null)
const [userCalculatedIL, setUserCalculatedIL] = useState('')
const [verificationResult, setVerificationResult] = useState('')
const [experimentCase, setExperimentCase] = useState(1)
const [measuredRth, setMeasuredRth] = useState(null)
const [measuredVth, setMeasuredVth] = useState(null)
const [measuredIl, setMeasuredIl] = useState(null)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [reportPrinted, setReportPrinted] = useState(false)
  const [status, setStatus] = useState('Make the connections, click CHECK, then set the resistance values.')
  const [checkRequest, setCheckRequest] = useState(0)
  const [resetRequest, setResetRequest] = useState(0)
const [autoConnectRequest, setAutoConnectRequest] = useState(0)
  const [connectionsVerified, setConnectionsVerified] = useState(false)
  const [sessionStart, setSessionStart] = useState(() => Date.now())
  const [showRth, setShowRth] = useState(false)
  const walkthroughWasOpenRef = useRef(false)
const walkthroughCompletedRef = useRef(false)
const resistanceIntroPlayedRef = useRef(false)
const { isOpen: walkthroughOpen } = useWalkthrough()
const voltageGuidePlayedRef = useRef(false)
const resistancesConfigured =
  Number(r1) !== 0.1 &&
  Number(r2) !== 0.1 &&
  Number(r3) !== 0.1 &&
  Number(rl) !== 100
  useEffect(() => {
    const handleResize = () => setScale(getScale())

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const content = postSimulationContentRef.current

    if (!content) {
      return undefined
    }

    const updateContentHeight = () => {
      const nextHeight = Math.ceil(content.offsetTop + content.offsetHeight)

      setContentHeight((currentHeight) => (
        currentHeight === nextHeight ? currentHeight : nextHeight
      ))
    }

    updateContentHeight()

    const resizeObserver = new ResizeObserver(updateContentHeight)
    resizeObserver.observe(content)
    window.addEventListener('load', updateContentHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('load', updateContentHeight)
    }
  }, [])

  useEffect(() => {
    const handleAfterPrint = () => setReportPrinted(true)

    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

const handleAutoConnect = () => {
  setAutoConnectRequest((prev) => prev + 1)
}
  const readings = useMemo(
    () => calculateReadings({
  voltage: powerOn ? voltage : 0,
  r1,
  r2,
  r3,
  rl,
}),
    [powerOn, r1, r2, r3, rl, voltage],
  )
console.log(readings)
  const normalizedVoltage = Number(voltage.toFixed(1))
  const currentReadingSignature = getObservationSignature({
  vth: readings.vth,
  rth: readings.rth,
  il: readings.il,
})
const [case1ConnectionsRemoved, setCase1ConnectionsRemoved] = useState(false)
const [case2ConnectionsRemoved, setCase2ConnectionsRemoved] = useState(false)
const [showMultimeter, setShowMultimeter] = useState(false)
  const hasDuplicateReading = observations.some((row) => (
    row.voltage === normalizedVoltage
      || getObservationSignature(row) === currentReadingSignature
  ))
  const readingCount = observations.length
  const handleAiGuideStart = useCallback(() => {
    setStatus('AI Guide narration started.')
  }, [])

const handleAiGuideFinish = useCallback(() => {
  setStatus('AI Guide finished.')
}, [])

  const handleAiGuideError = useCallback(() => {
    setStatus('AI Guide could not play its configured audio file.')
  }, [])

const {
  isPlaying: aiGuidePlaying,
  activeStepId,
  start: startAiGuide,
  stop: stopAiGuide,
  playStepById,
  playStepsById,
} = useAiGuideNarration({
    onError: handleAiGuideError,
    onFinish: handleAiGuideFinish,
    onStart: handleAiGuideStart,
})
useEffect(() => {
  if (walkthroughOpen) {
    walkthroughWasOpenRef.current = true
    return
  }

  if (
    !aiGuidePlaying ||
    !walkthroughWasOpenRef.current ||
    walkthroughCompletedRef.current
  ) {
    return
  }

  walkthroughCompletedRef.current = true

  playStepById(2)
}, [walkthroughOpen, aiGuidePlaying, playStepById])
useEffect(() => {
  if (
    !aiGuidePlaying ||
    !resistancesConfigured ||
    resistanceIntroPlayedRef.current
  ) {
    return
  }

  resistanceIntroPlayedRef.current = true

  playStepsById([3,4, 5])
}, [
  aiGuidePlaying,
  resistancesConfigured,
  playStepsById,
])
useEffect(() => {
  if (!case1ConnectionsRemoved) {
    return
  }

  playStepsById?.([16, 17])

}, [
  case1ConnectionsRemoved,
  playStepsById,
])

useEffect(() => {
  if (!case2ConnectionsRemoved) {
    return
  }

  playStepsById([25, 26])

}, [
  case2ConnectionsRemoved,
  playStepsById,
])
  const handleAiGuide = useCallback(() => {
    if (aiGuidePlaying) {
      stopAiGuide()
      setStatus('AI Guide narration stopped.')
      return
    }

    startAiGuide()
  }, [aiGuidePlaying, startAiGuide, stopAiGuide])

  const recordObservation = () => {
    if (!connectionsVerified) {
      setStatus('Check the circuit connections before adding readings.')
      showStepAlert(EXPERIMENT_ALERTS.connectionsWrong, {
        description: 'Verify the wiring before storing current readings.',
        stepNumber: 6,
        target: '#check-button',
        type: 'warning',
      })
      return
    }

   if (experimentCase !== 1 && !powerOn) {
      setStatus('Switch on the power supply before adding readings.')
      showStepAlert(EXPERIMENT_ALERTS.cannotStartPower, {
        description: 'Switch on the verified power supply before adding readings.',
        stepNumber: 6,
        target: '#power-toggle-button',
      })
      return
    }

    if (experimentCase !== 1 && normalizedVoltage <= 0) {
      setStatus('Set the power supply voltage before adding a reading.')
      showStepAlert(EXPERIMENT_ALERTS.adjustVoltage, {
        dedupeKey: 'step-6-zero-voltage',
        description: 'Increase the voltage above 0 V before adding a reading.',
        target: '#voltage-control',
        type: 'warning',
      })
      return
    }

    if (readingCount >= MAX_OBSERVATIONS) {
      setStatus('Observation table is full. Reset the experiment for a new run.')
      showStepAlert(EXPERIMENT_ALERTS.minimumReadingsRequired, {
        description: 'The observation table already contains the maximum number of readings.',
        title: 'Observation Table Is Full',
      })
      return
    }

    if (hasDuplicateReading) {
      setStatus('Duplicate reading cannot be added to the observation table.')
      showStepAlert(EXPERIMENT_ALERTS.readingAlreadyExists, {
        description: 'This reading already exists in the observation table. Change the voltage before adding another reading.',
        title: 'Duplicate Reading Not Allowed',
      })
      return
    }

 if (experimentCase === 1) {

  setObservations([
    {
      id: 1,
      rth: readings.rth,
      vth: null,
      il: null,
      rl,
    },
  ])

  setMeasuredRth(readings.rth)

  playStepById(15)
  showStepAlert(
    EXPERIMENT_ALERTS.readingAddedCase1,
    aiGuidePlaying ? { audio: '#' } : {},
  )
  setConnectionsVerified(false)
  voltageGuidePlayedRef.current = false
  setExperimentCase(2)
  setCase1ConnectionsRemoved(false)
}

else if (experimentCase === 2) {
  setObservations([
    {
      ...observations[0],
      vth: readings.vth,
    },
  ])


   setMeasuredVth(readings.vth)
   playStepById(24)
   showStepAlert(
     EXPERIMENT_ALERTS.readingAddedCase2,
     aiGuidePlaying ? { audio: '#' } : {},
   )
   setPowerOn(false)
   setVoltageLocked(true)
setConnectionsVerified(false)
voltageGuidePlayedRef.current = false
setExperimentCase(3)
setCase2ConnectionsRemoved(false)
}

else if (experimentCase === 3) {
  setObservations([
    {
      ...observations[0],
      il: readings.il,
    },
  ])

  setMeasuredIl(readings.il)
  playStepById(31)
  showStepAlert(
    EXPERIMENT_ALERTS.readingAdded,
    aiGuidePlaying ? { audio: '#' } : {},
  )
  setConnectionsVerified(false)
  setExperimentCase(4)
  
}
  
    setReportGenerated(false)
    setReportPrinted(false)
    setStatus(
      experimentCase === 2
        ? 'Case 2 reading added. The power supply switched off automatically; its voltage setting and connections are retained for Case 3.'
        : 'Reading added to the observation table.'
    )

//    if (nextObservationCount === MIN_OBSERVATION_READINGS) {
//   showStepAlert(EXPERIMENT_ALERTS.sufficientData)
// }
  }

  const resetSimulation = useCallback(() => {
    stopAiGuide()
    playStepById(35)
    setPowerOn(false)
    setVoltage(1)
    setVoltageLocked(false)
setR1(0.1)
setR2(0.1)
setR3(0.1)
setRl(100)
    setObservations([])
    setCalculationDone(false)
setCalculatedValues(null)
setVerificationResult('')
setUserCalculatedIL('')
    setReportGenerated(false)
    setReportPrinted(false)
    setCheckRequest(0)
    setExperimentCase(1)
    setConnectionsVerified(false)
    setResetRequest((current) => current + 1)
    setSessionStart(Date.now())
    setStatus('Simulation reset. Make the circuit connections again.')
    showStepAlert(EXPERIMENT_ALERTS.resetSuccess)
    setShowRth(false)
    setShowMultimeter(false)
    walkthroughWasOpenRef.current = false
walkthroughCompletedRef.current = false
resistanceIntroPlayedRef.current = false
voltageGuidePlayedRef.current = false
  }, [playStepById, showStepAlert, stopAiGuide])

  const handleReset = () => {
    clearAlerts()
    resetSimulation()
  }


const handlePrint = () => {
  window.print()
}
const handleGenerateReport = async () => {
  if (!calculationDone) {
    window.alert('Please click CALCULATE before generating report.')
    return
  }

  if (readingCount < MIN_OBSERVATION_READINGS) {
    window.alert('Please add at least one observation.')
    return
  }

  clearAlerts()
  setStatus('Report is ready. Click OK to open it in a new tab.')
  playStepById?.(37)

  const shouldOpenReport = await confirmAlert({
    ...EXPERIMENT_ALERTS.reportGenerated,
    confirmLabel: 'OK',
  })

  if (!shouldOpenReport) {
    setStatus('Report opening cancelled.')
    return
  }

  const reportOpened = generateTheveninReport({
    observations,
    r1,
    r2,
    r3,
    rl,
    vth: calculatedValues?.vth ?? 0,
    rth: calculatedValues?.rth ?? 0,
    calculatedIL: Number(userCalculatedIL),
    sessionStart,
  })

  if (!reportOpened) {
    setStatus('The report window was blocked. Allow popups and try again.')
    return
  }

  setReportGenerated(true)
  setStatus('Report generated and opened in a new tab.')
}

  const scaledWidth = Math.ceil(BASE_WIDTH * scale)
  const scaledHeight = Math.ceil(contentHeight * scale)
  const handleCheckConnections = useCallback((result) => {

  if (result.isCorrect) {
    clearAlerts()

    if (experimentCase === 1) {
      setShowRth(true)
      setShowMultimeter(true)
      playStepById(14)
    }

    setConnectionsVerified(true)

    if (experimentCase === 1) {
      setStatus('Right connections! Click ADD to measure RTH.')
    }

    else if (experimentCase === 2) {
      setStatus(
        'Right connections! Turn ON power supply and click ADD to measure VTH.'
      )
    }

    else if (experimentCase === 3) {
      setStatus(
        'Right connections! Turn ON power supply and click ADD to measure IL.'
      )
    }

    if (experimentCase === 1) {
  showStepAlert(
    EXPERIMENT_ALERTS.connectionsVerified,
    aiGuidePlaying ? { audio: '#' } : {},
  )
}
else if (experimentCase === 2) {
  playStepById(22)
  showStepAlert(
    EXPERIMENT_ALERTS.connectionsVerifiedCase2,
    aiGuidePlaying ? { audio: '#' } : {},
  )
}
else if (experimentCase === 3) {
  playStepById(38)
  showStepAlert(
    EXPERIMENT_ALERTS.connectionsVerifiedCase3,
    aiGuidePlaying ? { audio: '#' } : {},
  )
}

    return
  }

  setConnectionsVerified(false)

  if (result.totalConnections === 0) {

    playStepById(13)

    setStatus('Please make the connections first.')

    showStepAlert(EXPERIMENT_ALERTS.connectionsWrong, {
      description:
        'No circuit wires were found. Drag node connections before checking.',
      type: 'warning',
    })

    return
  }

  if (result.matchedCount === 0) {
    playStepById(9)
  } else {
    playStepById(10)
  }

  setStatus(
    'Invalid connections. Please check the wiring and try again.'
  )

  showStepAlert(
    result.matchedCount === 0
      ? EXPERIMENT_ALERTS.connectionsWrong
      : EXPERIMENT_ALERTS.someConnectionsWrong,
    aiGuidePlaying ? { audio: '#' } : {},
  )

}, [aiGuidePlaying, clearAlerts, experimentCase, playStepById, showStepAlert])

  const handleCheck = () => {
    setCheckRequest((current) => current + 1)
  }
  const handleTogglePower = () => {
  // Case 1 - Power supply should never be used
  if (experimentCase === 1) {
    showStepAlert(EXPERIMENT_ALERTS.cannotStartPower)
    setStatus(
      'Power supply is not required during Case 1.'
    )
    return
  }

  // Case 2 & Case 3
  if (!powerOn && !connectionsVerified) {
    showStepAlert(EXPERIMENT_ALERTS.cannotStartPower)
    setStatus(
      'Complete all required connections before switching ON the power supply.'
    )
    return
  }

if (powerOn) {
    setPowerOn(false)
    setStatus('Power supply switched off.')
    return
}

  setPowerOn(true)
  setStatus(
    experimentCase === 3
      ? `Power supply switched on at the previous setting of ${voltage} V. Add the reading.`
      : 'Power supply switched on. Adjust voltage and add the reading.'
  )
  clearAlerts()
  showStepAlert(
    EXPERIMENT_ALERTS.powerOn,
    experimentCase === 3
      ? {
          audio: aiGuidePlaying ? '#' : EXPERIMENT_ALERTS.powerOn.audio,
          description:
            'Power supply switched ON at the Case 2 voltage setting. Click ADD to record IL.',
          target: '#add-reading-button',
        }
      : {},
  )
  if (experimentCase === 3) {
    playStepById(30)
  }
}


const handleVoltageChange = useCallback((nextVoltage) => {

  if (voltageLocked) {
    return
  }

  setVoltage(nextVoltage)

  if (
    powerOn &&
    experimentCase === 2 &&
    !voltageGuidePlayedRef.current
  ) {
    voltageGuidePlayedRef.current = true
    playStepById(23)
    clearAlerts()
    showStepAlert(
      EXPERIMENT_ALERTS.adjustVoltage,
      aiGuidePlaying ? { audio: '#' } : {},
    )
  }

}, [
  aiGuidePlaying,
  clearAlerts,
  powerOn,
  experimentCase,
  playStepById,
  showStepAlert,
  voltageLocked,
])

 const handleCalculate = () => {
setCalculatedValues({
  r1,
  r2,
  r3,
  rl: observations[0]?.rl ?? rl,

  voltageSource: voltage,

  vth: observations[0]?.vth ?? measuredVth,
  rth: observations[0]?.rth ?? measuredRth,
  observedIL: measuredIl,
})

  setCalculationDone(true)
  playStepById(32)
  showStepAlert(EXPERIMENT_ALERTS.calculationReady)

}
const guideHighlights = {
  5: ['5-endpoint', '11-endpoint'],
  6: ['6-endpoint', '13-endpoint'],
  7: ['9-endpoint', '10-endpoint'],

  17: ['7-endpoint', '9-endpoint'],
  18: ['8-endpoint', '10-endpoint'],
  19: ['1-endpoint', '11-endpoint'],
  20: ['2-endpoint', '13-endpoint'],

  26: ['3-endpoint', '11-endpoint'],
  27: ['4-endpoint', '12-endpoint'],
  28: ['13-endpoint', '14-endpoint'],
}

const highlightedTerminalIds =
  guideHighlights[Number(activeStepId)] ?? []
const verificationSucceeded =
  verificationResult.includes('Verified Successfully')
const activeInstructionStep =
  !resistancesConfigured
    ? 'step1'
    : experimentCase === 1 ||
        (experimentCase === 2 && !case1ConnectionsRemoved)
      ? 'case1'
      : experimentCase === 2 ||
          (experimentCase === 3 && !case2ConnectionsRemoved)
        ? 'case2'
        : experimentCase === 3
          ? 'case3'
          : !calculationDone
            ? 'step3'
            : !verificationSucceeded
              ? 'step4'
              : !reportPrinted
                ? 'step5'
                : 'step6'
console.log("ACTIVE STEP =", activeStepId)
console.log("HIGHLIGHT IDS =", highlightedTerminalIds)
  return (
    <div id="app-wrapper">
      <div
        id="app-viewport"
        style={{
          height: `${scaledHeight}px`,
          width: `${scaledWidth}px`,
        }}
      >
        <div
          id="app-scale"
          style={{
            height: `${contentHeight}px`,
            zoom: scale,
          }}
        >
          <main className="simulation-shell" id="walkthrough-demo-experiment">
            <HeaderBoard />
            <WalkthroughStartButton
              highlighted={Number(activeStepId) === 1}
              variant="side-tab"
            />
            {/* <StatusBar status={status} /> */}
            <span className="sr-only" role="status" aria-live="polite">{status}</span>

            <section className="workspace-grid">
              <aside className="left-panel">
                <ActionButtons
                  activeInstructionStep={activeInstructionStep}
                  activeButtons={{
                    onAiGuide: aiGuidePlaying,
                  }}
      disabledButtons={{
  onAdd: !connectionsVerified,
  onCheck: false,
  onPrint: false,
  onCalculate: experimentCase !== 4,
}}
                  onAdd={recordObservation}
                  onCheck={handleCheck}
         
                  onPrint={handlePrint}
                  onReset={handleReset}
                  onAiGuide={handleAiGuide}
                  onCalculate={handleCalculate}
                  onAutoConnect={handleAutoConnect}
                />

                <ControlPanel
  locked={powerOn}
  minReadings={MIN_OBSERVATION_READINGS}
  onGenerateReport={handleGenerateReport}
  observations={observations}
  readingCount={readingCount}
  reportGenerated={reportGenerated}
  rl={rl}
  r1={r1}
  r2={r2}
  r3={r3}
  setRl={setRl}
  setR1={setR1}
  setR2={setR2}
  setR3={setR3}
/>
              </aside>

              <section className="right-panel">
                <ConnectionLab
                experimentCase={experimentCase}
                  key={`connection-lab-${resetRequest}`}
                  autoConnectRequest={autoConnectRequest}
                  aiGuidePlaying={aiGuidePlaying}
                  checkRequest={checkRequest}
                  onCheckConnections={handleCheckConnections}
                  powerOn={powerOn}
                  r1={r1}
                  r2={r2}
                  r3={r3}
                  rl={rl}
                  readings={readings}
                  resetRequest={resetRequest}
                  scale={scale}
                  onTogglePower={handleTogglePower}
                  setVoltage={handleVoltageChange}
                  voltage={voltage}
                  voltageLocked={voltageLocked}
                  resistancesConfigured={resistancesConfigured}
                  showRth={showRth}
                  showMultimeter={showMultimeter}
                  playStepById={playStepById}
                  playStepsById={playStepsById}
                  case1ConnectionsRemoved={case1ConnectionsRemoved}
                  setCase1ConnectionsRemoved={setCase1ConnectionsRemoved}
                  case2ConnectionsRemoved={case2ConnectionsRemoved}
                  setCase2ConnectionsRemoved={setCase2ConnectionsRemoved}
                  setShowRth={setShowRth}
                  setShowMultimeter={setShowMultimeter}
                  highlightedTerminalIds={highlightedTerminalIds}
                />
              </section>
            </section>



</main>
<div className="post-simulation-content" ref={postSimulationContentRef}>
  <CalculationPanel
    key={calculationDone ? 'calculation-ready' : 'calculation-reset'}
    calculationDone={calculationDone}
    calculatedValues={calculatedValues}
    verificationResult={verificationResult}
    userCalculatedIL={userCalculatedIL}
    setUserCalculatedIL={setUserCalculatedIL}
    setVerificationResult={setVerificationResult}
    playStepById={playStepById}
  />
  <footer className="site-footer">
    © 2026 Virtual Labs, IIT Roorkee
  </footer>
</div>
        </div>
      </div>
    </div>
  )
}

export default App
