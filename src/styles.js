const CSS = `
      .tp-root {
        height: 100%;
        min-height: 0;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 22px 26px 24px;
        color: var(--dsw-alias-label-primary);
        background: var(--dsw-alias-bg-base);
        font-family: inherit;
      }
      .tp-header {
        flex: 0 0 auto;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }
      .tp-heading { min-width: 0; }
      .tp-title {
        margin: 0;
        font-size: 20px;
        line-height: 1.3;
        font-weight: 650;
        letter-spacing: -0.01em;
      }
      .tp-subtitle {
        margin: 4px 0 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        line-height: 1.55;
      }
      .tp-headerActions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 8px;
        max-width: 58%;
      }
      .tp-engine {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        max-width: 390px;
        padding: 7px 11px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 999px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        line-height: 1.3;
      }
      .tp-engineText {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .tp-engineText strong {
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .tp-engineMeta {
        margin-left: 6px;
        color: var(--dsw-alias-label-secondary);
        font-variant-numeric: tabular-nums;
      }
      .tp-dot {
        width: 7px;
        height: 7px;
        flex: 0 0 auto;
        border-radius: 50%;
        background: var(--dsw-alias-state-idle-primary);
      }
      .tp-dot-ok { background: var(--dsw-alias-state-success-primary); }
      .tp-dot-error { background: var(--dsw-alias-state-error-primary); }
      .tp-dot-pending { background: var(--dsw-alias-state-warn-primary); }
      .tp-alert {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 12px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, transparent);
        border-radius: 10px;
        background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-base));
        color: var(--dsw-alias-state-error-primary);
        font-size: 12px;
        line-height: 1.55;
      }
      .tp-alertText { min-width: 0; }
      .tp-alertHint {
        margin-top: 3px;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-grid {
        flex: 1 1 auto;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.92fr);
        gap: 14px;
      }
      .tp-left,
      .tp-side {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .tp-card {
        box-sizing: border-box;
        min-width: 0;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1);
        overflow: hidden;
      }
      .tp-reader {
        flex: 1 1 auto;
        min-height: 220px;
        display: flex;
        flex-direction: column;
      }
      .tp-cardHead {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 13px 17px 11px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .tp-cardTitle {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.3;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .tp-cardMeta {
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        font-variant-numeric: tabular-nums;
      }
      .tp-article {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 17px 18px 24px;
      }
      .tp-articleTitle {
        margin: 0 0 12px;
        font-size: 18px;
        line-height: 1.35;
        font-weight: 650;
        letter-spacing: -0.01em;
      }
      .tp-sentences {
        margin: 0;
        font-size: 16px;
        line-height: 2;
        letter-spacing: 0.002em;
        overflow-wrap: anywhere;
      }
      .tp-paragraph { margin: 0 0 1.05em; }
      .tp-paragraph:last-child { margin-bottom: 0; }
      .tp-sentence {
        border-radius: 5px;
        transition: background 120ms ease, color 120ms ease;
      }
      .tp-sentenceDone {
        color: var(--dsw-alias-label-secondary);
      }
      .tp-sentenceActive {
        padding: 2px 3px;
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent);
        box-shadow: inset 2px 0 0 var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-label-primary);
      }
      .tp-char { white-space: pre-wrap; }
      .tp-word {
        cursor: pointer;
        border-radius: 2px;
        transition: background 100ms ease;
      }
      .tp-word:hover {
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);
        text-decoration: underline dotted var(--dsw-alias-brand-primary);
        text-underline-offset: 2px;
      }
      .tp-charError {
        color: var(--dsw-alias-state-error-primary);
        background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 17%, transparent);
        border-radius: 2px;
        text-decoration: underline wavy var(--dsw-alias-state-error-primary);
        text-underline-offset: 2px;
      }
      .tp-inputCard {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 9px;
        padding: 14px 17px 15px;
      }
      .tp-inputTop {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 12px;
      }
      .tp-inputTop strong {
        font-weight: 600;
      }
      .tp-diff {
        color: var(--dsw-alias-state-error-primary);
        font-variant-numeric: tabular-nums;
      }
      .tp-diffOk { color: var(--dsw-alias-state-success-primary); }
      .tp-textarea {
        width: 100%;
        min-height: 92px;
        max-height: 150px;
        box-sizing: border-box;
        resize: vertical;
        padding: 10px 12px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 9px;
        outline: none;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 15px;
        line-height: 1.6;
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }
      .tp-textarea:focus {
        border-color: var(--dsw-alias-brand-primary);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);
      }
      .tp-textarea::placeholder { color: var(--dsw-alias-label-secondary); }
      .tp-inputHint {
        min-height: 17px;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        line-height: 1.5;
      }
      .tp-inputHintWarn { color: var(--dsw-alias-state-warn-primary); }
      .tp-progress {
        height: 4px;
        margin-top: 2px;
        border-radius: 999px;
        background: var(--dsw-alias-bg-layer-2);
        overflow: hidden;
      }
      .tp-progressBar {
        height: 100%;
        border-radius: inherit;
        background: var(--dsw-alias-brand-primary);
        transition: width 180ms ease;
      }
      .tp-current {
        flex: 0 1 auto;
        max-height: 44%;
        display: flex;
        flex-direction: column;
      }
      .tp-currentBody {
        min-height: 100px;
        overflow: auto;
        padding: 14px 17px 16px;
      }
      .tp-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 7px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 999px;
        background: rgba(8, 14, 24, 0.58) !important;
        color: rgba(244, 247, 248, 0.68) !important;
        font-size: 10.5px;
        line-height: 1.5;
        white-space: nowrap;
      }
      .tp-current .tp-btnSmall,
      .tp-recordHead .tp-btnSmall {
        background: rgba(8, 14, 24, 0.46) !important;
        border-color: rgba(216, 199, 163, 0.34) !important;
        color: #e6d6b5 !important;
      }
      .tp-current .tp-btnSmall:hover:not(:disabled),
      .tp-recordHead .tp-btnSmall:hover:not(:disabled) {
        background: rgba(216, 199, 163, 0.12) !important;
        border-color: rgba(216, 199, 163, 0.64) !important;
      }
      .tp-enSmall {
        margin: 0 0 10px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.55;
      }
      .tp-zh {
        margin: 0;
        font-size: 16px;
        line-height: 1.8;
        font-weight: 500;
      }
      .tp-providerLine {
        margin-top: 10px;
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px;
        line-height: 1.4;
        font-variant-numeric: tabular-nums;
      }
      .tp-placeholder {
        margin: 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        line-height: 1.7;
      }
      .tp-pending {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        line-height: 1.6;
      }
      .tp-pending::before {
        content: '';
        width: 8px;
        height: 8px;
        border: 2px solid var(--dsw-alias-border-l2);
        border-top-color: var(--dsw-alias-brand-primary);
        border-radius: 50%;
        animation: tp-spin 800ms linear infinite;
      }
      @keyframes tp-spin { to { transform: rotate(360deg); } }
      .tp-records {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .tp-recordList {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 4px 8px 10px;
      }
      .tp-record {
        padding: 11px 9px 12px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .tp-record:last-child { border-bottom: 0; }
      .tp-recordHead {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 5px;
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px;
      }
      .tp-recordIndex {
        min-width: 22px;
        color: var(--dsw-alias-brand-primary);
        font-weight: 650;
        font-variant-numeric: tabular-nums;
      }
      .tp-recordStatus { margin-left: auto; }
      .tp-recordEn {
        margin: 0 0 5px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.55;
      }
      .tp-recordZh {
        margin: 0;
        font-size: 13.5px;
        line-height: 1.7;
      }
      .tp-muted { color: var(--dsw-alias-label-secondary); }
      .tp-recordError {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        color: var(--dsw-alias-state-error-primary);
        font-size: 12px;
        line-height: 1.55;
      }
      .tp-empty {
        padding: 18px 16px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.7;
      }
      .tp-doneBox {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 18px 17px;
      }
      .tp-doneTitle {
        font-size: 15px;
        font-weight: 600;
      }
      .tp-doneBody {
        margin: 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        line-height: 1.65;
      }
      .tp-btn {
        flex: 0 0 auto;
        padding: 5px 9px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 7px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 11.5px;
        line-height: 1.45;
        cursor: pointer;
        transition: border-color 120ms ease, background 120ms ease;
      }
      .tp-btn:hover {
        border-color: var(--dsw-alias-border-l2);
        background: var(--dsw-alias-bg-layer-1);
      }
      .tp-btn:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 2px;
      }
      .tp-btnSmall { padding: 3px 7px; font-size: 10.5px; }
      @media (max-width: 880px) {
        .tp-root { height: auto; min-height: 100%; overflow: auto; padding: 18px 18px 22px; }
        .tp-header { flex-direction: column; }
        .tp-headerActions { max-width: none; justify-content: flex-start; }
        .tp-grid { grid-template-columns: minmax(0, 1fr); flex: 0 0 auto; }
        .tp-reader { min-height: 300px; }
        .tp-current { max-height: none; }
        .tp-records { min-height: 280px; }
      }

      /* ---- favourites ---- */
      .tp-favBtn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 999px;
        border: 1px solid var(--dsw-alias-border-secondary);
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        line-height: 1.5;
        cursor: pointer;
        transition: color .15s ease, border-color .15s ease, background .15s ease;
      }
      .tp-favBtn:hover:not(:disabled) {
        color: var(--dsw-alias-brand-primary);
        border-color: var(--dsw-alias-brand-primary);
      }
      .tp-favBtn:disabled { cursor: default; opacity: .85; }
      .tp-favBtnSaved {
        color: var(--dsw-alias-brand-primary);
        border-color: var(--dsw-alias-brand-primary);
        background: color-mix(in oklab, var(--dsw-alias-brand-primary) 10%, transparent);
      }
      .tp-favStar { font-size: 12px; line-height: 1; }

      .tp-favFloat {
        position: fixed;
        z-index: 60;
        transform: translate(-50%, calc(-100% - 10px));
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        border-radius: 10px;
        border: 1px solid var(--dsw-alias-border-secondary);
        background: var(--dsw-alias-bg-elevated, var(--dsw-alias-bg-base));
        box-shadow: 0 8px 24px rgba(0, 0, 0, .16);
        white-space: nowrap;
      }
      .tp-favPickLabel {
        font-size: 11px;
        color: var(--dsw-alias-label-secondary);
        padding: 0 2px;
      }
      .tp-favCancel {
        border: none;
        background: transparent;
        color: var(--dsw-alias-label-tertiary);
        font-size: 11px;
        cursor: pointer;
        padding: 3px 4px;
      }
      .tp-favToast {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 61;
        max-width: 320px;
        padding: 8px 14px;
        border-radius: 10px;
        font-size: 12px;
        color: #fff;
        background: var(--dsw-alias-brand-primary, #2b6cb0);
        box-shadow: 0 8px 24px rgba(0, 0, 0, .18);
      }
      .tp-favToastError { background: var(--dsw-alias-state-error, #c53030); }

      .tp-favRoot { gap: 12px; }
      .tp-favFilters {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .tp-favChip {
        padding: 4px 12px;
        border-radius: 999px;
        border: 1px solid var(--dsw-alias-border-secondary);
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        cursor: pointer;
      }
      .tp-favChipActive {
        color: var(--dsw-alias-brand-primary);
        border-color: var(--dsw-alias-brand-primary);
        background: color-mix(in oklab, var(--dsw-alias-brand-primary) 10%, transparent);
      }
      .tp-favList {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 2px 2px 8px;
      }
      .tp-favGroup {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 4px;
      }
      .tp-favGroupTitle {
        margin: 4px 2px 0;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: .02em;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-favItem {
        border: 1px solid var(--dsw-alias-border-secondary);
        border-radius: 12px;
        padding: 10px 12px;
        background: var(--dsw-alias-bg-base);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .tp-favItemHead {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .tp-favType {
        font-size: 10.5px;
        padding: 1px 8px;
        border-radius: 999px;
        border: 1px solid var(--dsw-alias-border-secondary);
        color: var(--dsw-alias-label-secondary);
      }
      .tp-favTypeWord { color: #b7791f; border-color: #b7791f55; }
      .tp-favTypeSentence { color: #2b6cb0; border-color: #2b6cb055; }
      .tp-favMeta {
        font-size: 11px;
        color: var(--dsw-alias-label-tertiary);
      }
      .tp-favDel {
        margin-left: auto;
        border: none;
        background: transparent;
        color: var(--dsw-alias-label-tertiary);
        font-size: 11.5px;
        cursor: pointer;
        padding: 2px 4px;
      }
      .tp-favDel:hover { color: var(--dsw-alias-state-error, #c53030); }
      .tp-favText {
        margin: 0;
        font-size: 13.5px;
        line-height: 1.65;
        color: var(--dsw-alias-label-primary);
        white-space: pre-wrap;
        word-break: break-word;
      }
      .tp-favZh {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.65;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-favSource {
        margin: 0;
        font-size: 11px;
        color: var(--dsw-alias-label-tertiary);
      }
      .tp-favState {
        padding: 28px 8px;
        text-align: center;
        font-size: 12.5px;
        color: var(--dsw-alias-label-tertiary);
      }
      .tp-favTypeTabs {
        display: flex;
        gap: 7px;
        padding: 2px 0;
      }
      .tp-favTypeTab {
        padding: 7px 14px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 999px;
        background: rgba(8, 14, 24, 0.46);
        color: rgba(244, 247, 248, 0.62);
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }
      .tp-favTypeTabActive {
        background: rgba(216, 199, 163, 0.16);
        border-color: rgba(216, 199, 163, 0.58);
        color: #e6d6b5;
        font-weight: 650;
      }
      .tp-favTagCloud {
        display: flex;
        flex-direction: column;
        gap: 7px;
        padding: 9px 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 11px;
        background: rgba(8, 14, 24, 0.34);
      }
      .tp-favTagCloudHead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        color: rgba(244, 247, 248, 0.52);
        font-size: 10.5px;
        letter-spacing: .04em;
      }
      .tp-favTagClear {
        border: none;
        background: transparent;
        color: #e6d6b5;
        font-size: 10.5px;
        cursor: pointer;
      }
      .tp-favTagList {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .tp-favTagSubList {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 2px;
        padding-top: 7px;
        border-top: 1px dashed rgba(255, 255, 255, 0.10);
      }
      .tp-favTagChip {
        padding: 3px 9px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(244, 247, 248, 0.66);
        font: inherit;
        font-size: 10.5px;
        cursor: pointer;
      }
      .tp-favTagChip:hover {
        border-color: rgba(216, 199, 163, 0.48);
        color: #f4f7f8;
      }
      .tp-favTagChipActive {
        background: rgba(216, 199, 163, 0.16);
        border-color: rgba(216, 199, 163, 0.62);
        color: #e6d6b5;
      }
      .tp-favItem {
        border-color: rgba(255, 255, 255, 0.13);
        background: rgba(10, 16, 26, 0.50);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
      .tp-favItemHead {
        flex-wrap: wrap;
        row-gap: 6px;
      }
      .tp-favWriting {
        padding: 1px 7px;
        border: 1px solid rgba(216, 199, 163, 0.42);
        border-radius: 999px;
        color: #e6d6b5;
        font-size: 10px;
        line-height: 1.5;
        white-space: nowrap;
      }
      .tp-favItemActions {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-left: auto;
      }
      .tp-favPlay {
        padding: 3px 9px;
        border: 1px solid rgba(216, 199, 163, 0.38);
        border-radius: 999px;
        background: rgba(8, 14, 24, 0.44);
        color: #e6d6b5;
        font: inherit;
        font-size: 10.5px;
        white-space: nowrap;
        cursor: pointer;
      }
      .tp-favPlay:hover {
        background: rgba(216, 199, 163, 0.12);
        border-color: rgba(216, 199, 163, 0.68);
      }
      .tp-favDel { margin-left: 0; }
      .tp-favTextRow {
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
      }
      .tp-favTextRow .tp-favText { flex: 0 1 auto; }
      .tp-favPos {
        color: #e6d6b5;
        font-size: 10.5px;
        font-style: italic;
        white-space: nowrap;
      }
      .tp-favAnalysis {
        margin: 0;
        padding: 7px 9px;
        border-left: 2px solid rgba(216, 199, 163, 0.50);
        background: rgba(216, 199, 163, 0.06);
        color: rgba(244, 247, 248, 0.70);
        font-size: 11.5px;
        line-height: 1.65;
      }
      .tp-favPhrases {
        margin: 1px 0 0;
        border: 1px solid rgba(255, 255, 255, 0.11);
        border-radius: 8px;
        background: rgba(8, 14, 24, 0.30);
      }
      .tp-favPhrases summary {
        padding: 5px 8px;
        color: rgba(244, 247, 248, 0.54);
        font-size: 10.5px;
        cursor: pointer;
      }
      .tp-favPhraseList {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin: 0;
        padding: 0 8px 7px;
        list-style: none;
      }
      .tp-favPhraseList li {
        display: flex;
        gap: 7px;
        align-items: baseline;
        color: rgba(244, 247, 248, 0.58);
        font-size: 11px;
        line-height: 1.55;
      }
      .tp-favPhraseList strong { color: #f4f7f8; font-weight: 550; }
      .tp-favTags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .tp-favTag {
        padding: 1px 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(244, 247, 248, 0.52);
        font-size: 9.5px;
        line-height: 1.5;
      }
      .tp-favNote {
        margin: 1px 0 0;
        padding: 6px 8px;
        border-radius: 7px;
        background: rgba(216, 199, 163, 0.07);
        color: rgba(244, 247, 248, 0.66);
        font-size: 11px;
        line-height: 1.6;
        white-space: pre-wrap;
      }
      .tp-favNoteBtn {
        align-self: flex-start;
        border: none;
        background: transparent;
        color: rgba(244, 247, 248, 0.42);
        font: inherit;
        font-size: 10.5px;
        padding: 0;
        cursor: pointer;
      }
      .tp-favNoteBtn:hover { color: #e6d6b5; }
      .tp-favNoteEditor {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .tp-favNoteInput {
        width: 100%;
        box-sizing: border-box;
        resize: vertical;
        min-height: 64px;
        padding: 7px 9px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        outline: none;
        background: rgba(8, 14, 24, 0.48);
        color: #f4f7f8;
        font: inherit;
        font-size: 11.5px;
        line-height: 1.6;
      }
      .tp-favNoteInput:focus { border-color: rgba(216, 199, 163, 0.60); }
      .tp-favNoteActions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }

      /* ---- quiz drawer ---- */
      .tp-root { position: relative; }
      .tp-cardHead { flex-wrap: wrap; row-gap: 8px; }
      .tp-cardHeadRight {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: wrap;
      }
      .tp-quizBtn { white-space: nowrap; }
      .tp-readingBtn {
        background: rgba(8, 14, 24, 0.46) !important;
        border-color: rgba(216, 199, 163, 0.38) !important;
        color: #e6d6b5 !important;
        white-space: nowrap;
      }
      .tp-readingBtn:hover:not(:disabled) {
        background: rgba(216, 199, 163, 0.12) !important;
        border-color: rgba(216, 199, 163, 0.68) !important;
      }
      .tp-quizLayer {
        position: absolute;
        inset: 0;
        z-index: 70;
        display: flex;
        justify-content: flex-end;
      }
      .tp-quizBackdrop {
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--dsw-alias-bg-base) 58%, transparent);
      }
      .tp-quizDrawer {
        position: relative;
        z-index: 1;
        width: min(480px, 100%);
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        background: var(--dsw-alias-bg-base);
        border-left: 1px solid var(--dsw-alias-border-l2);
        box-shadow: -12px 0 32px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
      }
      .tp-quizHeader {
        flex: 0 0 auto;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        padding: 16px 18px 13px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .tp-quizHeaderText { min-width: 0; }
      .tp-quizTitle {
        margin: 0;
        font-size: 15px;
        line-height: 1.35;
        font-weight: 650;
      }
      .tp-quizSubtitle {
        margin: 4px 0 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 11.5px;
        line-height: 1.5;
      }
      .tp-quizHeaderActions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 0 0 auto;
      }
      .tp-quizBody {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 14px 16px 18px;
      }
      .tp-quizLoading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 56px 20px;
        text-align: center;
      }
      .tp-quizSpinner {
        width: 22px;
        height: 22px;
        border: 2px solid var(--dsw-alias-border-l2);
        border-top-color: var(--dsw-alias-brand-primary);
        border-radius: 50%;
        animation: tp-spin 800ms linear infinite;
      }
      .tp-quizLoadingText {
        font-size: 13px;
        color: var(--dsw-alias-label-primary);
      }
      .tp-quizLoadingHint {
        max-width: 300px;
        font-size: 11.5px;
        line-height: 1.6;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-quizErrorBox {
        padding: 18px 2px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .tp-quizErrorTitle {
        font-size: 14px;
        font-weight: 600;
        color: var(--dsw-alias-state-error-primary);
      }
      .tp-quizErrorText {
        font-size: 12px;
        line-height: 1.65;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-quizErrorHint {
        font-size: 11px;
        line-height: 1.55;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-quizSummary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
        padding: 9px 11px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 10px;
        background: var(--dsw-alias-bg-layer-1);
        font-size: 11.5px;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-quizSummary strong {
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .tp-quizQuestion {
        padding: 14px 13px 15px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 12px;
        background: var(--dsw-alias-bg-layer-1);
        margin-bottom: 12px;
      }
      .tp-quizQuestion:last-child { margin-bottom: 0; }
      .tp-quizQHead {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 8px;
      }
      .tp-quizIndex {
        font-size: 11.5px;
        font-weight: 650;
        color: var(--dsw-alias-brand-primary);
      }
      .tp-quizType {
        padding: 2px 7px;
        border-radius: 999px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-secondary);
        font-size: 10px;
        line-height: 1.5;
      }
      .tp-quizResultOk {
        margin-left: auto;
        color: var(--dsw-alias-state-success-primary);
        font-size: 11px;
        font-weight: 600;
      }
      .tp-quizResultBad {
        margin-left: auto;
        color: var(--dsw-alias-state-error-primary);
        font-size: 11px;
        font-weight: 600;
      }
      .tp-quizStem {
        margin: 0 0 10px;
        font-size: 13.5px;
        line-height: 1.65;
        font-weight: 500;
      }
      .tp-quizOptions {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .tp-quizOption {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 9px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-base);
        cursor: pointer;
        transition: border-color 120ms ease, background 120ms ease;
      }
      .tp-quizOption:hover { border-color: var(--dsw-alias-border-l2); }
      .tp-quizOptionSelected {
        border-color: var(--dsw-alias-brand-primary);
        background: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, var(--dsw-alias-bg-base));
      }
      .tp-quizOptionCorrect {
        border-color: var(--dsw-alias-state-success-primary);
        background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, var(--dsw-alias-bg-base));
      }
      .tp-quizOptionWrong {
        border-color: var(--dsw-alias-state-error-primary);
        background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-base));
      }
      .tp-quizOption input {
        margin-top: 2px;
        flex: 0 0 auto;
        accent-color: var(--dsw-alias-brand-primary);
      }
      .tp-quizOptionLabel {
        flex: 0 0 auto;
        width: 16px;
        font-size: 12px;
        font-weight: 650;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-quizOptionText {
        min-width: 0;
        font-size: 12.5px;
        line-height: 1.6;
      }
      .tp-quizAnswerBox {
        margin-top: 11px;
        padding-top: 10px;
        border-top: 1px dashed var(--dsw-alias-border-l1);
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .tp-quizAnswerRow {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 11.5px;
      }
      .tp-quizAnswerLabel { color: var(--dsw-alias-label-secondary); }
      .tp-quizAnswerValue {
        font-weight: 650;
        color: var(--dsw-alias-state-success-primary);
      }
      .tp-quizYourAnswer { color: var(--dsw-alias-label-secondary); }
      .tp-quizExplanation {
        margin: 0;
        font-size: 12px;
        line-height: 1.7;
        color: var(--dsw-alias-label-primary);
      }
      .tp-quizExplanation strong,
      .tp-quizEvidence strong {
        color: var(--dsw-alias-label-secondary);
        font-weight: 600;
      }
      .tp-quizEvidence {
        margin: 0;
        padding: 8px 10px;
        border-left: 2px solid var(--dsw-alias-brand-primary);
        border-radius: 0 7px 7px 0;
        background: var(--dsw-alias-bg-layer-2);
        font-size: 11.5px;
        line-height: 1.65;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-quizFooter {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        border-top: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-base);
      }
      .tp-quizFooterMeta {
        font-size: 11.5px;
        line-height: 1.5;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-quizFooterMeta strong {
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .tp-quizNeedAll { color: var(--dsw-alias-state-warn-primary); }
      .tp-quizSubmit {
        padding: 6px 14px;
        border-color: transparent;
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
        font-weight: 600;
      }
      .tp-quizSubmit:hover:not(:disabled) {
        background: var(--dsw-alias-brand-primary);
        border-color: transparent;
        opacity: .9;
      }
      .tp-quizSubmit:disabled {
        opacity: .45;
        cursor: not-allowed;
      }
      .tp-quizClose {
        border: none;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 11.5px;
        cursor: pointer;
        padding: 4px 2px;
      }
      .tp-quizClose:hover { color: var(--dsw-alias-label-primary); }
      @media (max-width: 880px) {
        .tp-quizDrawer { width: 100%; }
      }
    `

    const ESSAY_CSS = `
      .tp-essayRoot { gap: 14px; }
      .tp-essayBoard {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 2px;
      }
      .tp-essayBoardIntro {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .tp-essayBoardTitle {
        margin: 0;
        font-size: 20px;
        line-height: 1.35;
        font-weight: 650;
      }
      .tp-essayBoardSubtitle {
        margin: 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        line-height: 1.65;
      }
      .tp-essayBoardSummary {
        margin: 4px 0 0;
        color: var(--dsw-alias-brand-primary);
        font-size: 12px;
        font-weight: 600;
      }
      .tp-essayStatsLoading {
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.6;
      }
      .tp-essayPracticeCategory {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 11px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 9px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.5;
      }
      .tp-essayPracticeCategoryId {
        color: var(--dsw-alias-brand-primary);
        font-size: 10px;
        font-weight: 650;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .tp-essayCategoryGrid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }
      .tp-essayCategoryCard {
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 235px;
        padding: 18px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1);
        overflow: hidden;
      }
      .tp-essayCategoryCardRecommended {
        border-color: var(--dsw-alias-brand-primary);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--dsw-alias-brand-primary) 36%, transparent);
      }
      .tp-essayCategoryTop {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 22px;
      }
      .tp-essayCategoryCode {
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .tp-essayCategoryBadge {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 999px;
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
        font-size: 10.5px;
        font-weight: 650;
        white-space: nowrap;
      }
      .tp-essayCategoryTitle {
        margin: 8px 0 0;
        font-size: 18px;
        line-height: 1.35;
        font-weight: 650;
      }
      .tp-essayCategoryEn {
        margin: 2px 0 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        line-height: 1.5;
      }
      .tp-essayCategoryDesc {
        margin: 8px 0 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.6;
      }
      .tp-essayCategoryStats {
        display: flex;
        gap: 28px;
        margin-top: 14px;
      }
      .tp-essayCategoryStatLabel {
        display: block;
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px;
        line-height: 1.4;
      }
      .tp-essayCategoryStatValue {
        display: block;
        margin-top: 2px;
        font-size: 16px;
        line-height: 1.35;
        font-weight: 650;
      }
      .tp-essayCategoryProgress {
        height: 6px;
        margin-top: 12px;
        overflow: hidden;
        border-radius: 999px;
        background: color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
      }
      .tp-essayCategoryProgress > span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--dsw-alias-brand-primary);
      }
      .tp-essayCategoryStart {
        align-self: flex-start;
        margin-top: auto;
        padding-top: 7px;
        padding-bottom: 7px;
      }
      .tp-essayBackButton {
        border-color: var(--dsw-alias-border-l1);
        background: transparent;
        color: var(--dsw-alias-label-secondary);
      }
      .tp-essayBackButton:hover {
        color: var(--dsw-alias-label-primary);
        border-color: var(--dsw-alias-border-l2);
        background: transparent;
      }
      .tp-essayArchiveError {
        margin: 12px 0 0;
        color: var(--dsw-alias-state-error-primary);
        font-size: 11.5px;
        line-height: 1.6;
      }
      .tp-essayGrid {
        flex: 1 1 auto;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
        gap: 14px;
      }
      .tp-essayCol {
        min-width: 0;
        min-height: 0;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding-right: 2px;
      }
      .tp-essayCol > .tp-card { flex: 0 0 auto; }
      .tp-essayEmpty {
        flex: 1 1 auto;
        min-height: 320px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 32px;
        text-align: center;
        border: 1px dashed var(--dsw-alias-border-l2);
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1);
      }
      .tp-essayEmptyIcon {
        font-size: 28px;
        line-height: 1;
        color: var(--dsw-alias-brand-primary);
      }
      .tp-essayEmptyTitle {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      .tp-essayEmptyBody {
        max-width: 460px;
        margin: 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        line-height: 1.7;
      }
      .tp-essayTopicBody { padding: 14px 17px 17px; }
      .tp-essayTopicMeta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }
      .tp-essayPrompt {
        margin: 0;
        font-size: 14px;
        line-height: 1.8;
        white-space: pre-wrap;
      }
      .tp-essayMaterialBody { padding: 12px 14px 14px; }
      .tp-essayVocabGrid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }
      .tp-essayVocab {
        min-width: 0;
        padding: 7px 8px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 9px;
        background: rgba(8, 14, 24, 0.52);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
      .tp-essayWord {
        display: block;
        color: #f4f7f8;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }
      .tp-essayMeaning {
        display: block;
        margin-top: 2px;
        color: rgba(244, 247, 248, 0.58);
        font-size: 11px;
        line-height: 1.5;
      }
      .tp-essayExpressionList {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .tp-essayExpression {
        padding: 8px 9px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 9px;
        background: rgba(8, 14, 24, 0.52);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
      .tp-essayExpressionHead {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
      }
      .tp-essayExpressionText {
        color: #f4f7f8;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.55;
        overflow-wrap: anywhere;
      }
      .tp-essayExpressionMeaning {
        margin: 4px 0 0;
        color: rgba(244, 247, 248, 0.58);
        font-size: 11px;
        line-height: 1.55;
      }
      .tp-essayPosition {
        flex: 0 0 auto;
        padding: 1px 6px;
        border: 1px solid rgba(216, 199, 163, 0.32);
        border-radius: 999px;
        background: rgba(216, 199, 163, 0.10);
        color: #e6d6b5;
        font-size: 9.5px;
        line-height: 1.6;
      }
      .tp-essayBackgroundList {
        margin: 0;
        padding: 0 0 0 18px;
        color: var(--dsw-alias-label-primary);
        font-size: 12px;
        line-height: 1.75;
      }
      .tp-essayBackgroundList li { margin: 0 0 6px; }
      .tp-essayBackgroundList li:last-child { margin-bottom: 0; }
      .tp-essayWriteBody { padding: 12px 14px 14px; }
      .tp-essayTextarea {
        width: 100%;
        min-height: 250px;
        max-height: 420px;
        box-sizing: border-box;
        resize: vertical;
        padding: 11px 12px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 9px;
        outline: none;
        background: var(--dsw-alias-bg-base);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 13px;
        line-height: 1.7;
      }
      .tp-essayTextarea:focus {
        border-color: var(--dsw-alias-brand-primary);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);
      }
      .tp-essayTextarea::placeholder { color: var(--dsw-alias-label-secondary); }
      .tp-essayWriteFooter {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 9px;
        flex-wrap: wrap;
      }
      .tp-essayWordCount {
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
        line-height: 1.5;
        font-variant-numeric: tabular-nums;
      }
      .tp-essayWordCount strong {
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .tp-essayWriteFooter .tp-essaySampleBtn {
        background: rgba(8, 14, 24, 0.46) !important;
        border-color: rgba(216, 199, 163, 0.42) !important;
        color: #e6d6b5 !important;
      }
      .tp-essayWriteFooter .tp-essaySampleBtn:hover:not(:disabled) {
        background: rgba(216, 199, 163, 0.12) !important;
        border-color: rgba(216, 199, 163, 0.70) !important;
      }
      .tp-essayHint {
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px;
        line-height: 1.5;
      }
      .tp-essayScoreBody { padding: 14px 15px 18px; }
      .tp-essayScoreHero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 13px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 12px;
        background: rgba(8, 14, 24, 0.52);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
      .tp-essayTotalLabel {
        color: var(--dsw-alias-label-secondary);
        font-size: 11px;
      }
      .tp-essayTotal {
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin-top: 2px;
      }
      .tp-essayTotalNumber {
        font-size: 32px;
        line-height: 1;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: #e6d6b5;
      }
      .tp-essayTotalMax {
        color: var(--dsw-alias-label-secondary);
        font-size: 13px;
      }
      .tp-essayBand { text-align: right; }
      .tp-essayBandLabel {
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px;
      }
      .tp-essayBandValue {
        margin-top: 4px;
        font-size: 12px;
        font-weight: 600;
      }
      .tp-essayDimensionGrid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-top: 10px;
      }
      .tp-essayDimension {
        padding: 9px 10px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 9px;
        background: rgba(8, 14, 24, 0.48);
      }
      .tp-essayDimensionLabel {
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px;
      }
      .tp-essayDimensionScore {
        margin-top: 3px;
        font-size: 18px;
        font-weight: 650;
        color: #f4f7f8;
      }
      .tp-essayDimensionMax {
        color: var(--dsw-alias-label-secondary);
        font-size: 10px;
        font-weight: 400;
      }
      .tp-essaySectionTitle {
        margin: 16px 0 8px;
        color: #f4f7f8;
        font-size: 12px;
        font-weight: 650;
      }
      .tp-essayFeedbackList {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .tp-essayFeedback {
        padding: 10px 11px;
        border: 1px solid rgba(255, 255, 255, 0.13);
        border-radius: 10px;
        background: rgba(8, 14, 24, 0.48);
      }
      .tp-essayFeedbackHead {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 5px;
      }
      .tp-essayIssue {
        padding: 1px 7px;
        border-radius: 999px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-secondary);
        font-size: 9.5px;
        line-height: 1.6;
      }
      .tp-essayExcerpt {
        margin: 0 0 6px;
        padding: 6px 8px;
        border-left: 2px solid rgba(216, 199, 163, 0.58);
        border-radius: 0 6px 6px 0;
        background: rgba(8, 14, 24, 0.40);
        color: rgba(244, 247, 248, 0.62);
        font-size: 11.5px;
        line-height: 1.6;
        white-space: pre-wrap;
      }
      .tp-essayFeedbackLine {
        margin: 0 0 4px;
        font-size: 11.5px;
        line-height: 1.65;
      }
      .tp-essayFeedbackLine:last-child { margin-bottom: 0; }
      .tp-essayFeedbackLine strong {
        color: var(--dsw-alias-label-secondary);
        font-weight: 600;
      }
      .tp-essayImproved {
        margin: 0;
        padding: 10px 12px;
        border: 1px solid rgba(255, 255, 255, 0.13);
        border-radius: 10px;
        background: rgba(8, 14, 24, 0.46);
        font-size: 12px;
        line-height: 1.7;
        white-space: pre-wrap;
      }
      .tp-essayScroll {
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-gutter: stable;
        padding-right: 4px;
      }
      .tp-essayVocabScroll { max-height: 190px; }
      .tp-essayExpressionScroll { max-height: 210px; }
      .tp-essayBackgroundScroll { max-height: 300px; }
      .tp-essayScroll::-webkit-scrollbar { width: 8px; }
      .tp-essayScroll::-webkit-scrollbar-track { background: transparent; }
      .tp-essayScroll::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.22);
        border-radius: 999px;
      }
      .tp-essayScroll::-webkit-scrollbar-thumb:hover {
        background: rgba(216, 199, 163, 0.42);
      }
      .tp-essayDrawingCard { flex: 0 0 auto; }
      .tp-essayDrawingBody { padding: 10px 12px 12px; }
      .tp-essayDrawingSvg {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 9px;
        background: #ffffff;
        overflow: auto;
      }
      .tp-essayDrawingSvg svg {
        display: block;
        width: 100%;
        height: auto;
        max-height: 280px;
      }
      .tp-essayParagraphList {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .tp-essayParagraph {
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.13);
        border-left: 3px solid rgba(216, 199, 163, 0.42);
        border-radius: 12px;
        background: rgba(8, 14, 24, 0.48);
      }
      .tp-essayParagraphHead { margin-bottom: 6px; }
      .tp-essayParagraphIndex {
        color: var(--dsw-alias-brand-primary);
        font-size: 12px;
        font-weight: 650;
      }
      .tp-essayParagraphOriginalLabel {
        margin: 4px 0 4px;
        color: var(--dsw-alias-label-secondary);
        font-size: 10.5px;
      }
      .tp-essayRewriteBlock {
        margin-top: 9px;
        padding: 10px 11px;
        border: 1px solid rgba(216, 199, 163, 0.28);
        border-radius: 9px;
        background: rgba(216, 199, 163, 0.08);
      }
      .tp-essayRewriteLabel {
        margin-bottom: 5px;
        color: var(--dsw-alias-brand-primary);
        font-size: 10.5px;
        font-weight: 600;
      }
      .tp-essayRewriteText {
        margin: 0;
        font-size: 12px;
        line-height: 1.7;
        white-space: pre-wrap;
      }
      .tp-essayProvider {
        margin-top: 10px;
        color: var(--dsw-alias-label-secondary);
        font-size: 10px;
        line-height: 1.45;
        font-variant-numeric: tabular-nums;
      }
      .tp-essayScorePlaceholder {
        padding: 22px 16px;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 1.7;
      }
      @media (max-width: 980px) {
        .tp-essayGrid {
          grid-template-columns: minmax(0, 1fr);
          flex: 0 0 auto;
        }
        .tp-essayCol { overflow: visible; }
      }
      @media (max-width: 760px) {
        .tp-essayCategoryGrid { grid-template-columns: minmax(0, 1fr); }
        .tp-essayCategoryCard { min-height: 210px; }
      }
      @media (max-width: 620px) {
        .tp-essayVocabGrid { grid-template-columns: 1fr; }
        .tp-essayDimensionGrid { grid-template-columns: 1fr; }
        .tp-essayScoreHero {
          flex-direction: column;
          align-items: flex-start;
        }
        .tp-essayBand { text-align: left; }
      }
    `

