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
              <figcaption><span className="ECG_FigureNumber">01</span><div><strong>{copy.axes3dTitle}</strong></div></figcaption>
            </figure>
            <figure className="ECG_Example">
              <img src={`${import.meta.env.BASE_URL}images/ecg-axes-2d.png`} width="1600" height="800" alt={copy.axes2dAlt} loading="lazy" />
              <figcaption><span className="ECG_FigureNumber">02</span><div><strong>{copy.axes2dTitle}</strong></div></figcaption>
            </figure>
            <div className="ECG_Axes">
              {copy.axes.map(([axis, title]) => (
                <div className="ECG_Axis" key={title}><span className="ECG_AxisSymbol">{axis}</span><div><h3>{title}</h3></div></div>
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
                <figure className="ECG_Example">
                  <img src={`${import.meta.env.BASE_URL}images/${point.image}.png`} width="1600" height="800" alt={point.alt} loading="lazy" />
                  <figcaption><span className="ECG_FigureNumber">{point.figure}</span><div><p>{point.caption}</p></div></figcaption>
                </figure>
              </article>
            ))}
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-case">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.caseKicker}</span><h2 id="ecg-case">{copy.caseTitle}</h2></div>
            <p className="ECG_SectionLead">{copy.caseDescription}</p>

            <figure className="ECG_CaseGraph">
              <img src={`${import.meta.env.BASE_URL}images/${copy.caseGraphImage}.png`} width="2400" height="1500" alt={copy.caseGraphAlt} loading="lazy" />
              <figcaption><span className="ECG_FigureNumber">{copy.caseGraphFigure}</span><div><strong>{copy.caseGraphTitle}</strong><p>{copy.caseGraphCaption}</p></div></figcaption>
            </figure>

            <div className="ECG_CaseExperiences">
              {copy.caseExperiences.map((experience) => (
                <article className={`ECG_CaseExperience ECG_CaseExperience_${experience.id.split(' ').at(-1)}`} key={experience.id}>
                  <header>
                    <span>{experience.id}</span>
                    <h3>{experience.title}</h3>
                  </header>
                  {experience.description && <p className="ECG_CaseExperienceDescription">{experience.description}</p>}
                  <ol>
                    {experience.facts.map(([id, title, description]) => (
                      <li key={id}>
                        <span>{id}</span>
                        <div><h4>{title}</h4><p>{description}</p></div>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>

            <section className="ECG_CaseLinks" aria-labelledby="ecg-case-links">
              <h3 id="ecg-case-links">{copy.caseLinksTitle}</h3>
              <div>
                {copy.caseLinks.map(([id, relation, description]) => (
                  <article key={id}>
                    <span>{id}</span>
                    <h4>{relation}</h4>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            </section>

            <div className="ECG_CaseInsights">
              {copy.caseInsights.map((insight) => (
                <article className="ECG_CaseInsight" key={insight.key}>
                  <span className="ECG_Eyebrow">{insight.kicker}</span>
                  <h3>{insight.title}</h3>
                  <p>{insight.description}</p>
                  <figure className="ECG_CaseGraph">
                    <img src={`${import.meta.env.BASE_URL}images/${insight.image}.png`} width="2400" height="1500" alt={insight.alt} loading="lazy" />
                    <figcaption><span className="ECG_FigureNumber">{insight.figure}</span><div><p>{insight.caption}</p></div></figcaption>
                  </figure>
                </article>
              ))}
            </div>
          </section>

        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Extended_Commit_Graph;