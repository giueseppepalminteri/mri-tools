class MriHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const root = this.getAttribute('root') || '../';
        const pageTitle = document.title;
        const currentPath = window.location.pathname;

        const headerEl = this;

        const injectSettings = () => {
            const settingsContent = document.getElementById('settings-content');

            if (settingsContent) {
                const mirrorPatientCheck = document.getElementById('m-p-check');
                const mirrorRow = mirrorPatientCheck ? mirrorPatientCheck.closest('.control-row') : null;

                const autoHideRow = document.createElement('div');
                autoHideRow.className = 'control-row';
                autoHideRow.innerHTML = '<input type="checkbox" id="auto-hide-check"><label for="auto-hide-check">⇱ Auto Hide Bars</label>';
                if (mirrorRow) {
                    mirrorRow.parentNode.insertBefore(autoHideRow, mirrorRow);
                } else {
                    settingsContent.appendChild(autoHideRow);
                }

                const fullScreenRow = document.createElement('div');
                fullScreenRow.className = 'control-row';
                fullScreenRow.innerHTML = '<input type="checkbox" id="fullscreen-check"><label for="fullscreen-check">⛶ Full Screen</label>';
                autoHideRow.after(fullScreenRow);

                const allDivs = settingsContent.querySelectorAll('div');
                let creditsDiv = null;
                allDivs.forEach(d => {
                    if (d.textContent.includes('Tools created by')) creditsDiv = d;
                });

                const disclaimerLink = document.createElement('div');
                disclaimerLink.style.cssText = 'text-align: center; margin: 4px 0;';
                disclaimerLink.innerHTML = '<a href="#" id="settings-disclaimer-link" style="color: #fb7185; font-size: 0.65rem; text-decoration: underline; cursor: pointer; font-weight: 500;">⚠ Medical Disclaimer</a>';

                if (creditsDiv) {
                    const disclaimerHr = document.createElement('hr');
                    disclaimerHr.style.cssText = 'border:0; border-top:1px solid #333; margin: 6px 0;';
                    creditsDiv.parentNode.insertBefore(disclaimerHr, creditsDiv);
                    creditsDiv.parentNode.insertBefore(disclaimerLink, creditsDiv);
                } else {
                    settingsContent.appendChild(disclaimerLink);
                }

                document.getElementById('settings-disclaimer-link').addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof window.showMriDisclaimer === 'function') {
                        window.showMriDisclaimer(true);
                    }
                });
            }

            const fsCheck = document.getElementById('fullscreen-check');
            
            if (fsCheck) {
                fsCheck.checked = !!document.fullscreenElement;
                
                fsCheck.addEventListener('change', () => {
                    if (fsCheck.checked) {
                        document.documentElement.requestFullscreen().catch(() => {
                            fsCheck.checked = false;
                        });
                    } else {
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        }
                    }
                });
            }

            document.addEventListener('fullscreenchange', () => {
                const isFs = !!document.fullscreenElement;
                if (fsCheck) {
                    fsCheck.checked = isFs;
                }
            });

            const autoHideCheck = document.getElementById('auto-hide-check');
            let autoHideActive = localStorage.getItem('mri_auto_hide_bars') === 'true';
            if (autoHideCheck) {
                autoHideCheck.checked = autoHideActive;
            }

            if (!document.getElementById('mri-pinned-bars-style')) {
                const style = document.createElement('style');
                style.id = 'mri-pinned-bars-style';
                style.innerHTML = `
                    body.bars-pinned {
                        padding-top: 60px !important;
                        padding-bottom: 75px !important;
                        box-sizing: border-box !important;
                    }
                `;
                document.head.appendChild(style);
            }

            window.mriHeaderMirror = false;
            const getTransform = (y) => `translateY(${y}) ${window.mriHeaderMirror ? 'scaleX(-1)' : ''}`;
            
            window.mri_updateHeaderTransform = () => {
                const currentY = autoHideActive && (headerEl.style.opacity === '0') ? '-100%' : '0';
                headerEl.style.transform = getTransform(currentY);
            };

            const applyAutoHide = () => {
                if (autoHideActive) {
                    headerEl.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease';
                    headerEl.style.transform = getTransform('-100%');
                    headerEl.style.opacity = '0';

                    const bottomToolbar = document.getElementById('bottom-toolbar');
                    if (bottomToolbar) {
                        bottomToolbar.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease';
                        bottomToolbar.style.transform = 'translateY(110%)';
                        bottomToolbar.style.opacity = '0';
                        bottomToolbar.style.pointerEvents = 'none';
                    }
                    document.body.classList.remove('bars-pinned');
                } else {
                    headerEl.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease';
                    headerEl.style.transform = getTransform('0');
                    headerEl.style.opacity = '1';

                    const bottomToolbar = document.getElementById('bottom-toolbar');
                    if (bottomToolbar) {
                        bottomToolbar.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease';
                        bottomToolbar.style.transform = 'translateY(0)';
                        bottomToolbar.style.opacity = '1';
                        bottomToolbar.style.pointerEvents = 'auto';
                    }
                    document.body.classList.remove('toolbars-hidden');
                    document.body.classList.add('bars-pinned');
                }
            };

            const showHeader = () => {
                if (!autoHideActive) return;
                headerEl.style.transform = getTransform('0');
                headerEl.style.opacity = '1';
            };
            const hideHeader = () => {
                if (!autoHideActive) return;
                headerEl.style.transform = getTransform('-100%');
                headerEl.style.opacity = '0';
                
                // Collapse panels
                const settingsPanel = document.getElementById('settings-panel');
                if (settingsPanel && !settingsPanel.classList.contains('collapsed')) {
                    settingsPanel.classList.add('collapsed');
                }
                const navPanel = headerEl.shadowRoot.getElementById('mri-nav-panel');
                if (navPanel) {
                    navPanel.classList.remove('visible');
                }
                const notesPanel = headerEl.shadowRoot.getElementById('mri-notes-panel');
                if (notesPanel) {
                    notesPanel.classList.remove('visible');
                }
            };
            const showToolbar = () => {
                if (!autoHideActive) return;
                const bt = document.getElementById('bottom-toolbar');
                if (bt) { bt.style.transform = 'translateY(0)'; bt.style.opacity = '1'; }
            };
            const hideToolbar = () => {
                if (!autoHideActive) return;
                const bt = document.getElementById('bottom-toolbar');
                if (bt) { bt.style.transform = 'translateY(100%)'; bt.style.opacity = '0'; }
            };

            let hideTimeout;
            const scheduleHide = () => {
                if (!autoHideActive) return;
                if (hideTimeout) clearTimeout(hideTimeout);
                hideTimeout = setTimeout(() => {
                    hideHeader();
                    hideToolbar();
                }, 300);
            };

            const cancelHide = () => {
                if (!autoHideActive) return;
                if (hideTimeout) clearTimeout(hideTimeout);
                showHeader();
                showToolbar();
            };

            document.addEventListener('mousemove', (e) => {
                if (!autoHideActive) return;
                
                const path = e.composedPath();
                const isOverHeader = path.some(el => el === headerEl || (el.classList && (el.classList.contains('mri-nav-panel') || el.id === 'settings-panel')));
                
                const bt = document.getElementById('bottom-toolbar');
                const isOverBottomBar = bt && path.some(el => el === bt);

                const isOverTopEdge = e.clientY <= 72;
                const isOverBottomEdge = window.innerHeight - e.clientY <= 72;

                if (isOverHeader || isOverBottomBar || isOverTopEdge || isOverBottomEdge) {
                    cancelHide();
                } else {
                    scheduleHide();
                }
            });

            document.addEventListener('mouseleave', () => {
                scheduleHide();
            });

            if (autoHideCheck) {
                autoHideCheck.addEventListener('change', () => {
                    autoHideActive = autoHideCheck.checked;
                    localStorage.setItem('mri_auto_hide_bars', autoHideActive);
                    
                    if (isInIframe) {
                        window.parent.postMessage({ type: 'SET_AUTO_HIDE', active: autoHideActive }, '*');
                    }
                    
                    applyAutoHide();
                });
            }

            applyAutoHide();
            
            // Allow triggering applyAutoHide from message events without needing autoHideCheck
            window.mri_applyAutoHideGlobal = (active) => {
                autoHideActive = active;
                applyAutoHide();
            };

            window.mri_applyHeaderVisibility = (visible) => {
                if (visible) showHeader();
                else hideHeader();
            };
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectSettings);
        } else {
            injectSettings();
        }



        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 60px;
                    background-color: rgba(0, 0, 0, 0.9);
                    border-bottom: 1px solid #333;
                    z-index: 9999;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 20px;
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, sans-serif;
                }
                .mri-logo {
                    color: #fff;
                    font-size: 1.5rem;
                    font-weight: bold;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .mri-logo:hover {
                    color: #94d2bd;
                }
                .mri-settings-btn {
                    background: none;
                    border: none;
                    color: #94d2bd;
                    font-size: 28px;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                }
                .mri-settings-btn:hover {
                    color: #fff;
                    transform: scale(1.1);
                }
                #mri-page-title {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%) translateY(-4px);
                    color: #fff;
                    font-size: 1.2rem;
                    font-weight: bold;
                    white-space: nowrap;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                #mri-status-text {
                    color: #94d2bd;
                    font-size: 0.9rem;
                    font-weight: normal;
                    opacity: 0.8;
                }
                #mri-info-toggle {
                    background: #94d2bd;
                    color: #001219;
                    border: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    font-size: 14px;
                    font-weight: 900;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: auto;
                    transition: all 0.2s ease;
                    font-family: 'serif';
                    font-style: italic;
                }
                #mri-info-toggle:hover {
                    background: #fff;
                    transform: scale(1.1);
                }
                #mri-info-panel {
                    position: fixed;
                    top: 70px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 500px;
                    background: rgba(0, 18, 25, 0.95);
                    border: 1px solid #94d2bd;
                    border-radius: 12px;
                    padding: 20px;
                    color: #fff;
                    z-index: 10000;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    display: none;
                    backdrop-filter: blur(10px);
                }
                #mri-info-panel.visible {
                    display: block;
                    animation: fadeInDown 0.3s ease-out;
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                .info-close {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    color: #94d2bd;
                    cursor: pointer;
                    font-size: 20px;
                }
                .mri-notes-btn {
                    background: none;
                    border: none;
                    color: #94d2bd;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    font-weight: bold;
                    transition: all 0.2s ease;
                    padding: 5px 10px;
                    border-radius: 6px;
                }
                .mri-notes-btn:hover {
                    background: rgba(148, 210, 189, 0.1);
                    color: #fff;
                }
                #mri-nav-panel {
                    position: fixed;
                    top: 60px;
                    left: 0;
                    width: 280px;
                    height: calc(100vh - 60px);
                    background: rgba(0, 18, 25, 0.98);
                    border-right: 1px solid rgba(148, 210, 189, 0.3);
                    padding: 30px 20px;
                    color: #fff;
                    z-index: 10003;
                    box-shadow: 10px 0 40px rgba(0,0,0,0.8);
                    display: none;
                    backdrop-filter: blur(15px);
                    flex-direction: column;
                    gap: 15px;
                }
                #mri-nav-panel.visible {
                    display: flex;
                    animation: fadeInLeft 0.3s ease-out;
                }
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 15px;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    border: 1px solid transparent;
                }
                .nav-item:hover {
                    background: rgba(148, 210, 189, 0.1);
                    color: #94d2bd;
                    border-color: rgba(148, 210, 189, 0.2);
                    transform: translateX(5px);
                }
                .nav-item.active {
                    background: rgba(148, 210, 189, 0.15);
                    color: #94d2bd;
                    border-color: rgba(148, 210, 189, 0.5);
                }
                .mri-icon-btn {
                    height: 40px;
                    cursor: pointer;
                    transition: transform 0.2s ease, filter 0.2s ease;
                    filter: drop-shadow(0 0 5px rgba(148, 210, 189, 0.2));
                }
                .mri-icon-btn:hover {
                    transform: scale(1.1);
                    filter: drop-shadow(0 0 10px rgba(148, 210, 189, 0.5));
                }
                .mri-logo-container {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                #mri-nav-panel h3 {
                    color: #94d2bd;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 10px;
                    padding-left: 15px;
                    opacity: 0.7;
                }
                #mri-notes-panel {
                    position: fixed;
                    top: 70px;
                    right: 20px;
                    width: 320px;
                    background: rgba(0, 18, 25, 0.98);
                    border: 1px solid #94d2bd;
                    border-radius: 12px;
                    padding: 20px;
                    color: #fff;
                    z-index: 10001;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                    display: none;
                    backdrop-filter: blur(15px);
                }
                #mri-notes-panel.visible {
                    display: block;
                    animation: fadeInRight 0.3s ease-out;
                }
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .notes-section {
                    margin-bottom: 15px;
                }
                .notes-label {
                    font-size: 0.75rem;
                    color: #94d2bd;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                    display: block;
                    font-weight: bold;
                }
                .notes-area {
                    width: 100%;
                    height: 100px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid #333;
                    border-radius: 6px;
                    color: #fff;
                    padding: 10px;
                    font-size: 0.9rem;
                    resize: none;
                    font-family: inherit;
                    box-sizing: border-box;
                    display: block;
                }
                .notes-area:focus {
                    outline: none;
                    border-color: #94d2bd;
                    background: rgba(255,255,255,0.08);
                }
                .notes-warning {
                    font-size: 13px;
                    color: orange;
                    margin-bottom: 15px;
                    line-height: 1.3;
                    display: flex;
                    gap: 5px;
                }
                .notes-actions {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                }
                .btn-save-notes {
                    flex: 1;
                    background: #94d2bd;
                    color: #001219;
                    border: none;
                    padding: 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .btn-close-notes {
                    background: #333;
                    color: #fff;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
            <div class="mri-logo-container">
                <img src="${root}mri_icon.png" class="mri-icon-btn" id="mri-nav-toggle" title="Navigation Menu">
                <a href="${root}index.html" class="mri-logo" id="mri-logo-link" title="Back to Home">
                    MRI Tools
                </a>
            </div>

            <div id="mri-nav-panel">
                <span class="info-close" id="nav-panel-close" style="top: 15px; right: 20px;">&times;</span>
                <h3>Tools & Studies</h3>
                <a href="${root}index.html" class="nav-item ${pageTitle === 'MRI Tools Index' ? 'active' : ''}">🏠 Home</a>
                <a href="${root}breathing-instructions/index.html" class="nav-item ${pageTitle === 'MRI Breathing Instructions' ? 'active' : ''}">🗣️ Breathing Instructions</a>
                <a href="${root}breathing-pattern/index.html" class="nav-item ${pageTitle === 'MRI Breathing Pattern' ? 'active' : ''}">🫁 Breathing Pattern</a>
                <a href="${root}orbit-fixation/index.html" class="nav-item ${pageTitle === 'MRI Orbit Fixation' ? 'active' : ''}">👁️ Orbit Fixation</a>
                <a href="${root}tmj/index.html" class="nav-item ${pageTitle === 'TMJ Study' ? 'active' : ''}">🦷 TMJ Study</a>
                <h3 style="margin-top: 20px;">Resources</h3>
                <a href="https://download-directory.github.io/?url=https://github.com/giueseppepalminteri/mri-tools/tree/main/docs" class="nav-item" title="Download for offline use" target="_blank">💾 Download Offline Version</a>
            </div>
            <div id="mri-page-title">
                <span id="mri-title-text"></span>
                <span id="mri-status-text"></span>
                <button id="mri-info-toggle" title="How to use this tool">i</button>
            </div>
            <div id="mri-info-panel">
                <span class="info-close" id="info-panel-close">&times;</span>
                <h3 style="color: #94d2bd; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px;">How to use this tool</h3>
                <div id="mri-info-content" style="font-size: 0.95rem; line-height: 1.6;"></div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button id="mri-notes-toggle" class="mri-notes-btn" title="Open Notes">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Notes
                </button>

                <button class="mri-settings-btn" id="mri-global-settings-toggle" title="Toggle Settings">⚙️</button>
            </div>



            <div id="mri-notes-panel">
                <span class="info-close" id="notes-panel-close">&times;</span>
                <h3 style="color: #94d2bd; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px; font-size: 1.1rem;">Notes</h3>
                
                <div class="notes-warning">
                    <span>⚠️</span>
                    <span>These notes are temporary and stored locally in your browser. They may be lost if browser cache is cleared.</span>
                </div>

                <div class="notes-section">
                    <label class="notes-label">Website notes</label>
                    <textarea id="notes-global" class="notes-area" placeholder="Write notes visible from all the pages..."></textarea>
                </div>

                <div class="notes-section">
                    <label class="notes-label" id="label-tool-notes">Tool Notes</label>
                    <textarea id="notes-specific" class="notes-area" placeholder="Add notes specific to this tool..."></textarea>
                </div>

                <div class="notes-actions">
                    <button class="btn-save-notes" id="notes-save-btn">SAVE NOTES</button>
                    <button class="btn-close-notes" id="notes-cancel-btn">CLOSE</button>
                </div>
            </div>
        `;

        const titleEl = this.shadowRoot.getElementById('mri-title-text');
        const infoToggle = this.shadowRoot.getElementById('mri-info-toggle');
        const infoPanel = this.shadowRoot.getElementById('mri-info-panel');
        const infoContent = this.shadowRoot.getElementById('mri-info-content');
        const infoClose = this.shadowRoot.getElementById('info-panel-close');

        if (titleEl && root !== './' && pageTitle !== 'MRI Tools Index') {
            titleEl.textContent = pageTitle;
        } else if (infoToggle) {
            // Hide info button on home page if desired, or keep for general info
            // In this case, let's keep it but handle the click
        }

        const descriptions = {
            "MRI Tools Index": "Welcome to the MRI Tools Suite. Designed to improve patient cooperation and comfort during MRI scans. Select a tool from the menu to assist with specific procedures like guided breathing, orbital fixation, or TMJ studies.",
            "MRI Breathing Pattern": "Guided breathing tool to help patients maintain a steady rhythm. <br><br><b>How to use:</b><br>1. Set the target BPM or manually adjust In/Out times.<br>2. Enable 'Pulse' or 'Text' cues for the patient.<br>3. Use the Timer or Countdown to synchronize with MRI sequences.",
            "MRI Orbit Fixation": "Visual fixation target to help patients keep eyes steady. <br><br><b>How to use:</b><br>1. Adjust 'Dot Size' for patient visibility.<br>2. Use 'Jitter' to prevent visual fading (Troxler effect).",
            "TMJ Study": "Guided jaw opening positions for joint imaging. <br><br><b>How to use:</b><br>1. Preview study phases and select which to include.<br>2. Click 'Start Study' for full-screen presentation.<br>3. Use Spacebar or Click to advance to the next position."
        };

        infoToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = descriptions[pageTitle] || "Instructions for this tool are currently being finalized. Please consult your standard clinical protocols.";
            infoContent.innerHTML = text;
            infoPanel.classList.toggle('visible');
        });

        infoClose.addEventListener('click', () => infoPanel.classList.remove('visible'));

        // Close on outside click
        document.addEventListener('click', () => infoPanel.classList.remove('visible'));
        infoPanel.addEventListener('click', (e) => e.stopPropagation());

        this.shadowRoot.getElementById('mri-global-settings-toggle').addEventListener('click', () => {
            const panel = document.getElementById('settings-panel');
            
            if (panel) {
                panel.classList.toggle('collapsed');
            } else {
                console.warn('MRI Header: Settings panel not found on this page.');
            }
        });


        // --- Notes Logic ---
        const notesToggle = this.shadowRoot.getElementById('mri-notes-toggle');
        const notesPanel = this.shadowRoot.getElementById('mri-notes-panel');
        const notesGlobal = this.shadowRoot.getElementById('notes-global');
        const notesSpecific = this.shadowRoot.getElementById('notes-specific');
        const notesSaveBtn = this.shadowRoot.getElementById('notes-save-btn');
        const notesCancelBtn = this.shadowRoot.getElementById('notes-cancel-btn');
        const notesPanelClose = this.shadowRoot.getElementById('notes-panel-close');
        const labelToolNotes = this.shadowRoot.getElementById('label-tool-notes');

        const toolName = pageTitle === 'MRI Tools Index' ? 'Page/Tool' : pageTitle;
        labelToolNotes.textContent = toolName + " Notes";

        const storageKeyGlobal = 'mri_global_notes';
        const storageKeySpecific = 'mri_notes_' + pageTitle.replace(/\s+/g, '_').toLowerCase();

        const loadNotes = () => {
            notesGlobal.value = localStorage.getItem(storageKeyGlobal) || '';
            notesSpecific.value = localStorage.getItem(storageKeySpecific) || '';
        };

        const saveNotes = () => {
            localStorage.setItem(storageKeyGlobal, notesGlobal.value);
            localStorage.setItem(storageKeySpecific, notesSpecific.value);
            notesPanel.classList.remove('visible');
        };

        notesToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            loadNotes();
            notesPanel.classList.toggle('visible');
        });

        notesSaveBtn.addEventListener('click', saveNotes);
        notesCancelBtn.addEventListener('click', () => notesPanel.classList.remove('visible'));
        notesPanelClose.addEventListener('click', () => notesPanel.classList.remove('visible'));

        notesPanel.addEventListener('click', (e) => e.stopPropagation());



        // --- Navigation Logic ---
        const navToggle = this.shadowRoot.getElementById('mri-nav-toggle');
        const navPanel = this.shadowRoot.getElementById('mri-nav-panel');
        const navPanelClose = this.shadowRoot.getElementById('nav-panel-close');

        const navItems = this.shadowRoot.querySelectorAll('.nav-item');

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navPanel.classList.toggle('visible');
        });

        navPanelClose.addEventListener('click', () => navPanel.classList.remove('visible'));

        document.addEventListener('click', () => navPanel.classList.remove('visible'));
        navPanel.addEventListener('click', (e) => e.stopPropagation());

        // --- URL State Synchronization & Presets ---
        if (pageTitle !== 'MRI Tools Index') {
            const excludedInputIds = ['fullscreen-check', 'auto-hide-check', 'preset-name-input', 'preset-select', 'zoom-select', 'm-p-check', 'm-a-check', 'instr-check', 'instr-size-slider'];
            
            const keyMap = {
                'reps':'r', 'inhale':'i', 'hold':'h', 'recovery':'c', 'patternType':'p', 'alertSpeed':'a',
                'size-slider':'s', 'jitter-slider':'j', 'freq-slider':'f', 'cd-min':'m', 'cd-sec':'x', 'opacity-slider':'o',
                'bpm':'b', 'inOutSelect':'io', 'pulse-en':'pe', 'text-en':'te', 'timer-select':'ts'
            };
            const revMap = Object.entries(keyMap).reduce((acc, [k,v]) => { acc[v]=k; return acc; }, {});
            const shortK = k => keyMap[k] || k;
            const longK = k => revMap[k] || k;

            const getSyncableInputs = () => {
                const nodes = document.querySelectorAll('input[id], select[id]');
                return Array.from(nodes).filter(el => !excludedInputIds.includes(el.id) && !(headerEl.shadowRoot && headerEl.shadowRoot.contains(el)));
            };

            const syncUiStateToUrl = () => {
                const inputs = getSyncableInputs();
                const params = new URLSearchParams(window.location.search);
                let changed = false;

                // Keep only existing non-mapped keys if they exist, but clear mapped ones to rebuild concisely
                const newParams = new URLSearchParams();

                inputs.forEach(input => {
                    let val = input.type === 'checkbox' ? (input.checked ? '1' : '0') : input.value;
                    let sk = shortK(input.id);
                    newParams.set(sk, val);
                    
                    if (params.get(sk) !== val) changed = true;
                });

                if (changed || params.toString() !== newParams.toString()) {
                    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
                    window.history.replaceState({}, '', newUrl);
                }
            };

            const loadUiStateFromUrl = () => {
                const params = new URLSearchParams(window.location.search);
                
                // Track changes constantly for new/init values
                const inputs = getSyncableInputs();
                inputs.forEach(input => {
                    const sk = shortK(input.id);
                    const val = params.get(sk) || params.get(input.id); // fallback for older links
                    if (val !== null) {
                        if (input.type === 'checkbox') {
                            input.checked = val === '1';
                        } else {
                            input.value = val;
                        }
                        
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    
                    input.addEventListener('change', syncUiStateToUrl);
                    if (input.type === 'range' || input.type === 'number' || input.type === 'text') {
                        input.addEventListener('input', syncUiStateToUrl);
                    }
                });
                setTimeout(syncUiStateToUrl, 100); // Flush fresh state
            };

            const initUrlSync = () => {
                loadUiStateFromUrl();

                const _settingsPanel = document.getElementById('settings-content');
                if (_settingsPanel) {
                    const hr = document.createElement('hr');
                    hr.style.cssText = 'border:0; border-top:1px solid #333; margin: 15px 0 10px 0;';
                    _settingsPanel.appendChild(hr);

                    const presetDiv = document.createElement('div');
                    presetDiv.style.cssText = 'display:flex; flex-direction:column; gap:8px; margin-bottom:10px;';
                    
                    // Share Button
                    const btnCopy = document.createElement('button');
                    btnCopy.textContent = '🔗 Copy Shareable Link';
                    btnCopy.style.cssText = 'background: #222; color: #94d2bd; border: 1px solid #444; padding: 6px; border-radius: 4px; cursor: pointer; font-weight:bold; font-size: 0.8rem; width: 100%;';
                    btnCopy.onclick = () => {
                        syncUiStateToUrl();
                        navigator.clipboard.writeText(window.location.href).then(() => {
                            const orig = btnCopy.textContent;
                            btnCopy.textContent = '✅ Copied to clipboard!';
                            setTimeout(() => btnCopy.textContent = orig, 1500);
                        });
                    };
                    presetDiv.appendChild(btnCopy);
                    
                    // Load Preset Area
                    const presetListDiv = document.createElement('div');
                    presetListDiv.style.cssText = 'display:flex; flex-direction:column; gap:4px; margin-top:5px; margin-bottom:5px; max-height: 150px; overflow-y: auto;';
                    
                    const updatePresetList = () => {
                        presetListDiv.innerHTML = '';
                        const prefix = 'mri_preset_' + currentPath + '_';
                        let found = false;
                        for (let i = 0; i < localStorage.length; i++) {
                            const k = localStorage.key(i);
                            if (k && k.startsWith(prefix)) {
                                found = true;
                                const pName = k.substring(prefix.length);
                                const pVal = localStorage.getItem(k);
                                
                                const chipRow = document.createElement('div');
                                chipRow.style.cssText = 'display:flex; padding: 4px 8px; background: #1a1a1a; border: 1px solid #333; border-radius: 4px; align-items:center; cursor: pointer;';
                                chipRow.onmouseover = () => chipRow.style.background = '#2a2a2a';
                                chipRow.onmouseout = () => chipRow.style.background = '#1a1a1a';
                                
                                const lbl = document.createElement('span');
                                lbl.textContent = pName;
                                lbl.style.cssText = 'flex:1; font-size: 0.8rem; color: #94d2bd; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
                                
                                const delBtn = document.createElement('button');
                                delBtn.innerHTML = '&#10005;'; // X mark
                                delBtn.style.cssText = 'background:transparent; border:none; color: #ff5555; cursor:pointer; font-size:0.8rem; padding:0 0 0 8px; margin-left: 5px; border-left: 1px solid #333; font-weight: bold;';
                                
                                delBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    if(confirm(`Delete preset "${pName}"?`)) {
                                        localStorage.removeItem(k);
                                        updatePresetList();
                                    }
                                };
                                
                                chipRow.onclick = () => {
                                    window.history.replaceState({}, '', window.location.pathname + pVal);
                                    loadUiStateFromUrl();
                                };
                                
                                chipRow.appendChild(lbl);
                                chipRow.appendChild(delBtn);
                                presetListDiv.appendChild(chipRow);
                            }
                        }
                        presetListDiv.style.display = found ? 'flex' : 'none';
                    };
                    
                    presetDiv.appendChild(presetListDiv);

                    // Save Preset Area
                    const saveBox = document.createElement('div');
                    saveBox.style.cssText = 'display:flex; gap:5px;';
                    
                    const presetName = document.createElement('input');
                    presetName.id = 'preset-name-input';
                    presetName.type = 'text';
                    presetName.placeholder = 'Preset Name...';
                    presetName.style.cssText = 'flex:1; background: #111; color: white; border: 1px solid #444; border-radius: 4px; padding: 4px; font-size:0.8rem;';
                    
                    const btnSave = document.createElement('button');
                    btnSave.textContent = 'Save';
                    btnSave.style.cssText = 'background: #222; border: 1px solid #444; color: white; border-radius: 4px; cursor:pointer; font-weight:bold; font-size:0.8rem;';
                    
                    btnSave.onclick = () => {
                        syncUiStateToUrl();
                        const name = presetName.value.trim() || 'My Preset';
                        const key = 'mri_preset_' + currentPath + '_' + name;
                        localStorage.setItem(key, window.location.search);
                        updatePresetList();
                        presetName.value = '';
                    };
                    
                    saveBox.appendChild(presetName);
                    saveBox.appendChild(btnSave);
                    presetDiv.appendChild(saveBox);

                    _settingsPanel.appendChild(presetDiv);
                    updatePresetList();
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => setTimeout(initUrlSync, 100));
            } else {
                setTimeout(initUrlSync, 100);
            }
        }
    }

    setStatusText(text) {
        const statusEl = this.shadowRoot.getElementById('mri-status-text');
        if (statusEl) {
            statusEl.textContent = text ? `- ${text}` : '';
        }
    }
}

customElements.define('mri-header', MriHeader);

// --- Global Disclaimer Modal ---
(function () {
    // Only run this logic if we're actually in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    window.showMriDisclaimer = function (force = false) {
        if (!force && localStorage.getItem('mri_disclaimer_accepted') === 'true') {
            return;
        }

        // Remove any existing disclaimer so we don't open multiple
        const existingContainer = document.getElementById('mri-global-disclaimer-container');
        if (existingContainer) existingContainer.remove();

        const modalHTML = `
            <div id="mri-global-disclaimer" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95); z-index: 2147483647; display: flex; justify-content: center; align-items: flex-start; color: #fff; font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px 20px; overflow-y: auto;">
                <div style="background: #001219; border: 2px solid #94d2bd; border-radius: 12px; padding: 30px; max-width: 800px; width: 100%; box-shadow: 0 0 30px rgba(148, 210, 189, 0.2); position: relative;">
                    <h2 style="color: #94d2bd; margin-top: 0; font-size: 1.8rem; border-bottom: 1px solid #333; padding-bottom: 15px;">Terms of Use and Medical Disclaimer</h2>
                    
                    <h3 style="color: #00ff88; margin-bottom: 5px; font-size: 1.1rem;">1. Purpose of This Website</h3>
                    <p style="margin-top: 5px; line-height: 1.6; font-size: 0.95rem;">This website and its associated tools were created as an independent project to improve the MRI patient experience. By projecting visual cues and instructions, it aims to assist patients, particularly those with hearing impairments, and provide general guidance to reduce anxiety and improve cooperation during scans.</p>
                    
                    <h3 style="color: #00ff88; margin-bottom: 5px; margin-top: 20px; font-size: 1.1rem;">2. Accuracy</h3>
                    <p style="margin-top: 5px; line-height: 1.6; font-size: 0.95rem;">While every effort has been made to provide helpful and functional tools, the software is not a certified medical device, has not been subjected to regulatory clinical trials, and may contain bugs, errors, or inaccuracies.</p>
                    
                    <h3 style="color: #00ff88; margin-bottom: 5px; margin-top: 20px; font-size: 1.1rem;">3. User Responsibility and Testing</h3>
                    <p style="margin-top: 5px; line-height: 1.6; font-size: 0.95rem;">Anyone utilizing this website (including MRI technologists, radiologists, or any healthcare facility) does so entirely at their own risk.</p>
                    <p style="margin-top: 5px; line-height: 1.6; font-size: 0.95rem;"><strong>Mandatory Testing:</strong> It is the sole responsibility of the user to thoroughly test all features, visuals, and timing beforehand to ensure they meet the specific needs and safety protocols of their clinical environment and patients.</p>
                    <p style="margin-top: 5px; line-height: 1.6; font-size: 0.95rem;"><strong>Clinical Judgment:</strong> This tool is intended strictly as a supplementary aid and must never replace professional clinical judgment, standard medical protocols, or direct patient communication and monitoring.</p>
                    
                    <h3 style="color: #00ff88; margin-bottom: 5px; margin-top: 20px; font-size: 1.1rem;">4. "As Is" Provision</h3>
                    <p style="margin-top: 5px; line-height: 1.6; font-size: 0.95rem;">All tools, features, and content on this website are provided strictly on an "as is" and "as available" basis, without warranties of any kind, either express or implied. There is no guarantee of uninterrupted service, accuracy, or suitability for any specific medical procedure or patient demographic.</p>
                    
                    <h3 style="color: #00ff88; margin-bottom: 5px; margin-top: 20px; font-size: 1.1rem;">5. Limitation of Liability</h3>
                    <p style="margin-top: 5px; line-height: 1.6; font-size: 0.95rem;">By choosing to use this website, you explicitly agree that the creator(s), developer(s), and host(s) of this website assume zero liability or responsibility for any consequences arising from its use or misuse. This includes, but is not limited to:</p>
                    <ul style="line-height: 1.6; font-size: 0.95rem; color: #ccc;">
                        <li>Patient distress, injury, or adverse reactions.</li>
                        <li>Misinterpretation of visual cues by the patient.</li>
                        <li>Delays in medical procedures or ruined scans.</li>
                        <li>Technical malfunctions, screen freezing, or website downtime.</li>
                    </ul>
                    
                    <div style="background: rgba(251, 113, 133, 0.1); border-left: 4px solid #fb7185; padding: 15px; margin-top: 25px;">
                        <p style="margin: 0; font-weight: bold; color: #fb7185; line-height: 1.5; font-size: 0.95rem;">By accessing and using these tools, you acknowledge that you have read, understood, and agreed to this disclaimer, and you accept full legal and ethical responsibility for its implementation in your practice.</p>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 35px; justify-content: flex-end; border-top: 1px solid #333; padding-top: 20px;">
                        <button id="disclaimer-decline" style="background: #222; color: #fff; border: 1px solid #555; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s;">Decline & Exit</button>
                        <button id="disclaimer-accept" style="background: #94d2bd; color: #001219; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: transform 0.2s, background 0.2s;">I Understand and Accept</button>
                    </div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.id = 'mri-global-disclaimer-container';
        container.innerHTML = modalHTML;
        document.body.appendChild(container);

        document.getElementById('disclaimer-accept').addEventListener('click', () => {
            localStorage.setItem('mri_disclaimer_accepted', 'true');
            container.remove();
        });

        document.getElementById('disclaimer-decline').addEventListener('click', () => {
            window.location.href = "https://www.google.com";
        });

        // Add minimal hover effects
        const acceptBtn = document.getElementById('disclaimer-accept');
        acceptBtn.addEventListener('mouseover', () => acceptBtn.style.background = '#a6e4cf');
        acceptBtn.addEventListener('mouseout', () => acceptBtn.style.background = '#94d2bd');

        const declineBtn = document.getElementById('disclaimer-decline');
        declineBtn.addEventListener('mouseover', () => declineBtn.style.background = '#333');
        declineBtn.addEventListener('mouseout', () => declineBtn.style.background = '#222');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.showMriDisclaimer(false));
    } else {
        window.showMriDisclaimer(false);
    }
})();
