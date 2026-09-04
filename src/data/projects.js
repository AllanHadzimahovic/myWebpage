/**
 * Project markers scattered across the landing page.
 * sticker: true → die-cut PNG with baked white silhouette (no rounded CSS frame).
 * rotate: degrees of tilt (optional).
 * x/y: percent of the full landing viewport.
 * stills: [{ src, alt? }] — static images in a row (e.g. two photos above a PDF).
 * stillsPlacement: 'end' — render stills after Links instead of above Documents.
 * hideMarker: true — content-only entry (not drawn as a landing sticker).
 * gallery: [{ src, alt?, caption?, text? } | { type:'youtube', youtubeId, alt?, caption?, text? }] — primary carousel.
 *   caption / text — shown in a box to the right of that slide.
 * favorites: [{ title, items: [string | { title, url }] }] — boxed lists (About Me, etc).
 * galleryHeading: optional h2 for the primary gallery (default "Gallery").
 * galleryBeforeVideo: true — render the primary gallery above the Video section.
 * gallerySecondary: same shape as gallery; rendered below primary (above Documents).
 * gallerySecondaryHeading: optional h2 for that section (default "Partners").
 * galleries: [{ heading, images, fit?, note?, flag?, flyFlag? }] — extra named carousels after gallerySecondary.
 *   fit: 'portrait' — taller frame for tall slides (Scrum pages, etc.).
 *   note — read-only text box rendered above that gallery.
 *   flag — die-cut PNG parked beside that gallery (not a carousel slide).
 *   flyFlag — landing sticker splits and this flag flies to the gallery dock.
 * phoneNumber — skip panel; shake the sticker and show this number in a text box.
 * confetti: true — skip panel; rain confetti from the top of the screen for 7 seconds.
 * languageGroups: [{ heading, intro?, items: [{ title, src, text }], credit? }] — labeled icon grids; click opens a text box.
 * languageStickers / languageStickersHeading — older single-grid shape (still supported).
 */
