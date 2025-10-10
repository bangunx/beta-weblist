/**
 * UI management module for CCTV Map Application
 */

class UIManager {
    constructor() {
        this.currentFilter = 'all';
        this.searchTimeout = null;
        this.modal = null;
        this.modalBody = null;
        this.previouslyFocusedElement = null;
        this.hlsInstance = null;
        this.activeVideoElement = null;
        this.currentDistrict = 'all';
        this.districtFilterSelect = null;
        this.availableDistricts = [];
        this.panelToggleMap = new Map();
        this.locationMarker = null;
        this.boundOutsideClickHandler = this.handleOutsideClick.bind(this);
        this.statsPanel = null;
        this.statsToggleButton = null;
        this.statsCollapsed = false;
        this.statsMediaQuery = null;
    }

    // Initialize UI components
    initialize() {
        this.initializeSearch();
        this.initializeFilters();
        this.initializeDistrictFilter();
        this.initializeModal();
        this.initializeStats();
        this.initializePanelToggles();
        this.initializeQuickActions();
        console.log('UI initialized successfully');
    }

    // Initialize search functionality
    initializeSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        const searchResults = document.querySelector('.search-results');
        
        // Debounced search function
        const debouncedSearch = debounce((query) => {
            this.performSearch(query, searchResults);
        }, 300);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideSearchResults(searchResults);
                return;
            }

            debouncedSearch(query);
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                this.hideSearchResults(searchResults);
            }
        });
    }

    // Perform search
    performSearch(query, resultsContainer) {
        if (!window.cctvApp || !window.cctvApp.dataManager) {
            console.warn('CCTV app not initialized');
            return;
        }

        const results = window.cctvApp.dataManager.searchCCTVs(query, {
            maxResults: 10,
            sortBy: 'name'
        });

        this.displaySearchResults(results, resultsContainer);
    }

    // Display search results
    displaySearchResults(results, container) {
        if (!results.length) {
            container.innerHTML = '<div class="search-result-item">Tidak ada hasil ditemukan</div>';
            container.style.display = 'block';
            return;
        }

        const html = results.map(cctv => {
            const statusInfo = getStatusInfo(cctv.status);
            return `
                <div class="search-result-item" data-cctv-id="${cctv.id}">
                    <div style="font-weight: bold; margin-bottom: 4px;">${cctv.name}</div>
                    <div style="font-size: 0.85em; color: #666;">
                        ${statusInfo.icon} ${statusInfo.text} • ${cctv.district} • ${cctv.camera_type}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        container.style.display = 'block';

        // Add click handlers
        container.querySelectorAll('.search-result-item[data-cctv-id]').forEach(item => {
            item.addEventListener('click', () => {
                const cctvId = item.getAttribute('data-cctv-id');
                this.selectSearchResult(cctvId);
            });
        });
    }

    // Hide search results
    hideSearchResults(container) {
        if (container) {
            container.style.display = 'none';
        }
    }

    // Select search result
    selectSearchResult(cctvId) {
        if (window.cctvApp && window.cctvApp.mapManager) {
            window.cctvApp.mapManager.highlightMarker(cctvId);
        }
        
        // Clear search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.hideSearchResults(document.querySelector('.search-results'));
    }

    // Initialize filter buttons
    initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.resetDistrictFilter();
                const filter = btn.getAttribute('data-filter');
                this.setActiveFilter(filter);
                
                if (window.cctvApp && window.cctvApp.dataManager) {
                    const filteredData = window.cctvApp.dataManager.setFilter(filter);
                    window.cctvApp.mapManager.addMarkers(filteredData);
                    this.updateStatistics(filteredData);
                }
            });
        });
    }

    // Initialize district filter dropdown
    initializeDistrictFilter() {
        const select = document.getElementById('district-filter');
        if (!select) return;

        this.districtFilterSelect = select;

        select.addEventListener('change', (event) => {
            if (!window.cctvApp || !window.cctvApp.dataManager) {
                return;
            }

            const value = event.target.value || 'all';
            this.currentDistrict = value;

            const filteredData = window.cctvApp.dataManager.setDistrict(value);
            window.cctvApp.mapManager.addMarkers(filteredData);
            this.updateStatistics(filteredData);
        });
    }

    // Populate district dropdown
    populateDistrictFilter(districtsMap = {}) {
        if (!this.districtFilterSelect) {
            this.districtFilterSelect = document.getElementById('district-filter');
        }

        const select = this.districtFilterSelect;
        if (!select) return;

        const entries = Object.entries(districtsMap);
        if (!entries.length) {
            select.innerHTML = '<option value="all">Semua kecamatan</option>';
            return;
        }

        const options = ['<option value="all">Semua kecamatan</option>'];
        entries
            .sort((a, b) => a[0].localeCompare(b[0], 'id-ID'))
            .forEach(([districtName, cameras]) => {
                const sample = cameras[0] || {};
                const slug = (sample.district_slug || districtName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim();
                options.push(`<option value="${slug}">${districtName} (${cameras.length})</option>`);
            });

        select.innerHTML = options.join('');
        this.availableDistricts = entries.map(([name]) => name);
        this.resetDistrictFilter();
    }

    // Reset district filter selection
    resetDistrictFilter() {
        this.currentDistrict = 'all';
        if (this.districtFilterSelect) {
            this.districtFilterSelect.value = 'all';
        }
        if (window.cctvApp && window.cctvApp.dataManager) {
            window.cctvApp.dataManager.setDistrict('all');
        }
    }

    // Set active filter
    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // Initialize modal
    initializeModal() {
        // Create modal HTML if it doesn't exist
        if (!document.getElementById('cctv-modal')) {
            const modalHTML = `
                <div id="cctv-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
                    <div class="modal-content">
                        <div class="modal-header">
                            <span class="modal-title" id="modal-title">Detail CCTV</span>
                            <button type="button" class="close" aria-label="Tutup detail">&times;</button>
                        </div>
                        <div class="modal-body" id="modal-body">
                            <!-- Content will be loaded here -->
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        this.modal = document.getElementById('cctv-modal');
        this.modalBody = document.getElementById('modal-body');

        if (!this.modal) {
            console.warn('Modal container tidak ditemukan');
            return;
        }

        if (!this.modal.hasAttribute('aria-hidden')) {
            this.modal.setAttribute('aria-hidden', 'true');
        }

        const closeBtn = this.modal.querySelector('.close');

        // Close modal events
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (!this.modal) return;

            if (e.key === 'Escape' && this.modal.getAttribute('aria-hidden') === 'false') {
                this.closeModal();
            }
        });
    }

    // Show CCTV details in modal
    showCCTVDetails(cctvId) {
        if (!window.cctvApp || !window.cctvApp.dataManager) {
            console.warn('CCTV app not initialized');
            return;
        }

        const cctv = window.cctvApp.dataManager.findCCTVById(cctvId);
        if (!cctv) {
            console.warn('CCTV not found:', cctvId);
            return;
        }

        if (!this.modal || !this.modalBody) {
            this.initializeModal();
        }

        if (!this.modal || !this.modalBody) {
            return;
        }

        const statusInfo = getStatusInfo(cctv.status);
        const cameraTypeInfo = getCameraTypeInfo(cctv.camera_type);
        const coordinates = formatCoordinates(cctv.latitude, cctv.longitude);
        const hlsPlayerId = `hls-player-${cctv.id}`;
        const tags = Array.isArray(cctv.metadata?.tags) ? cctv.metadata.tags.filter(Boolean) : [];
        const updatedAt = cctv.updated_at || cctv.metadata?.updated_at;
        const createdAt = cctv.created_at || cctv.metadata?.created_at;

        const detailsHTML = `
            <div class="detail-overview">
                <div>
                    <h2 class="detail-overview__title">${cctv.name}</h2>
                    <p class="detail-overview__location">${formatAddress(cctv)}</p>
                </div>
                <span class="detail-overview__status ${statusInfo.class}">
                    ${statusInfo.icon} ${statusInfo.text}
                </span>
            </div>

            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">🏘️ Kecamatan</div>
                    <div class="detail-value">${cctv.district || 'N/A'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">🏙️ Kota</div>
                    <div class="detail-value">${cctv.city || 'N/A'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">📮 Kode Pos</div>
                    <div class="detail-value">${cctv.postal_code || 'N/A'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">${cameraTypeInfo.icon} Tipe Kamera</div>
                    <div class="detail-value">${cctv.camera_type || 'N/A'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">📍 Tipe Lokasi</div>
                    <div class="detail-value">${cctv.location_type || 'N/A'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">⭐ Prioritas</div>
                    <div class="detail-value">${cctv.priority || 'Normal'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">🔗 Akses</div>
                    <div class="detail-value">${cctv.isPublic ? '🌐 Publik' : '🔒 Privat'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">📊 Koordinat</div>
                    <div class="detail-value">${coordinates}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">🆔 Stream ID</div>
                    <div class="detail-value">${cctv.stream_id || 'N/A'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">🖥️ Host</div>
                    <div class="detail-value">${cctv.host || 'N/A'}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">📅 Dibuat</div>
                    <div class="detail-value">${formatDateTime(createdAt)}</div>
                </div>

                <div class="detail-item">
                    <div class="detail-label">🔄 Diperbarui</div>
                    <div class="detail-value">${formatDateTime(updatedAt)}</div>
                </div>

                ${cctv.metadata?.district_category ? `
                <div class="detail-item">
                    <div class="detail-label">🏷️ Kategori Distrik</div>
                    <div class="detail-value">${cctv.metadata.district_category}</div>
                </div>
                ` : ''}

                ${tags.length ? `
                <div class="detail-item detail-item--full">
                    <div class="detail-label">🔖 Tag</div>
                    <div class="detail-value tag-list">
                        ${tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
                    </div>
                </div>
                ` : ''}

                ${cctv.webrtc_url ? `
                <div class="detail-item detail-item--full detail-item--actions">
                    <div class="detail-label">🎬 WebRTC</div>
                    <div class="detail-actions">
                        <a href="${cctv.webrtc_url}" target="_blank" rel="noopener"
                           class="popup-btn popup-btn-stream">
                            Buka Live Stream WebRTC
                        </a>
                    </div>
                </div>
                ` : ''}

                ${cctv.hls_url ? `
                <div class="detail-item detail-item--full detail-item--video">
                    <div class="detail-label">📺 Live Stream HLS</div>
                    <div class="detail-value">
                        <div class="video-wrapper">
                            <video id="${hlsPlayerId}"
                                   class="hls-player"
                                   controls
                                   playsinline
                                   preload="metadata"
                                   data-hls-url="${cctv.hls_url}">
                                Browser Anda tidak mendukung pemutaran HLS secara langsung.
                            </video>
                        </div>
                        <div class="video-actions">
                            <a href="${cctv.hls_url}" target="_blank" rel="noopener"
                               class="popup-btn popup-btn-detail video-link">
                                🔗 Buka di tab baru
                            </a>
                        </div>
                        <p class="video-fallback" hidden>
                            Browser Anda belum mendukung HLS. Gunakan tautan di atas atau pemutar eksternal.
                        </p>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        this.modalBody.innerHTML = detailsHTML;
        this.previouslyFocusedElement = document.activeElement;

        this.modal.style.display = 'block';
        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.classList.add('fade-in');

        const closeBtn = this.modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.focus();
        }

        if (cctv.hls_url) {
            this.initializeHLSPlayer(cctv.hls_url, hlsPlayerId);
        } else {
            this.destroyHlsPlayer();
        }
    }

    // Close modal
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.modal.setAttribute('aria-hidden', 'true');
            this.modal.classList.remove('fade-in');
        }

        this.destroyHlsPlayer();

        if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
            this.previouslyFocusedElement.focus();
        }

        this.previouslyFocusedElement = null;
    }

    // Initialize HLS player
    initializeHLSPlayer(hlsUrl, elementId) {
        this.destroyHlsPlayer();

        const videoEl = document.getElementById(elementId);
        if (!videoEl || !hlsUrl) {
            return;
        }

        const fallbackMessage = videoEl.closest('.detail-item--video')?.querySelector('.video-fallback');
        if (fallbackMessage) {
            fallbackMessage.hidden = true;
            fallbackMessage.textContent = 'Browser Anda belum mendukung HLS. Gunakan tautan di atas atau pemutar eksternal.';
        }

        const playableUrl = this.getPlayableStreamUrl(hlsUrl);
        if (!playableUrl) {
            if (fallbackMessage) {
                const protocol = window.location?.protocol || '';
                fallbackMessage.textContent = protocol === 'https:'
                    ? 'Streaming tidak bisa diputar otomatis karena sumber hanya tersedia melalui koneksi HTTP. Gunakan tombol "Buka di tab baru" di atas untuk melihat video.'
                    : 'Streaming tidak bisa diputar secara otomatis. Coba buka tautan langsung di tab baru.';
                fallbackMessage.hidden = false;
            }
            return;
        }

        this.activeVideoElement = videoEl;

        if (window.Hls && window.Hls.isSupported()) {
            this.hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 30
            });

            this.hlsInstance.loadSource(playableUrl);
            this.hlsInstance.attachMedia(videoEl);

            this.hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                if (fallbackMessage) {
                    fallbackMessage.textContent = data?.response?.code === 0
                        ? 'Tidak dapat memuat stream. Jika Anda membuka situs melalui HTTPS, buka tautan live stream di tab baru.'
                        : 'Gagal memutar stream. Coba buka tautan live stream di tab baru.';
                    fallbackMessage.hidden = false;
                }
            });
        } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            videoEl.src = playableUrl;
        } else {
            if (fallbackMessage) {
                fallbackMessage.textContent = 'Peramban ini belum mendukung HLS langsung. Gunakan tautan live stream di tab baru atau pemutar eksternal.';
                fallbackMessage.hidden = false;
            }
        }
    }

    // Destroy HLS player instance
    destroyHlsPlayer() {
        if (this.hlsInstance) {
            this.hlsInstance.destroy();
            this.hlsInstance = null;
        }

        if (this.activeVideoElement) {
            this.activeVideoElement.pause();
            this.activeVideoElement.removeAttribute('src');
            this.activeVideoElement.load();
            this.activeVideoElement = null;
        }
    }

    // Resolve playable stream URL, respecting HTTPS contexts
    getPlayableStreamUrl(rawUrl) {
        if (!rawUrl || typeof rawUrl !== 'string') {
            return null;
        }

        const trimmed = rawUrl.trim();
        if (!trimmed) {
            return null;
        }

        if (trimmed.startsWith('https://')) {
            return trimmed;
        }

        if (trimmed.startsWith('//')) {
            return (window.location?.protocol || 'https:') + trimmed;
        }

        if (trimmed.startsWith('http://')) {
            if (window.location?.protocol === 'https:') {
                return null;
            }
            return trimmed;
        }

        if (trimmed.startsWith('/')) {
            const origin = window.location?.origin;
            if (!origin) {
                return null;
            }
            if (origin.startsWith('https://') && window.location?.protocol === 'https:') {
                return null;
            }
            return origin.replace(/\/$/, '') + trimmed;
        }

        return trimmed;
    }

    // Initialize statistics display
    initializeStats() {
        this.statsPanel = document.getElementById('stats') || null;
        this.statsToggleButton = document.querySelector('[data-toggle-stats]') || null;

        const statsBody = this.statsPanel?.querySelector('.stats-body');
        if (statsBody) {
            statsBody.setAttribute('aria-hidden', 'false');
        }

        if (this.statsToggleButton) {
            this.statsToggleButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.toggleStatsPanel();
            });
            this.updateStatsToggleLabel();
        }

        if (window.matchMedia) {
            this.statsMediaQuery = window.matchMedia('(max-width: 768px)');

            if (this.statsMediaQuery.matches) {
                this.toggleStatsPanel(true);
            }

            const handleStatsMediaChange = (event) => {
                if (!this.statsPanel) {
                    return;
                }

                if (event.matches) {
                    this.toggleStatsPanel(true);
                } else if (this.statsCollapsed) {
                    this.toggleStatsPanel(false);
                }
            };

            // Modern browsers support addEventListener, fall back to addListener for older ones
            if (typeof this.statsMediaQuery.addEventListener === 'function') {
                this.statsMediaQuery.addEventListener('change', handleStatsMediaChange);
            } else if (typeof this.statsMediaQuery.addListener === 'function') {
                this.statsMediaQuery.addListener(handleStatsMediaChange);
            }
        }

        console.log('Statistics display initialized');
    }

    // Initialize panel toggles
    initializePanelToggles() {
        const toggleButtons = document.querySelectorAll('[data-toggle-panel]');
        if (!toggleButtons.length) {
            return;
        }

        toggleButtons.forEach((button) => {
            const selector = button.getAttribute('data-toggle-panel');
            if (!selector) {
                return;
            }

            const panel = document.querySelector(selector);
            if (!panel) {
                return;
            }

            const toggles = this.panelToggleMap.get(panel) || [];
            toggles.push(button);
            this.panelToggleMap.set(panel, toggles);

            button.setAttribute('aria-expanded', panel.classList.contains('is-visible') ? 'true' : 'false');

            button.addEventListener('click', (event) => {
                event.preventDefault();
                const isOpen = this.togglePanel(panel);
                toggles.forEach((toggleBtn) => toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false'));
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAllPanels();
            }
        });

        document.addEventListener('click', this.boundOutsideClickHandler);
    }

    // Handle click outside toggle panels
    handleOutsideClick(event) {
        if (!this.panelToggleMap.size) {
            return;
        }

        let shouldClose = false;

        this.panelToggleMap.forEach((toggles, panel) => {
            if (!panel.classList.contains('is-visible')) {
                return;
            }

            const clickedInsidePanel = panel.contains(event.target);
            const clickedToggle = event.target.closest('[data-toggle-panel]');

            if (!clickedInsidePanel && !clickedToggle) {
                this.closePanel(panel);
                toggles.forEach((toggleBtn) => toggleBtn.setAttribute('aria-expanded', 'false'));
                shouldClose = true;
            }
        });

        if (shouldClose) {
            event.stopPropagation();
        }
    }

    // Toggle panel visibility
    togglePanel(panelOrSelector) {
        const panel = typeof panelOrSelector === 'string'
            ? document.querySelector(panelOrSelector)
            : panelOrSelector;

        if (!panel) {
            return false;
        }

        const shouldOpen = !panel.classList.contains('is-visible');

        if (shouldOpen) {
            this.closeAllPanels(panel);
        }

        panel.classList.toggle('is-visible', shouldOpen);
        panel.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');

        if (shouldOpen) {
            const focusable = panel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable && typeof focusable.focus === 'function') {
                focusable.focus({ preventScroll: true });
            }
        }

        return shouldOpen;
    }

    // Close all registered panels
    closeAllPanels(exceptPanel = null) {
        if (!this.panelToggleMap.size) {
            return;
        }

        this.panelToggleMap.forEach((toggles, panel) => {
            if (panel === exceptPanel) {
                return;
            }
            this.closePanel(panel);
            toggles.forEach((toggleBtn) => toggleBtn.setAttribute('aria-expanded', 'false'));
        });
    }

    // Close specific panel
    closePanel(panel) {
        if (!panel || !panel.classList.contains('is-visible')) {
            return;
        }

        panel.classList.remove('is-visible');
        panel.setAttribute('aria-hidden', 'true');
    }

    // Initialize quick action buttons
    initializeQuickActions() {
        const quickActionButtons = document.querySelectorAll('[data-quick-action]');
        if (!quickActionButtons.length) {
            return;
        }

        quickActionButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const action = button.getAttribute('data-quick-action');
                if (!action) {
                    return;
                }
                this.handleQuickAction(action, button);
            });
        });
    }

    // Perform quick action logic
    async handleQuickAction(action, trigger = null) {
        const app = window.cctvApp;

        if (!app || !app.isInitialized) {
            this.showNotification('Aplikasi masih menyiapkan data. Silakan coba lagi sebentar lagi.', 'warning', 2500);
            return;
        }

        const mapManager = app?.mapManager;

        try {
            switch (action) {
                case 'refresh-data':
                    this.setButtonBusy(trigger, true);
                    await app.refreshData();
                    break;

                case 'reset-view':
                    if (!mapManager || !mapManager.markers || !mapManager.markers.length) {
                        this.showNotification('Belum ada kamera yang dapat ditampilkan saat ini.', 'warning', 2500);
                        return;
                    }
                    mapManager.fitToMarkers();
                    this.showNotification('Tampilan peta dikembalikan ke semua kamera.', 'info', 2200);
                    break;

                case 'focus-city':
                    if (!mapManager) {
                        this.showNotification('Peta belum siap digunakan.', 'warning', 2500);
                        return;
                    }
                    mapManager.centerOn(-7.98, 112.62, 13);
                    this.showNotification('Fokus diarahkan ke pusat Kota Malang.', 'info', 2200);
                    break;

                case 'zoom-in':
                case 'zoom-out':
                    if (!mapManager || !mapManager.map) {
                        this.showNotification('Peta belum siap digunakan.', 'warning', 2500);
                        return;
                    }
                    {
                        const step = action === 'zoom-in' ? 1 : -1;
                        const currentZoom = mapManager.getZoom();
                        mapManager.setZoom(currentZoom + step);
                    }
                    break;

                case 'locate':
                    if (!mapManager || !mapManager.map) {
                        this.showNotification('Peta belum siap digunakan.', 'warning', 2500);
                        return;
                    }

                    if (!navigator.geolocation) {
                        this.showNotification('Perangkat Anda tidak mendukung geolokasi.', 'error', 3000);
                        return;
                    }

                    this.setButtonBusy(trigger, true);

                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            this.setButtonBusy(trigger, false);
                            const { latitude, longitude } = position.coords;
                            mapManager.centerOn(latitude, longitude, 16);
                            this.highlightUserLocation(latitude, longitude);
                            this.showNotification('Peta difokuskan ke lokasi Anda.', 'success', 2800);
                        },
                        (error) => {
                            this.setButtonBusy(trigger, false);
                            this.showNotification(`Tidak dapat mengakses lokasi: ${error.message}`, 'error', 3200);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        }
                    );
                    break;

                default:
                    console.warn(`Unhandled quick action: ${action}`);
                    break;
            }
        } catch (error) {
            console.error(`Quick action "${action}" failed:`, error);
            this.showNotification(`Terjadi kesalahan: ${error.message}`, 'error', 3200);
            if (action === 'locate') {
                this.setButtonBusy(trigger, false);
            }
        } finally {
            if (action !== 'locate') {
                this.setButtonBusy(trigger, false);
            }
        }
    }

    // Toggle button busy state
    setButtonBusy(button, isBusy = true) {
        if (!button || !(button instanceof HTMLElement)) {
            return;
        }

        if (isBusy) {
            button.classList.add('is-disabled');
            button.setAttribute('aria-busy', 'true');
            if (button.tagName === 'BUTTON') {
                button.setAttribute('disabled', 'true');
            }
        } else {
            button.classList.remove('is-disabled');
            button.removeAttribute('aria-busy');
            if (button.tagName === 'BUTTON') {
                button.removeAttribute('disabled');
            }
        }
    }

    // Clear existing location marker
    clearLocationMarker() {
        if (this.locationMarker && typeof this.locationMarker.remove === 'function') {
            this.locationMarker.remove();
            this.locationMarker = null;
        }
    }

    // Highlight user location on map
    highlightUserLocation(lat, lon) {
        const app = window.cctvApp;
        if (!app || !app.mapManager || !app.mapManager.map || typeof L === 'undefined') {
            return;
        }

        this.clearLocationMarker();

        this.locationMarker = L.circleMarker([lat, lon], {
            radius: 10,
            weight: 3,
            color: '#0ea5e9',
            fillColor: '#38bdf8',
            fillOpacity: 0.6,
            className: 'user-location-marker'
        });

        this.locationMarker.addTo(app.mapManager.map);
        this.locationMarker.bindPopup('<strong>Lokasi Anda</strong>').openPopup();

        setTimeout(() => {
            this.clearLocationMarker();
        }, 20000);
    }

    // Update statistics display
    updateStatistics(data = null) {
        if (!window.cctvApp || !window.cctvApp.dataManager) {
            return;
        }

        const stats = window.cctvApp.dataManager.getStatistics(data);
        
        // Update DOM elements
        this.updateStatElement('total-cctv', formatNumber(stats.total));
        this.updateStatElement('online-cctv', formatNumber(stats.online));
        this.updateStatElement('offline-cctv', formatNumber(stats.offline));
        this.updateStatElement('intersection-cctv', formatNumber(stats.intersection));
        this.updateStatElement('street-cctv', formatNumber(stats.street));
        this.updateStatElement('district-count', formatNumber(stats.districts));

        const generatedAt = window.cctvApp?.dataManager?.generatedAt
            || window.cctvApp?.dataManager?.summary?.generated_at
            || window.cctvApp?.dataManager?.summary?.generatedAt
            || null;
        this.updateMetaElement('data-updated', formatDateTime(generatedAt));

        const onlinePercentage = stats.total > 0
            ? Math.round((stats.online / stats.total) * 100)
            : 0;

        this.updateMetaElement('badge-total-cctv', `${formatNumber(stats.total)} Kamera aktif`);
        this.updateMetaElement('badge-online-percentage', `${onlinePercentage}% Online`);
        this.updateMetaElement('badge-district-total', `${formatNumber(stats.districts)} Kecamatan`);

        const safePercentage = Math.max(0, Math.min(100, onlinePercentage));

        const progressFill = document.getElementById('stat-online-percentage');
        if (progressFill) {
            progressFill.style.width = `${safePercentage}%`;
        }

        const progressBar = document.querySelector('.stat-progress__bar');
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', String(safePercentage));
        }

        const progressLabel = document.getElementById('stat-online-percentage-label');
        if (progressLabel) {
            progressLabel.textContent = `${safePercentage}%`;
        }
    }

    // Toggle statistics panel
    toggleStatsPanel(forceState = null) {
        if (!this.statsPanel || !this.statsToggleButton) {
            return;
        }

        const shouldCollapse = forceState === null
            ? !this.statsCollapsed
            : Boolean(forceState);

        this.statsCollapsed = shouldCollapse;
        this.statsPanel.classList.toggle('is-collapsed', shouldCollapse);

        const statsBody = this.statsPanel.querySelector('.stats-body');
        if (statsBody) {
            statsBody.setAttribute('aria-hidden', shouldCollapse ? 'true' : 'false');
        }

        this.updateStatsToggleLabel();
    }

    // Update stats toggle labels and aria state
    updateStatsToggleLabel() {
        if (!this.statsToggleButton) {
            return;
        }

        const expanded = !this.statsCollapsed;
        this.statsToggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');

        const label = expanded
            ? 'Sembunyikan statistik'
            : 'Tampilkan statistik';

        const hiddenLabel = this.statsToggleButton.querySelector('.visually-hidden');
        if (hiddenLabel) {
            hiddenLabel.textContent = label;
        }

        this.statsToggleButton.setAttribute('title', label);
        this.statsToggleButton.setAttribute('aria-label', label);
    }

    // Update individual stat element
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Update meta/stat helper
    updateMetaElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Show loading state
    showLoading(message = 'Memuat...') {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = createLoadingElement(message);
            loadingElement.style.display = 'block';
            loadingElement.setAttribute('aria-hidden', 'false');
        }
    }

    // Hide loading state
    hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
            loadingElement.setAttribute('aria-hidden', 'true');
        }
    }

    // Show error message
    showError(message) {
        if (typeof window !== 'undefined' && typeof window.showError === 'function') {
            window.showError(message);
        } else {
            console.error('UI Error:', message);
        }
    }

    // Add notification
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const styles = `
                <style id="notification-styles">
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 4000;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    padding: 15px 20px;
                    max-width: 300px;
                    animation: slideInRight 0.3s ease;
                }
                .notification-info { border-left: 4px solid #17a2b8; }
                .notification-success { border-left: 4px solid #28a745; }
                .notification-warning { border-left: 4px solid #ffc107; }
                .notification-error { border-left: 4px solid #dc3545; }
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }

        // Add to DOM
        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, duration);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Update header information
    updateHeader(title, subtitle) {
        const headerTitle = document.querySelector('.header h1');
        const headerSubtitle = document.querySelector('.header p');
        
        if (headerTitle) headerTitle.textContent = title;
        if (headerSubtitle) headerSubtitle.textContent = subtitle;
    }
}

// Global function for showing CCTV details (called from popup)
function showCCTVDetails(cctvId) {
    if (window.cctvApp && window.cctvApp.uiManager) {
        window.cctvApp.uiManager.showCCTVDetails(cctvId);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}

if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
