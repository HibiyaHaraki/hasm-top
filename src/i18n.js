import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react';
import { createLogger } from './hasm_logger/src/react/logger.js';

const STORAGE_KEY = 'hasm_language_preference';
const logger = createLogger('language');
const LanguageContext = createContext(null);

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' }
];

const TRANSLATIONS = {
  en: {
    // Navigation & Common
    theme: 'Theme',
    language: 'Language',
    backHome: 'HASM Home',
    openMarkdown: 'Open HASM Markdown',
    openColorPattern: 'Open Color Pattern',
    openLogo: 'Explain HASM Logo',
    openMarkdownSubApp: 'Sub App: HASM Markdown',
    openColorPatternSubApp: 'Sub App: Color Pattern',
    openLogoSubApp: 'Sub App: Logo System',
    openCreatorSubApp: 'Meet the HASM Creator',
    openHasmAppSubApp: 'Open HASM Model Editor',
    hasmMainApp: 'MAIN APP',
    hasmSubApps: 'HASM ECOSYSTEM',
    hasmSubAppsDescription: 'Explore the HASM Model Editor and the specialized sub-modules for document editing, color pattern design, and brand mark geometry.',
    copyright: 'Copyright (c) 2026 Hibiya Haraki.',
    ownership: 'HASM is a project by',
    footerTagline: 'HASM is a living structure — separating what happened from what it means.',
    githubLinksLabel: 'HASM GitHub links',
    githubCreator: 'HASM Creator Account',
    githubCreatorAvatar: 'HibiyaHaraki GitHub profile picture',
    githubIntroduction: 'HASM Introduction Page',
    githubDesktopApp: 'HASM Editor Desktop App',
    githubMarkdownEditor: 'HASM Markdown Editor',
    creatorKicker: 'HASM CREATOR',
    creatorTitle: 'HASM Creator',
    creatorDescription: 'Learn about the person behind the HASM project family.',
    creatorLead: 'HibiyaHaraki creates the HASM project family and its tools for structured, local-first thinking.',
    creatorGithubLabel: 'GitHub account',
    creatorGithubButton: 'Visit HibiyaHaraki on GitHub',
    creatorBlogButton: 'Read the development blog',
    blogKicker: 'WRITING & DEVELOPMENT LOG',
    blogTitle: 'HASM Blog',
    blogLead: 'Essays and build notes tracing the ideas, research, and engineering behind HASM.',
    blogNoteLabel: 'note essays',
    blogQiitaLabel: 'Qiita technical posts',
    blogReadArticle: 'Read the original article',
    blogNoteArticles: [
      ['Visualizing the value of life beyond a resume', 'The initial question behind HASM: preserve events, reasons, changing interpretations, and relationships so a personal history becomes a map for the future.', 'https://note.com/_hibs_/n/na6bf4c63017d'],
      ['Solving communication gaps through shared experience', 'An interim research report on narrowing knowledge gaps with structured experience histories, drawing on common ground, boundary objects, reflection, and sensemaking.', 'https://note.com/_hibs_/n/nff73894e334d'],
      ['HASM research map from a Miyakojima workation', 'Maps seven intersecting fields, from knowledge engineering and cognitive science to AI, CSCW, and management, and considers collective experience graphs.', 'https://note.com/_hibs_/n/n2787ba7bbba2'],
      ['Building Tauri and React foundations alongside AI', 'A Jozankei workation log on a Markdown editor prototype, local file handling, autosave, and learning by understanding AI-assisted code.', 'https://note.com/_hibs_/n/n2d2661bce859'],
      ['From writing to connecting: HASM architecture and roadmap', 'Explains the four core entities, a 3D timeline, Markdown-plus-SQLite storage, and a phased implementation plan for the project family.', 'https://note.com/_hibs_/n/n5948f803a5d0'],
      ['Publishing the first HASM introduction page', 'Reflects on turning causal-semantic separation into a public introduction and identifies next challenges in interaction and practical use cases.', 'https://note.com/_hibs_/n/nbeb04391e892']
    ],
    blogQiitaArticles: [
      ['Planning a learning roadmap for a life-log application', 'Defines the original goal and a practical learning sequence for React, Tauri, local storage, Three.js, and GitHub Actions.', 'https://qiita.com/Hibs/items/adde5e32a020a08fb92d'],
      ['Life-log development #1: First steps with Tauri v2 and React', 'A beginner-oriented account of Windows setup, Rust installation, PowerShell issues, and creating the first desktop application.', 'https://qiita.com/Hibs/items/f430c84ad93152ecf094'],
      ['Life-log development #2: Three.js trajectories in 3D', 'Builds Three.js fundamentals with animated Lorenz trajectories, camera controls, dynamic line rendering, and performance lessons.', 'https://qiita.com/Hibs/items/ff47da0ef53902e49430'],
      ['Life-log development #3: A Tauri and Milkdown Markdown editor', 'Integrates rich Markdown editing, local file operations, and image drag-and-drop while documenting permissions and lifecycle pitfalls.', 'https://qiita.com/Hibs/items/29cfeebb5130b3a3ecc2'],
      ['Life-log development #4: Portable HASM Markdown', 'Explains portable two-layer storage and a development workflow built around design documents, evaluation cases, and iterative debugging.', 'https://qiita.com/Hibs/items/a98acd52ce0a4642b67e']
    ],

    // Top Landing Page (HASM_Page.jsx)
    homeKicker: 'HUMAN ACTIVITY STRUCTURING MODEL',
    homeTitle: 'Human Activity Structure Model',
    homeTagline: 'Before HASM is software, it is a way of separating what happened from what it means.',
    homeDescription: 'Organize people, experiences, facts, and links in a transparent local model with Markdown files and SQLite.',

    // Philosophy Core
    philosophyKicker: 'PHILOSOPHY & FOUNDATION',
    philosophyTitle: 'Why HASM exists: Causal-Semantic Separation',
    philosophyLead: 'A résumé or achievement list is a flat line: one date, one entry, one fixed meaning forever. HASM starts from a foundational realization — a human life, project, or career is not a single linear log, but a multi-layered structure where objective causality and subjective meaning are fundamentally distinct.',
    
    // 4 Fatal Defects of Conventional Formats
    defectsSectionTitle: 'The 4 Fatal Defects of Conventional Records',
    defectsSectionSubtitle: 'Why existing formats (CVs, portfolios, task trackers, and static note apps) fail to capture true human context:',
    defect1Name: '1. Non-linear Revaluation',
    defect1EnName: '(Non-linear Revaluation)',
    defect1Desc: 'The value of an event is not fixed at the moment it happens; it is dynamically restructured by subsequent experiences and future breakthroughs. In traditional formats, a 2019 failure remains labeled as a failure forever, unable to show that it became the indispensable turning point for a 2024 success without altering history.',
    defect2Name: '2. Structural Discontinuity',
    defect2EnName: '(Structural Discontinuity)',
    defect2Desc: 'Career pivots, changes in field, or periods of self-study look like disjointed, disconnected dots on a chronological timeline. In reality, an underlying, coherent motivation and core methodology bridges those seemingly unrelated domains.',
    defect3Name: '3. Context-Dependent Valuation',
    defect3EnName: '(Context-Dependent Valuation)',
    defect3Desc: 'The exact same fact or skill holds drastically different value depending on the evaluation lens (e.g., personal mindset growth vs. team engineering capability). Conventional formats force a single static label, erasing contextual nuance.',
    defect4Name: '4. Subjective Closure',
    defect4EnName: '(Subjective Closure)',
    defect4Desc: 'Existing records are locked into the single perspective of the author. They lack the architectural structure to allow multiple viewpoints (e.g., self-reflection, collaborator perspective, manager evaluation) to co-exist simultaneously on the same objective event.',

    // Dual Layer Stack Concept
    layerStackTitle: 'The Dual-Layer Architecture: Causal vs. Semantic',
    layerStackSubtitle: 'A clear separation between what actually occurred and how it is interpreted.',
    layerSubjectiveTitle: 'Subjective Layer (Semantic Layer / Perception Frames)',
    layerSubjectiveDesc: 'Contains human interpretations, contextual framing, and subjective significance (Experience & Perception Frames). Owned by a Person. Features dynamic Enable/Disable switches and retroactive re-linking without altering historical facts.',
    layerNexusTitle: 'Nexus Bridge (Omnidirectional Links & Bonds)',
    layerNexusDesc: 'Connects not only across the dual layers (attaching meaning to facts), but also within each layer: linking Fact to Fact (cause and effect), Experience to Experience (thematic relations & lineage), and Person to activities.',
    layerObjectiveTitle: 'Objective Layer (Causal Layer / Immutable Records)',
    layerObjectiveDesc: 'An immutable sequence and causal network along the irreversible timeline. Contains discrete events (Facts and Achievements) and sustained activities (Processes). It is never rewritten or deleted.',

    // Engineering Metaphor
    metaphorTitle: 'Refactoring the "Commit Messages" of Human Life',
    metaphorDesc: 'In software development, systems strictly record why a change was made (Change Request / Commit Message). Yet for humans—the most complex system—we only record flat execution logs while leaving the crucial "Why" in volatile memory. HASM provides the formal framework to record, audit, and refactor the meaning of our actions over time.',

    // Interdisciplinary Grounding
    groundingTitle: 'Grounded Across Interdisciplinary Sciences',
    groundingDesc: 'HASM is not an arbitrary database schema; it synthesizes established principles across computer science, psychology, and management:',
    groundingCognitive: 'Cognitive Science & Psychology (Autobiographical Memory, Narrative Identity, Sensemaking, Reflective Practice)',
    groundingKnowledge: 'Knowledge Engineering & Semantic Web (Dynamic Knowledge Graphs, Provenance Lineage, Ontology Modeling)',
    groundingHCI: 'Human-Computer Interaction & CSCW (Personal Information Management, Reflective Systems, Social Translucency)',
    groundingCareer: 'Social Science & Career Theory (Career Construction Theory, Competency Modeling, Common Ground)',

    // Comparison Table: Current Tech vs HASM
    compSectionTitle: 'What is Impossible in Current Tech vs. What is Possible in HASM',
    compSectionSubtitle: 'A systematic comparison between conventional linear formats and HASM.',
    compDimHeader: 'Dimension',
    compConvHeader: 'Conventional Tech (CV, LinkedIn, Jira, Note Apps)',
    compHasmHeader: 'HASM (Human Activity Structuring Model)',
    compRow1Dim: 'Temporal Structure',
    compRow1Conv: '1D flat chronological sequence. Events are fixed in linear order.',
    compRow1Hasm: '3D Spatio-Temporal Graph. Irreversible Time Axis + Social Distance + Context Domains.',
    compRow2Dim: 'Revaluation of Past Events',
    compRow2Conv: 'Impossible without rewriting history. Past entries stay static.',
    compRow2Hasm: 'Non-linear Revaluation: Re-link new semantic interpretations while keeping causal facts intact.',
    compRow3Dim: 'Motivation & "Why"',
    compRow3Conv: 'Lost in fragile human memory. Only "What was done" is recorded.',
    compRow3Hasm: 'Explicitly structured in the Semantic Layer (Perception Frames & Nexus links).',
    compRow4Dim: 'Multi-Agent Perspectives',
    compRow4Conv: 'Single author closure. Evaluator or team views require separate documents.',
    compRow4Hasm: 'Multi-Perspective Mapping: Multiple agents attach distinct interpretations to shared objective events.',
    compRow5Dim: 'Data Ownership & Privacy',
    compRow5Conv: 'Proprietary cloud silos, vendor lock-in, tracking telemetry.',
    compRow5Hasm: '100% Local-First: Plain-text Markdown files + embedded SQLite with zero external dependencies.',

    // App Navigation Tabs (HASM_App_Page.jsx)
    navAllOverview: 'All Overview',
    navWhatIsHasm: 'What is HASM?',
    navExample: '3D Graph & Examples',
    navBenefit: 'Why HASM? / Benefits',
    navUsecase: 'Use Cases',

    // Section 1: What is HASM? (App Page)
    whatIsHasmKicker: 'THE MODEL & ARCHITECTURE',
    whatIsHasmTitle: 'A Local-First Framework for Human Activity',
    whatIsHasmDescription: 'HASM structures human knowledge into transparent Markdown entity files and an embedded SQLite index (main.db), enabling instant search, 3D visualization, and graph-based traversal without cloud lock-in.',
    
    // Core 4 Entities
    entityPerson: 'PERSON',
    entityPersonDesc: 'The individual or actor who experiences events, interprets context, and attributes meaning to activities. Serves as the origin for social distance relationships.',
    entityExperience: 'EXPERIENCE',
    entityExperienceDesc: 'Subjective context space and perception frame. Groups facts and activities under meaningful themes (e.g., "Language Acquisition", "ADAS Development") and connects related experiences.',
    entityFact: 'FACT / ACHIEVEMENT',
    entityFactDesc: 'Immutable, verified events, milestones, or technical outcomes (e.g., "Bombe Machine Breakthrough", "Patent Issued", "Project Setback").',
    entityLink: 'LINK / NEXUS',
    entityLinkDesc: 'Omnidirectional connections linking facts to facts (causality), experiences to experiences (thematic lineage), and experiences to facts (meaning and context).',

    // Ontological Matrix Table
    ontTableTitle: 'Core Ontological Entity Overview',
    ontColEntity: 'Entity Class',
    ontColRole: 'Core Role',
    ontColConcept: 'Nature & Characteristics',
    ontColDev: 'Software / Git Metaphor',
    ontRowPersonConcept: 'Meaning creator & origin of social perspective',
    ontRowPersonDev: 'Repository Owner / Author',
    ontRowExpConcept: 'Dynamic context space & thematic perception frame',
    ontRowExpDev: 'Feature Branch / Perception Filter',
    ontRowFactConcept: 'Immutable atomic event or recorded outcome',
    ontRowFactDev: 'Commit Event / Runtime Log',
    ontRowLinkConcept: 'Omnidirectional causal, thematic & interpretive bond',
    ontRowLinkDev: 'Edge / Commit Parent Hash / Tag',

    // Roadmap Notice
    roadmapTitle: 'Current Implementation vs. Extended Roadmap',
    roadmapDesc: 'Release v0.1.0 implements the Core 4 entity types (PERSON, EXPERIENCE, FACT, LINK) in Tauri 2, Rust & React. Extending the model with dedicated duration processes and multi-agent portable package synchronization represents our ongoing evolutionary roadmap.',

    // Desktop App Flow
    flowTitle: 'Core Desktop Application Lifecycle',
    flowStep1: 'Open Workspace Folder on Local Disk',
    flowStep2: 'Automatic Markdown & main.db Sync',
    flowStep3: 'Inspect & Navigate 3D Commit Graph',
    flowStep4: 'Edit Markdown & Refactor Semantic Links',

    // 3D Visualizer & Coordinate Section
    visualizerKicker: 'LIVE 3D COMMIT GRAPH VISUALIZER',
    visualizerTitle: 'Explore Experience Trajectories in 3D Spatio-Temporal Space',
    visualizerDescription: 'The WebGL 3D commit graph maps events along the irreversible timeline while spreading social relationships and semantic context domains across the spatial canvas. Drag to rotate, scroll to zoom, and click nodes to inspect.',
    sampleModel: 'Sample .hasm Package',
    timeScale: 'Time Scale Mode',
    zScale: 'Z Scale Factor',
    coordTitle: '3D Coordinate Space Design',
    coordZ: 'Time Axis (Depth): Irreversible flow of time from past to future. Discrete milestones and duration periods are placed chronologically.',
    coordX: 'Social Distance (Horizontal): Proximity to the primary person (Self, direct teammates, mentors, external collaborators).',
    coordY: 'Context Domain (Vertical): Thematic classification clusters (e.g., Technology, Leadership, Mindset, Creative Projects).',

    // Practical Example
    exampleKicker: 'PRACTICAL EXAMPLE',
    exampleTitle: 'How HASM Structures Your Knowledge Graph on Disk',
    exampleDescription: 'Each entity is preserved in standard, human-readable Markdown files organized by directory, indexed locally by SQLite for high-speed graph queries.',
    exampleFolderTitle: 'Local Model Directory Structure',
    examplePersonName: 'Alan Turing',
    examplePersonRole: 'Mathematician & Cryptanalyst',
    exampleExperienceName: 'Bletchley Park Enigma Project (1939 - 1945)',
    exampleExperienceRole: 'Wartime Cryptanalysis Milestone',
    exampleFactName: 'Bombe Machine Breakthrough',
    exampleFactRole: 'Verified Technological & Historical Fact',
    exampleFactDesc: 'Electromechanical machine reduced Enigma decryption time from weeks to hours.',
    exampleLinkName: 'Alan Turing ➔ [Participated In] ➔ Enigma Project ➔ [Produced Fact] ➔ Bombe Machine',
    exampleLinkDesc: 'A typed relationship linking an actor (PERSON) through a context (EXPERIENCE) to a verified outcome (FACT).',

    // Section 3: Benefits
    benefitKicker: 'KEY ADVANTAGES',
    benefitTitle: 'Why Choose HASM Over Conventional Tools?',
    benefitDescription: 'HASM merges the freedom of personal prose with the computational precision of structured graph databases, delivering longevity, privacy, and expressiveness.',
    benefit1Title: '100% Local-First & Zero Cloud Dependency',
    benefit1Desc: 'Zero telemetry, zero external APIs, zero server sync required. Your confidential thoughts, internal architecture notes, and personal reflections remain permanently secure on your local machine.',
    benefit2Title: 'Human-Readable & 50-Year Future Proof',
    benefit2Desc: 'All data is stored in plain-text Markdown files alongside SQLite. Even if the HASM application ceases to exist decades from now, every file remains fully editable in any text editor.',
    benefit3Title: 'Causal-Semantic Multi-Layer Separation',
    benefit3Desc: 'Re-evaluate past experiences, adapt meaning to new contexts, and build dynamic narratives without corrupting the historical record of what actually occurred.',
    benefit4Title: 'Native Cross-Platform with Tauri 2 & WebGL',
    benefit4Desc: 'Built with Rust and React for high performance on Windows, macOS, and Linux, paired with a unified design system from the HASM Color Pattern library.',

    // Section 4: 5 Major Use Cases
    usecaseKicker: 'REAL-WORLD APPLICATIONS',
    usecaseTitle: '5 Groundbreaking Use Cases Enabled by HASM',
    usecaseDescription: 'From individual career navigation to enterprise knowledge engineering, HASM unlocks structural capabilities impossible in flat systems.',
    
    usecase1Title: '1. Dynamic Competence Modeling',
    usecase1Subtitle: 'Mapping "Who experienced what and why" without document decay.',
    usecase1Desc: 'Static skill matrices become obsolete as fast as technology evolves. HASM continuously captures the living lineage of team capabilities by connecting who participated in which project, the exact technical challenges overcome, and the design insights gained.',

    usecase2Title: '2. Dynamic Narrative CV & Portfolio Builder',
    usecase2Subtitle: 'Generating context-specific resumes directly from the knowledge graph.',
    usecase2Desc: 'Instead of submitting a generic bulleted list of past jobs, query specific subgraphs (e.g., "Show all experiences demonstrating distributed systems and crisis leadership") to generate coherent, verifiable narrative CVs tailored to any opportunity.',

    usecase3Title: '3. Reflective Management & 1-on-1 Feedback',
    usecase3Subtitle: 'Targeted mentoring grounded in structural context, not subjective memory.',
    usecase3Desc: 'Enables managers and mentors to explore the historical background behind a team member\'s actions. See which prior experiences influenced a current decision, facilitating deep, empathetic coaching and growth alignment.',

    usecase4Title: '4. Collaborative Experience Network (Experience SNS)',
    usecase4Subtitle: 'Citing co-experiences and shared achievements like academic papers.',
    usecase4Desc: 'In collaborative projects, team members can cite shared achievements while attaching their own distinct role interpretations. The resulting multi-agent graph visualizes mutual influence and collective institutional memory.',

    usecase5Title: '5. Context-Aware Life & Project Planning',
    usecase5Subtitle: 'Multi-axis 3D forward planning with open experience branches.',
    usecase5Desc: 'Plan upcoming career milestones or research directions as open experience branches in 3D coordinate space. Trace prerequisites, anticipate required skills, and navigate future possibilities with structural clarity.',

    // Download Section
    downloadHeader: 'DOWNLOAD INSTALLERS',
    downloadTitleHasm: 'Download HASM Desktop Model Editor',
    downloadTitleMarkdown: 'Download HASM Markdown Editor',
    downloadSubtitleHasm: 'Download native installer packages (.msi, .exe, .dmg, .deb, .AppImage) for your OS.',
    downloadSubtitleMarkdown: 'Download native installer packages (.msi, .dmg, .deb, .AppImage) or portable standalone archives for your OS.',
    downloadUnavailable: 'Installer packages will appear here after the desktop apps are packaged.',
    winTitle: 'Windows 10 / 11 (64-bit)',
    winMsi: 'Download .msi Installer',
    winExe: 'Download .exe Installer',
    winZip: 'Download Portable .zip',
    macTitle: 'macOS (Universal / Apple Silicon)',
    macDmg: 'Download .dmg Installer',
    macTar: 'Download Portable .tar.gz',
    linuxTitle: 'Linux (Ubuntu / Debian / Fedora)',
    linuxAppImage: 'Download .AppImage',
    linuxDeb: 'Download .deb Package',
    buildVersionTag: 'Release v0.1.0 • Built with Tauri 2, Rust & React • 100% Offline & Local',

    // Markdown Sub-App Page (HASM_Markdown_Page.jsx)
    markdownKicker: 'HASM MARKDOWN EDITOR',
    markdownTitle: 'Carry your thoughts anywhere.',
    markdownDescription: 'A portable Markdown editor that works entirely locally, with no installation required.',
    scrollHint: 'Scroll to explore editor features',
    editor: 'EDITOR',
    preview: 'PREVIEW',
    live: 'LIVE',
    portableQuestion: 'Can it open unchanged on different computers and for different people?',
    portableTitle: 'Cross-platform portability',
    portableAlt: 'Demo',
    portableLines: ['Launch anywhere from one USB drive', 'Absorb OS and environment differences', 'Keep config.json and assets together'],
    assetQuestion: 'How are image and asset references managed?',
    assetTitle: 'Asset management',
    assetAlt: 'Diagram',
    assetDescription: 'Assets in the same folder are managed through a manifest. Broken paths are prevented and embeds stay safe.',
    assetStatus: 'Resolved automatically through the manifest',
    privacyQuestion: 'What about external connections and tracking?',
    privacyTitle: 'Fully local security',
    offlineLabel: '100% Offline & Local',
    offlineDescription: 'A dependable place for confidential documents and private thoughts.',
    footerTitle: 'Start with one file and zero installation',
    footerDescription: 'Extract it to a USB drive or any directory to create your ideal writing environment.',
    download: 'Download HASM Editor (.zip)',
    portableStatus: 'Portable mode active',
    portableDescription: 'Automatically load dependencies from one folder and render consistently across users and operating systems.',
    usbHint: 'Launch directly from a USB drive or cloud-synced folder',
    osNames: ['macOS (MacBook)', 'Windows 11 (PC)', 'Ubuntu Linux'],
    osLabels: ['macOS', 'Windows', 'Ubuntu'],
    loaded: '[Loaded] asset:portable.mp4',
    localStatus: '[Status] 100% Local & Portable',
    externalApi: 'External API dependency: zero',
    telemetry: 'Automatic telemetry: none',
    offlineGuarantee: 'Works 100% offline.',

    // Color Pattern Page (HASM_Color_Pattern_Page.jsx)
    colorPatternKicker: 'HASM COLOR PATTERN SYSTEM',
    colorPatternTitle: 'Theme your documents with a consistent spectrum.',
    colorPatternDescription: 'A shared palette library with ready-made themes, safe contrast math, and CSS variables that work across HASM apps.',
    colorPatternPreview: 'Live preview',
    colorPatternCatalog: 'Pattern catalog',
    colorPatternCode: 'Quick usage',
    colorPatternContrast: 'Contrast-ready',
    colorPatternTokens: 'Token model',
    colorPatternLabel: 'Pattern',

    // Logo Page (HASM_Logo_Explanation_Page.jsx)
    logoKicker: 'HASM LOGO SYSTEM',
    logoTitle: 'A structure that holds together.',
    logoDescription: 'The HASM mark is a deterministic geometric rosette. Curves derived from one date turn collaboration, continuity, and human activity into a single visual system.',
    logoVariantsLabel: 'Four outputs',
    logoVariantsTitle: 'One mark, ready for every surface.',
    logoVariantsDescription: 'The logo repository generates the same geometry for transparent interfaces, dark canvases, light documents, and compact app icons.',
    logoTransparent: 'Transparent',
    logoDark: 'Dark background',
    logoLight: 'Light background',
    logoFavicon: 'Favicon',
    logoModelLabel: 'The model',
    logoModelTitle: 'Mathematics gives the mark its memory.',
    logoModelDescription: 'The trajectory combines a fundamental frequency of 8 with a harmonic frequency of 14. Together they form the rosette while staying inside a square boundary.',
    logoAnchorLabel: 'Time anchor',
    logoAnchorDescription: 'The date is not decoration. It seeds the phase and the color model, making each generated asset reproducible.',
    logoFormulaLabel: 'Parametric trajectory equations',
    logoHarmonyTitle: 'Structural harmony',
    logoHarmonyDescription: 'Seven-fold symmetry lets distinct paths overlap without losing their own direction.',
    logoColorTitle: 'Muted spectrum',
    logoColorDescription: 'Squared trigonometric channels create a calm gradient that remains legible on light and dark backgrounds.',
    logoUsageTitle: 'Clear space',
    logoUsageDescription: 'Keep the mark square and preserve at least 10% padding around the geometry.'
  },

  ja: {
    // Navigation & Common
    theme: 'テーマ',
    language: '言語',
    backHome: 'HASM トップ',
    openMarkdown: 'HASM Markdownを開く',
    openColorPattern: 'Color Patternを開く',
    openLogo: 'HASMロゴの説明を見る',
    openMarkdownSubApp: 'サブアプリ: HASM Markdown',
    openColorPatternSubApp: 'サブアプリ: Color Pattern',
    openLogoSubApp: 'サブアプリ: Logo システム',
    openCreatorSubApp: 'HASMの作成者を見る',
    openHasmAppSubApp: 'HASM モデルエディタを開く',
    hasmMainApp: 'メインアプリ',
    hasmSubApps: 'HASM エコシステム',
    hasmSubAppsDescription: 'HASM モデルエディタ本体と、文書編集・カラーパレット設計・ブランドマーク幾何学を担う専門サブモジュールを見てみましょう。',
    copyright: 'Copyright (c) 2026 Hibiya Haraki.',
    ownership: 'HASMの考案者は',
    footerTagline: 'HASMは生きた構造です──「起きたこと」と「その意味」を切り離す。',
    githubLinksLabel: 'HASM GitHubリンク',
    githubCreator: 'HASM作成者アカウント',
    githubCreatorAvatar: 'HibiyaHarakiのGitHubプロフィール画像',
    githubIntroduction: 'HASM紹介ページ',
    githubDesktopApp: 'HASMエディタ デスクトップアプリ',
    githubMarkdownEditor: 'HASM Markdownエディタ',
    creatorKicker: 'HASMの作成者',
    creatorTitle: 'HASM作成者',
    creatorDescription: 'HASMプロジェクト群を作る人について紹介します。',
    creatorLead: 'HibiyaHarakiは、構造化されローカルファーストな思考のためのHASMプロジェクト群とツールを作っています。',
    creatorGithubLabel: 'GitHubアカウント',
    creatorGithubButton: 'GitHubでHibiyaHarakiを見る',
    creatorBlogButton: '開発ブログを読む',
    blogKicker: '執筆・開発ログ',
    blogTitle: 'HASMブログ',
    blogLead: 'HASMの思想、調査、実装をたどるエッセイと開発記録です。',
    blogNoteLabel: 'noteの記事',
    blogQiitaLabel: 'Qiitaの技術記事',
    blogReadArticle: '元の記事を読む',
    blogNoteArticles: [
      ['履歴書には書けない「人生の価値」を、見える化したい。', '出来事、行動の理由、変化する解釈、経験どうしの関係を残し、未来を考えるための地図にするというHASMの出発点を綴ります。', 'https://note.com/_hibs_/n/na6bf4c63017d'],
      ['コミュニケーションの「不全」を履歴で解く', '経験履歴を構造化して知識の非対称性を埋める可能性を、共同基盤、境界オブジェクト、内省的実践、センスメイキングから探ります。', 'https://note.com/_hibs_/n/nff73894e334d'],
      ['HASMの先行研究・マインドマップの作成', '知識工学、認知科学、HCI、キャリア論、AI、CSCW、経営科学の7領域を整理し、集団知としての経験グラフの可能性を考えます。', 'https://note.com/_hibs_/n/n2787ba7bbba2'],
      ['AIと並走してTauri+React開発の足掛かりを掴む', 'Markdownエディタの試作、ローカルファイル操作、自動保存を進めながら、AIのコードを理解して使う開発プロセスを振り返ります。', 'https://note.com/_hibs_/n/n2d2661bce859'],
      ['「書く」から「繋ぐ」へ。HASM本丸の全体設計とロードマップ', '4つのエンティティ、3Dタイムライン、MarkdownとSQLiteを組み合わせた保存設計、段階的な実装ロードマップを紹介します。', 'https://note.com/_hibs_/n/n5948f803a5d0'],
      ['履歴書を超えて「経験の意味」を可視化する', '因果と意味を分けるHASMの思想を紹介ページとして公開するまでの過程と、今後の課題をまとめます。', 'https://note.com/_hibs_/n/nbeb04391e892']
    ],
    blogQiitaArticles: [
      ['個人開発で人生ログアプリを作りたいので、学習ロードマップを整理してみた', 'HASMの目標を定め、React、Tauri、ローカル保存、Three.js、GitHub Actionsを順に学びながら小さく作る計画を整理します。', 'https://qiita.com/Hibs/items/adde5e32a020a08fb92d'],
      ['【人生ログ開発 #1】Tauri v2 + Reactでデスクトップアプリ開発の第一歩', 'Windowsでの開発環境構築、Rustの導入、PowerShellの実行ポリシー、Hello Worldまでを初心者の視点で記録します。', 'https://qiita.com/Hibs/items/f430c84ad93152ecf094'],
      ['【人生ログ開発 #2】Three.jsで点と線による軌跡描画をマスターする', 'ローレンツ方程式を題材に、Three.jsの基本、カメラ操作、動的な線の描画、パフォーマンスの学びをまとめます。', 'https://qiita.com/Hibs/items/ff47da0ef53902e49430'],
      ['【人生ログ開発 #3】Tauri v2 + Milkdownで画像D&D対応のMarkdownエディタを作る', 'リッチなMarkdown編集、ローカルファイル操作、画像ドラッグ&ドロップを実装し、Tauriの権限とReact連携の課題を記録します。', 'https://qiita.com/Hibs/items/29cfeebb5130b3a3ecc2'],
      ['【人生ログ開発 #4】ポータブルなHASM Markdownの設計とAIとの開発プロセス', '持ち運べるMarkdownパッケージの二層保存構造と、設計書、評価仕様、反復デバッグを軸にしたAI協働開発を紹介します。', 'https://qiita.com/Hibs/items/a98acd52ce0a4642b67e']
    ],

    // Top Landing Page (HASM_Page.jsx)
    homeKicker: 'HUMAN ACTIVITY STRUCTURING MODEL',
    homeTitle: 'Human Activity Structure Model',
    homeTagline: 'HASMはソフトウェアである前に、「起きたこと」と「その意味」を切り離すための考え方です。',
    homeDescription: '人物・体験・事実・リンクを、MarkdownファイルとSQLiteによるローカルで透明なモデルとして整理するモデルエディタ。',

    // Philosophy Core
    philosophyKicker: '哲学と設計思想',
    philosophyTitle: 'HASMが目指すもの─因果と意味の分離（Causal-Semantic Separation）',
    philosophyLead: '履歴書や業績リストは一本の線です。ひとつの日付に、ひとつの行、永久にひとつの意味。HASMは根本的な問いから出発します──人間の人生やキャリア、プロジェクトは一本の線ではなく、「客観的な事実」と「主観的な解釈」という、時にしか一致しない二つの層でできているのではないか、と。',

    // 4 Fatal Defects of Conventional Formats
    defectsSectionTitle: '従来の記録形式が抱える「4つの本質的欠陥」',
    defectsSectionSubtitle: 'なぜ既存のツール（職務経歴書、ポートフォリオ、タスク管理、単なるノート）では人の成長や文脈を扱えないのか：',
    defect1Name: '1. 非線形な再評価の欠落',
    defect1EnName: '(Non-linear Revaluation)',
    defect1Desc: '出来事の真の価値は、発生した瞬間には決まりません。その後の経験や後続の成果によって動的に再構造化されます。従来の履歴書では過去の失敗はずっと失敗のまま固定され、2019年の挫折が2024年の大成功の設計思想になったという事実を、過去を改ざんすることなく表現する術がありません。',
    defect2Name: '2. 構造的不連続の見かけ',
    defect2EnName: '(Structural Discontinuity)',
    defect2Desc: '職種転換や異分野への挑戦、一見バラバラに見える経験は、年表上では不連続な点に見えてしまいます。しかし実際には、その人の内面に一貫した動機や哲学、共通する問題意識が存在しています。従来の形式はこの見えない連続性を切り捨ててしまいます。',
    defect3Name: '3. 文脈依存の価値変動',
    defect3EnName: '(Context-Dependent Valuation)',
    defect3Desc: '同一の経験やスキルであっても、評価する文脈（個人の内省・成長の節目か、組織のケイパビリティ需要か）によって価値は大きく変動します。従来の形式は記述を単一の意味に固定化してしまいます。',
    defect4Name: '4. 主観的閉包と単一視点',
    defect4EnName: '(Subjective Closure)',
    defect4Desc: '既存の記録は書いた本人の視点だけに閉じています。同じプロジェクトという客観的事実に対し、共作者の視点、上司やメンターの評価、第三者のレビューなど、多視点の解釈を同時に共存させるデータ構造が存在しません。',

    // Dual Layer Stack Concept
    layerStackTitle: '二層アーキテクチャ：客観層（因果）と主観層（意味）',
    layerStackSubtitle: '「何が起きたか」と「それをどう捉えるか」を構造的に分離するモデル。',
    layerSubjectiveTitle: '主観層（Semantic Layer / 認識の枠組み）',
    layerSubjectiveDesc: '人間（人物）が意味を与える非線形の解釈グラフ（体験や認識の枠組み）。テーマや動機に応じた枠組みを持ち、過去の事実を傷つけることなく、後から有効/無効の切り替えや再リンクが可能です。',
    layerNexusTitle: 'Nexus / リンク（多層と各層内をつなぐ絆）',
    layerNexusDesc: '主観層と客観層を結ぶ意味づけだけでなく、各層の内部も網羅的に接続します。事実同士の因果関係（原因と結果）、体験同士の文脈関係（関連する経験の系譜）、人物と出来事の関わりをすべて明示的に結びつけます。',
    layerObjectiveTitle: '客観層（Causal Layer / 不変の記録）',
    layerObjectiveDesc: '不可逆な時間軸上に固定された不変の記録と因果関係。個別の出来事（事実や達成）と時間幅を持つ活動（プロセス）を保持し、決して上書きや削除されません。',

    // Engineering Metaphor
    metaphorTitle: '人生というシステムの「コミットメッセージ」を書き直す',
    metaphorDesc: 'ソフトウェア開発では、システムの変更理由（Change Request / コミットメッセージ）が厳格に管理されます。しかし、人間という最も複雑なシステムにおいて、私たちは「何をしたか」という実行ログだけを記録し、最も重要な「なぜそう動いたか」を不安定な記憶の中に放置してきました。HASMは、客観的事実を変えることなく、その意味と繋がりを後から美しくリファクタリングするための基盤です。',

    // Interdisciplinary Grounding
    groundingTitle: '学際的な学問領域に根ざす理論的支柱',
    groundingDesc: 'HASMの因果・意味分離モデルは恣意的なアイデアではなく、認知科学、情報工学、社会科学の知見を統合して設計されています：',
    groundingCognitive: '認知科学・心理学（自伝的記憶、物語的同一性、センスメイキング、内省的実践）',
    groundingKnowledge: '知識工学・セマンティックウェブ（動的知識グラフ、プロベナンス・データリネージ、オントロジー工学）',
    groundingHCI: 'HCI & CSCW（個人情報管理 PIM、内省支援ツール、Social Translucency）',
    groundingCareer: '社会科学・キャリア理論（キャリア構築理論、コンピテンシーモデリング、コモングラウンド）',

    // Comparison Table: Current Tech vs HASM
    compSectionTitle: '既存技術では不可能なこと × HASMで可能になること',
    compSectionSubtitle: '従来の線形フォーマットとHASMの因果・意味分離構造の比較。',
    compDimHeader: '比較軸',
    compConvHeader: '従来の記録技術（職務経歴書、LinkedIn、Jira、ノート）',
    compHasmHeader: 'HASM（Human Activity Structuring Model）',
    compRow1Dim: '時間構造',
    compRow1Conv: '1次元のフラットな時系列。過去の出来事は単一の順序に固定される。',
    compRow1Hasm: '3次元時空グラフ。不可逆な時間軸＋人間関係の距離＋文脈ドメイン。',
    compRow2Dim: '過去の再評価',
    compRow2Conv: '過去の書き換え（改ざん）なしには不可能。記述は当時のまま静文化。',
    compRow2Hasm: '非線形な再評価：客観的ログを保持したまま、新しい意味の糸（Nexus）を何度でも結び直せる。',
    compRow3Dim: '動機と「なぜ」の管理',
    compRow3Conv: '個人の不安定な記憶に依存。「何をしたか」の羅列にとどまる。',
    compRow3Hasm: '主観層（認識の枠組みとNexus）として明示的に構造化・永続化。',
    compRow4Dim: '複数視点の共存',
    compRow4Conv: '単一の作者視点に閉じる。他者の評価や解釈は別文書に分散。',
    compRow4Hasm: 'マルチパースペクティブ：同一の客観的事実に対し、複数人が異なる解釈を同時に付与可能。',
    compRow5Dim: 'データ主権とプライバシー',
    compRow5Conv: 'クラウド依存、ベンダーロックイン、プライベートな思考の追跡リスク。',
    compRow5Hasm: '100%ローカルファースト：プレーンテキストのMarkdown＋SQLite。外部通信ゼロ。',

    // App Navigation Tabs (HASM_App_Page.jsx)
    navAllOverview: '全体概要',
    navWhatIsHasm: 'What is HASM?',
    navExample: '3Dグラフ & 実例',
    navBenefit: 'Why HASM? / 利点',
    navUsecase: 'ユースケース',

    // Section 1: What is HASM? (App Page)
    whatIsHasmKicker: 'モデルとアーキテクチャ',
    whatIsHasmTitle: '人の活動をローカルで構造化するオントロジー基盤',
    whatIsHasmDescription: 'HASMは、人間の活動にまつわる知識をローカルのMarkdownファイル群と組み込みSQLite（main.db）で透過的に保持し、クラウドに依存しない高速検索・3D可視化・グラフ探索を可能にするモデルです。',

    // Core 4 Entities
    entityPerson: 'PERSON（人物）',
    entityPersonDesc: '活動を経験し、意味づけを行う主体・人間。人間関係や社会的距離の基準点となります。',
    entityExperience: 'EXPERIENCE（体験/文脈）',
    entityExperienceDesc: '主観的な認識の枠組み・文脈空間。「技術習得」「プロジェクトリーダー」などのテーマで事実を束ね、関連する経験へと展開します。',
    entityFact: 'FACT / ACHIEVEMENT（事実/達成）',
    entityFactDesc: '不変の客観的な出来事や達成成果（「解読機の開発成功」「特許取得」「プロジェクトの中断」など）。',
    entityLink: 'LINK / NEXUS（関係性・絆）',
    entityLinkDesc: '事象間の客観的な因果関係、体験間の文脈関係、あるいは体験と事実を結びつける全方位の型付き接続。',

    // Ontological Matrix Table
    ontTableTitle: 'オントロジー構成要素と特徴',
    ontColEntity: 'エンティティ',
    ontColRole: 'オントロジー上の役割',
    ontColConcept: '性質と役割の範囲',
    ontColDev: 'ソフトウェア・Gitでの対応',
    ontRowPersonConcept: '意味づけの主体・社会的文脈の原点',
    ontRowPersonDev: 'リポジトリ所有者 / 作成者',
    ontRowExpConcept: '動的な文脈空間・テーマ別の認識枠組み',
    ontRowExpDev: 'フィーチャーブランチ / 認識フィルタ',
    ontRowFactConcept: '不変の原子的出来事・記録された客観的成果',
    ontRowFactDev: 'コミットイベント / 実行ログ',
    ontRowLinkConcept: '層内・層間を自在に結ぶ因果・文脈・意味の絆',
    ontRowLinkDev: 'コミット親ハッシュ / エッジ / タグ',

    // Roadmap Notice
    roadmapTitle: '現在の実装と将来の拡張ロードマップ',
    roadmapDesc: '現在の v0.1.0 リリースでは、PERSON, EXPERIENCE, FACT, LINK の4大エンティティをローカルMarkdown + SQLiteで実装しています。時間幅を持つプロセスの厳密な区分や、複数人でのポータブルパッケージ共有は、今後の研究開発ロードマップとして位置づけられています。',

    // Desktop App Flow
    flowTitle: 'デスクトップアプリの基本ライフサイクル',
    flowStep1: 'ローカルのモデルフォルダを選択',
    flowStep2: 'Markdownとmain.dbの自動同期',
    flowStep3: '3Dコミットグラフの探索と閲覧',
    flowStep4: 'Markdown編集と意味リンクのリファクタリング',

    // 3D Visualizer & Coordinate Section
    visualizerKicker: '3D COMMIT GRAPH VISUALIZER',
    visualizerTitle: '3次元時空空間で経験の軌跡を探検する',
    visualizerDescription: 'WebGL 3Dコミットグラフエンジンが、不可逆な時間軸に沿って出来事を配置し、人間関係の距離と意味のドメインを空間上に美しく展開します。ドラッグで回転、スクロールでズーム、クリックでノード詳細を確認できます。',
    sampleModel: 'サンプル .hasm パッケージ',
    timeScale: '時間スケールモード',
    zScale: 'Z軸スケール倍率',
    coordTitle: '3次元座標系の設計論',
    coordZ: '時間軸（奥行き）: 過去から未来へ流れる不可逆な時間。個別の達成や期間を持つ活動が時系列にプロットされます。',
    coordX: '社会的距離（横軸）: 主体からの距離。自分、チームメンバー、メンター、外部組織が配置されます。',
    coordY: '文脈・ドメイン（縦軸）: テーマの分類（技術開発、マネジメント、自己探求、創作活動など）。',

    // Practical Example
    exampleKicker: '実践的なデータ構造例',
    exampleTitle: 'HASMがディスク上でモデルを構造化する方法',
    exampleDescription: '各エンティティはカテゴリ別のサブディレクトリに標準的なMarkdownファイルとして保存され、SQLiteの検索インデックスによって高速に相互参照されます。',
    exampleFolderTitle: 'モデルフォルダのディレクトリ構成',
    examplePersonName: 'アラン・チューリング',
    examplePersonRole: '数学者・暗号解読者',
    exampleExperienceName: 'ブレッチリー・パーク暗号解読プロジェクト (1939 - 1945)',
    exampleExperienceRole: '戦時暗号解読マイルストーン',
    exampleFactName: 'ボンベ（Bombe）機械の開発と劇的成果',
    exampleFactRole: '検証された歴史的・技術的事実',
    exampleFactDesc: '電気機械式解読機により、Enigma暗号の解読時間を数週間から数時間に短縮。',
    exampleLinkName: 'アラン・チューリング ➔ [参加] ➔ 暗号解読プロジェクト ➔ [成果の事実] ➔ ボンベ機械',
    exampleLinkDesc: '人物（PERSON）が体験（EXPERIENCE）を通じて客観的事実（FACT）を生み出した関係性の記述。',

    // Section 3: Benefits
    benefitKicker: 'HASMの圧倒的な強み',
    benefitTitle: '従来のナレッジ管理ツールと何が違うのか？',
    benefitDescription: '自由なテキスト記述の柔軟性と、グラフ理論の厳密性を兼ね備え、プライバシーと耐久性を両立します。',
    benefit1Title: '100%ローカルファースト＆プライバシーの保証',
    benefit1Desc: 'クラウド依存ゼロ、外部API不要、自動テレメトリ送信なし。機密文書や個人的な思考、内省のログもローカルから一歩も外に出ません。',
    benefit2Title: '人間が読める透明性と半世紀先への耐久性',
    benefit2Desc: 'すべてのエンティティは標準的なMarkdownファイルとして保存されます。将来HASMアプリが更新を停止しても、あなたの記録は永遠に読み続けられます。',
    benefit3Title: '因果・意味分離による多層モデリング',
    benefit3Desc: '客観的な歴史を損なうことなく、新しい視点や文脈に合わせて過去の経験を何度でも再評価・再構成できます。',
    benefit4Title: 'Tauri 2とWebGLによる高速クロスプラットフォーム',
    benefit4Desc: 'RustとReactのハイブリッド構成により、Windows, macOS, Linuxで極めて軽量に動作し、HASM Color Patternの統一テーマを提供します。',

    // Section 4: 5 Major Use Cases
    usecaseKicker: '実践的な活用領域',
    usecaseTitle: 'HASMが可能にする5つの革新的なユースケース',
    usecaseDescription: '個人のキャリア構築から組織の知識工学まで、従来のフラットなシステムでは不可能だった新しい価値を提供します。',

    usecase1Title: '1. 動的コンピテンシーモデリング',
    usecase1Subtitle: '「誰が何を経験し、なぜそうしたか」を陳腐化させずに可視化。',
    usecase1Desc: '静的なスキルマップは技術の進歩とともに即座に陳腐化します。HASMは、誰がどのプロジェクトに関わり、どんな課題に直面し、何を学んだのかという「経験の系譜」を動的に記録・更新し続けます。',

    usecase2Title: '2. 動的職務経歴書・ナラティブCV生成',
    usecase2Subtitle: 'グラフデータから文脈に応じたポートフォリオを瞬時に編纂。',
    usecase2Desc: '単なる箇条書きの職務経歴書を提出する代わりに、特定の文脈（例：「分散システムと危機対応リーダーシップ」）を指定して部分グラフを抽出し、説得力ある一貫したストーリーを持つ経歴書を自動生成します。',

    usecase3Title: '3. リフレクティブ・マネジメント＆内省支援',
    usecase3Subtitle: '記憶に頼らない、文脈の時空図に基づいた1-on-1と育成支援。',
    usecase3Desc: 'マネジメント層やメンターがメンバーの過去の意思決定背景を時空図として把握。表面的な結果だけでなく、その行動に至った動機や過去の経験との繋がりを踏まえた深いコーチングを実現します。',

    usecase4Title: '4. 共創経験ネットワーク（経験SNS）',
    usecase4Subtitle: '論文を引用するように、他者との共同成果や影響関係を共有。',
    usecase4Desc: 'チームプロジェクトにおいて、同一の客観的成果（FACT）を共有しつつ、各自が異なる役割の解釈（EXPERIENCE）を紐付けることで、組織内の知の循環と相互理解のインフラを形成します。',

    usecase5Title: '5. 多次元コンテキストプロジェクト管理',
    usecase5Subtitle: '未来の経験を未完のブランチとして3次元空間に設計。',
    usecase5Desc: 'キャリアの目標や新規研究の計画を、3次元空間のオープンな経験ブランチとしてプロット。前提となるFactや必要な関係性を立体的に把握し、自律的なキャリアプランニングを支援します。',

    // Download Section
    downloadHeader: 'DOWNLOAD INSTALLERS',
    downloadTitleHasm: 'HASM デスクトップアプリをダウンロード',
    downloadTitleMarkdown: 'HASM Markdown エディタをダウンロード',
    downloadSubtitleHasm: 'お使いのOSに応じたネイティブインストーラー（.msi, .exe, .dmg, .deb, .AppImage）をダウンロードできます。',
    downloadSubtitleMarkdown: 'お使いのOSに応じたネイティブインストーラー（.msi, .dmg, .deb, .AppImage）またはポータブル版をダウンロードできます。',
    downloadUnavailable: 'デスクトップアプリのパッケージ作成後、ここにインストーラーが表示されます。',
    winTitle: 'Windows 10 / 11 (64-bit)',
    winMsi: '.msi インストーラーをダウンロード',
    winExe: '.exe インストーラーをダウンロード',
    winZip: 'ポータブル .zip をダウンロード',
    macTitle: 'macOS (Apple Silicon / Intel)',
    macDmg: '.dmg インストーラーをダウンロード',
    macTar: 'ポータブル .tar.gz をダウンロード',
    linuxTitle: 'Linux (Ubuntu / Debian / Fedora)',
    linuxAppImage: '.AppImage をダウンロード',
    linuxDeb: '.deb パッケージをダウンロード',
    buildVersionTag: 'リリース v0.1.0 • Tauri 2, Rust & Reactでビルド • 100% オフライン＆ローカル動作',

    // Markdown Sub-App Page (HASM_Markdown_Page.jsx)
    markdownKicker: 'HASM MARKDOWN EDITOR',
    markdownTitle: '思考をそのまま、どこへでも持ち運ぶ。',
    markdownDescription: 'インストール不要、完全ローカルで動作するポータブルMarkdownエディタ。',
    scrollHint: 'スクロールしてエディタの機能を見る',
    editor: 'EDITOR',
    preview: 'PREVIEW',
    live: 'LIVE',
    portableQuestion: '異なるPCや人でも、そのまま開ける？',
    portableTitle: 'クロスプラットフォームポータブル',
    portableAlt: '動作デモ',
    portableLines: ['USB1本でどこでもそのまま起動', 'OSや個人の環境差分を吸収', 'config.jsonとアセットを一体化'],
    assetQuestion: '画像やアセットの参照管理はどうなる？',
    assetTitle: 'アセット管理機能',
    assetAlt: '図解',
    assetDescription: '同一フォルダ内のアセットをマニフェスト管理。パス崩れを防ぎ、安全に埋め込めます。',
    assetStatus: 'マニフェスト経由で自動解決・正常参照中',
    privacyQuestion: '外部通信やトラッキングの心配は？',
    privacyTitle: '完全ローカル・セキュリティ',
    offlineLabel: '100% Offline & Local',
    offlineDescription: '機密文書やプライベートな思考の記録にも安心。',
    footerTitle: '1ファイル・ゼロインストールで開始',
    footerDescription: 'USBメモリや任意のディレクトリに解凍するだけで、理想の執筆環境が完成します。',
    download: 'HASM Editor (.zip)をダウンロード',
    portableStatus: 'ポータブル動作中',
    portableDescription: '異なるユーザー環境やOSでも、依存ファイルを同一フォルダから自動読み込みして同一レンダリングを実現。',
    usbHint: 'USBメモリやクラウド同期フォルダからそのまま起動可能',
    osNames: ['macOS (MacBook)', 'Windows 11 (PC)', 'Ubuntu Linux'],
    osLabels: ['macOS', 'Windows', 'Ubuntu'],
    loaded: '[Loaded] asset:portable.mp4',
    localStatus: '[Status] 100% Local & Portable',
    externalApi: '外部API依存 : ゼロ',
    telemetry: '自動送信テレメトリ : なし',
    offlineGuarantee: 'オフライン環境でも100%動作します。',

    // Color Pattern Page (HASM_Color_Pattern_Page.jsx)
    colorPatternKicker: 'HASM COLOR PATTERN SYSTEM',
    colorPatternTitle: '一貫したスペクトラムで文書を彩る。',
    colorPatternDescription: '安全なコントラスト計算とCSS変数を備えた共有カラーパレット。HASMの各アプリで同じテーマを再利用できます。',
    colorPatternPreview: 'ライブプレビュー',
    colorPatternCatalog: 'パターン一覧',
    colorPatternCode: 'クイック利用',
    colorPatternContrast: 'コントラスト対応',
    colorPatternTokens: 'トークンモデル',
    colorPatternLabel: 'パターン',

    // Logo Page (HASM_Logo_Explanation_Page.jsx)
    logoKicker: 'HASM LOGO SYSTEM',
    logoTitle: '構造をひとつに束ねる形。',
    logoDescription: 'HASMのマークは、ひとつの日付から決まる幾何学的なロゼットです。協働、継続、人の活動を、ひとつの視覚システムへ変換します。',
    logoVariantsLabel: '4つの出力',
    logoVariantsTitle: 'どの画面にも使える、ひとつのマーク。',
    logoVariantsDescription: 'ロゴリポジトリでは、透明なUI、暗いキャンバス、明るい文書、コンパクトなアプリアイコン向けに同じ形状を生成します。',
    logoTransparent: '透明背景',
    logoDark: '暗い背景',
    logoLight: '明るい背景',
    logoFavicon: 'ファビコン',
    logoModelLabel: '数学モデル',
    logoModelTitle: '数学がマークに記憶を与える。',
    logoModelDescription: '基本周波数8と倍音周波数14を組み合わせた軌跡です。ロゼットを描きながら、正方形の境界内に収まります。',
    logoAnchorLabel: '時間のアンカー',
    logoAnchorDescription: '日付は飾りではありません。位相と色のモデルを決め、生成アセットを再現可能にします。',
    logoFormulaLabel: 'パラメトリック軌跡の式',
    logoHarmonyTitle: '構造的な調和',
    logoHarmonyDescription: '7回対称の曲線が、個々の方向性を失わずに重なり合います。',
    logoColorTitle: '穏やかなスペクトラム',
    logoColorDescription: '三角関数を二乗したチャンネルが、明暗どちらの背景でも読みやすいグラデーションを作ります。',
    logoUsageTitle: '余白を守る',
    logoUsageDescription: '正方形の比率を保ち、形状の周囲に最低10%の余白を残します。'
  }
};

export function LanguageProvider({ children }) {
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

  return createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t: TRANSLATIONS[language] } },
    children
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider.');
  }
  return context;
}