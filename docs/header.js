class MriHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const root = this.getAttribute('root') || '../';
        
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
            </style>
            <a href="${root}index.html" class="mri-logo" title="Back to Home">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94d2bd" stroke-width="2" style="margin-right: 5px;">
                    <circle cx="12" cy="12" r="2.5" fill="#fff" stroke="none"/>
                    <circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>
                    <circle cx="12" cy="3" r="1.5" fill="#94d2bd" stroke="none"/>
                </svg>
                MRI Tools
            </a>
            <button class="mri-settings-btn" id="mri-global-settings-toggle" title="Toggle Settings">⚙️</button>
        `;

        this.shadowRoot.getElementById('mri-global-settings-toggle').addEventListener('click', () => {
            const panel = document.getElementById('settings-panel');
            if (panel) {
                panel.classList.toggle('collapsed');
            } else {
                console.warn('MRI Header: Settings panel not found on this page.');
            }
        });
    }
}

customElements.define('mri-header', MriHeader);
