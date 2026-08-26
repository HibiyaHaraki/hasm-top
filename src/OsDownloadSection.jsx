import React from 'react';
import { useLanguage } from './i18n.js';

const downloadSectionStyles = `
  .OsDownload_Section {
    margin-top: 48px;
    padding: 36px 24px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    border-top: 3px solid var(--theme-primary);
  }

  .OsDownload_Header {
    text-align: center;
    margin-bottom: 28px;
  }

  .OsDownload_Kicker {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--theme-accent-readable);
    margin-bottom: 6px;
  }

  .OsDownload_Title {
    font-family: Georgia, serif;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    font-weight: 700;
    margin: 0 0 10px;
  }

  .OsDownload_Subtitle {
    max-width: 680px;
    margin: 0 auto 12px;
    color: var(--theme-muted);
    font-size: 0.95rem;
  }

  .OsDownload_Badge {
    display: inline-block;
    padding: 4px 12px;
    font-size: 0.75rem;
    font-weight: 700;
    background: var(--theme-soft);
    border: 1px solid var(--theme-border);
    color: var(--theme-accent-readable);
  }

  .OsDownload_Grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 28px;
  }

  .OsDownload_Card {
    display: flex;
    flex-direction: column;
    padding: 24px;
    background: var(--theme-textbackground);
    border: 1px solid var(--theme-border);
    gap: 16px;
  }

  .OsDownload_OsHeader {
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--theme-border);
    padding-bottom: 12px;
  }

  .OsDownload_OsIcon {
    font-size: 1.6rem;
  }

  .OsDownload_OsName {
    font-family: Georgia, serif;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .OsDownload_Buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .OsDownload_Btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 18px;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }

  .OsDownload_BtnPrimary {
    background: var(--theme-primary);
    color: var(--theme-on-accent);
    border: 1px solid var(--theme-primary);
  }

  .OsDownload_BtnPrimary:hover {
    opacity: 0.9;
  }

  .OsDownload_BtnSecondary {
    background: var(--theme-surface);
    color: var(--theme-text);
    border: 1px solid var(--theme-border);
  }

  .OsDownload_BtnSecondary:hover {
    background: var(--theme-soft);
  }
`;

export function OsDownloadSection({ appType = 'hasm' }) {
  const { t } = useLanguage();

  const isHasm = appType === 'hasm';
  const folder = isHasm ? 'hasm' : 'hasm_markdown';
  const title = isHasm ? t.downloadTitleHasm : t.downloadTitleMarkdown;

  const files = isHasm
    ? {
        msi: 'hasm_0.1.0_x64_en-US.msi',
        zip: 'hasm_0.1.0_x64_portable.zip',
        dmg: 'hasm_0.1.0_aarch64.dmg',
        appImage: 'hasm_0.1.0_amd64.AppImage',
        deb: 'hasm_0.1.0_amd64.deb',
      }
    : {
        msi: 'hasm_markdown_0.1.0_x64_en-US.msi',
        zip: 'hasm_markdown_0.1.0_x64_portable.zip',
        dmg: 'hasm_markdown_0.1.0_aarch64.dmg',
        appImage: 'hasm_markdown_0.1.0_amd64.AppImage',
        deb: 'hasm_markdown_0.1.0_amd64.deb',
      };

  return (
    <section className="OsDownload_Section" id="download">
      <style>{downloadSectionStyles}</style>

      <div className="OsDownload_Header">
        <div className="OsDownload_Kicker">{t.downloadHeader}</div>
        <h2 className="OsDownload_Title">{title}</h2>
        <p className="OsDownload_Subtitle">{t.downloadSubtitle}</p>
        <span className="OsDownload_Badge">{t.buildVersionTag}</span>
      </div>

      <div className="OsDownload_Grid">
        {/* WINDOWS */}
        <div className="OsDownload_Card">
          <div className="OsDownload_OsHeader">
            <span className="OsDownload_OsIcon">🪟</span>
            <span className="OsDownload_OsName">{t.winTitle}</span>
          </div>
          <div className="OsDownload_Buttons">
            <a
              href={`/downloads/${folder}/${files.msi}`}
              download={files.msi}
              className="OsDownload_Btn OsDownload_BtnPrimary"
            >
              📥 {t.winMsi}
            </a>
            <a
              href={`/downloads/${folder}/${files.zip}`}
              download={files.zip}
              className="OsDownload_Btn OsDownload_BtnSecondary"
            >
              📦 {t.winZip}
            </a>
          </div>
        </div>

        {/* MACOS */}
        <div className="OsDownload_Card">
          <div className="OsDownload_OsHeader">
            <span className="OsDownload_OsIcon">🍎</span>
            <span className="OsDownload_OsName">{t.macTitle}</span>
          </div>
          <div className="OsDownload_Buttons">
            <a
              href={`/downloads/${folder}/${files.dmg}`}
              download={files.dmg}
              className="OsDownload_Btn OsDownload_BtnPrimary"
            >
              📥 {t.macDmg}
            </a>
            <a
              href={`/downloads/${folder}/${files.dmg}`}
              download={files.dmg}
              className="OsDownload_Btn OsDownload_BtnSecondary"
            >
              📦 {t.macTar}
            </a>
          </div>
        </div>

        {/* LINUX */}
        <div className="OsDownload_Card">
          <div className="OsDownload_OsHeader">
            <span className="OsDownload_OsIcon">🐧</span>
            <span className="OsDownload_OsName">{t.linuxTitle}</span>
          </div>
          <div className="OsDownload_Buttons">
            <a
              href={`/downloads/${folder}/${files.appImage}`}
              download={files.appImage}
              className="OsDownload_Btn OsDownload_BtnPrimary"
            >
              📥 {t.linuxAppImage}
            </a>
            <a
              href={`/downloads/${folder}/${files.deb}`}
              download={files.deb}
              className="OsDownload_Btn OsDownload_BtnSecondary"
            >
              📦 {t.linuxDeb}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OsDownloadSection;
