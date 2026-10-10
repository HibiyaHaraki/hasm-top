import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { useLanguage } from './i18n.js';
import SiteHeader from './SiteHeader.jsx';
import Footer from './Footer.jsx';
import './extended-commit-graph.css';

function Diagram({ image, alt, children, onOpen, openLabel, large = false, priority = false }) {
  const src = `${import.meta.env.BASE_URL}images/${image}.png`;
  const width = large ? 2400 : 1600;
  const height = large ? 1500 : 800;

  return (
    <figure className="ECG_Diagram">
      <figcaption>
        <div>{children}</div>
      </figcaption>
      <button className="ECG_ImageButton" type="button" aria-label={`${openLabel}: ${alt}`} onClick={() => onOpen({ src, alt, width, height })}>
        <img src={src} width={width} height={height} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} />
      </button>
    </figure>
  );
}

export function Extended_Commit_Graph({ onNavigateHome }) {
  const { t } = useLanguage();
  const copy = t.ecg;
  const [selectedImage, setSelectedImage] = useState(null);
  const diagramProps = { onOpen: setSelectedImage, openLabel: copy.openImage };

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
            <Diagram {...diagramProps} image="ecg-axes-3d" alt={copy.axes3dAlt} priority>
              <p className="ECG_SectionLead">{copy.coordDescription}</p>
              <h3>{copy.axes3dTitle}</h3>
              <div className="ECG_Axes">
                {copy.axes.slice(0, 2).map(([axis, title]) => (
                  <div className="ECG_Axis" key={title}><span className="ECG_AxisSymbol">{axis}</span><div><h3>{title}</h3></div></div>
                ))}
              </div>
            </Diagram>
            <Diagram {...diagramProps} image="ecg-axes-2d" alt={copy.axes2dAlt}>
              <h3>{copy.axes2dTitle}</h3>
              <div className="ECG_Axes">
                {copy.axes.slice(2).map(([axis, title]) => (
                  <div className="ECG_Axis" key={title}><span className="ECG_AxisSymbol">{axis}</span><div><h3>{title}</h3></div></div>
                ))}
              </div>
            </Diagram>
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-entities">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.entityKicker}</span><h2 id="ecg-entities">{copy.entityTitle}</h2></div>
            <p className="ECG_SectionLead">{copy.entityDescription}</p>
            <div className="ECG_Entities">
              {copy.entities.map((entity) => (
                <article className="ECG_Entity" key={entity.key}>
                  <Diagram {...diagramProps} image={entity.image} alt={entity.alt}>
                    <div className="ECG_EntityHead">
                      <span className={`ECG_Mark ECG_Mark_${entity.key}`} aria-hidden="true" />
                      <span className="ECG_EntityLabel">{entity.label}</span>
                    </div>
                    <h3>{entity.title}</h3>
                    <p>{entity.caption}</p>
                  </Diagram>
                </article>
              ))}
            </div>
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-git">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.gitKicker}</span><h2 id="ecg-git">{copy.gitTitle}</h2></div>
            <p className="ECG_SectionLead">{copy.gitDescription}</p>
            {copy.gitPoints.map((point) => (
              <article className="ECG_Difference" key={point.key}>
                <Diagram {...diagramProps} image={point.image} alt={point.alt}>
                  <h3>{point.title}</h3>
                  <p>{point.caption}</p>
                </Diagram>
              </article>
            ))}
          </section>

          <section className="ECG_Section" aria-labelledby="ecg-case">
            <div className="ECG_SectionHeading"><span className="ECG_Eyebrow">{copy.caseKicker}</span><h2 id="ecg-case">{copy.caseTitle}</h2></div>
            <Diagram {...diagramProps} image={copy.caseGraphImage} alt={copy.caseGraphAlt} large>
              <p className="ECG_SectionLead">{copy.caseDescription}</p>
              <h3>{copy.caseGraphTitle}</h3>
              <p>{copy.caseGraphCaption}</p>
            </Diagram>

            <div className="ECG_CaseExperiences">
              {copy.caseExperiences.map((experience) => (
                <article className={`ECG_CaseExperience ECG_CaseExperience_${experience.id.split(' ').at(-1)}`} key={experience.id}>
                  <details>
                    <summary>
                      <span>{experience.id}</span>
                      <h3>{experience.title}</h3>
                      <span className="ECG_DetailsHint ECG_DetailsHint_closed">{copy.showExperienceDetails}</span>
                      <span className="ECG_DetailsHint ECG_DetailsHint_open">{copy.hideExperienceDetails}</span>
                    </summary>
                    {experience.description && <p className="ECG_CaseExperienceDescription">{experience.description}</p>}
                    <ol>
                      {experience.facts.map(([id, title, description]) => (
                        <li key={id}>
                          <span>{id}</span>
                          <div><h4>{title}</h4><p>{description}</p></div>
                        </li>
                      ))}
                    </ol>
                  </details>
                </article>
              ))}
            </div>

            <section className="ECG_CaseLinks" aria-labelledby="ecg-case-links">
              <h3 id="ecg-case-links">{copy.caseLinksTitle}</h3>
              <div>
                {copy.caseLinks.map(([id, relation, description]) => (
                  <article key={id}>
                    <details>
                      <summary>
                        <span>{id}</span>
                        <h4>{relation}</h4>
                        <span className="ECG_DetailsHint ECG_DetailsHint_closed">{copy.showLinkDetails}</span>
                        <span className="ECG_DetailsHint ECG_DetailsHint_open">{copy.hideLinkDetails}</span>
                      </summary>
                      <p>{description}</p>
                    </details>
                  </article>
                ))}
              </div>
            </section>

            <div className="ECG_CaseInsights">
              {copy.caseInsights.map((insight) => (
                <article className="ECG_CaseInsight" key={insight.key}>
                  <Diagram {...diagramProps} image={insight.image} alt={insight.alt} large>
                    <span className="ECG_Eyebrow">{insight.kicker}</span>
                    <h3>{insight.title}</h3>
                    <p className="ECG_InsightDescription">{insight.description}</p>
                    <p>{insight.caption}</p>
                  </Diagram>
                </article>
              ))}
            </div>
          </section>

        </main>
      </div>
      <Footer />
      <Lightbox
        open={selectedImage !== null}
        close={() => setSelectedImage(null)}
        slides={selectedImage ? [selectedImage] : []}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        render={{ buttonPrev: () => null, buttonNext: () => null }}
        controller={{ closeOnBackdropClick: true }}
        labels={{ Close: copy.closeImage, 'Zoom in': copy.zoomIn, 'Zoom out': copy.zoomOut }}
        className="ECG_Lightbox"
      />
    </div>
  );
}

export default Extended_Commit_Graph;