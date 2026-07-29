import { useEffect, useState } from 'react';
import { useLabAlerts } from '../alerts/useLabAlerts.js';
import { EXPERIMENT_ALERTS } from '../alerts/experimentStepAlerts.js'
import ElectricalText from './ElectricalText.jsx';
const CalculationPanel = ({
  calculationDone,
  calculatedValues,
  verificationResult,
  setUserCalculatedIL,
  setVerificationResult,
  playStepById,
}) => {
  // Extracting basic parameters from calculatedValues
  const r1 = calculatedValues?.r1 ?? '';
  const r2 = calculatedValues?.r2 ?? '';
  const r3 = calculatedValues?.r3 ?? '';
  const voltageSource = calculatedValues?.voltageSource ?? '';

  // Extracting recorded load parameters
  const rl = calculatedValues?.rl ?? '';
  const observedIL = calculatedValues?.observedIL ?? '';

  const { showStepAlert } = useLabAlerts();
  const [theveninInputs, setTheveninInputs] = useState({
    rth: '',
    vth: '',
  });

  const hasTheveninInputs =
    theveninInputs.rth.trim() !== '' &&
    theveninInputs.vth.trim() !== '';
  const enteredRth = Number(theveninInputs.rth);
  const enteredVth = Number(theveninInputs.vth);
  const loadResistance = Number(rl);
  const loadCurrentDenominator = enteredRth + loadResistance;
  const inputsAreValid =
    hasTheveninInputs &&
    Number.isFinite(enteredRth) &&
    enteredRth >= 0 &&
    Number.isFinite(enteredVth) &&
    Number.isFinite(loadResistance) &&
    loadResistance >= 0 &&
    loadCurrentDenominator > 0;
  const calculatedLoadCurrent = inputsAreValid
    ? enteredVth / loadCurrentDenominator
    : null;
  const calculatedLoadCurrentDisplay =
    calculatedLoadCurrent === null
      ? ''
      : calculatedLoadCurrent.toFixed(6);

  useEffect(() => {
    setUserCalculatedIL(calculatedLoadCurrentDisplay);
  }, [calculatedLoadCurrentDisplay, setUserCalculatedIL]);

  const handleTheveninInputChange = (parameter, value) => {
    setTheveninInputs((current) => ({
      ...current,
      [parameter]: value,
    }));
    setVerificationResult('');
  };

  const handleVerify = () => {
    if (!calculationDone) return;

    if (!hasTheveninInputs) {
      showStepAlert({
        title: 'Input Required',
        description:
          'Please enter the Thevenin equivalent resistance and voltage.',
        type: 'warning',
      });
      return;
    }

    if (!inputsAreValid) {
      showStepAlert({
        title: 'Invalid Input',
        description:
          'Please enter valid values for the Thevenin equivalent resistance and voltage.',
        type: 'warning',
      });
      return;
    }

    const actual = Number(observedIL);
    const isCorrect =
      Number.isFinite(actual) &&
      Math.abs(calculatedLoadCurrent - actual) < 0.001;

    if (isCorrect) {
      playStepById?.(34)
     showStepAlert(EXPERIMENT_ALERTS.verificationSuccess)
      setVerificationResult('✅ Verified Successfully');

    } else {
      playStepById?.(33)
      showStepAlert(EXPERIMENT_ALERTS.verificationFailed)
      setVerificationResult('❌ Incorrect Calculation');
    }
  };

  return (
    <section id="calculation-panel" className="graph-panel graph-panel--separate">
      <div className="graph-panel__heading">
        <div>
          <h2>CALCULATIONS</h2>
        </div>
      </div>

      <div className="graph-panel__body">

        {/* TOP ROW: Resistance & Source Values */}
        <div className="calc-top-row">
          
          {/* Resistance Values Card */}
          <div className="values-card">
            <h3>Resistance Values</h3>
            <div className="values-inline-group">
              <div className="inline-input-item">
                <span className="inline-label">R<sub>1</sub>:</span>
                <div className="inline-display">
                  {calculationDone && r1 !== '' ? Number(r1).toFixed(1) : ''}
                </div>
                <span className="inline-unit">Ω</span>
              </div>
              
              <div className="inline-input-item">
                <span className="inline-label">R<sub>2</sub>:</span>
                <div className="inline-display">
                  {calculationDone && r2 !== '' ? Number(r2).toFixed(1) : ''}
                </div>
                <span className="inline-unit">Ω</span>
              </div>
              
              <div className="inline-input-item">
                <span className="inline-label">R<sub>3</sub>:</span>
                <div className="inline-display">
                  {calculationDone && r3 !== '' ? Number(r3).toFixed(1) : ''}
                </div>
                <span className="inline-unit">Ω</span>
              </div>

              <div className="inline-input-item">
                <span className="inline-label">R<sub>L</sub>:</span>
                <div className="inline-display">
                  {calculationDone && rl !== '' ? Number(rl).toFixed(0) : ''}
                </div>
                <span className="inline-unit">Ω</span>
              </div>
            </div>
          </div>

          {/* Source Values Card */}
          <div className="values-card">
            <h3>Source Values</h3>
            <div className="values-inline-group">

              <div className="inline-input-item">
                <span className="inline-label long-label">Voltage Source:</span>
                <div className="inline-display">
                  {calculationDone && voltageSource !== '' ? Number(voltageSource).toFixed(1) : ''}
                </div>
                <span className="inline-unit">V</span>
              </div>
            </div>
          </div>

        </div>

        {/* Thevenin Calculation Parameters */}

          {/* RTH */}
        <div className="calc-field">
          <div className="calc-label">Thevenin Equivalent Resistance:</div>
          <div className="calc-manual-entry-control">
            <div className="calc-input-group">
              <div className="calc-prefix">R<sub>TH</sub></div>
              <input
                aria-label="Enter Thevenin equivalent resistance"
                className="calc-display calc-user-input"
                disabled={!calculationDone}
                onChange={(event) => handleTheveninInputChange('rth', event.target.value)}
                placeholder="Enter value"
                min="0"
                step="0.01"
                type="number"
                value={theveninInputs.rth}
              />
              <div className="calc-suffix">Ω</div>
            </div>
          </div>
        </div>

        {/* VTH */}
        <div className="calc-field">
          <div className="calc-label">Thevenin Equivalent Voltage:</div>
          <div className="calc-manual-entry-control">
            <div className="calc-input-group">
              <div className="calc-prefix">V<sub>TH</sub></div>
              <input
                aria-label="Enter Thevenin equivalent voltage"
                className="calc-display calc-user-input"
                disabled={!calculationDone}
                onChange={(event) => handleTheveninInputChange('vth', event.target.value)}
                placeholder="Enter value"
                step="0.01"
                type="number"
                value={theveninInputs.vth}
              />
              <div className="calc-suffix">V</div>
            </div>
          </div>
        </div>
        <br />

        {/* Verification Result Cards */}
        <div className="results-section">
          <fieldset className="result-card">
            <legend>Observed Results</legend>
            <div className="result-row">
              <span className="result-label">
                Observed Load Current (<ElectricalText text="IL" />):
              </span>
              <div className="result-display">
                {calculationDone ? Number(observedIL).toFixed(6) : ''}
              </div>
              <div className="result-unit">A</div>
            </div>
          </fieldset>

          <fieldset className="result-card">
            <legend>Verification</legend>
            <div className="result-row">
              <span className="result-label">
                Calculated Load Current (<ElectricalText text="IL" />):
              </span>
              <input
                aria-label="Calculated load current"
                type="number"
                step="0.000001"
                value={calculatedLoadCurrentDisplay}
                readOnly
                disabled={!calculationDone}
                className="verification-input"
                placeholder="Calculated automatically"
              />
              <div className="result-unit">A</div>
            </div>
          </fieldset>
        </div>

        {/* Action Button Segment */}
        <div className="verification-section">
          <button
            type="button"
            onClick={handleVerify}
            disabled={!calculationDone}
            className="verify-btn"
          >
            Verify
          </button>

          {verificationResult && (
            <div
              className={`verification-message ${
                verificationResult.includes('Verified') ? 'success' : 'error'
              }`}
            >
              {verificationResult}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default CalculationPanel;
