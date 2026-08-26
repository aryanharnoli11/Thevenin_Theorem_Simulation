import { useState } from 'react'
import { FormulaIcon, PdfIcon } from './Icons.jsx'
import ElectricalText from './ElectricalText.jsx'

const formulaSections = [
  {
    description: 'Thevenin resistance (RTH​) is the equivalent resistance of a linear electrical network as seen from the load terminals after removing the load resistance and deactivating all independent sources. It represents the internal resistance of the circuit in its Thevenin equivalent.',
    formula: 'R3 + (R1 × R2) / (R1 + R2)',
    formulaLead: 'Direct Formula like Rth =',
    heading: 'Steps to Calculate RTH',
    id: 'rth',
    steps: [
      'Remove the load resistance (RL​).',
      'Replace all independent voltage sources with short circuits and all independent current sources with open circuits.',
      'Calculate the equivalent resistance seen from the load terminals. This equivalent resistance is the Thevenin resistance (RTH​).',
    ],
  },
  {
    description: 'Thevenin voltage (VTH) is the open-circuit voltage measured across the load terminals after removing the load resistance (RL​).',
    formula: 'VS × (R2 / (R1 + R2))',
    formulaLead: 'Direct Formula like Vth =',
    heading: 'Steps to Calculate VTH',
    id: 'vth',
    steps: [
      'Remove the load resistance (RL​).',
      'Keep all independent sources active.',
      'Calculate the voltage across the open terminals using an appropriate circuit analysis method.',
      'The voltage obtained across the open terminals is the Thevenin voltage (VTH​).',
    ],
  },
  {
    description: 'Load Current (IL​) is the current flowing through the load resistor when it is connected to the Thevenin equivalent circuit.',
    formula: 'VTH / (RTH + RL)',
    formulaLead: 'IL =',
    id: 'il',
    steps: [],
  },
]
const ReportControls = ({
  minReadings,
  onGenerateReport,
  readingCount,
  reportGenerated,
}) => {
  const [formulasOpen, setFormulasOpen] = useState(false)
  const readingsReady = readingCount >= minReadings

  return (
  <div className="report-controls">

    {formulasOpen && (
      <aside
        aria-labelledby="formula-panel-title"
        aria-modal="true"
        className="floating-formula-panel"
        id="equations-panel"
        role="dialog"
      >

        <div className="floating-formula-panel__header">
          <h3 id="formula-panel-title">Thevenin Theorem Equations</h3>
          <button
            aria-label="Close equations panel"
            className="floating-formula-panel__close"
            type="button"
            onClick={() => setFormulasOpen(false)}
          >
            &times;
          </button>
        </div>

        <div className="floating-formula-panel__content">
          {formulaSections.map((section) => (
            <section
              className="floating-formula-panel__section"
              key={section.id}
            >
              <p className="floating-formula-panel__description">
                <ElectricalText text={section.description} />
              </p>

              {section.heading ? (
                <h4><ElectricalText text={section.heading} /></h4>
              ) : null}

              {section.steps.length > 0 ? (
                <ol className="floating-formula-panel__steps">
                  {section.steps.map((step) => (
                    <li key={step}><ElectricalText text={step} /></li>
                  ))}
                </ol>
              ) : null}

              <p className="floating-formula-panel__formula">
                <strong><ElectricalText text={section.formulaLead} /></strong>{' '}
                <span><ElectricalText text={section.formula} /></span>
              </p>
            </section>
          ))}
        </div>

      </aside>
    )}

   
    <button
      id="generate-report-button"
      type="button"
      className="report-button"
      disabled={!readingsReady}
      aria-label="Generate Report"
      data-report-generated={reportGenerated ? 'true' : 'false'}
      onClick={onGenerateReport}
    >
      <PdfIcon />
      <span>Generate Report</span>
    </button>
 <button
 id="formula-button"
      type="button"
      className="formula-button"
      aria-controls="equations-panel"
      aria-expanded={formulasOpen}
      onClick={() => setFormulasOpen((current) => !current)}
    >
      <FormulaIcon />
      <span>Equations</span>
    </button>

  </div>
)
}

export default ReportControls
