import React from 'react';
import { useLanguage } from './i18n.js';
import SiteHeader from './SiteHeader.jsx';
import Footer from './Footer.jsx';
import './extended-commit-graph.css';

export function Extended_Commit_Graph({ onNavigateHome }) {
  const { t } = useLanguage();
  const copy = t.ecg;

  return (
    <div className="ECG_Page">
      <SiteHeader onNavigateHome={onNavigateHome} />
      <div className="ECG_Inner">
        <main>
          <section className="ECG_Intro" aria-labelledby="ecg-title">
            <div className="ECG_Eyebrow">{copy.kicker}</div>
            <h1 id="ecg-title">{copy.title}</h1>
            <p className="ECG_Lead">{copy.lead}</p>
            {/*<p className="ECG_Status"><span className="ECG_StatusDot" aria-hidden="true" />{copy.status}</p>*/}
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-coord">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.coordKicker}</span><h2 id="ecg-coord">{copy.coordTitle}</h2></div>
            <p className="ECG_SectionLead">{copy.coordDescription}</p>
            <figure className="ECG_Overview">
              <img src={`${import.meta.env.BASE_URL}images/ecg-axes-3d.png`} width="1600" height="800" alt={copy.axes3dAlt} fetchPriority="high" />
              <figcaption><span className="ECG_FigureNumber">01</span><div><strong>{copy.axes3dTitle}</strong><p>{copy.axes3dCaption}</p></div></figcaption>
            </figure>
            <figure className="ECG_Example">
              <img src={`${import.meta.env.BASE_URL}images/ecg-axes-2d.png`} width="1600" height="800" alt={copy.axes2dAlt} loading="lazy" />
              <figcaption><span className="ECG_FigureNumber">02</span><div><strong>{copy.axes2dTitle}</strong><p>{copy.axes2dCaption}</p></div></figcaption>
            </figure>
            <div className="ECG_Axes">
              {copy.axes.map(([axis, title, description]) => (
                <div className="ECG_Axis" key={title}><span className="ECG_AxisSymbol">{axis}</span><div><h3>{title}</h3><p>{description}</p></div></div>
              ))}
            </div>
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-entities">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.entityKicker}</span><h2 id="ecg-entities">{copy.entityTitle}</h2></div>
            <p className="ECG_SectionLead">{copy.entityDescription}</p>
            <div className="ECG_Entities">
              {copy.entities.map((entity) => (
                <article className="ECG_Entity" key={entity.key}>
                  <div className="ECG_EntityHead">
                    <span className={`ECG_Mark ECG_Mark_${entity.key}`} aria-hidden="true" />
                    <span className="ECG_EntityLabel">{entity.label}</span>
                  </div>
                  <h3>{entity.title}</h3>
                  <p>{entity.description}</p>
                  <figure className="ECG_Example">
                    <img src={`${import.meta.env.BASE_URL}images/${entity.image}.png`} width="1600" height="800" alt={entity.alt} loading="lazy" />
                    <figcaption><span className="ECG_FigureNumber">{entity.figure}</span><div><p>{entity.caption}</p></div></figcaption>
                  </figure>
                </article>
              ))}
            </div>
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-git">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.gitKicker}</span><h2 id="ecg-git">{copy.gitTitle}</h2></div>
            <p className="ECG_SectionLead">{copy.gitDescription}</p>
            {copy.gitPoints.map((point) => (
              <article className="ECG_Difference" key={point.key}>
                <h3>{point.title}</h3>
                <p>{point.description}</p>
                <figure className="ECG_Example">
                  <img src={`${import.meta.env.BASE_URL}images/${point.image}.png`} width="1600" height="800" alt={point.alt} loading="lazy" />
                  <figcaption><span className="ECG_FigureNumber">{point.figure}</span><div><p>{point.caption}</p></div></figcaption>
                </figure>
              </article>
            ))}
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