/**
 * Main application module for CCTV Map Application
 */

class CCTVApp {
    constructor() {
        this.dataManager = null;
        this.mapManager = null;
        this.uiManager = null;
        this.performanceManager = null;
        this.keyboardManager = null;
        this.isInitialized = false;
    }

    // Initialize the application
    async initialize() {
        try {
            console.log('Initializing CCTV Map Application...');
            
            // Show loading
            if (window.uiManager) {
                window.uiManager.showLoading('Menginisialisasi aplikasi...');
            }

            // Initialize managers
            this.dataManager = new CCTVDataManager();
            this.mapManager = new MapManager();
            this.uiManager = new UIManager();
            this.performanceManager = new PerformanceManager();
            this.keyboardManager = new KeyboardManager();

            this.mapManager.setPerformanceManager(this.performanceManager);

            // Make managers globally available
            window.cctvApp = this;
            window.dataManager = this.dataManager;
            window.mapManager = this.mapManager;
            window.uiManager = this.uiManager;
            window.performanceManager = this.performanceManager;
            window.keyboardManager = this.keyboardManager;

            // Initialize UI first
            this.uiManager.initialize();

            // Load data
            console.log('Loading CCTV data...');
            const cctvData = await this.dataManager.loadData();
            
            // Initialize map
            console.log('Initializing map...');
            this.mapManager.initialize();

            // Add markers to map
            console.log('Adding markers to map...');
            this.mapManager.addMarkers(cctvData);

            // Populate district dropdown
            this.uiManager.populateDistrictFilter(this.dataManager.getCCTVsByDistrict());

            // Update statistics
            this.uiManager.updateStatistics();

            // Hide loading
            this.uiManager.hideLoading();

            this.isInitialized = true;
            console.log('CCTV Map Application initialized successfully');

            // Show success notification
            this.uiManager.showNotification(
                `Berhasil memuat ${formatNumber(cctvData.length)} kamera CCTV`,
                'success',
                3000
            );

        } catch (error) {
            console.error('Error initializing application:', error);
            if (this.uiManager && typeof this.uiManager.showError === 'function') {
                this.uiManager.showError('Gagal menginisialisasi aplikasi: ' + error.message);
            } else if (typeof window !== 'undefined' && typeof window.showError === 'function') {
                window.showError('Gagal menginisialisasi aplikasi: ' + error.message);
            } else {
                alert('Gagal menginisialisasi aplikasi: ' + error.message);
            }
        }
    }

    // Filter markers
    filterMarkers(filter) {
        if (!this.isInitialized) {
            console.warn('Application not initialized');
            return;
        }

        this.uiManager.resetDistrictFilter();
        const filteredData = this.dataManager.setFilter(filter);
        this.mapManager.addMarkers(filteredData);
        this.uiManager.updateStatistics(filteredData);

        // Update UI filter state
        this.uiManager.setActiveFilter(filter);
    }

    // Search CCTVs
    searchCCTVs(query) {
        if (!this.isInitialized) {
            console.warn('Application not initialized');
            return;
        }

        const results = this.dataManager.setSearchQuery(query);
        this.mapManager.addMarkers(results);
        this.uiManager.updateStatistics(results);
    }

    // Get application statistics
    getStatistics() {
        if (!this.dataManager) {
            return null;
        }
        return this.dataManager.getDataSummary();
    }

    // Export data
    exportData(format = 'json') {
        if (!this.dataManager) {
            return null;
        }
        return this.dataManager.exportData(format);
    }

    // Get nearby CCTVs
    getNearbyCCTVs(lat, lon, radiusKm = 5) {
        if (!this.dataManager) {
            return [];
        }
        return this.dataManager.getNearbyCCTVs(lat, lon, radiusKm);
    }

    // Highlight specific CCTV
    highlightCCTV(cctvId) {
        if (!this.mapManager) {
            return;
        }
        this.mapManager.highlightMarker(cctvId);
    }

    // Refresh data
    async refreshData() {
        if (!this.isInitialized) {
            console.warn('Application not initialized');
            return;
        }

        try {
            this.uiManager.showLoading('Memperbarui data...');
            
            const cctvData = await this.dataManager.loadData();
            this.mapManager.addMarkers(cctvData);
            this.uiManager.populateDistrictFilter(this.dataManager.getCCTVsByDistrict());
            this.uiManager.updateStatistics();
            
            this.uiManager.hideLoading();
            this.uiManager.showNotification('Data berhasil diperbarui', 'success');
            
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.uiManager.showError('Gagal memperbarui data: ' + error.message);
        }
    }

    // Reset filters
    resetFilters() {
        if (!this.isInitialized) {
            return;
        }

        this.filterMarkers('all');
        this.uiManager.resetDistrictFilter();

        // Clear search
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.uiManager.hideSearchResults(document.querySelector('.search-results'));
    }

    // Get current view info
    getCurrentViewInfo() {
        if (!this.mapManager) {
            return null;
        }

        const bounds = this.mapManager.getBounds();
        const zoom = this.mapManager.getZoom();
        const markersInView = this.mapManager.getMarkersInView();

        return {
            bounds: {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            },
            zoom: zoom,
            markersInView: markersInView.length,
            center: this.mapManager.map.getCenter()
        };
    }

    // Fit map to specific district
    fitToDistrict(districtName) {
        if (!this.dataManager || !this.mapManager) {
            return;
        }

        const districtCCTVs = this.dataManager.cctvData.filter(cctv => 
            cctv.district === districtName && 
            isValidCoordinate(cctv.latitude, cctv.longitude)
        );

        if (districtCCTVs.length > 0) {
            const coordinates = districtCCTVs.map(cctv => [
                parseFloat(cctv.latitude),
                parseFloat(cctv.longitude)
            ]);

            const bounds = L.latLngBounds(coordinates);
            this.mapManager.map.fitBounds(bounds);
            
            this.uiManager.showNotification(
                `Memfokuskan ke ${districtName} (${districtCCTVs.length} kamera)`,
                'info'
            );
        }
    }

    // Toggle heatmap
    toggleHeatmap() {
        if (!this.mapManager) {
            return;
        }

        // This would require heatmap library
        console.log('Heatmap toggle not implemented yet');
        this.uiManager.showNotification('Fitur heatmap belum tersedia', 'warning');
    }

    // Destroy application
    destroy() {
        if (this.mapManager) {
            this.mapManager.destroy();
        }
        
        this.dataManager = null;
        this.mapManager = null;
        this.uiManager = null;
        this.isInitialized = false;
        
        // Clear global references
        window.cctvApp = null;
        window.dataManager = null;
        window.mapManager = null;
        window.uiManager = null;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = new CCTVApp();
        await app.initialize();
        
        // Keyboard shortcuts are now handled by KeyboardManager

        // Add resize handler
        window.addEventListener('resize', debounce(() => {
            if (app.mapManager && app.mapManager.map) {
                app.mapManager.map.invalidateSize();
            }
        }, 250));

        console.log('CCTV Map Application ready');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Gagal memuat aplikasi: ' + error.message);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CCTVApp;
}
