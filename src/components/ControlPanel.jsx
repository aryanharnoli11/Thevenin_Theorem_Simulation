import ObservationTable from './ObservationTable.jsx'
import ReportControls from './ReportControls.jsx'
import ResistanceSlider from './ResistanceSlider.jsx'
import SectionCard from './SectionCard.jsx'

const ControlPanel = ({
  locked,
  minReadings,
  onGenerateReport,
  observations,
  readingCount,
  reportGenerated,
  rl,
  r1,
  r2,
  r3,
  setRl,
  setR1,
  setR2,
  setR3,
}) => (
  <>
    <SectionCard
      className="h-[208px]"
      icon="sliders"
      id="resistance-controls"
      title="RESISTANCE SLIDERS"
    >
      <div className="flex flex-col gap-[14.4px] px-[20.8px] pt-[20.8px]">

        <ResistanceSlider
          disabled={locked}
          label="RL"
          onChange={setRl}
          value={rl}
        />

        <ResistanceSlider
          disabled={locked}
          label="R1"
          onChange={setR1}
          value={r1}
        />

        <ResistanceSlider
          disabled={locked}
          label="R2"
          onChange={setR2}
          value={r2}
        />

        <ResistanceSlider
          disabled={locked}
          label="R3"
          onChange={setR3}
          value={r3}
        />

      </div>
    </SectionCard>

    <ObservationTable observations={observations} />

    <ReportControls
      minReadings={minReadings}
      onGenerateReport={onGenerateReport}
      readingCount={readingCount}
      reportGenerated={reportGenerated}
    />
  </>
)

export default ControlPanel
