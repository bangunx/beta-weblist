const darkThemeStyles = `
  body.theme-dark {
    background: linear-gradient(180deg, #0b1120 0%, #0f172a 55%, #111827 100%);
    color: #e2e8f0;
    color-scheme: dark;
  }
  body.theme-dark #main-container {
    color: inherit;
  }
  body.theme-dark .hero {
    background: #111827;
    border-color: rgba(51, 65, 85, 0.8);
    box-shadow: 0 22px 40px -30px rgba(0, 0, 0, 0.65);
    color: #e2e8f0;
  }
  body.theme-dark .hero__title {
    color: #f8fafc;
  }
  body.theme-dark .hero__description {
    color: #94a3b8;
  }
  body.theme-dark .hero__tag {
    background: rgba(37, 99, 235, 0.24);
    color: #bfdbfe;
  }
  body.theme-dark .hero__metrics {
    border-color: rgba(71, 85, 105, 0.65);
  }
  body.theme-dark .metric-chip {
    background: rgba(15, 23, 42, 0.85);
    border-color: rgba(71, 85, 105, 0.8);
  }
  body.theme-dark .metric-chip__value {
    color: #93c5fd;
  }
  body.theme-dark .metric-chip__label {
    color: #c7d2fe;
  }
  body.theme-dark .metric-chip__caption {
    color: #94a3b8;
  }
  body.theme-dark .control-panel,
  body.theme-dark .quick-panel,
  body.theme-dark .page-surface {
    background: #111827;
    border-color: rgba(51, 65, 85, 0.85);
    box-shadow: 0 24px 42px -32px rgba(0, 0, 0, 0.65);
  }
  body.theme-dark .quick-panel__header h2,
  body.theme-dark .page-title {
    color: #e2e8f0;
  }
  body.theme-dark .quick-panel__empty,
  body.theme-dark .page-subtitle {
    color: #94a3b8;
  }
  body.theme-dark .quick-chip {
    background: rgba(37, 99, 235, 0.18);
    border-color: rgba(37, 99, 235, 0.42);
    color: #bfdbfe;
  }
  body.theme-dark .quick-chip:hover {
    background: rgba(37, 99, 235, 0.28);
  }
  body.theme-dark .quick-chip--active {
    background: #2563eb;
    color: #f8fafc;
    border-color: #2563eb;
  }
  body.theme-dark .back-to-top {
    background: #2563eb;
    color: #f8fafc;
    box-shadow: 0 20px 32px -24px rgba(37, 99, 235, 0.7);
  }
  body.theme-dark .back-to-top:hover {
    background: #1d4ed8;
  }
  body.theme-dark .selector-group select {
    background: rgba(15, 23, 42, 0.92);
    color: #f8fafc;
    border-color: rgba(148, 163, 184, 0.6);
  }
  body.theme-dark .selector-group select:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
  }
  body.theme-dark .selector-group select option {
    color: #0f172a;
    background: #e2e8f0;
  }
  body.theme-dark .search-form input[type="search"] {
    background: rgba(15, 23, 42, 0.9);
    color: #f8fafc;
    border-color: rgba(148, 163, 184, 0.55);
  }
  body.theme-dark .search-form input[type="search"]::placeholder {
    color: rgba(148, 163, 184, 0.75);
  }
  body.theme-dark .entry-card,
  body.theme-dark .page-card {
    background: #0f172a;
    border-color: rgba(51, 65, 85, 0.85);
    box-shadow: 0 18px 32px -26px rgba(2, 6, 23, 0.85);
  }
  body.theme-dark .entry-card__title,
  body.theme-dark .page-title {
    color: #f8fafc;
  }
  body.theme-dark .entry-card__path {
    color: #94a3b8;
  }
  body.theme-dark .entry-badge {
    background: rgba(59, 130, 246, 0.18);
    color: #bfdbfe;
  }
  body.theme-dark .entry-badge--file {
    background: rgba(34, 197, 94, 0.18);
    color: #bbf7d0;
  }
  body.theme-dark .favorite-toggle {
    background: rgba(148, 163, 184, 0.2);
    border-color: rgba(148, 163, 184, 0.4);
    color: #cbd5f5;
  }
  body.theme-dark .favorite-toggle:hover {
    color: #facc15;
    border-color: rgba(250, 204, 21, 0.7);
    box-shadow: 0 14px 28px -20px rgba(250, 204, 21, 0.55);
  }
  body.theme-dark .favorite-toggle.is-favorite {
    background: rgba(250, 204, 21, 0.24);
    color: #facc15;
    border-color: rgba(250, 204, 21, 0.85);
  }
  body.theme-dark .entry-button--primary {
    background: #2563eb;
    box-shadow: 0 20px 36px -24px rgba(37, 99, 235, 0.75);
  }
  body.theme-dark .entry-button--ghost {
    background: rgba(37, 99, 235, 0.14);
    color: #bfdbfe;
    border-color: rgba(37, 99, 235, 0.35);
  }
  body.theme-dark .entry-button--ghost:hover {
    background: rgba(37, 99, 235, 0.28);
    border-color: rgba(37, 99, 235, 0.5);
  }
  body.theme-dark .quick-copy {
    color: #bfdbfe;
  }
  body.theme-dark .control-button {
    background: rgba(30, 41, 59, 0.9);
    color: #e2e8f0;
  }
  body.theme-dark .link-button {
    color: #93c5fd;
  }
  body.theme-dark .setting-button {
    background: rgba(37, 99, 235, 0.18);
    border-color: rgba(37, 99, 235, 0.35);
    color: #bfdbfe;
  }
  body.theme-dark .setting-button:hover {
    background: rgba(37, 99, 235, 0.28);
  }
  body.theme-dark .setting-button--active {
    background: #2563eb;
    color: #0f172a;
    border-color: #2563eb;
    box-shadow: 0 14px 26px -20px rgba(37, 99, 235, 0.65);
  }
  body.theme-dark #pagination a {
    background: rgba(148, 163, 184, 0.16);
    color: #e2e8f0;
    border: 1px solid rgba(148, 163, 184, 0.28);
  }
  body.theme-dark #pagination a.bg-blue-500 {
    color: #f8fafc !important;
  }
`;

