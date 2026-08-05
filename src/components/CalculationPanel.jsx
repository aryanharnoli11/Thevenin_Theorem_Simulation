import { useEffect, useState } from 'react';
import ElectricalText from './ElectricalText.jsx';
import { amperesToMilliamperes } from '../utils/current.js';
import {
  formatKilohms,
  kilohmsToOhms,
} from '../utils/resistance.js';
const CalculationPanel = ({
  calculationDone,
  calculatedValues,
  verificationResult,
  setUserCalculatedIL,
  setVerificationResult,
  onGuideEvent,
}) => {
  // Extracting basic parameters from calculatedValues
  const r1 = calculatedValues?.r1 ?? '';
  const r2 = calculatedValues?.r2 ?? '';
  const r3 = calculatedValues?.r3 ?? '';
  const voltageSource = calculatedValues?.voltageSource ?? '';

  // Extracting recorded load parameters
  const rl = calculatedValues?.rl ?? '';
  const observedIL = calculatedValues?.observedIL ?? '';

  const [theveninInputs, setTheveninInputs] = useState({
    rth: '',
    vth: '',
    rl: '',
  });

  const hasTheveninInputs =
    theveninInputs.rth.trim() !== '' &&
    theveninInputs.vth.trim() !== '' &&
    theveninInputs.rl.trim() !== '';
  const enteredRthKilohms = Number(theveninInputs.rth);
  const enteredVth = Number(theveninInputs.vth);
  const loadResistanceKilohms = Number(theveninInputs.rl);
  const enteredRth = kilohmsToOhms(enteredRthKilohms);
  const loadResistance = kilohmsToOhms(loadResistanceKilohms);
  const loadCurrentDenominator = enteredRth + loadResistance;
  const inputsAreValid =
    hasTheveninInputs &&
    Number.isFinite(enteredRthKilohms) &&
    enteredRthKilohms >= 0 &&
    Number.isFinite(enteredVth) &&
    Number.isFinite(loadResistanceKilohms) &&
    loadResistanceKilohms >= 0 &&
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
      onGuideEvent?.({
        alertType: 'warning',
        title: 'Input Required',
        description:
          'Please enter the Thevenin equivalent voltage, resistance, and load resistance.',
        target: '#calculation-panel',
        type: 'CALCULATION_INPUT_REQUIRED',
      });
      return;
    }

    if (!inputsAreValid) {
      onGuideEvent?.({
        alertType: 'warning',
        title: 'Invalid Input',
        description:
          'Please enter valid values for the Thevenin equivalent voltage, resistance, and load resistance.',
        target: '#calculation-panel',
        type: 'CALCULATION_INPUT_INVALID',
      });
      return;
    }

    const actual = Number(observedIL);
    const isCorrect =
      Number.isFinite(actual) &&
      Math.abs(calculatedLoadCurrent - actual) < 0.001;

    if (isCorrect) {
      onGuideEvent?.({
        isCorrect: true,
        type: 'VERIFICATION_RESULT',
      })
      setVerificationResult('✅ Verified Successfully');

    } else {
      onGuideEvent?.({
        isCorrect: false,
        type: 'VERIFICATION_RESULT',
      })
      setVerificationResult('❌ Incorrect Calculation');
    }
  };

  return (
    <section id="calculation-panel" className="graph-panel graph-panel--separate">
      <div className="graph-panel__heading">
        <div>
          <h2>THEORETICAL CALCULATIONS</h2>
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
                  {calculationDone && r1 !== '' ? formatKilohms(r1, 0) : ''}
                </div>
                <span className="inline-unit">kΩ</span>
              </div>
              
              <div className="inline-input-item">
                <span className="inline-label">R<sub>2</sub>:</span>
                <div className="inline-display">
                  {calculationDone && r2 !== '' ? formatKilohms(r2, 0) : ''}
                </div>
                <span className="inline-unit">kΩ</span>
              </div>
              
              <div className="inline-input-item">
                <span className="inline-label">R<sub>3</sub>:</span>
                <div className="inline-display">
                  {calculationDone && r3 !== '' ? formatKilohms(r3, 0) : ''}
                </div>
                <span className="inline-unit">kΩ</span>
              </div>

              <div className="inline-input-item">
                <span className="inline-label">R<sub>L</sub>:</span>
                <div className="inline-display">
                  {calculationDone && rl !== '' ? formatKilohms(rl, 1) : ''}
                </div>
                <span className="inline-unit">kΩ</span>
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
                  {calculationDone && voltageSource !== '' ? Number(voltageSource) : ''}
                </div>
                <span className="inline-unit">V</span>
              </div>
            </div>
          </div>

        </div>

        {/* Observed and calculated current share one continuous calculation area. */}
        <div className="load-current-calculation">
          <div className="observed-current-row">
            <span className="load-current-heading">
              Observed Load Current (<ElectricalText text="IL" />) =
            </span>
            <output
              aria-label="Observed load current in milliamperes"
              className="observed-current-value"
            >
              {calculationDone && observedIL !== ''
                ? amperesToMilliamperes(observedIL).toFixed(3)
                : ''}
              {calculationDone && observedIL !== '' ? ' mA' : ''}
            </output>
          </div>

          <div className="calculated-current-section">
            <h3 className="load-current-heading">
              Calculated Load Current (<ElectricalText text="IL" />):
            </h3>

            <div
              className="load-current-equation"
              aria-label="Load current equals Thevenin voltage divided by the sum of Thevenin resistance and load resistance"
            >
              <span className="equation-lead">
                <ElectricalText text="IL" /> =
              </span>

              <div className="equation-fraction">
                <label className="equation-term equation-numerator">
                  <ElectricalText text="Vth" />
                  <input
                    aria-label="Enter Thevenin equivalent voltage"
                    className="formula-input"
                    disabled={!calculationDone}
                    onChange={(event) => handleTheveninInputChange('vth', event.target.value)}
                    placeholder="Enter Value"
                    step="0.01"
                    type="number"
                    value={theveninInputs.vth}
                  />
                  <span className="equation-input-unit">V</span>
                </label> 
                <div className="equation-denominator">
                  <label className="equation-term">
                    <ElectricalText text="Rth" />
                    <input
                      aria-label="Enter Thevenin equivalent resistance in kilo-ohms"
                      className="formula-input"
                      disabled={!calculationDone}
                      min="0"
                      onChange={(event) => handleTheveninInputChange('rth', event.target.value)}
                      placeholder="Enter Value"
                      step="0.01"
                      type="number"
                      value={theveninInputs.rth}
                    />
                    <span className="equation-input-unit">kΩ</span>
                  </label>
                  <span aria-hidden="true" className="equation-operator">+</span>
                  <label className="equation-term">
                    <ElectricalText text="RL" />
                    <input
                      aria-label="Enter load resistance in kilo-ohms"
                      className="formula-input"
                      disabled={!calculationDone}
                      min="0"
                      onChange={(event) => handleTheveninInputChange('rl', event.target.value)}
                      placeholder="Enter Value"
                      step="0.01"
                      type="number"
                      value={theveninInputs.rl}
                    />
                    <span className="equation-input-unit">kΩ</span>
                  </label>
                </div>
              </div>

              <div className="equation-result">
                <span className="equation-equals" aria-hidden="true">=</span>
                <input
                  aria-label="Calculated load current"
                  aria-readonly="true"
                  className="formula-input formula-result-input"
                  disabled={!calculationDone}
                  placeholder="Answer"
                  readOnly
                  step="0.000001"
                  type="number"
                  value={calculatedLoadCurrentDisplay}
                />
                <span className="equation-unit">mA</span>
              </div>
            </div>
          </div>
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
