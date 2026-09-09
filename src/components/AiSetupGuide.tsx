import { aiSetupDownloads, aiSetupIntro, aiSetupNetworkNote } from "@/data/aiSetup";

const AiSetupGuide = () => (
  <section aria-label="AI downloads and setup" className="mt-6 space-y-5 text-sm leading-7 text-white/75">
    <p>{aiSetupIntro}</p>
    <dl className="space-y-5">
      {aiSetupDownloads.map((item) => (
        <div key={item.title}>
          <dt className="font-semibold text-white">{item.title}</dt>
          <dd className="mt-1">{item.description}</dd>
        </div>
      ))}
    </dl>
    <p>{aiSetupNetworkNote}</p>
  </section>
);

export default AiSetupGuide;
