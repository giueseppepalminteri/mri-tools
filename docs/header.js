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
                #mri-page-title {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #fff;
                    font-size: 1.2rem;
                    font-weight: bold;
                    white-space: nowrap;
                    pointer-events: none;
                }
            </style>
            <a href="${root}index.html" class="mri-logo" title="Back to Home">
                <img src="${root}atom_logo.png" style="height: 36px; margin-right: 10px; border-radius: 5px;">
                MRI Tools
            </a>
            <div id="mri-page-title"></div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span id="mri-disclaimer-btn" style="color: #94d2bd; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease; text-decoration: underline;" title="Review Disclaimer">You are using this website because you accepted the conditions</span>
                <button class="mri-settings-btn" id="mri-global-settings-toggle" title="Toggle Settings">⚙️</button>
            </div>
        `;

        const titleEl = this.shadowRoot.getElementById('mri-page-title');
        if (titleEl && root !== './' && document.title !== 'MRI Tools Index') {
            titleEl.textContent = document.title;
        }

        this.shadowRoot.getElementById('mri-global-settings-toggle').addEventListener('click', () => {
            const panel = document.getElementById('settings-panel');
            if (panel) {
                panel.classList.toggle('collapsed');
            } else {
                console.warn('MRI Header: Settings panel not found on this page.');
            }
        });
        this.shadowRoot.getElementById('mri-disclaimer-btn').addEventListener('click', () => {
            if (typeof window.showMriDisclaimer === 'function') {
                window.showMriDisclaimer(true);
            }
        });
        
        // Add hover effect for the disclaimer button
        const disclaimerBtn = this.shadowRoot.getElementById('mri-disclaimer-btn');
        disclaimerBtn.addEventListener('mouseover', () => {
            disclaimerBtn.style.background = '#94d2bd';
            disclaimerBtn.style.color = '#001219';
        });
        disclaimerBtn.addEventListener('mouseout', () => {
            disclaimerBtn.style.background = 'none';
            disclaimerBtn.style.color = '#94d2bd';
        });

        // Hide the button if disclaimer is not accepted yet (so we don't show "Accepted" prematurely)
        if (typeof window !== 'undefined' && localStorage.getItem('mri_disclaimer_accepted') !== 'true') {
            disclaimerBtn.style.display = 'none';
        }
    }
}

customElements.define('mri-header', MriHeader);

// --- Global Disclaimer Modal ---
(function() {
    // Only run this logic if we're actually in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    window.showMriDisclaimer = function(force = false) {
        if (!force && localStorage.getItem('mri_disclaimer_accepted') === 'true') {
            // Un-hide the header button if we are passively returning
            const headers = document.querySelectorAll('mri-header');
            headers.forEach(h => {
                if (h.shadowRoot) {
                    const btn = h.shadowRoot.getElementById('mri-disclaimer-btn');
                    if (btn) btn.style.display = 'block';
                }
            });
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
                    <p style="margin-top: 5px; line-height: 1.6; font-size: 0.95rem;">This website and its associated tools were created as an independent project to improve the MRI patient experience. By projecting visual cues and instructions, it aims to assist patients—particularly those with hearing impairments—and provide general guidance to reduce anxiety and improve cooperation during scans.</p>
                    
                    <h3 style="color: #00ff88; margin-bottom: 5px; margin-top: 20px; font-size: 1.1rem;">2. Development and Accuracy</h3>
                    <p style="margin-top: 5px; line-height: 1.6; font-size: 0.95rem;">Please note that this website was developed with the assistance of Artificial Intelligence (AI). While every effort has been made to provide helpful and functional tools, the software is not a certified medical device, has not been subjected to regulatory clinical trials, and may contain bugs, errors, or inaccuracies.</p>
                    
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
            
            // Show the header button upon acceptance
            const headers = document.querySelectorAll('mri-header');
            headers.forEach(h => {
                if (h.shadowRoot) {
                    const btn = h.shadowRoot.getElementById('mri-disclaimer-btn');
                    if (btn) btn.style.display = 'block';
                }
            });
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
