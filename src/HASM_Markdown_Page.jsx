import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Design tokens & syntax highlighting synced from submodules/hasm_markdown (see scripts/sync-markdown-design.mjs).
import './generated/markdown-design-tokens.css';
import { highlightMarkdown } from './generated/markdownHighlight.js';
import hasmLogo from './assets/logo/hasm_logo_transparent.png';
import { useColorTheme } from './theme/useColorTheme.js';
import ThemeSelector from './ThemeSelector.jsx';

// レイアウト専用スタイル（配色・タイポ・エディタ/プレビューの見た目は generated/markdown-design-tokens.css 側で同期）
const hasmStyles = `
  .hasm-lp-root {
    font-family: "Yu Mincho", "游明朝", Georgia, serif;
    color: var(--theme-text);
    background-color: var(--theme-textbackground);
    letter-spacing: 0.03em;
    line-height: 1.75;
  }

  .sticky-container {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    align-items: center;
  }

  .feature-step {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .HASM_Markdown_Editor_Pane {
    border: 1px solid var(--theme-border);
    background: var(--theme-surface);
    box-shadow: 0 10px 30px rgba(20, 18, 15, 0.12);
    overflow: hidden;
  }

  .HASM_Markdown_Editor_ViewerCol_Viewer {
    padding: 24px;
    min-height: 380px;
  }

  .BackHomeLink {
    position: fixed;
    top: 18px;
    left: 18px;
    z-index: 20;
    padding: 6px 12px;
    color: var(--theme-text);
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    box-shadow: 0 6px 18px rgba(20, 18, 15, 0.12);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
  }

  .ThemeSelector {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    color: var(--theme-text);
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    box-shadow: 0 6px 18px rgba(20, 18, 15, 0.12);
  }

  .ThemeSelector_Label {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--theme-muted);
  }

  .ThemeSelector_Select {
    padding: 4px 8px;
    color: var(--theme-text);
    background: var(--theme-input-bg);
    border: 1px solid var(--theme-border);
  }
`;

