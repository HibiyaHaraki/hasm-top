import React from 'react';
import { useColorTheme } from './theme/useColorTheme.js';
import { useLanguage } from './i18n.js';
import LanguageSelector from './LanguageSelector.jsx';
import ThemeSelector from './ThemeSelector.jsx';
import Footer from './Footer.jsx';
import './extended-commit-graph.css';

export function Extended_Commit_Graph({ onNavigateHome }) {
  const { colorPattern, setColorPattern, patterns } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();
  const copy = t.ecg;

  return (
    <div className="ECG_Page">
      <div className="ECG_Inner">
        <header className="ECG_Header">
          <button type="button" className="ECG_Back" onClick={onNavigateHome}>{t.backHome}</button>
          <div className="ECG_Controls">
            <LanguageSelector language={language} onChange={setLanguage} label={t.language} />
            <ThemeSelector patterns={patterns} activePatternId={colorPattern} onChange={setColorPattern} label={t.theme} />
          </div>
        </header>

        <main>
          <section className="ECG_Intro" aria-labelledby="ecg-title">
            <div className="ECG_Eyebrow">{copy.kicker}</div>
            <h1 id="ecg-title">{copy.title}</h1>
            <p className="ECG_Lead">{copy.lead}</p>
            <p className="ECG_Status"><span className="ECG_StatusDot" aria-hidden="true" />{copy.status}</p>
          </section>

          <figure className="ECG_Overview">
            <img src={`${import.meta.env.BASE_URL}images/ecg-layers.png`} width="1600" height="800" alt={copy.overviewAlt} fetchPriority="high" />
            <figcaption><span className="ECG_FigureNumber">01</span><div><strong>{copy.overviewTitle}</strong><p>{copy.overviewCaption}</p></div></figcaption>
          </figure>

          <section className="ECG_Section" aria-labelledby="ecg-concept">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.conceptKicker}</span><h2 id="ecg-concept">{copy.conceptTitle}</h2></div>
            <p className="ECG_SectionLead">{copy.conceptDescription}</p>
            <div className="ECG_Axes">
              {copy.axes.map(([axis, title, description]) => (
                <div className="ECG_Axis" key={axis}><span className="ECG_AxisSymbol">{axis}</span><div><h3>{title}</h3><p>{description}</p></div></div>
              ))}
            </div>
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-language">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.languageKicker}</span><h2 id="ecg-language">{copy.languageTitle}</h2></div>
            <div className="ECG_Legend">
              {copy.elements.map(([kind, title, description]) => (
                <article className="ECG_LegendRow" key={kind}><span className={`ECG_Mark ECG_Mark_${kind}`} aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div></article>
              ))}
            </div>
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-example">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.exampleKicker}</span><h2 id="ecg-example">{copy.exampleTitle}</h2></div>
            <p className="ECG_SectionLead">{copy.exampleDescription}</p>
            <figure className="ECG_Example">
              <img src={`${import.meta.env.BASE_URL}images/ecg-branches.png`} width="1600" height="800" alt={copy.branchAlt} loading="lazy" />
              <figcaption><span className="ECG_FigureNumber">02</span><div><strong>{copy.branchTitle}</strong><p>{copy.branchCaption}</p></div></figcaption>
            </figure>
            <ol className="ECG_Story">
              {copy.story.map(([id, title, description]) => <li key={id}><span>{id}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}
            </ol>
            <p className="ECG_Note">{copy.trajectoryNote}</p>
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-interaction">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.interactionKicker}</span><h2 id="ecg-interaction">{copy.interactionTitle}</h2></div>
            <div className="ECG_Interactions">
              {copy.interactions.map(([title, description], index) => <article key={title}><span className="ECG_ItemNumber">0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}
            </div>
          </section>

          <section className="ECG_Section ECG_Development" aria-labelledby="ecg-development">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.developmentKicker}</span><h2 id="ecg-development">{copy.developmentTitle}</h2></div>
            <p className="ECG_SectionLead">{copy.developmentDescription}</p>
            <div className="ECG_Pipeline" aria-label={copy.pipelineLabel}>
              {copy.pipeline.map(([title, detail]) => <div key={title}><strong>{title}</strong><span>{detail}</span></div>)}
            </div>
            <dl className="ECG_Implementation">
              {copy.implementation.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}
            </dl>
            <p className="ECG_Note">{copy.scopeNote}</p>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Extended_Commit_Graph;