const SHELL_CSS = `
      .tp-shell {
        position: relative;
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        background-color: #0a1220;
        background-image:
          radial-gradient(120% 80% at 10% 0%, rgba(95, 145, 220, 0.18), transparent 55%),
          linear-gradient(180deg, rgba(4, 8, 16, 0.28), rgba(4, 8, 16, 0.46)),
          var(--tp-wallpaper, url("/dsh-liquid-glass/assets/liquid-glass-deepwater.b209a409aea86fd6.jpg"));
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
        color: var(--dsw-alias-label-primary);
      }
      .tp-shellHeader {
        flex: 0 0 auto;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 18px 26px 0;
      }
      .tp-shellHeading { min-width: 0; }
      .tp-shellTitle {
        margin: 0;
        font-size: 20px;
        line-height: 1.3;
        font-weight: 650;
        letter-spacing: -0.01em;
      }
      .tp-shellSubtitle {
        margin: 4px 0 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12.5px;
        line-height: 1.55;
      }
      .tp-shellActions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .tp-backgroundBtn {
        height: 34px;
        padding: 0 12px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 9px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
      }
      .tp-backgroundBtn:hover {
        border-color: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-brand-primary);
      }
      .tp-backgroundBtn:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 2px;
      }
      .tp-starBtn {
        width: 34px;
        height: 34px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 9px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-brand-primary);
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
      }
      .tp-starBtn:hover {
        border-color: var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-bg-layer-2);
      }
      .tp-starBtn:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 2px;
      }
      .tp-tabs {
        flex: 0 0 auto;
        display: flex;
        gap: 4px;
        padding: 14px 26px 0;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
        overflow-x: auto;
      }
      .tp-tab {
        border: 0;
        border-bottom: 2px solid transparent;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        padding: 9px 12px 10px;
        font: inherit;
        font-size: 13px;
        line-height: 1.4;
        cursor: pointer;
        white-space: nowrap;
      }
      .tp-tab:hover { color: var(--dsw-alias-label-primary); }
      .tp-tabActive {
        color: var(--dsw-alias-label-primary);
        border-bottom-color: var(--dsw-alias-brand-primary);
        font-weight: 600;
      }
      .tp-tab:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: -2px;
      }
      .tp-shellBody {
        flex: 1 1 auto;
        min-height: 0;
      }
      .tp-tabPanel {
        height: 100%;
        min-height: 0;
      }
      .tp-tabPanel[hidden] { display: none !important; }
      .tp-headerEmbedded { justify-content: flex-end; }
      .tp-headerEmbedded .tp-headerActions { max-width: none; }
      .tp-embeddedRoot { padding-top: 8px; }
      .tp-favDrawerLayer {
        position: absolute;
        inset: 0;
        z-index: 90;
        display: flex;
        justify-content: flex-end;
      }
      .tp-favDrawerBackdrop {
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);
      }
      .tp-favDrawerPanel {
        position: relative;
        z-index: 1;
        width: min(440px, 100%);
        height: 100%;
        overflow: hidden;
        background: var(--dsw-alias-bg-base);
        border-left: 1px solid var(--dsw-alias-border-l2);
        box-shadow: -12px 0 32px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
      }
      .tp-favDrawerPanel .tp-root {
        height: 100%;
        padding: 18px 18px 20px;
      }
      .tp-favClose {
        width: 24px;
        height: 24px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 7px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
      }
      .tp-favClose:hover {
        color: var(--dsw-alias-label-primary);
        border-color: var(--dsw-alias-border-l2);
      }
      @media (max-width: 700px) {
        .tp-shellHeader { padding: 14px 16px 0; }
        .tp-tabs { padding: 10px 16px 0; }
      }

      /* Phase 2: status blocks use a lighter-touch glass tier so they do not
         become white slabs and still read as different from main content cards. */
      .tp-engine {
        background: rgba(8, 14, 22, 0.58) !important;
        border: 1px solid rgba(255, 255, 255, 0.16) !important;
        border-radius: 999px !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        color: rgba(244, 247, 248, 0.68) !important;
        -webkit-backdrop-filter: blur(10px) saturate(135%);
        backdrop-filter: blur(10px) saturate(135%);
      }
      .tp-engineText strong { color: #f4f7f8 !important; }
      .tp-engineMeta { color: rgba(244, 247, 248, 0.52) !important; }

      .tp-alert {
        background:
          linear-gradient(90deg, rgba(255, 112, 112, 0.14), rgba(10, 15, 22, 0.70)) !important;
        border: 1px solid rgba(255, 120, 120, 0.34) !important;
        border-left: 3px solid #ff8b8b !important;
        border-radius: 12px !important;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          0 14px 36px rgba(0, 0, 0, 0.24) !important;
        color: #ffd8d8 !important;
        -webkit-backdrop-filter: blur(10px) saturate(130%);
        backdrop-filter: blur(10px) saturate(130%);
      }
      .tp-alertHint { color: rgba(255, 226, 226, 0.58) !important; }

      .tp-essayEmpty {
        background: rgba(10, 16, 26, 0.48) !important;
        border: 1px solid rgba(255, 255, 255, 0.13) !important;
        border-radius: 20px !important;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.12),
          0 22px 60px rgba(0, 0, 0, 0.24);
        -webkit-backdrop-filter: blur(16px) saturate(140%);
        backdrop-filter: blur(16px) saturate(140%);
      }
      .tp-essayEmpty.tp-essayLoading {
        flex: 0 0 auto;
        width: min(680px, 100%);
        min-height: 240px;
        margin: 7vh auto 0;
        padding: 32px;
        border-style: solid;
        background:
          linear-gradient(145deg, rgba(25, 40, 58, 0.54), rgba(8, 15, 26, 0.44)) !important;
      }
      .tp-essayEmpty .tp-quizLoadingText { color: #f4f7f8; }
      .tp-essayEmpty .tp-quizLoadingHint { color: rgba(244, 247, 248, 0.62); }

      .tp-essayPracticeCategory {
        --tp-category-accent: #8ec5ff;
        background:
          linear-gradient(
            90deg,
            color-mix(in srgb, var(--tp-category-accent) 16%, transparent),
            rgba(8, 14, 22, 0.54)
          ) !important;
        border: 1px solid color-mix(in srgb, var(--tp-category-accent) 34%, transparent) !important;
        border-left: 3px solid var(--tp-category-accent) !important;
        border-radius: 12px !important;
        color: rgba(244, 247, 248, 0.72) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10);
        -webkit-backdrop-filter: blur(9px) saturate(130%);
        backdrop-filter: blur(9px) saturate(130%);
      }
      .tp-essayPracticeCategoryId { color: var(--tp-category-accent) !important; }
      .tp-essayPracticeCategory[data-category='society'] { --tp-category-accent: #8ec5ff; }
      .tp-essayPracticeCategory[data-category='philosophy'] { --tp-category-accent: #c4b5fd; }
      .tp-essayPracticeCategory[data-category='technology'] { --tp-category-accent: #6ee7d8; }
      .tp-essayPracticeCategory[data-category='culture'] { --tp-category-accent: #e6c78a; }
    `

module.exports = { CSS, ESSAY_CSS, SHELL_CSS }
