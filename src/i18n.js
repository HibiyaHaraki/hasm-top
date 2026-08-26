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
    theme: 'Theme', language: 'Language', homeKicker: 'HASM MAIN APPLICATION', homeTitle: 'Human Activity Structure Model',
    homeDescription: 'Organize people, experiences, facts, and links in a transparent local model with Markdown files and SQLite.',
    openMarkdown: 'Open HASM Markdown', openColorPattern: 'Open Color Pattern', openLogo: 'Explain HASM Logo',
    openMarkdownSubApp: 'Sub App: HASM Markdown', openColorPatternSubApp: 'Sub App: Color Pattern', openLogoSubApp: 'Sub App: Logo System',
    hasmMainApp: 'MAIN APP', hasmSubApps: 'ECOSYSTEM SUB APPS',
    hasmSubAppsDescription: 'HASM is supported by specialized sub-modules for document editing, color pattern design, and brand mark geometry.',
    navWhatIsHasm: 'What is HASM?', navExample: 'Example', navBenefit: 'What is benefit of using HASM?', navUsecase: 'What is usecase of HASM?',
    whatIsHasmKicker: 'WHAT IS HASM?', whatIsHasmTitle: 'A local model format and desktop app for human activity.',
    whatIsHasmDescription: 'HASM (Human Activity Structure Model) is a local-first desktop application designed to organize knowledge around human activity. Instead of locking data in a proprietary format or cloud service, HASM keeps data transparent: local folders contain Markdown entity files, while an embedded SQLite index (main.db) enables instant searching, browsing, and graph-like metadata navigation.',
    entityPerson: 'PERSON', entityPersonDesc: 'Individuals, team members, researchers, or actors involved in human activities.',
    entityExperience: 'EXPERIENCE', entityExperienceDesc: 'Events, projects, historical milestones, or personal activities over time.',
    entityFact: 'FACT', entityFactDesc: 'Verified facts, observations, technical rules, or quantitative records.',
    entityLink: 'LINK', entityLinkDesc: 'Typed connections linking people, experiences, and facts together.',
    flowTitle: 'Core Desktop Application Flow', flowStep1: 'Boot App & Open Model Folder', flowStep2: 'Sync Markdown Folders with main.db',
    flowStep3: 'Browse PERSON, EXPERIENCE, FACT, LINK', flowStep4: 'View Details & Edit Entity Records',
    exampleKicker: 'PRACTICAL EXAMPLE', exampleTitle: 'How HASM structures your model on disk.',
    exampleDescription: 'HASM stores each entity as a standard Markdown file inside categorized subdirectories. A local main.db database maintains a search index for high-speed browsing.',
    exampleFolderTitle: 'Model Folder Directory Structure', examplePersonName: 'Alan Turing', examplePersonRole: 'Mathematician & Cryptanalyst',
    exampleExperienceName: 'Bletchley Park Enigma Project (1939 - 1945)', exampleExperienceRole: 'Wartime Cryptanalysis Milestone',
    exampleFactName: 'Bombe Machine Breakthrough', exampleFactRole: 'Verified Historical & Technological Fact',
    exampleFactDesc: 'Electromechanical machine reduced Enigma decryption time from weeks to hours.',
    exampleLinkName: 'Alan Turing ➔ [Participated In] ➔ Enigma Project ➔ [Produced Fact] ➔ Bombe Machine',
    exampleLinkDesc: 'Structured relationship connecting a PERSON to an EXPERIENCE and a FACT.',
    visualizerKicker: '3D COMMIT GRAPH VISUALIZER', visualizerTitle: 'Live 3D graph visualization powered by HASM sub-module.',
    visualizerDescription: 'Experience the exact same WebGL 3D commit graph engine used in the HASM desktop app (submodules/hasm). Explore sample .hasm models, adjust timeline filters, and inspect interconnected entity nodes in real time.',
    sampleModel: 'Example .hasm Package', timeScale: 'Time Scale', zScale: 'Z Scale',
    benefitKicker: 'KEY BENEFITS', benefitTitle: 'Why choose HASM for your knowledge graph?',
    benefitDescription: 'HASM bridges the gap between unstructured personal notes and complex relational databases, delivering privacy, durability, and expressiveness.',
    benefit1Title: '100% Local & Privacy First', benefit1Desc: 'Zero cloud dependencies, zero external API requirements, and zero telemetry. Confidential personal notes and sensitive organizational records never leave your hard drive.',
    benefit2Title: 'Human-Readable & Future-Proof', benefit2Desc: 'All entities are saved in standard, plain-text Markdown files alongside SQLite. Even without HASM, your data remains fully accessible in any text editor forever.',
    benefit3Title: 'Structured Knowledge Graph', benefit3Desc: 'Combines freeform prose with graph-like relational metadata. Seamlessly query connections between people, experiences, facts, and links.',
    benefit4Title: 'Cross-Platform & Theme Consistent', benefit4Desc: 'Runs natively on Windows, macOS, and Linux powered by Tauri 2 and Rust, sharing exact color spectrums with the HASM color pattern system.',
    usecaseKicker: 'USE CASES', usecaseTitle: 'Where HASM excels in practice.',
    usecaseDescription: 'Designed for complex human-centric domains where interconnections between people, historical events, facts, and decisions matter.',
    usecase1Title: 'Personal Knowledge Management & Life Log', usecase1Desc: 'Organize your life story, personal career milestones, relationships with collaborators, key learnings, and life facts in a permanent personal graph.',
    usecase2Title: 'Project & Team Context Modeling', usecase2Desc: 'Map team members (PERSON), project milestones and sprints (EXPERIENCE), architecture decisions and specs (FACT), and team dependencies (LINK).',
    usecase3Title: 'Research, Investigation & History', usecase3Desc: 'Structure qualitative interviews, historical timelines, legal/investigative cases, or scientific research into interconnected, verifiable networks.',
    usecase4Title: 'Confidential Offline Documentation', usecase4Desc: 'Maintain internal organizational charts, security audit archives, or proprietary research completely offline without exposing data to third-party clouds.',
    backHome: 'HASM', markdownKicker: 'HASM MARKDOWN EDITOR',
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
    theme: 'テーマ', language: '言語', homeKicker: 'HASM メインアプリケーション', homeTitle: 'Human Activity Structure Model',
    homeDescription: '人物・体験・事実・リンクを、MarkdownファイルとSQLiteによるローカルで透明なモデルとして整理するモデルエディタ。',
    openMarkdown: 'HASM Markdownを開く', openColorPattern: 'Color Patternを開く', openLogo: 'HASMロゴの説明を見る',
    openMarkdownSubApp: 'サブアプリ: HASM Markdown', openColorPatternSubApp: 'サブアプリ: Color Pattern', openLogoSubApp: 'サブアプリ: Logo システム',
    hasmMainApp: 'メインアプリ', hasmSubApps: 'エコシステム サブアプリ',
    hasmSubAppsDescription: 'HASMは、文書編集、カラーパレット設計、ブランドマーク幾何学などの役割を担う専門サブモジュールによって支えられています。',
    navWhatIsHasm: 'What is HASM?', navExample: 'Example', navBenefit: 'What is benefit of using HASM?', navUsecase: 'What is usecase of HASM?',
    whatIsHasmKicker: 'WHAT IS HASM?', whatIsHasmTitle: '人の活動をローカルで構造化するモデルフォーマット＆デスクトップアプリ。',
    whatIsHasmDescription: 'HASM（Human Activity Structure Model）は、人の活動にまつわる知識や記録を構造化するために設計されたローカルファーストのデスクトップアプリケーションです。データを独自フォーマットやクラウドに閉じ込めるのではなく、ローカルフォルダ内のMarkdownファイルで各エンティティを透過的に保持し、内蔵のSQLite（main.db）により高速な検索・閲覧・メタデータ管理を実現します。',
    entityPerson: 'PERSON', entityPersonDesc: '活動に関わる個人、チームメンバー、研究者、関係者など。',
    entityExperience: 'EXPERIENCE', entityExperienceDesc: 'イベント、プロジェクト、歴史的節目、個人の体験・活動の軌跡など。',
    entityFact: 'FACT', entityFactDesc: '検証された事実、観察データ、技術的ルール、定量的記録など。',
    entityLink: 'LINK', entityLinkDesc: '人物・体験・事実の相互関係を定義する型付きのつながり。',
    flowTitle: '基本アプリケーションフロー', flowStep1: 'アプリ起動 & モデルフォルダ選択', flowStep2: 'Markdownフォルダとmain.dbの自動同期',
    flowStep3: 'PERSON, EXPERIENCE, FACT, LINKを閲覧', flowStep4: '詳細確認 & エンティティの編集・保存',
    exampleKicker: 'PRACTICAL EXAMPLE', exampleTitle: 'HASMがディスク上でモデルを構造化する方法。',
    exampleDescription: 'HASMは各エンティティをカテゴリ別のサブディレクトリ内にある標準的なMarkdownファイルとして保存します。ローカルのmain.dbデータベースが検索インデックスを保持し、高速なナビゲーションを可能にします。',
    exampleFolderTitle: 'モデルフォルダのディレクトリ構造', examplePersonName: 'アラン・チューリング', examplePersonRole: '数学者・暗号解読者',
    exampleExperienceName: 'ブレッチリー・パーク暗号解読プロジェクト (1939 - 1945)', exampleExperienceRole: '戦時暗号解読マイルストーン',
    exampleFactName: 'ボンベ（Bombe）機械の開発と劇的成果', exampleFactRole: '検証された歴史的・技術的事実',
    exampleFactDesc: '電気機械式解読機により、Enigma暗号の解読時間を数週間から数時間に短縮。',
    exampleLinkName: 'アラン・チューリング ➔ [参加] ➔ 暗号解読プロジェクト ➔ [成果の事実] ➔ ボンベ機械',
    exampleLinkDesc: 'PERSON、EXPERIENCE、FACTを結びつける構造化された関係性。',
    visualizerKicker: '3D COMMIT GRAPH VISUALIZER', visualizerTitle: 'HASMサブモジュールと完全同一の3Dグラフビジュアル表示。',
    visualizerDescription: 'HASMデスクトップ本体アプリ（submodules/hasm）で採用されているWebGL 3DコミットグラフエンジンをWeb上でそのまま体験できます。サンプル.hasmモデルを読み込み、タイムスケールフィルターや3D空間でのノード探索をリアルタイムに実行できます。',
    sampleModel: 'サンプル .hasm パッケージ', timeScale: '時間スケール', zScale: 'Z軸スケール',
    benefitKicker: 'KEY BENEFITS', benefitTitle: 'ナレッジグラフ構築にHASMを選ぶ理由。',
    benefitDescription: 'HASMは、構造化されていない単なるテキストノートと複雑なリレーショナルデータベースの間のギャップを埋め、プライバシー、永続性、そして高い表現力を提供します。',
    benefit1Title: '100%ローカル & プライバシーファースト', benefit1Desc: 'クラウド依存ゼロ、外部API不要、自動テレメトリ送信なし。機密文書やプライベートな思考の記録もローカルから外に出ません。',
    benefit2Title: '人間が読める透明性と未来への耐久性', benefit2Desc: 'すべてのエンティティは標準的なプレーンテキストのMarkdownファイルとして保存されます。将来HASMアプリがなくなっても、データが失われる心配はありません。',
    benefit3Title: '構造化ナレッジグラフ', benefit3Desc: '自由な文章記述と、グラフ状のリレーショナルメタデータを融合。人物・体験・事実・リンク間の関係性を直感的に検索・参照できます。',
    benefit4Title: 'クロスプラットフォーム & 統一テーマ', benefit4Desc: 'Tauri 2とRustによりWindows, macOS, Linuxで快適に動作し、HASM Color Pattern Systemによる一貫したデザインテーマを維持します。',
    usecaseKicker: 'USE CASES', usecaseTitle: 'HASMが威力を発揮する実践的な活用シーン。',
    usecaseDescription: '人物、歴史的出来事、客観的事実、重要な意思決定が複雑に絡み合う分野で最高のパフォーマンスを発揮します。',
    usecase1Title: 'パーソナルナレッジマネジメント & ライフログ', usecase1Desc: '自分のキャリヤマイルストーン、共作者との関係、学んだノウハウ、身の回りの事実を永久保存可能な個人の知識グラフとして整理。',
    usecase2Title: 'プロジェクト & チームコンテキストモデリング', usecase2Desc: 'チームメンバー（PERSON）、プロジェクトの節目（EXPERIENCE）、アーキテクチャや仕様の決定（FACT）、依存関係（LINK）を明確に記録・共有。',
    usecase3Title: '学術研究・歴史分析・調査報道', usecase3Desc: '定性インタビュー、歴史のタイムライン、事件や法的調査、科学研究の記録を、相互に検証可能なエンティティネットワークとして構造化。',
    usecase4Title: 'オフライン＆機密組織ドキュメント', usecase4Desc: 'サードパーティのクラウドにデータを晒すことなく、組織図、セキュリティ監査アーカイブ、独自の研究開発データを完全オフラインで安全に管理。',
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