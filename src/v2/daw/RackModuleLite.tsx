// Four vendored NAM Rack knobs (vendor/NAMRackKnob.tsx, unchanged) inside a
// compact module chrome modelled on OpenStudio's NAMRackChainModule card.
import { memo } from "react";
import { Power, Zap } from "lucide-react";
import { RackKnob } from "./vendor/NAMRackKnob";
import type { BuiltInParamDescriptor } from "./vendor/stubs/nativeBridgeTypes";
import { RACK_PARAMS } from "./sessionScript";

interface RackModuleLiteProps {
  values: Record<string, number>;
  power: boolean;
  title?: string;
  caption?: string;
}

const noop = () => undefined;

export const RackModuleLite = memo(function RackModuleLite({
  values,
  power,
  title = "NAM Rack",
  caption = "JVM 410H · 4×12 V30",
}: RackModuleLiteProps) {
  return (
    <section className="daw-rack-module" aria-label={`${title} module`} data-active={power}>
      <header className="daw-rack-module__head">
        <span className="daw-rack-module__title">
          <strong>
            <Zap size={10} style={{ display: "inline", verticalAlign: "-1px", marginRight: 4 }} />
            {title}
          </strong>
          <small>{caption}</small>
        </span>
        <span className="daw-rack-module__power" data-active={power} aria-hidden="true">
          <Power size={11} />
        </span>
      </header>
      <div className="daw-rack-module__knobs">
        {RACK_PARAMS.map((param) => {
          const live: BuiltInParamDescriptor = { ...param, value: values[param.id] ?? param.value };
          return <RackKnob key={param.id} param={live} onChange={noop} disabled={!power} />;
        })}
      </div>
      <footer className="daw-rack-module__foot">
        <span>
          <i className="daw-rack-module__led" data-on={power} /> Model loaded
        </span>
        <span>A / B</span>
      </footer>
    </section>
  );
});