// 異なるPC・OSのイラストアニメーション（右側プレビュー用）
const EnvironmentIllustrations = () => {
  const [currentEnv, setCurrentEnv] = useState(0);
  const environments = [
    { name: 'macOS (MacBook)', color: '#2d3748', icon: '🍎', border: '#e2e8f0' },
    { name: 'Windows 11 (PC)', color: '#0f172a', icon: '🪟', border: '#38bdf8' },
    { name: 'Ubuntu Linux', color: '#1c1917', icon: '🐧', border: '#f97316' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEnv((prev) => (prev + 1) % environments.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [environments.length]);

  const env = environments[currentEnv];

  return (
    <div className="p-2 text-center">
      {/* OSインジケーター */}
      <div className="d-flex justify-content-center gap-2 mb-3">
        {environments.map((e, idx) => (
          <span
            key={e.name}
            className={`badge px-2 py-1 ${idx === currentEnv ? 'bg-primary' : 'bg-secondary'}`}
            style={{ fontSize: '0.7rem', transition: 'all 0.3s' }}
          >
            {e.icon} {e.name.split(' ')[0]}
          </span>
        ))}
      </div>

      {/* PCイラスト・フレーム */}
      <motion.div
        key={env.name}
        initial={{ opacity: 0, scale: 0.92, rotateY: -15 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.4 }}
        className="p-3 rounded-3 shadow-lg text-start mx-auto"
        style={{
          background: env.color,
          border: `2px solid ${env.border}`,
          maxWidth: '420px',
          color: '#f8fafc'
        }}
      >
        <div className="d-flex align-items-center justify-content-between border-bottom border-secondary pb-2 mb-2">
          <div className="d-flex gap-1">
            <span className="rounded-circle bg-danger d-inline-block" style={{ width: 8, height: 8 }}></span>
            <span className="rounded-circle bg-warning d-inline-block" style={{ width: 8, height: 8 }}></span>
            <span className="rounded-circle bg-success d-inline-block" style={{ width: 8, height: 8 }}></span>
          </div>
          <span className="font-monospace text-muted" style={{ fontSize: '0.65rem' }}>
            {env.icon} HASM Editor — {env.name}
          </span>
        </div>

        <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.06)', fontSize: '0.85rem' }}>
          <div className="fw-bold mb-1" style={{ color: 'var(--theme-primary)' }}>ポータブル動作中</div>
          <p className="small text-light mb-2">
            異なるユーザー環境やOSでも、依存ファイルを同一フォルダから自動読み込みして同一レンダリングを実現。
          </p>
          <div className="p-2 rounded font-monospace small" style={{ background: '#000', color: '#4ade80' }}>
            [Loaded] asset:portable.mp4<br />
            [Status] 100% Local & Portable
          </div>
        </div>
      </motion.div>

      <div className="mt-3 text-muted small" style={{ fontSize: '0.72rem' }}>
        ※ USBメモリやクラウド同期フォルダからそのまま起動可能
      </div>
    </div>
  );
};

// 各機能の入力テキスト・プレビュー定義
const features = [
  {
    id: 'portable',
    question: 'Q. 異なるPC・異なる人でもそのまま開ける？',
    markdownText: `# クロスプラットフォームポータブル

![動作デモ](asset:portable.mp4)

- USB1本でどこでもそのまま起動
- OSや個人の環境差分を完全吸収
- 設定ファイル(config.json)とアセットが一体化`,
    renderPreview: () => <EnvironmentIllustrations />
  },
  {
    id: 'asset',
    question: 'Q. 画像やアセットの参照管理はどうなる？',
    markdownText: `## アセット管理機能

![図解](asset:architecture-diagram)

同一フォルダ内のアセットをマニフェスト管理。
パス崩れを防ぎ、安全に埋め込みできます。`,
    renderPreview: () => (
      <div>
        <h3 className="border-bottom pb-2 border-secondary">アセット管理機能</h3>
        <p className="mt-3">同一フォルダ内のアセットをマニフェスト管理。パス崩れを防ぎ、安全に埋め込みできます。</p>
        
        <div className="alert alert-warning border-secondary mt-3 d-flex align-items-center gap-3">
          <div className="fs-3">◇</div>
          <div className="small">
            <strong>asset:architecture-diagram</strong>
            <br />
            <span className="text-muted">マニフェスト経由で自動解決・正常参照中</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'privacy',
    question: 'Q. 外部通信やトラッキングの心配は？',
    markdownText: `### 完全ローカル・セキュリティ

- 外部API依存 : ゼロ
- 自動送信テレメトリ : なし

オフライン環境でも100%動作を保証します。`,
    renderPreview: () => (
      <div>
        <h4 className="border-bottom pb-2 border-secondary">完全ローカル・セキュリティ</h4>
        <ul className="mt-3">
          <li>外部API依存 : ゼロ</li>
          <li>自動送信テレメトリ : なし</li>
        </ul>
        <div className="p-3 my-3 text-center border border-secondary rounded" style={{ background: 'var(--theme-surface)' }}>
          <div className="fs-2 mb-1">🛡️</div>
          <div className="fw-bold">100% Offline & Local</div>
          <div className="small text-muted">機密文書やプライベートな思考の記録にも安心</div>
        </div>
      </div>
    )
  }
];

// タイピング演出コンポーネント
const TypewriterText = ({ htmlContent }) => {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    setDisplayedLength(0);
    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev < htmlContent.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 15);

    return () => clearInterval(timer);
  }, [htmlContent]);

  const currentHtml = htmlContent.slice(0, displayedLength);

  return (
    <div 
      className="MarkdownSyntax_Input flex-grow-1"
      dangerouslySetInnerHTML={{ __html: currentHtml + '<span style="color:var(--theme-primary)">|</span>' }}
    />
  );
};