const enhancedStyles = `
  body {
    background: linear-gradient(180deg, #f8fafc 0%, #f8fafc 45%, #f1f5f9 100%);
    color-scheme: light;
  }
  #main-container {
    max-width: 1200px;
  }
  .hero {
    display: grid;
    gap: clamp(1.25rem, 3vw, 1.5rem);
    padding: clamp(1.5rem, 4vw, 2.25rem);
    border-radius: 20px;
    background: #ffffff;
    color: #0f172a;
    border: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow: 0 18px 36px -28px rgba(15, 23, 42, 0.25);
  }
  .hero__content {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }
  .hero__title {
    font-size: clamp(1.85rem, 4vw, 2.8rem);
    font-weight: 700;
    line-height: 1.1;
    color: #0f172a;
  }
  .hero__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    background: rgba(99, 102, 241, 0.08);
    border-radius: 9999px;
    padding: 0.3rem 0.75rem;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #2563eb;
  }
  .hero__description {
    max-width: 32rem;
    font-size: clamp(0.95rem, 2.5vw, 1.05rem);
    color: #475569;
  }
  .hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .hero__metrics {
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    padding-top: clamp(0.75rem, 2vw, 1rem);
  }
  .hero__metrics-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .metric-chip {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 0.95rem;
    border-radius: 14px;
    background: #f8fafc;
    border: 1px solid rgba(148, 163, 184, 0.25);
    min-width: 160px;
    flex: 1 1 160px;
  }
  .metric-chip__value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1d4ed8;
  }
  .metric-chip__meta {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .metric-chip__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #334155;
  }
  .metric-chip__caption {
    font-size: 0.8rem;
    color: #64748b;
  }
  .page-toolbar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .page-title {
    font-size: clamp(2rem, 4vw, 2.6rem);
    font-weight: 700;
    color: #0f172a;
  }
  .page-subtitle {
    font-size: 0.95rem;
    color: #64748b;
  }
  .page-toolbar__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }
  .page-surface {
    background: #ffffff;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    padding: clamp(1.15rem, 3vw, 1.6rem);
    box-shadow: 0 12px 28px -24px rgba(15, 23, 42, 0.25);
  }
  .control-panel,
  .quick-panel {
    background: #ffffff;
    border-radius: 18px;
    padding: clamp(1.15rem, 3vw, 1.6rem);
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 12px 28px -24px rgba(15, 23, 42, 0.25);
  }
  .control-panel__row {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .control-panel__row--meta {
    align-items: stretch;
  }
  .control-panel__row + .control-panel__row {
    margin-top: 1rem;
  }
  .selector-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .selector-group select {
    min-width: 160px;
    border-radius: 9999px;
    padding: 0.6rem 1.25rem;
    border: 1px solid rgba(148, 163, 184, 0.45);
    background: rgba(255, 255, 255, 0.85);
    font-size: 0.95rem;
    transition: box-shadow 0.2s ease;
  }
  .selector-group select:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.25);
  }
  .quick-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .quick-filters--scrollable {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.35rem;
    -webkit-overflow-scrolling: touch;
  }
  .quick-filters--scrollable::-webkit-scrollbar {
    height: 6px;
  }
  .control-panel__toggles {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .quick-chip {
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: #f8fafc;
    color: #2563eb;
    font-weight: 600;
    padding: 0.4rem 0.9rem;
    font-size: 0.82rem;
    transition: all 0.2s ease;
  }
  .quick-chip:hover {
    background: rgba(37, 99, 235, 0.1);
    transform: translateY(-2px);
  }
  .quick-chip--active {
    background: #2563eb;
    color: #f8fafc;
    border-color: #2563eb;
    box-shadow: 0 10px 20px -14px rgba(37, 99, 235, 0.6);
  }
  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .search-form input[type="search"] {
    flex: 1;
    min-width: 220px;
    border-radius: 9999px;
    padding: 0.75rem 1.25rem;
    border: 1px solid rgba(148, 163, 184, 0.45);
    transition: box-shadow 0.2s ease;
  }
  .search-form input[type="search"]:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.3);
  }
  .entry-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 18px;
    background: #ffffff;
    padding: clamp(1rem, 3.2vw, 1.4rem);
    box-shadow: 0 12px 28px -22px rgba(15, 23, 42, 0.25);
    border: 1px solid rgba(226, 232, 240, 0.7);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .entry-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 32px 60px -28px rgba(79, 70, 229, 0.45);
  }
  .entry-card__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
  }
  .entry-card__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    letter-spacing: -0.01em;
  }
  .entry-card__path {
    margin-top: 0.4rem;
    font-size: 0.75rem;
    color: #6b7280;
    word-break: break-all;
  }
  .entry-card__meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .entry-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border-radius: 999px;
    padding: 0.35rem 0.75rem;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: rgba(129, 140, 248, 0.18);
    color: #3730a3;
    font-weight: 600;
  }
  .entry-badge--file {
    background: rgba(16, 185, 129, 0.15);
    color: #047857;
  }
  .favorite-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: #f8fafc;
    color: #94a3b8;
    transition: all 0.2s ease;
  }
  .favorite-toggle:hover {
    color: #f59e0b;
    border-color: rgba(245, 158, 11, 0.7);
    box-shadow: 0 12px 22px -18px rgba(245, 158, 11, 0.6);
  }
  .favorite-toggle.is-favorite {
    color: #f59e0b;
    border-color: rgba(245, 158, 11, 0.85);
    background: rgba(245, 158, 11, 0.16);
  }
  .entry-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.75rem;
  }
  .entry-button {
    border-radius: 999px;
    padding: 0.55rem 1.1rem;
    font-size: 0.85rem;
    font-weight: 600;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .entry-button:hover {
    transform: translateY(-1px);
  }
  .entry-button--primary {
    background: #2563eb;
    color: #f8fafc;
    box-shadow: 0 16px 30px -20px rgba(37, 99, 235, 0.6);
  }
  .entry-button--primary:hover {
    box-shadow: 0 18px 36px -20px rgba(37, 99, 235, 0.68);
  }
  .entry-button--ghost {
    background: #f8fafc;
    color: #2563eb;
    border-color: rgba(37, 99, 235, 0.35);
  }
  .entry-button--ghost:hover {
    background: rgba(37, 99, 235, 0.08);
    border-color: rgba(37, 99, 235, 0.5);
  }
  .quick-copy {
    color: #0f172a;
  }
  .quick-access {
    display: grid;
    gap: 1.5rem;
  }
  .quick-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }
  .quick-panel__empty {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 0.85rem;
  }
  .quick-chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }
  .quick-chip-button {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 999px;
    padding: 0.5rem 0.9rem;
    background: rgba(15, 23, 42, 0.08);
    color: #0f172a;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(148, 163, 184, 0.25);
    transition: all 0.2s ease;
  }
  .quick-chip-button:hover {
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.35);
  }
  .quick-chip-button__icon {
    font-size: 0.7rem;
    color: rgba(99, 102, 241, 0.75);
  }
  .back-to-top {
    background: #2563eb;
    color: #f8fafc;
  }
  .back-to-top:hover {
    background: #1d4ed8;
    box-shadow: 0 22px 36px -22px rgba(29, 78, 216, 0.55);
  }
  .setting-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: #f1f5f9;
    color: #2563eb;
    font-weight: 600;
    padding: 0.45rem 1rem;
    font-size: 0.82rem;
    transition: all 0.2s ease;
  }
  .setting-button:hover {
    background: rgba(37, 99, 235, 0.08);
  }
  .setting-button--active {
    background: #2563eb;
    color: #f8fafc;
    border-color: #2563eb;
    box-shadow: 0 10px 20px -14px rgba(37, 99, 235, 0.5);
  }
  .link-button {
    font-size: 0.85rem;
    font-weight: 600;
    color: #4338ca;
    background: transparent;
    border: none;
    cursor: pointer;
    text-decoration: underline;
  }
  .catalog-section {
    margin-top: 3rem;
  }
  .catalog-section h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e1b4b;
    margin-bottom: 1.25rem;
  }
  #folders-container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }
  #pagination {
    margin-top: 2rem;
    gap: 0.5rem;
  }
  #pagination a {
    border-radius: 999px;
    font-weight: 600;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  #pagination a:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px -15px rgba(79, 70, 229, 0.55);
  }
  .page-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.1rem;
  }
  @media (max-width: 768px) {
    .hero {
      border-radius: 20px;
      text-align: center;
      gap: 1.1rem;
    }
    .hero__actions {
      justify-content: center;
      width: 100%;
    }
    .hero__metrics {
      border-top: none;
      padding-top: 0;
    }
    .hero__metrics-grid {
      flex-wrap: nowrap;
      overflow-x: auto;
      justify-content: center;
      padding-bottom: 0.35rem;
      -webkit-overflow-scrolling: touch;
    }
    .hero__metrics-grid::-webkit-scrollbar {
      height: 6px;
    }
    .metric-chip {
      flex: 0 0 auto;
    }
    .page-toolbar {
      align-items: center;
      text-align: center;
    }
  }
  @media (max-width: 520px) {
    #main-container {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    .hero__content {
      align-items: center;
    }
    .hero__tag {
      margin: 0 auto;
    }
    .hero__metrics {
      width: 100%;
    }
    .hero__metrics-grid {
      display: grid;
      grid-template-columns: 1fr;
      justify-items: stretch;
      gap: 0.65rem;
      overflow: visible;
    }
    .metric-chip {
      width: 100%;
      justify-content: center;
      text-align: center;
    }
    .metric-chip__meta {
      align-items: center;
    }
    .control-panel__row {
      gap: 0.75rem;
    }
    .control-panel__toggles {
      flex-direction: column;
      gap: 0.45rem;
    }
    .control-panel__toggles .setting-button,
    .control-panel__toggles .entry-button,
    .control-panel__toggles .link-button {
      width: 100%;
    }
    .quick-filters {
      flex-wrap: wrap;
      overflow: visible;
      justify-content: center;
      gap: 0.35rem;
    }
    .quick-chip {
      flex: 0 0 calc(50% - 0.4rem);
      text-align: center;
    }
    .page-toolbar__actions {
      flex-direction: column;
    }
    .page-toolbar__actions .setting-button,
    .page-toolbar__actions .entry-button {
      width: 100%;
    }
    .back-to-top {
      right: 1rem;
      bottom: 1rem;
      width: 2.75rem;
      height: 2.75rem;
    }
  }
  @media (min-width: 1024px) {
    .hero {
      grid-template-columns: 1.1fr 1fr;
    }
    .control-panel__row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .control-panel__row--meta {
      align-items: center;
    }
    .page-toolbar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }
  }
  @media (max-width: 640px) {
    .hero {
      padding: 1.5rem 1.25rem;
    }
    .hero__title {
      font-size: clamp(1.65rem, 7vw, 2.1rem);
    }
    .hero__description {
      margin: 0 auto;
    }
    .control-panel,
    .quick-panel,
    .page-surface {
      padding: 1.2rem;
    }
    .selector-group {
      flex-direction: column;
      width: 100%;
    }
    .selector-group select {
      width: 100%;
    }
    .search-form {
      flex-direction: column;
      align-items: stretch;
    }
    .search-form button {
      width: 100%;
      justify-content: center;
    }
    .control-panel__row {
      align-items: stretch;
    }
    .control-panel__toggles {
      width: 100%;
      justify-content: center;
    }
    .control-panel__toggles .setting-button,
    .control-panel__toggles .entry-button,
    .control-panel__toggles .link-button {
      flex: 1 1 auto;
      text-align: center;
    }
    .control-panel__toggles .link-button {
      padding: 0.5rem 0;
    }
    .quick-filters {
      gap: 0.4rem;
      flex-wrap: nowrap;
      overflow-x: auto;
      justify-content: flex-start;
      padding-bottom: 0.35rem;
    }
    .quick-filters::-webkit-scrollbar {
      height: 6px;
    }
    .page-toolbar {
      align-items: stretch;
      gap: 1rem;
    }
    .page-toolbar__actions {
      justify-content: center;
      width: 100%;
    }
    .page-toolbar__actions .setting-button,
    .page-toolbar__actions .entry-button {
      flex: 1 1 auto;
      text-align: center;
    }
  }
  body.layout-compact .hero {
    padding: clamp(1.25rem, 3vw, 1.8rem);
  }
  body.layout-compact .hero__description {
    max-width: 28rem;
  }
  body.layout-compact .hero__metrics-grid {
    gap: 0.5rem;
  }
  body.layout-compact .metric-chip {
    padding: 0.5rem 0.8rem;
  }
  body.layout-compact .control-panel,
  body.layout-compact .quick-panel,
  body.layout-compact .page-surface {
    padding: 1rem;
  }
  body.layout-compact .entry-card {
    padding: clamp(0.85rem, 2.5vw, 1.1rem);
  }
  body.layout-compact .entry-card__title {
    font-size: 1rem;
  }
  body.layout-compact .entry-card__actions {
    gap: 0.5rem;
    margin-top: 1.1rem;
  }
  body.layout-compact #folders-container {
    gap: 2.2rem;
  }
  body.layout-compact .catalog-section {
    margin-top: 2.2rem;
  }
  body.layout-compact .quick-access {
    gap: 1rem;
  }
  body.layout-compact .quick-chip {
    padding: 0.35rem 0.75rem;
  }
  body.layout-compact .page-toolbar {
    gap: 0.85rem;
  }
`;

module.exports = {
  darkThemeStyles,
  enhancedStyles,
};