export const projects = [
  {
    id: 'project-1',
    title: 'LEGO',
    icon: '/projects/project-1.png',
    sticker: true,
    x: 8,
    y: 18,
    size: 108,
    rotate: -12,
    summary: 'DOT LEGO Ideas case study.',
    description:
      'Ever since I was a kid, I have loved building LEGO - my favourite set was the Mercedes-Benz Arocs 3245 :) This shifted into playing Lego Star Wars, Rock Raiders, Racers and many more. Lately, I have been interested in LEGO Ideas, which my group wrote a paper on.',
    youtubeId: '',
    stills: [
      {
        src: '/projects/lego/01.jpg',
        alt: 'Allan with a LEGO Game Boy set, a Danish flag, and a card that says Du får ny LEGO',
      },
      {
        src: '/projects/lego/02.jpg',
        alt: 'Finished LEGO Game Boy, Vespa scooter, sports car, and a Prusa rubber duck on a table',
      },
    ],
    pdfs: [
      {
        title: 'DOT LEGO Ideas case',
        url: '/files/lego-ideas-case.pdf',
        filename: 'DOT-LEGO-Ideas-case.pdf',
        embed: true,
      },
    ],
    files: [],
    links: [],
  },
  {
    id: 'project-2',
    title: 'Volleyball',
    icon: '/projects/project-2.png',
    sticker: true,
    x: 72,
    y: 22,
    size: 108,
    rotate: 8,
    // Landing mini-game — skips ProjectPanel (see VolleyballGame.jsx).
    miniGame: 'volleyball',
  },
  {
    id: 'project-3',
    title: 'Contact me',
    markerTitle: 'Email',
    icon: '/projects/email-at.png',
    sticker: true,
    x: 94,
    y: 42,
    size: 108,
    rotate: 15,
    summary: '',
    description: '',
    contact: {
      channel: 'email',
      to: 'allanh@live.dk',
      sticker: '/projects/email-at.png',
      label: 'Send me an email here',
    },
    youtubeId: '',
    pdfs: [],
    links: [],
  },
  {
    id: 'project-5',
    title: 'Book a meeting',
    markerTitle: 'Calendar',
    icon: '/projects/project-5.png',
    sticker: true,
    x: 14,
    y: 78,
    size: 108,
    rotate: 10,
    summary: 'Pick a time that works — book a 30-minute meeting with Allan.',
    description: 'Hi - you can book me in for a meeting below :)',
    youtubeId: '',
    webEmbed: {
      heading: 'Schedule',
      title: 'Calendly — 30 min',
      src: 'https://calendly.com/allanhadzimahovic1/30min?hide_gdpr_banner=1',
      note: 'If the calendar does not load here, use Open in new tab.',
      status: 'Select a day and time. Confirmation goes to your email.',
    },
    pdfs: [],
    links: [
      {
        title: 'Open Calendly in a new tab',
        url: 'https://calendly.com/allanhadzimahovic1/30min',
      },
    ],
  },
  {
    id: 'project-6',
    title: 'LinkedIn',
    icon: '/projects/project-6.png',
    sticker: true,
    externalUrl: 'https://www.linkedin.com/in/allanprojectmanager/',
    x: 4,
    y: 48,
    size: 108,
    rotate: -18,
    // Opens the profile in a new tab — no fly-in / detail panel.
    summary: '',
    description: '',
    youtubeId: '',
    pdfs: [],
    links: [],
  },
  {
    id: 'project-7',
    title: 'Real Balloons',
    markerTitle: 'Unity',
    icon: '/projects/project-7.png',
    sticker: true,
    x: 42,
    y: 8,
    size: 108,
    rotate: 4,
    summary: 'Playable Unity WebGL game — defend, build, and survive.',
    description:
      'Ever played Bloons? This is a game where you buy towers but you can also damage waves of enemies with your own character. Can you survive long enough to build all towers? You can also check out the code below. It was fun working with game states, event listeners and loops :)\n\nI built it in Unity using C#. AI was only used for deploying the game, not for developing it.',
    youtubeId: '8knwQV1mQww',
    unityWebGL: {
      title: 'Real Balloons',
      // Cache-bust so browsers don't reuse an old compressed (.br) index.html
      src: '/games/unity/index.html?v=fit2',
      note: 'Works best on desktop Chrome or Edge. Click the game canvas after it loads if keyboard/mouse input feels stuck.',
    },
    codeRepo: {
      title: 'GitHub repository',
      url: 'https://github.com/AllanHadzimahovic/RealBalloons',
      icon: '/projects/project-15.png',
    },
    code: [
      { title: 'GameStateMachine.cs', url: '/files/code/real-balloons/GameStateMachine.cs', language: 'csharp' },
      { title: 'GlobalInputManager.cs', url: '/files/code/real-balloons/GlobalInputManager.cs', language: 'csharp' },
      { title: 'LevelManager.cs', url: '/files/code/real-balloons/LevelManager.cs', language: 'csharp' },
      { title: 'BuildManager.cs', url: '/files/code/real-balloons/BuildManager.cs', language: 'csharp' },
      { title: 'Character_Controller.cs', url: '/files/code/real-balloons/Character_Controller.cs', language: 'csharp' },
      { title: 'HomeScript.cs', url: '/files/code/real-balloons/HomeScript.cs', language: 'csharp' },
      { title: 'PlaneScript.cs', url: '/files/code/real-balloons/PlaneScript.cs', language: 'csharp' },
      { title: 'EnemyScript.cs', url: '/files/code/real-balloons/EnemyScript.cs', language: 'csharp' },
      { title: 'EnemySpawner.cs', url: '/files/code/real-balloons/EnemySpawner.cs', language: 'csharp' },
      { title: 'Turret.cs', url: '/files/code/real-balloons/Turret.cs', language: 'csharp' },
      { title: 'Bullet.cs', url: '/files/code/real-balloons/Bullet.cs', language: 'csharp' },
      { title: 'AttackSphereScript.cs', url: '/files/code/real-balloons/AttackSphereScript.cs', language: 'csharp' },
      { title: 'WallsOnTrigger.cs', url: '/files/code/real-balloons/WallsOnTrigger.cs', language: 'csharp' },
      { title: 'ChangeColor.cs', url: '/files/code/real-balloons/ChangeColor.cs', language: 'csharp' },
      { title: 'hagScript.cs', url: '/files/code/real-balloons/hagScript.cs', language: 'csharp' },
      { title: 'StartMenuScript.cs', url: '/files/code/real-balloons/StartMenuScript.cs', language: 'csharp' },
      { title: 'PauseMenuEvents.cs', url: '/files/code/real-balloons/PauseMenuEvents.cs', language: 'csharp' },
      { title: 'GameOverMenuScript.cs', url: '/files/code/real-balloons/GameOverMenuScript.cs', language: 'csharp' },
    ],
    pdfs: [],
    links: [],
  },
  {
    id: 'project-8',
    title: 'Azure',
    icon: '/projects/project-8.png',
    sticker: true,
    markerTitle: 'Azure',
    groupId: 'ms-cloud',
    linkTo: 'project-16',
    x: 96,
    y: 62,
    size: 108,
    rotate: -9,
    // Opens the shared Maternity Foundation project (project-16).
    summary: '',
    description: '',
    youtubeId: '',
    pdfs: [],
    links: [],
  },
  {
    id: 'project-9',
    title: 'Power Automate',
    icon: '/projects/project-9.png',
    sticker: true,
    markerTitle: 'Power Automate',
    groupId: 'ms-cloud',
    linkTo: 'project-16',
    x: 62,
    y: 90,
    size: 108,
    rotate: 14,
    // Opens the shared Maternity Foundation project (project-16).
    summary: '',
    description: '',
    youtubeId: '',
    pdfs: [],
    links: [],
  },
  {
    id: 'project-10',
    title: 'Scrum Master',
    icon: '/projects/project-10.png',
    sticker: true,
    x: 28,
    y: 92,
    size: 102,
    rotate: -4,
    summary: 'Microsoft Learn certifications and learning paths.',
    description:
      'Industrial Scrum Master Training\n\nThis course was a lot of fun! As a Scrum Master, I was paired up with 8 bachelor students, a Product Owner ([Tastelater](https://tastelater.com/)) and a Technical Specialist. For 4 months and over 6 sprints, we developed the frontend and backend of a transaction register for different user roles. It was fun to learn about Git, Pull Requests and testing but even more fun to learn about the Scrum Methodology, teamwork, alignment and the low-level difficulties of working 10 on a project. It was fun to work with Miro and we created a lot of memes :)\n\nAfter passing the exam, all Scrum Master’s received their [official certification](https://bcert.me/bc/html/show-badge.html?b=efrobwzy).',
    youtubeId: 'jmbbQRJH__0',
    webEmbed: {
      heading: 'Miro board',
      title: 'Microsoft Learn board',
      src: 'https://miro.com/app/live-embed/uXjVIeWTLeQ=/?embedMode=view_only_without_ui&autoplay=true',
      note: 'Pan and zoom inside the board if needed. If the embed stays blank, use Open in new tab.',
      image: {
        src: '/projects/microsoft-learn/scrum-team.jpg',
        alt: 'Scrum Master training team standing together outside a café',
      },
    },
    galleryHeading: 'Certifications',
    gallery: [
      {
        src: '/projects/microsoft-learn/01-badge.png',
        alt: 'Microsoft Learn certification badge',
      },
      {
        src: '/projects/microsoft-learn/02-azure-fundamentals-badge.webp',
        alt: 'Microsoft Certified: Azure Fundamentals (AZ-900) badge',
      },
      {
        src: '/projects/microsoft-learn/03-azure-ai-fundamentals.png',
        alt: 'Microsoft Certified: Azure AI Fundamentals (AI-900) certificate',
      },
      {
        src: '/projects/microsoft-learn/04-azure-data-fundamentals.jpg',
        alt: 'Microsoft Certified: Azure Data Fundamentals (DP-900) certificate',
      },
    ],
    galleries: [
      {
        heading: 'Memes',
        images: [
          {
            src: '/projects/microsoft-learn/memes/01-scrum-team.webp',
            alt: 'Scrum Team meme — developers and product owner as a football team',
          },
          {
            src: '/projects/microsoft-learn/memes/02-product-owner.webp',
            alt: 'Product Owner meme — the boss who owns the product vision',
          },
          {
            src: '/projects/microsoft-learn/memes/03-definition-of-done.webp',
            alt: 'Definition of Done meme — a shared checklist of completion criteria',
          },
          {
            src: '/projects/microsoft-learn/memes/04-daily-standup.webp',
            alt: 'Daily Standup meme — short sync on progress and blockers',
          },
          {
            src: '/projects/microsoft-learn/memes/05-sprint-planning.webp',
            alt: 'Sprint Planning meme — deciding what to build next',
          },
          {
            src: '/projects/microsoft-learn/memes/06-sprint-review.webp',
            alt: 'Sprint Review meme — demoing finished work to stakeholders',
          },
          {
            src: '/projects/microsoft-learn/memes/07-sprint-retrospective.webp',
            alt: 'Sprint Retrospective meme — reflecting on what to improve',
          },
          {
            src: '/projects/microsoft-learn/memes/08-product-backlog.webp',
            alt: 'Product Backlog meme — prioritized list of everything that could be built',
          },
          {
            src: '/projects/microsoft-learn/memes/09-sprint-backlog.webp',
            alt: 'Sprint Backlog meme — the team plan for the current sprint',
          },
        ],
      },
      {
        heading: 'Scrum',
        fit: 'portrait',
        images: [
          {
            src: '/projects/microsoft-learn/scrum/01.jpg',
            alt: 'Scrum training slide — Introduction to Scrum',
          },
          {
            src: '/projects/microsoft-learn/scrum/02.jpg',
            alt: 'Scrum training slide — Agile values and principles',
          },
          {
            src: '/projects/microsoft-learn/scrum/03.jpg',
            alt: 'Scrum training slide — page 3',
          },
          {
            src: '/projects/microsoft-learn/scrum/04.jpg',
            alt: 'Scrum training slide — page 4',
          },
          {
            src: '/projects/microsoft-learn/scrum/05.jpg',
            alt: 'Scrum training slide — page 5',
          },
          {
            src: '/projects/microsoft-learn/scrum/06.jpg',
            alt: 'Scrum training slide — page 6',
          },
          {
            src: '/projects/microsoft-learn/scrum/07.jpg',
            alt: 'Scrum training slide — page 7',
          },
          {
            src: '/projects/microsoft-learn/scrum/08.jpg',
            alt: 'Scrum training slide — page 8',
          },
          {
            src: '/projects/microsoft-learn/scrum/09.jpg',
            alt: 'Scrum training slide — Empirical Process Control',
          },
        ],
      },
    ],
    pdfs: [
      {
        title: 'ISE Slides',
        url: '/files/ise-slides.pdf',
        filename: 'ISE-Slides.pdf',
        embed: true,
      },
    ],
    links: [
      {
        title: 'Open Miro board',
        url: 'https://miro.com/app/board/uXjVIeWTLeQ=/',
      },
    ],
  },
  {
    id: 'project-11',
    title: 'Chess Machine',
    icon: '/projects/project-11.png',
    sticker: true,
    markerTitle: 'Prusa',
    groupId: 'htmaa-chess',
    x: 88,
    y: 28,
    size: 108,
    rotate: 0,
    summary: 'HTMAA chess machine — Prusa prints, Arduino, CAD, and electronics.',
    description:
      'My group and I built a Chess Robot - check it out below. It utilises stepper motors, an Arduino, an electromagnet, belts and a lot more :)\n\nThe coloured parts are 3D-printed on a Prusa MK4s and the chess board is laser cut. We also built a line-following robot called ‘Crab’ :)\n\nThe robots are designed in Autodesk Fusion, sliced in PrusaSlicer and coded in C++.',
    youtubeId: '',
    model3d: {
      title: 'Assembly (interactive)',
      src: '/models/New-Assembly.stl',
      allowUpload: false,
      note: 'Drag to rotate · scroll to zoom · right-drag to pan.',
    },
    gallery: [
      { type: 'youtube', youtubeId: 'vQstGV-e8uo', alt: 'Prusa prototype video' },
      { src: '/projects/prusa/01.jpg', alt: 'CAD assembly of printed parts' },
      { src: '/projects/prusa/02.png', alt: 'Gridfinity modular storage design' },
      { src: '/projects/prusa/03.png', alt: 'Finished blue Gridfinity bins' },
      { src: '/projects/prusa/04.png', alt: 'Orange part printing on the Prusa bed' },
      { src: '/projects/prusa/05.jpg', alt: 'Parts on the print bed' },
      { src: '/projects/prusa/06.png', alt: 'Prusa printer setup' },
    ],
    gallerySecondaryHeading: 'Maternity Foundation',
    gallerySecondary: [
      {
        type: 'youtube',
        youtubeId: '3FwDN4NRYxU',
        alt: 'Maternity Foundation video',
      },
      {
        src: '/projects/prusa/maternity-foundation.jpg',
        alt: 'Maternity Foundation partnership',
      },
    ],
    pdfs: [
      {
        title: 'HTMAA Exam Report (Group 20)',
        url: '/files/htmaa-exam-report.pdf',
        filename: 'Group20_HTMAA_Exam_Report.pdf',
        embed: true,
      },
    ],
    code: [
      {
        title: 'Combined_Code.ino',
        url: '/files/code/Combined_Code.ino',
        language: 'cpp',
      },
    ],
    files: [
      {
        title: 'Additional project files (ZIP)',
        url: '/files/group20-additional-files.zip',
        filename: 'group20_additional_files.zip',
      },
    ],
    links: [],
  },
  {
    id: 'project-12',
    title: 'Kwaxolo Impact Challenge',
    icon: '/projects/project-12.png',
    sticker: true,
    markerTitle: 'Arduino',
    groupId: 'arduino-terminal',
    x: 6,
    y: 64,
    size: 108,
    rotate: 7,
    summary: 'Live educational web app - Lovable and Claude Code.',
    description:
      'Ever played Club Penguin? We made something similar for the KwaXolo Impact Challenge which focuses on Digital Literacy in KwaXolo, South Africa. After creating your own avatar, students can learn about blogs, emails, forums, digital drawing, uploading pictures and many other elements of digital literacy. Students collectively work to upgrade and decorate their school by completing quizzes. The application is hooked up to a Claude API Key so that teachers are empowered to develop and expand the application. The application is built with Lovable and Claude Code.',
    youtubeId: '',
    webEmbed: {
      heading: 'Try it',
      title: 'Sibanye.school',
      src: 'https://git-sweetener.lovable.app/school',
      note: 'If the embed stays blank, use Open in new tab — some browsers or networks block third-party frames.',
      images: [
        {
          src: '/projects/kwaxolo/royal-hacks.jpg',
          alt: 'Team at Royal Hacks, IT University of Copenhagen, April 2026',
        },
        {
          src: '/projects/kwaxolo/royal-hacks-2.jpg',
          alt: 'KwaXolo Learn pitch in a lecture hall',
        },
      ],
    },
    pdfs: [
      {
        title: 'KwaXolo Impact Challenge — Case',
        url: '/files/kwaxolo-impact-challenge-case.pdf',
        filename: 'KwaXolo-Impact-Challenge-Case.pdf',
        embed: true,
      },
    ],
    links: [
      {
        title: 'Sibanye.school (full site)',
        url: 'https://git-sweetener.lovable.app/school',
      },
    ],
  },
  {
    id: 'project-13',
    title: 'Arduino',
    icon: '/projects/project-13.png',
    sticker: true,
    markerTitle: 'Arduino',
    groupId: 'htmaa-chess',
    linkTo: 'project-11',
    x: 22,
    y: 10,
    size: 108,
    rotate: -14,
    // Opens the shared Chess Machine project (project-11).
    summary: '',
    description: '',
    youtubeId: '',
    pdfs: [],
    links: [],
  },
  {
    id: 'project-14',
    title: 'Terminal',
    icon: '/projects/project-14.png',
    sticker: true,
    markerTitle: 'Terminal',
    groupId: 'arduino-terminal',
    linkTo: 'project-12',
    x: 70,
    y: 70,
    size: 108,
    rotate: 11,
    // Opens the shared Arduino & Terminal project (project-12).
    summary: '',
    description: '',
    youtubeId: '',
    pdfs: [],
    links: [],
  },
  {
    id: 'project-15',
    title: 'GitHub',
    icon: '/projects/project-15.png',
    sticker: true,
    externalUrl: 'https://github.com/AllanHadzimahovic',
    x: 54,
    y: 16,
    size: 108,
    rotate: -8,
    // Opens the profile in a new tab — no fly-in / detail panel.
    summary: '',
    description: '',
    youtubeId: '',
    pdfs: [],
    links: [],
  },
  {
    id: 'project-16',
    title: 'Maternity Foundation',
    icon: '/projects/project-16.png',
    sticker: true,
    markerTitle: 'Maternity Foundation',
    groupId: 'ms-cloud',
    x: 38,
    y: 84,
    size: 108,
    rotate: 9,
    summary: 'Partnership / project with the Maternity Foundation.',
    description:
      'For our Master’s Thesis, we collaborated with the amazing NGO Maternity Foundation to investigate Digitalisation of NGOs. It was great fun - we automated a manual data analysis process through Azure, Power Automate, Power BI and Data Factory. Here, we realised how important strategy and alignment are for generating value from data.',
    youtubeId: 'PCzt8Gsm4wE',
    galleryBeforeVideo: true,
    gallery: [
      {
        src: '/projects/maternity-foundation/thesis.jpg',
        alt: 'Thesis group with flowers and papers in front of a glass campus building',
      },
      {
        src: '/projects/maternity-foundation/02.jpg',
        alt: 'Two people smiling and pointing toward each other in a glass atrium',
      },
      {
        src: '/projects/maternity-foundation/03.jpg',
        alt: 'Talking with family and guests in the glass lobby after the thesis defence',
      },
      {
        src: '/projects/maternity-foundation/04.jpg',
        alt: 'Hugging at the thesis celebration with Danish flags in the lobby',
      },
    ],
    pdfs: [
      {
        title: 'Masters Thesis — DSR Study of Impact Reporting in NPO',
        url: '/files/masters-thesis-dsr-impact-reporting-npo.pdf',
        filename: 'Masters-Thesis-DSR-Impact-Reporting-NPO.pdf',
        embed: true,
      },
      {
        title: '23rd June Presentation',
        url: '/files/23rd-june-presentation.pdf',
        filename: '23rd-June-Presentation.pdf',
        embed: true,
      },
    ],
    links: [],
  },
  {
    id: 'project-17',
    title: 'Programming',
    icon: '/projects/project-17.png',
    sticker: true,
    x: 58,
    y: 52,
    size: 120,
    rotate: -5,
    summary: 'Languages, applications, and project tools I work with.',
    description:
      'Below are the languages and applications I have worked with. I’m not a programming expert, but I have a fundamental understanding of everything :)',
    youtubeId: '',
    languageGroups: [
      {
        heading: 'Programming languages',
        credit: 'Language icons from Flaticon.',
        items: [
          {
            title: 'SQL',
            src: '/projects/languages/sql.png',
            text: 'Structured Query Language — how I talk to relational databases. Select, join, and filter until the table actually answers the question.',
          },
          {
            title: 'JSON',
            src: '/projects/languages/json.png',
            text: 'JavaScript Object Notation. The usual shape of API payloads and config files — nested objects and arrays that move data between services and the UI.',
          },
          {
            title: 'C++',
            src: '/projects/languages/cpp.png',
            text: 'A systems language I used on hardware work, including Arduino firmware for the Chess Machine. Close to the metal, explicit about memory and control.',
          },
          {
            title: 'Python',
            src: '/projects/languages/python.png',
            text: 'My go-to for scripts, data, and glue code. Fast to try an idea, then keep the parts that are worth shipping.',
          },
          {
            title: 'Java',
            src: '/projects/languages/java.png',
            text: 'A strongly typed, object-oriented language for structured applications. Classes, packages, and a runtime that shows up across backends and tools.',
          },
          {
            title: 'JavaScript',
            src: '/projects/languages/javascript.png',
            text: 'The language of the web. I use it for interactive pages, browser logic, and the front-end of this portfolio.',
          },
          {
            title: 'C#',
            src: '/projects/languages/csharp.png',
            text: 'The language behind the Real Balloons Unity game — gameplay, input, menus, and the scripts that hold a scene together.',
          },
          {
            title: 'HTML',
            src: '/projects/languages/html.png',
            text: 'The markup of the web. Structure, headings, forms, and the skeleton every page in this portfolio sits on.',
          },
          {
            title: 'CSS',
            src: '/projects/languages/css.png',
            text: 'How the page actually looks — layout, type, color, and the sticker landing without turning it into a marketing site.',
          },
          {
            title: 'HTTP',
            src: '/projects/languages/http.png',
            text: 'How browsers and servers talk. Requests, responses, and the protocol behind every API call and page load.',
          },
          {
            title: 'Zsh',
            src: '/projects/languages/zsh.png',
            text: 'My daily shell. Aliases, prompts, and the terminal workflows that sit behind Arduino, Git, and this portfolio’s build loop.',
          },
        ],
      },
      {
        heading: 'Applications',
        items: [
          {
            title: 'Azure',
            src: '/projects/languages/azure.png',
            text: 'Microsoft’s cloud. I use it for services, identity, storage, and the rest of the stack that sits behind a project.',
          },
          {
            title: 'Power BI',
            src: '/projects/languages/power-bi.png',
            text: 'Reports and dashboards. Take a table and turn it into something a stakeholder can actually read in a meeting.',
          },
          {
            title: 'Data Factory',
            src: '/projects/languages/data-factory.png',
            text: 'Azure Data Factory — pipelines that move and transform data between systems on a schedule, not by hand.',
          },
          {
            title: 'Power Automate',
            src: '/projects/languages/power-automate.png',
            text: 'Flows that take the copy-paste out of recurring work across Microsoft 365, approvals, and notifications.',
          },
          {
            title: 'Claude Code',
            src: '/projects/languages/claude-code.png',
            text: 'Anthropic’s coding agent in the terminal. I use it for longer refactors and edits that need the whole repo in view.',
          },
          {
            title: 'Grok Bot',
            src: '/projects/languages/grok-bot.png',
            text: 'xAI’s Grok in the build loop — scaffolding, stickers, and shipping this portfolio.',
          },
          {
            title: 'Docker',
            src: '/projects/languages/docker.png',
            text: 'Containers so the app that runs on my machine runs the same on the next one.',
          },
          {
            title: 'Kubernetes',
            src: '/projects/languages/kubernetes.png',
            text: 'Orchestration for those containers when one box isn’t enough — deploy, scale, and keep services up.',
          },
          {
            title: 'VS Code',
            src: '/projects/languages/vscode.png',
            text: 'Daily editor. The place the code actually gets written, debugged, and committed.',
          },
          {
            title: 'Unity',
            src: '/projects/languages/unity-app.png',
            text: 'Game engine behind Real Balloons — scenes, physics, UI, and the WebGL build on this site.',
          },
          {
            title: 'GitHub',
            src: '/projects/languages/github-app.png',
            text: 'Where the repos live — issues, history, and this portfolio at github.com/AllanHadzimahovic.',
          },
          {
            title: 'Git',
            src: '/projects/languages/git.png',
            text: 'Version control. Commits, branches, and the history that makes it safe to try something and still get back.',
          },
          {
            title: 'Ollama',
            src: '/projects/languages/ollama.png',
            text: 'Run language models on my own machine. Useful when the work should stay local instead of going out to a hosted API.',
          },
          {
            title: 'DuckDB',
            src: '/projects/languages/duckdb.png',
            text: 'An in-process analytical database. Fast SQL over files and tables without standing up a separate server.',
          },
          {
            title: 'Lovable',
            src: '/projects/languages/lovable.png',
            text: 'The web-app builder behind Sibanye.school — prompt a working UI, then keep the parts worth shipping.',
          },
          {
            title: 'Autodesk Fusion',
            src: '/projects/languages/autodesk-fusion.png',
            text: 'CAD for parts and assemblies. The Chess Machine models start here before they hit the Prusa bed.',
          },
        ],
      },
      {
        heading: 'Project Management',
        items: [
          {
            title: 'ClickUp',
            src: '/projects/languages/clickup.png',
            text: 'Tasks, docs, and a place to park the work so it doesn’t live only in a chat thread.',
          },
          {
            title: 'Linear',
            src: '/projects/languages/linear.png',
            text: 'Issue tracking with a fast, keyboard-first workflow. Cycles, priorities, and a board that stays out of the way.',
          },
          {
            title: 'Jira',
            src: '/projects/languages/jira.png',
            text: 'Classic software delivery board — epics, sprints, and tickets when the team already lives in Atlassian.',
          },
          {
            title: 'Microsoft 365',
            src: '/projects/languages/microsoft-365.png',
            text: 'Outlook, Teams, Word, Excel — the office suite the day-to-day work runs through.',
          },
          {
            title: 'Google Workspace',
            src: '/projects/languages/google-workspace.png',
            text: 'Docs, Drive, Calendar, Meet — the Google side of sharing files and getting people in the same room.',
          },
          {
            title: 'e-conomic',
            src: '/projects/languages/economic.png',
            text: 'Danish accounting software (Visma e-conomic). Invoices, bookkeeping, and the numbers a small operation actually files.',
          },
          {
            title: 'HubSpot',
            src: '/projects/languages/hubspot.png',
            text: 'CRM and inbound tools — contacts, pipelines, and the marketing/sales side of keeping follow-ups in one place.',
          },
        ],
      },
      {
        heading: 'Programs I want to learn',
        intro: 'Of course, more about the programs above',
        items: [
          {
            title: 'SAP',
            src: '/projects/languages/sap.png',
            text: 'Enterprise software for finance, logistics, and the rest of a company’s operating system. Next on the list to learn properly.',
          },
          {
            title: 'C',
            src: '/projects/languages/c.png',
            text: 'The language underneath a lot of systems work. Closer to the metal than C++ — memory, pointers, and how the machine actually runs the program.',
          },
          {
            title: 'Playwright',
            src: '/projects/languages/playwright.png',
            text: 'Browser automation and end-to-end tests. Click through a real page the way a user would, and catch what broke before they do.',
          },
          {
            title: 'Amazon Web Services',
            src: '/projects/languages/aws.png',
            text: 'AWS — the other big cloud. Compute, storage, and the catalog of services that sit behind a lot of production apps.',
          },
          {
            title: 'BridgeMind',
            src: '/projects/languages/bridgemind.png',
            text: 'A vibe-coding / agent workspace — describe the work in plain language and let agents ship from the terminal.',
          },
        ],
      },
    ],
    pdfs: [],
    links: [],
  },
  {
    id: 'project-18',
    title: 'Phone',
    markerTitle: 'Phone',
    icon: '/projects/project-18.png',
    sticker: true,
    x: 31,
    y: 38,
    size: 108,
    rotate: -14,
    // Landing shake + text box — skips ProjectPanel.
    phoneNumber: '+45 42319931',
  },
  {
    id: 'project-19',
    title: 'Coffee Shop',
    markerTitle: 'Coffee',
    icon: '/projects/project-19.png',
    sticker: true,
    x: 80,
    y: 46,
    size: 108,
    rotate: 7,
    summary: 'ITU Introduction to Database Systems — Javalin + DuckDB coffee shop.',
    description:
      'A Java web app I built for Introduction to Database Systems: register, log in, buy drinks, and browse purchases against a DuckDB schema. The live demo below is the same shop (pages, products, and seed users as App.java). Try Anna / test, Martin / test, or Omar / test — or create your own account.',
    youtubeId: '',
    webEmbed: {
      heading: 'Coffee Shop',
      title: 'Coffee Shop',
      src: '/apps/coffeeshop/index.html',
      status: 'Register or log in to buy. Seed logins: Anna, Martin, or Omar — password test.',
      note: 'Purchases stay in this browser. Java source for the original Javalin + DuckDB server is in the Code section.',
    },
    code: [
      { title: 'App.java', url: '/files/code/coffeeshop/App.java', language: 'java' },
      { title: 'init.sql', url: '/files/code/coffeeshop/init.sql', language: 'sql' },
    ],
    pdfs: [],
    links: [],
  },
  {
    id: 'project-20',
    title: 'Celebration',
    markerTitle: 'Celebrate',
    icon: '/projects/project-20.png',
    sticker: true,
    x: 24,
    y: 56,
    size: 108,
    rotate: 16,
    // Landing confetti rain — skips ProjectPanel (see ConfettiRain.jsx).
    confetti: true,
  },
  {
    id: 'project-21',
    title: 'Countries',
    markerTitle: 'Countries',
    icon: '/projects/project-21.png',
    sticker: true,
    x: 78,
    y: 78,
    size: 108,
    rotate: -6,
    summary: 'Japanese, Austrian, Spanish, and Danish.',
    description:
      'I love traveling and meeting new people - explore my exchanges below',
    youtubeId: '',
    galleries: [
      {
        heading: 'Japanese',
        flag: '/projects/flags/japan.png',
        flyFlag: true,
        note: "I was on exchange in Japan - it was surreal and I'm definitely going back at some point :)",
        images: [
          {
            src: '/projects/flags/japanese/01.jpg',
            alt: 'Group on a snowy wooden bridge in a mountain village in Japan',
          },
          {
            src: '/projects/flags/japanese/02.jpg',
            alt: 'Allan on a snowy street in front of a temple town, beanie and olive jacket',
          },
          {
            src: '/projects/flags/japanese/03.jpg',
            alt: 'Face-in-hole Maidreamin cutout in Akihabara, welcome to Akihabara sign',
          },
          {
            src: '/projects/flags/japanese/04.jpg',
            alt: 'Allan on a snowy pier by a lake, peace sign, small boat beside the dock',
          },
          {
            src: '/projects/flags/japanese/05.jpg',
            alt: 'Group at sunset by the sea with Mount Fuji in the background',
          },
          {
            src: '/projects/flags/japanese/06.jpg',
            alt: 'Friends in yukata around a long kaiseki dinner table',
          },
          {
            src: '/projects/flags/japanese/07.jpg',
            alt: 'Group by a river with autumn hills in the background',
          },
        ],
      },
      {
        heading: 'Austrian',
        flag: '/projects/flags/austria.png',
        flyFlag: true,
        note: 'My girlfriend is from Vorarlberg, Austria - so Austria is now my second home',
        images: [
          {
            src: '/projects/flags/austrian/01.jpg',
            alt: 'Three people standing together on a frozen snowy lake with a forested hillside behind',
          },
          {
            src: '/projects/flags/austrian/02.jpg',
            alt: 'Family group in a garden in front of a wooden house in Vorarlberg',
          },
          {
            src: '/projects/flags/austrian/03.jpg',
            alt: 'Allan fishing at a turquoise alpine lake with mountains and a dam in the background',
          },
          {
            src: '/projects/flags/austrian/04.jpg',
            alt: 'Four people hiking a gravel path through a wet green forest',
          },
          {
            src: '/projects/flags/austrian/05.jpg',
            alt: 'Allan hiking with an older man in the Austrian Alps, poles and backpacks',
          },
          {
            src: '/projects/flags/austrian/06.jpg',
            alt: 'Allan and his girlfriend on a grassy alpine pasture with a cow and a wooden cross',
          },
          {
            src: '/projects/flags/austrian/07.jpg',
            alt: 'Allan and his girlfriend hugging on a mountain path with limestone peaks behind',
          },
          {
            src: '/projects/flags/austrian/08.jpg',
            alt: 'Family group with sleds on a foggy snowy slope in the Austrian Alps',
          },
        ],
      },
      {
        heading: 'Spanish',
        flag: '/projects/flags/spain.png',
        flyFlag: true,
        note: 'During my sabbatical year, I was 9 months in Alzira, Valencia with the European Solidarity Corps',
        images: [
          {
            src: '/projects/flags/spanish/01.jpg',
            alt: 'Hill town and mountains beyond a wooden fence and lawn under a clear blue sky near Alzira',
          },
          {
            src: '/projects/flags/spanish/02.jpg',
            alt: 'Allan and a friend laughing over coffee and chocolate croissants at an outdoor café',
          },
          {
            src: '/projects/flags/spanish/03.jpg',
            alt: 'Allan and a friend at a café table with tuna bocadillos',
          },
          {
            src: '/projects/flags/spanish/04.jpg',
            alt: 'European Solidarity Corps group photo in front of the Idea building in Alzira',
          },
          {
            src: '/projects/flags/spanish/05.jpg',
            alt: 'Allan presenting Cuerpo Europeo de Solidaridad next to a colleague at a blue table',
          },
          {
            src: '/projects/flags/spanish/06.jpg',
            alt: 'Allan with backpacks and a suitcase pointing at Torre Glòries in Barcelona',
          },
        ],
      },
      {
        heading: 'Danish',
        flag: '/projects/flags/denmark.png',
        flyFlag: true,
        note: 'My favorite activities - hanging out with friends, playing volleyball and exploring Copenhagen',
        images: [
          {
            src: '/projects/flags/danish/01.jpg',
            alt: 'Group photo in front of a TECHBBQ backdrop',
          },
          {
            src: '/projects/flags/danish/02.jpg',
            alt: 'Three people playing a board game at a wooden cabin table at night',
          },
          {
            src: '/projects/flags/danish/03.jpg',
            alt: 'Allan on a beach volleyball court in Copenhagen, white tank, black shorts, cap, and mirrored sunglasses',
          },
          {
            src: '/projects/flags/danish/04.jpg',
            alt: 'Allan under cherry blossoms on a path, bike helmet on, holding a bike',
          },
          {
            src: '/projects/flags/danish/05.jpg',
            alt: 'Friends hanging out in a Copenhagen apartment living room',
          },
          {
            src: '/projects/flags/danish/06.jpg',
            alt: 'Couple at a wedding reception under a white tent; man in navy tuxedo, woman in pink dress with a white bouquet',
          },
          {
            src: '/projects/flags/danish/07.jpg',
            alt: 'Family wedding photo in front of a Danish stone house with red window frames',
          },
        ],
      },
      {
        heading: 'EU',
        flag: '/projects/flags/eu.png',
        note: "Do you know Erasmus+ Youth Exchanges? It's week-long intercultural exchanges with focus on soft skills such as empathy, patience, communication and inclusion. Here are pictures from Czech Republic, Italy and Portugal :)",
        images: [
          {
            src: '/projects/flags/eu/01.jpg',
            alt: 'Erasmus+ group on a viewpoint above a riverside city in Portugal',
          },
          {
            src: '/projects/flags/eu/02.jpg',
            alt: 'Friends in a close selfie during an Erasmus+ Youth Exchange',
          },
          {
            src: '/projects/flags/eu/03.jpg',
            alt: 'Group around a table with Danish flags, snacks, and drinks at a cultural evening',
          },
          {
            src: '/projects/flags/eu/04.jpg',
            alt: 'Erasmus+ group by a forest river, waving',
          },
        ],
      },
    ],
    pdfs: [],
    links: [],
  },
  {
    id: 'project-22',
    title: 'Education and Work',
    markerTitle: 'Education and Work',
    icon: '/projects/project-22.png',
    sticker: true,
    x: 66,
    y: 34,
    size: 108,
    rotate: -11,
    summary: 'Degrees, jobs, and the paper trail between them.',
    description:
      'Education and work — CVs, diplomas, and the path between school and jobs. Stickers below are workplaces; documents sit further down.',
    youtubeId: '',
    languageGroups: [
      {
        heading: 'Work',
        items: [
          {
            title: 'TECHBBQ',
            src: '/projects/education/techbbq.png',
            text: 'TECHBBQ — Copenhagen tech festival and community.',
          },
          {
            title: 'Nykredit',
            src: '/projects/education/nykredit.png',
            text: 'Nykredit — Danish mortgage bank and financial group.',
          },
          {
            title: 'Hobbii',
            src: '/projects/education/hobbii.png',
            text: 'Hobbii — yarn, knitting, and craft.',
          },
          {
            title: 'INVIXO',
            src: '/projects/education/invixo.png',
            text: 'INVIXO (part of ECIT) — Assistant Partner Manager and Assistant Project Manager: deal-registration tool for Boomi, plus BizTalk / integrations work including Scandlines.',
          },
          {
            title: 'K.B. Hallen',
            src: '/projects/education/kb-hallen.png',
            text: 'K.B. Hallen — concert and event venue in Copenhagen.',
          },
          {
            title: 'Normal',
            src: '/projects/education/normal.png',
            text: 'Normal — Danish variety retail.',
          },
        ],
      },
    ],
    pdfs: [
      {
        title: 'CV + Transcripts',
        url: '/files/cv-transcripts.pdf',
        filename: 'CV-Transcripts.pdf',
        embed: true,
      },
      {
        title: 'Certifications and Recommendations',
        url: '/files/certifications-and-recommendations.pdf',
        filename: 'Certifications-and-Recommendations.pdf',
        embed: true,
      },
    ],
    links: [],
  },
  {
    id: 'about-me',
    title: 'About Me',
    hideMarker: true,
    summary: '',
    description: '',
    favorites: [
      {
        title: 'Books',
        items: [
          'Factfullness',
          'Eragon',
          "Ranger's Apprentice",
          'The Subtle Art of not Giving a F*ck',
          'Jytte Vender Tilbage',
          'Alt det ingen har fortalt os om Atomkraft',
          'A little life',
          'Stolen Focus',
          'Jeg anerkender ikke længere jeres autoritet',
        ],
      },
      {
        title: 'Games',
        items: [
          'Silksong',
          'Gran Turismo',
          'Trackmania',
          'Mariokart',
          'SuperMario Smashbrothers',
          'Tears of Kingdom',
          'Breath of the Wild',
          'Pokemon Shining Pearl',
          'GameBoy Mario Tennis',
          'Lego Star Wars',
          'Wii Sports',
          'Overcooked',
          'Black Ops',
        ],
      },
      {
        title: 'Websites',
        items: [
          { title: 'LEGO Ideas', url: 'https://ideas.lego.com/' },
          { title: 'lowtechgazine', url: 'https://solar.lowtechmagazine.com/' },
          { title: 'Forensic Architecture', url: 'https://forensic-architecture.org/' },
          { title: 'Pentagon Pizza Index', url: 'https://www.pizzint.watch/' },
          { title: 'The Odin Project', url: 'https://www.theodinproject.com/' },
          { title: 'CS50', url: 'https://cs50.harvard.edu/' },
          { title: 'GitBranching', url: 'https://learngitbranching.js.org/' },
          { title: 'Youtube', url: 'https://www.youtube.com/' },
          { title: 'Tokenizer', url: 'https://platform.openai.com/tokenizer' },
          { title: 'European alternatives', url: 'https://european-alternatives.eu/' },
          { title: 'Code Carbon', url: 'https://codecarbon.io/' },
        ],
      },
      {
        title: 'Activities',
        items: [
          'Volleyball',
          'Badminton',
          'Cycling',
          'Tennis',
          'Any kind of team sports (so not running!)',
          'Board games (Jaws of the Lion & Citadel)',
          'Intercultural Exchange (Youth Exchanges)',
          'Assembling Ikea furniture :)',
          'LEGO',
        ],
      },
    ],
    pdfs: [],
    links: [],
  },
]
