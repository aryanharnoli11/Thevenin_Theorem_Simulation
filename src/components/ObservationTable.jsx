import SectionCard from './SectionCard.jsx'
import { amperesToMilliamperes } from '../utils/current.js'
import { formatKilohms } from '../utils/resistance.js'

const OBSERVATION_ROW_COUNT = 1
const emptyRows = Array.from({ length: OBSERVATION_ROW_COUNT })

const ObservationTable = ({ observations }) => (
  <SectionCard className="observation-table-card" icon="table" id="observation-table-panel" title="OBSERVATION TABLE">
    <div className="observation-table-wrap">
      <table className="observation-table">
<thead>
  <tr>
    <th>S.No</th>
    <th>V<sub>TH</sub> (V)</th>
    <th>R<sub>TH</sub> (k&Omega;)</th>
    <th>R<sub>L</sub> (k&Omega;)</th>
    <th>I<sub>L</sub> (mA)</th>
  </tr>
</thead>
        <tbody>
          {emptyRows.map((_, index) => {
            const row = observations[index]

            return (
              <tr key={index}>
                <td>{row?.id ?? ''}</td>
               <td>{typeof row?.vth === 'number' ? row.vth.toFixed(2) : ''}</td>

<td>{typeof row?.rth === 'number' ? formatKilohms(row.rth, 2) : ''}</td>

<td>{typeof row?.rl === 'number' ? formatKilohms(row.rl, 1) : ''}</td>

<td>{typeof row?.il === 'number' ? amperesToMilliamperes(row.il).toFixed(3) : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </SectionCard>
)

export default ObservationTable
