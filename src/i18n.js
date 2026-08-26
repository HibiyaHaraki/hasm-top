import { useCallback, useEffect, useState } from 'react';
import { createLogger } from './hasm_logger/src/react/logger.js';

const STORAGE_KEY = 'hasm_language_preference';
const logger = createLogger('language');

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' }
];

const TRANSLATIONS = {
  en: {
    theme: 'Theme', language: 'Language', homeKicker: 'HASM', homeTitle: 'Human Activity Structure Model',
    homeDescription: 'The HASM desktop app is currently in preparation. Start by exploring the HASM Markdown editor.',
    openMarkdown: 'Open HASM Markdown', openColorPattern: 'Open Color Pattern', openLogo: 'Explain the HASM logo', backHome: 'HASM', markdownKicker: 'HASM MARKDOWN EDITOR',
    markdownTitle: 'Carry your thoughts anywhere.', markdownDescription: 'A portable Markdown editor that works entirely locally, with no installation required.',
    scrollHint: 'Scroll to explore', editor: 'EDITOR', preview: 'PREVIEW', live: 'LIVE',
    portableQuestion: 'Can it open unchanged on different computers and for different people?', portableTitle: 'Cross-platform portability', portableAlt: 'Demo',
    portableLines: ['Launch anywhere from one USB drive', 'Absorb OS and environment differences', 'Keep config.json and assets together'],
    assetQuestion: 'How are image and asset references managed?', assetTitle: 'Asset management', assetAlt: 'Diagram',
    assetDescription: 'Assets in the same folder are managed through a manifest. Broken paths are prevented and embeds stay safe.', assetStatus: 'Resolved automatically through the manifest',
    privacyQuestion: 'What about external connections and tracking?', privacyTitle: 'Fully local security', offlineLabel: '100% Offline & Local',
    offlineDescription: 'A dependable place for confidential documents and private thoughts.', footerTitle: 'Start with one file and zero installation',
    footerDescription: 'Extract it to a USB drive or any directory to create your ideal writing environment.', download: 'Download HASM Editor (.zip)',
    portableStatus: 'Portable mode active', portableDescription: 'Automatically load dependencies from one folder and render consistently across users and operating systems.',
    usbHint: 'Launch directly from a USB drive or cloud-synced folder', osNames: ['macOS (MacBook)', 'Windows 11 (PC)', 'Ubuntu Linux'],
    osLabels: ['macOS', 'Windows', 'Ubuntu'], loaded: '[Loaded] asset:portable.mp4', localStatus: '[Status] 100% Local & Portable',
    externalApi: 'External API dependency: zero', telemetry: 'Automatic telemetry: none', offlineGuarantee: 'Works 100% offline.',
    colorPatternKicker: 'HASM COLOR PATTERN SYSTEM', colorPatternTitle: 'Theme your documents with a consistent spectrum.',
    colorPatternDescription: 'A shared palette library with ready-made themes, safe contrast math, and CSS variables that work across HASM apps.',
    colorPatternPreview: 'Live preview', colorPatternCatalog: 'Pattern catalog', colorPatternCode: 'Quick usage', colorPatternContrast: 'Contrast-ready',
    colorPatternTokens: 'Token model', colorPatternLabel: 'Pattern', logoKicker: 'HASM LOGO SYSTEM', logoTitle: 'A structure that holds together.', logoDescription: 'The HASM mark is a deterministic geometric rosette. Curves derived from one date turn collaboration, continuity, and human activity into a single visual system.', logoVariantsLabel: 'Four outputs', logoVariantsTitle: 'One mark, ready for every surface.', logoVariantsDescription: 'The logo repository generates the same geometry for transparent interfaces, dark canvases, light documents, and compact app icons.', logoTransparent: 'Transparent', logoDark: 'Dark background', logoLight: 'Light background', logoFavicon: 'Favicon', logoModelLabel: 'The model', logoModelTitle: 'Mathematics gives the mark its memory.', logoModelDescription: 'The trajectory combines a fundamental frequency of 8 with a harmonic frequency of 14. Together they form the rosette while staying inside a square boundary.', logoAnchorLabel: 'Time anchor', logoAnchorDescription: 'The date is not decoration. It seeds the phase and the color model, making each generated asset reproducible.', logoFormulaLabel: 'Parametric trajectory equations', logoHarmonyTitle: 'Structural harmony', logoHarmonyDescription: 'Seven-fold symmetry lets distinct paths overlap without losing their own direction.', logoColorTitle: 'Muted spectrum', logoColorDescription: 'Squared trigonometric channels create a calm gradient that remains legible on light and dark backgrounds.', logoUsageTitle: 'Clear space', logoUsageDescription: 'Keep the mark square and preserve at least 10% padding around the geometry.', copyright: 'Copyright (c) 2026 Hibiya Haraki.'
  },
  ja: {
    theme: 'テーマ', language: '言語', homeKicker: 'HASM', homeTitle: 'Human Activity Structure Model',
    homeDescription: 'HASM本体アプリは現在準備中です。まずはHASM Markdownエディタをご覧ください。', openMarkdown: 'HASM Markdownを開く', openColorPattern: 'Color Patternを開く', openLogo: 'HASMロゴの説明を見る',
    backHome: 'HASM', markdownKicker: 'HASM MARKDOWN EDITOR', markdownTitle: '思考をそのまま、どこへでも持ち運ぶ。',
    markdownDescription: 'インストール不要、完全ローカルで動作するポータブルMarkdownエディタ。', scrollHint: 'スクロールして体験を見る',
    editor: 'EDITOR', preview: 'PREVIEW', live: 'LIVE', portableQuestion: '異なるPCや人でも、そのまま開ける？', portableTitle: 'クロスプラットフォームポータブル', portableAlt: '動作デモ',
    portableLines: ['USB1本でどこでもそのまま起動', 'OSや個人の環境差分を吸収', 'config.jsonとアセットを一体化'], assetQuestion: '画像やアセットの参照管理はどうなる？',
    assetTitle: 'アセット管理機能', assetAlt: '図解', assetDescription: '同一フォルダ内のアセットをマニフェスト管理。パス崩れを防ぎ、安全に埋め込めます。', assetStatus: 'マニフェスト経由で自動解決・正常参照中',
    privacyQuestion: '外部通信やトラッキングの心配は？', privacyTitle: '完全ローカル・セキュリティ', offlineLabel: '100% Offline & Local', offlineDescription: '機密文書やプライベートな思考の記録にも安心。',
    footerTitle: '1ファイル・ゼロインストールで開始', footerDescription: 'USBメモリや任意のディレクトリに解凍するだけで、理想の執筆環境が完成します。', download: 'HASM Editor (.zip)をダウンロード',
    portableStatus: 'ポータブル動作中', portableDescription: '異なるユーザー環境やOSでも、依存ファイルを同一フォルダから自動読み込みして同一レンダリングを実現。', usbHint: 'USBメモリやクラウド同期フォルダからそのまま起動可能',
    osNames: ['macOS (MacBook)', 'Windows 11 (PC)', 'Ubuntu Linux'], osLabels: ['macOS', 'Windows', 'Ubuntu'], loaded: '[Loaded] asset:portable.mp4', localStatus: '[Status] 100% Local & Portable',
    externalApi: '外部API依存 : ゼロ', telemetry: '自動送信テレメトリ : なし', offlineGuarantee: 'オフライン環境でも100%動作します。',
    colorPatternKicker: 'HASM COLOR PATTERN SYSTEM', colorPatternTitle: '一貫したスペクトラムで文書を彩る。',
    colorPatternDescription: '安全なコントラスト計算とCSS変数を備えた共有カラーパレット。HASMの各アプリで同じテーマを再利用できます。',
    colorPatternPreview: 'ライブプレビュー', colorPatternCatalog: 'パターン一覧', colorPatternCode: 'クイック利用', colorPatternContrast: 'コントラスト対応',
    colorPatternTokens: 'トークンモデル', colorPatternLabel: 'パターン', logoKicker: 'HASM LOGO SYSTEM', logoTitle: '構造をひとつに束ねる形。', logoDescription: 'HASMのマークは、ひとつの日付から決まる幾何学的なロゼットです。協働、継続、人の活動を、ひとつの視覚システムへ変換します。', logoVariantsLabel: '4つの出力', logoVariantsTitle: 'どの画面にも使える、ひとつのマーク。', logoVariantsDescription: 'ロゴリポジトリでは、透明なUI、暗いキャンバス、明るい文書、コンパクトなアプリアイコン向けに同じ形状を生成します。', logoTransparent: '透明背景', logoDark: '暗い背景', logoLight: '明るい背景', logoFavicon: 'ファビコン', logoModelLabel: '数学モデル', logoModelTitle: '数学がマークに記憶を与える。', logoModelDescription: '基本周波数8と倍音周波数14を組み合わせた軌跡です。ロゼットを描きながら、正方形の境界内に収まります。', logoAnchorLabel: '時間のアンカー', logoAnchorDescription: '日付は飾りではありません。位相と色のモデルを決め、生成アセットを再現可能にします。', logoFormulaLabel: 'パラメトリック軌跡の式', logoHarmonyTitle: '構造的な調和', logoHarmonyDescription: '7回対称の曲線が、個々の方向性を失わずに重なり合います。', logoColorTitle: '穏やかなスペクトラム', logoColorDescription: '三角関数を二乗したチャンネルが、明暗どちらの背景でも読みやすいグラデーションを作ります。', logoUsageTitle: '余白を守る', logoUsageDescription: '正方形の比率を保ち、形状の周囲に最低10%の余白を残します。', copyright: 'Copyright (c) 2026 Hibiya Haraki.'
  }
};

export function useLanguage() {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return 'ja';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return TRANSLATIONS[stored] ? stored : 'ja';
  });

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const setLanguage = useCallback((nextLanguage) => {
    if (!TRANSLATIONS[nextLanguage]) return;
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    logger.info('Selected language.', { language: nextLanguage });
  }, []);

  return { language, setLanguage, t: TRANSLATIONS[language] };
}