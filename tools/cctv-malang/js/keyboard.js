/**
 * Keyboard shortcuts module for CCTV Map Application
 */

class KeyboardManager {
    constructor() {
        this.shortcuts = new Map();
        this.isEnabled = true;
        this.init();
    }

    // Initialize keyboard manager
    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled) return;
            
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            if (!this.isEnabled) return;
            
            this.handleKeyUp(e);
        });

        // Register default shortcuts
        this.registerDefaultShortcuts();
    }

    // Handle key down events
    handleKeyDown(e) {
        const key = this.getKeyString(e);
        const shortcut = this.shortcuts.get(key);
        
        if (shortcut) {
            e.preventDefault();
            shortcut.handler(e);
        }
    }

    // Handle key up events
    handleKeyUp(e) {
        // Handle key up events if needed
    }

    // Get key string representation
    getKeyString(e) {
        const parts = [];
        
        if (e.ctrlKey) parts.push('ctrl');
        if (e.metaKey) parts.push('meta');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        parts.push(e.key.toLowerCase());
        
        return parts.join('+');
    }

    // Register a keyboard shortcut
    register(keys, handler, description = '') {
        const key = Array.isArray(keys) ? keys.join('+') : keys;
        this.shortcuts.set(key, {
            handler,
            description,
            keys: Array.isArray(keys) ? keys : [keys]
        });
    }

    // Unregister a keyboard shortcut
    unregister(keys) {
        const key = Array.isArray(keys) ? keys.join('+') : keys;
        this.shortcuts.delete(key);
    }

    // Register default shortcuts
    registerDefaultShortcuts() {
        // Refresh data
        this.register(['ctrl', 'r'], (e) => {
            if (window.cctvApp) {
                window.cctvApp.refreshData();
            }
        }, 'Refresh data');

        // Reset filters
        this.register('escape', (e) => {
            if (window.cctvApp) {
                window.cctvApp.resetFilters();
            }
        }, 'Reset filters');

        // Focus search
        this.register(['ctrl', 'f'], (e) => {
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }, 'Focus search');

        // Toggle fullscreen
        this.register('f11', (e) => {
            this.toggleFullscreen();
        }, 'Toggle fullscreen');

        // Show help
        this.register(['ctrl', 'h'], (e) => {
            this.showHelp();
        }, 'Show help');

        // Zoom in
        this.register('=', (e) => {
            if (window.mapManager && window.mapManager.map) {
                window.mapManager.map.zoomIn();
            }
        }, 'Zoom in');

        // Zoom out
        this.register('-', (e) => {
            if (window.mapManager && window.mapManager.map) {
                window.mapManager.map.zoomOut();
            }
        }, 'Zoom out');

        // Fit to all markers
        this.register(['ctrl', '0'], (e) => {
            if (window.mapManager) {
                window.mapManager.fitToMarkers();
            }
        }, 'Fit to all markers');

        // Toggle statistics panel
        this.register(['ctrl', 's'], (e) => {
            this.toggleStatsPanel();
        }, 'Toggle statistics panel');

        // Toggle controls panel
        this.register(['ctrl', 'c'], (e) => {
            this.toggleControlsPanel();
        }, 'Toggle controls panel');

        // Quick filters
        this.register('1', (e) => {
            if (window.cctvApp) {
                window.cctvApp.filterMarkers('all');
            }
        }, 'Show all CCTVs');

        this.register('2', (e) => {
            if (window.cctvApp) {
                window.cctvApp.filterMarkers('online');
            }
        }, 'Show online CCTVs');

        this.register('3', (e) => {
            if (window.cctvApp) {
                window.cctvApp.filterMarkers('offline');
            }
        }, 'Show offline CCTVs');

        this.register('4', (e) => {
            if (window.cctvApp) {
                window.cctvApp.filterMarkers('intersection');
            }
        }, 'Show intersection CCTVs');

        this.register('5', (e) => {
            if (window.cctvApp) {
                window.cctvApp.filterMarkers('street');
            }
        }, 'Show street CCTVs');
    }

    // Toggle fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Show help dialog
    showHelp() {
        const helpContent = `
            <h3>🎹 Keyboard Shortcuts</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                <div><strong>Ctrl + R:</strong> Refresh data</div>
                <div><strong>Escape:</strong> Reset filters</div>
                <div><strong>Ctrl + F:</strong> Focus search</div>
                <div><strong>F11:</strong> Toggle fullscreen</div>
                <div><strong>Ctrl + H:</strong> Show this help</div>
                <div><strong>+ / =:</strong> Zoom in</div>
                <div><strong>-:</strong> Zoom out</div>
                <div><strong>Ctrl + 0:</strong> Fit to all markers</div>
                <div><strong>Ctrl + S:</strong> Toggle statistics</div>
                <div><strong>Ctrl + C:</strong> Toggle controls</div>
                <div><strong>1:</strong> Show all CCTVs</div>
                <div><strong>2:</strong> Show online CCTVs</div>
                <div><strong>3:</strong> Show offline CCTVs</div>
                <div><strong>4:</strong> Show intersection CCTVs</div>
                <div><strong>5:</strong> Show street CCTVs</div>
            </div>
        `;

        if (window.uiManager) {
            // Create temporary modal for help
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <span class="modal-title">Keyboard Shortcuts</span>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        ${helpContent}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close handlers
            modal.querySelector('.close').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
    }

    // Toggle statistics panel
    toggleStatsPanel() {
        const statsPanel = document.getElementById('stats');
        if (statsPanel) {
            statsPanel.style.display = statsPanel.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Toggle controls panel
    toggleControlsPanel() {
        const controlsPanel = document.querySelector('.controls');
        if (controlsPanel) {
            controlsPanel.style.display = controlsPanel.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Enable keyboard shortcuts
    enable() {
        this.isEnabled = true;
    }

    // Disable keyboard shortcuts
    disable() {
        this.isEnabled = false;
    }

    // Get all registered shortcuts
    getAllShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([key, shortcut]) => ({
            key,
            description: shortcut.description,
            keys: shortcut.keys
        }));
    }

    // Clear all shortcuts
    clear() {
        this.shortcuts.clear();
    }

    // Destroy keyboard manager
    destroy() {
        this.shortcuts.clear();
        this.isEnabled = false;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardManager;
}

if (typeof window !== 'undefined') {
    window.KeyboardManager = KeyboardManager;
}