// Gutter markup mirrors HASM_Markdown_Editor.jsx exactly, so the shared .HASM_Markdown_Editor_EditorCol_Editor_LineNum > span rule applies.
const LineNumberGutter = ({ count }) => (
  <div className="HASM_Markdown_Editor_EditorCol_Editor_LineNum">
    {Array.from({ length: count }, (_, i) => i + 1).map((lineNumber) => (
      <span key={lineNumber}>{lineNumber}</span>
    ))}
  </div>
);

export const HASM_Markdown_Page = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { colorPattern, setColorPattern, patterns } = useColorTheme();

  return (
    <div className="hasm-lp-root EditorColor_light min-vh-100">
      <style>{hasmStyles}</style>
      {onNavigateHome && (
        <button type="button" className="BackHomeLink" onClick={onNavigateHome}>&larr; HASM</button>
      )}
      <ThemeSelector patterns={patterns} activePatternId={colorPattern} onChange={setColorPattern} />

      {/* ヒーローセクション */}
      <section className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center p-4">
        <img src={hasmLogo} alt="HASM" className="mb-3" style={{ width: 96, height: 96, objectFit: 'contain' }} />
        <div className="mb-2 text-uppercase fw-bold" style={{ color: 'var(--theme-primary)', fontSize: '0.8rem', letterSpacing: '0.16em' }}>
          HASM MARKDOWN EDITOR
        </div>
        <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          思考をそのまま、どこへでも持ち運ぶ。
        </h1>
        <p className="lead text-muted max-w-lg mb-4">
          インストール不要・完全ローカル完結のポータブル・マークダウンエディタ。
        </p>
        <p className="small text-secondary mt-5">↓ スクロールして体験を見る</p>
      </section>

      {/* スティッキースクロール */}
      <section className="container py-5">
        <div className="row g-4">
          
          {/* 左側: エディタ領域 */}
          <div className="col-md-6" style={{ paddingBottom: '30vh' }}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                onViewportEnter={() => setActiveTab(index)}
                viewport={{ amount: 0.6 }}
                className="feature-step"
                style={{
                  opacity: activeTab === index ? 1 : 0.25,
                  transition: 'opacity 0.4s ease'
                }}
              >
                <div className="mb-2 fw-bold" style={{ color: 'var(--theme-primary)', fontSize: '0.85rem' }}>
                  {feature.question}
                </div>
                
                <div className="HASM_Markdown_Editor_Pane">
                  <div className="HASM_Markdown_Editor_EditorCol_Title">
                    <span>EDITOR</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--theme-primary)' }}>note_{index + 1}.md</span>
                  </div>
                  <div className="d-flex">
                    <LineNumberGutter count={6} />
                    {activeTab === index ? (
                      <TypewriterText htmlContent={highlightMarkdown(feature.markdownText)} />
                    ) : (
                      <div 
                        className="MarkdownSyntax_Input flex-grow-1"
                        dangerouslySetInnerHTML={{ __html: highlightMarkdown(feature.markdownText) }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 右側: プレビュー領域（画面固定） */}
          <div className="col-md-6">
            <div className="sticky-container">
              <div className="w-100 HASM_Markdown_Editor_Pane">
                <div className="HASM_Markdown_Editor_ViewerCol_Title">
                  <span>PREVIEW</span>
                  <span className="badge" style={{ background: 'var(--theme-primary)', color: '#fff' }}>LIVE</span>
                </div>
                
                <div className="HASM_Markdown_Editor_ViewerCol_Viewer">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {features[activeTab].renderPreview()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* フッター / ダウンロード */}
      <section className="py-5 text-center border-top" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="container py-4">
          <h2 className="fw-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>1ファイル・ゼロインストールで開始</h2>
          <p className="text-muted mb-4">USBメモリや任意のディレクトリに解凍するだけで、理想の執筆環境が完成します。</p>
          <button 
            className="btn btn-lg px-5 py-3 fw-bold"
            style={{ 
              background: 'var(--theme-primary)', 
              color: 'var(--theme-surface)', 
              border: '1px solid var(--theme-primary)',
              borderRadius: '0' 
            }}
          >
            Download HASM Editor (.zip)
          </button>
        </div>
      </section>
    </div>
  );
};
