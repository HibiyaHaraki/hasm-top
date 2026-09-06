import React, { useEffect, useState } from 'react';
import { useLanguage } from './i18n.js';

const DOWNLOADS_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/downloads`;
const INSTALLER_LABELS = {
  '.msi': 'winMsi',
  '.exe': 'winExe',
  '.zip': 'winZip',
  '.dmg': 'macDmg',
  '.AppImage': 'linuxAppImage',
  '.deb': 'linuxDeb',
};

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
  const [availableFiles, setAvailableFiles] = useState([]);

  const isHasm = appType === 'hasm';
  const folder = isHasm ? 'hasm' : 'hasm_markdown';
  const downloadsBase = `${DOWNLOADS_BASE}/${folder}`;
  const title = isHasm ? t.downloadTitleHasm : t.downloadTitleMarkdown;
  const subtitle = isHasm ? t.downloadSubtitleHasm : t.downloadSubtitleMarkdown;

  useEffect(() => {
    let isMounted = true;

    fetch(`${DOWNLOADS_BASE}/manifest.json`)
      .then((response) => (response.ok ? response.json() : {}))
      .then((manifest) => {
        if (isMounted) {
          setAvailableFiles(Array.isArray(manifest[folder]) ? manifest[folder] : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAvailableFiles([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [folder]);

  const getInstallerExtension = (file) => (file.endsWith('.AppImage') ? '.AppImage' : `.${file.split('.').pop()}`);
  const getInstallerButton = (file) => ({
    file,
    label: t[INSTALLER_LABELS[getInstallerExtension(file)]] ?? file,
    variant: getInstallerExtension(file) === '.msi' || getInstallerExtension(file) === '.dmg' || getInstallerExtension(file) === '.AppImage' ? 'primary' : 'secondary',
    icon: getInstallerExtension(file) === '.msi' || getInstallerExtension(file) === '.dmg' || getInstallerExtension(file) === '.AppImage' ? '📥' : '📦',
  });

  const osGroups = [
    {
      key: 'windows',
      icon: '🪟',
      title: t.winTitle,
      buttons: availableFiles.filter((file) => ['.msi', '.exe', '.zip'].includes(getInstallerExtension(file))).map(getInstallerButton),
    },
    {
      key: 'macos',
      icon: '🍎',
      title: t.macTitle,
      buttons: availableFiles.filter((file) => getInstallerExtension(file) === '.dmg').map(getInstallerButton),
    },
    {
      key: 'linux',
      icon: '🐧',
      title: t.linuxTitle,
      buttons: availableFiles.filter((file) => ['.AppImage', '.deb'].includes(getInstallerExtension(file))).map(getInstallerButton),
    },
  ].filter((group) => group.buttons.length > 0);

  return (
    <section className="OsDownload_Section" id="download">
      <style>{downloadSectionStyles}</style>

      <div className="OsDownload_Header">
        <div className="OsDownload_Kicker">{t.downloadHeader}</div>
        <h2 className="OsDownload_Title">{title}</h2>
        <p className="OsDownload_Subtitle">{subtitle}</p>
        <span className="OsDownload_Badge">{t.buildVersionTag}</span>
      </div>

      <div className="OsDownload_Grid">
        {osGroups.length === 0 ? (
          <p className="OsDownload_Subtitle">{t.downloadUnavailable}</p>
        ) : osGroups.map((group) => (
          <div className="OsDownload_Card" key={group.key}>
            <div className="OsDownload_OsHeader">
              <span className="OsDownload_OsIcon">{group.icon}</span>
              <span className="OsDownload_OsName">{group.title}</span>
            </div>
            <div className="OsDownload_Buttons">
              {group.buttons.map((button) => (
                <a
                  href={`${downloadsBase}/${button.file}`}
                  download={button.file}
                  className={`OsDownload_Btn ${button.variant === 'primary' ? 'OsDownload_BtnPrimary' : 'OsDownload_BtnSecondary'}`}
                  key={button.file}
                >
                  {button.icon} {button.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default OsDownloadSection;
