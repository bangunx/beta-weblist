/**
 * Map management module for CCTV Map Application
 */

class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.markerCluster = null;
        this.currentBounds = null;
        this.isInitialized = false;
        this.performanceManager = null;
    }

    // Initialize the map
    initialize(containerId = 'map', center = [-7.98, 112.62], zoom = 13) {
        try {
            // Create map instance
            this.map = L.map(containerId).setView(center, zoom);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(this.map);

            // Initialize marker cluster group
            this.markerCluster = L.markerClusterGroup({
                chunkedLoading: true,
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true
            });

            // Add event listeners
            this.addMapEventListeners();
            
            this.isInitialized = true;
            console.log('Map initialized successfully');
            
            return this.map;
        } catch (error) {
            console.error('Error initializing map:', error);
            throw new Error('Gagal menginisialisasi peta');
        }
    }

    // Attach performance manager
    setPerformanceManager(performanceManager) {
        this.performanceManager = performanceManager;
    }

    // Add event listeners to map
    addMapEventListeners() {
        // Map click event
        this.map.on('click', (e) => {
            console.log('Map clicked at:', e.latlng);
            this.onMapClick(e);
        });

        // Zoom events
        this.map.on('zoomend', () => {
            this.currentBounds = this.map.getBounds();
            console.log('Zoom level:', this.map.getZoom());
            this.onZoomEnd();
        });

        // Move events
        this.map.on('moveend', () => {
            this.currentBounds = this.map.getBounds();
            this.onMoveEnd();
        });

        // Marker cluster events
        this.markerCluster.on('clusterclick', (e) => {
            console.log('Cluster clicked:', e.layer);
            this.onClusterClick(e);
        });
    }

    // Create marker for CCTV
    createMarker(cctv) {
        if (!isValidCoordinate(cctv.latitude, cctv.longitude)) {
            return null;
        }

        const lat = parseFloat(cctv.latitude);
        const lon = parseFloat(cctv.longitude);
        const statusInfo = getStatusInfo(cctv.status);

        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-${statusInfo.isOnline ? 'online' : 'offline'}"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        // Create marker
        const marker = L.marker([lat, lon], { icon: icon });
        
        // Store CCTV data in marker
        marker.cctvData = cctv;
        
        return marker;
    }

    // Add markers to map
    addMarkers(cctvData) {
        // Clear existing markers
        this.clearMarkers();

        // Create markers for valid CCTVs
        const validCCTVs = cctvData.filter(cctv => 
            isValidCoordinate(cctv.latitude, cctv.longitude)
        );

        console.log('Creating markers for', validCCTVs.length, 'CCTVs');

        validCCTVs.forEach(cctv => {
            const marker = this.performanceManager
                ? this.performanceManager.createOptimizedMarker(cctv)
                : this.createMarker(cctv);

            if (marker) {
                marker.cctvData = cctv;

                // Create popup content
                const popupContent = this.performanceManager
                    ? this.performanceManager.createOptimizedPopupContent(cctv)
                    : this.createPopupContent(cctv);

                marker.bindPopup(popupContent, {
                    maxWidth: 350,
                    className: 'custom-popup'
                });

                this.markers.push(marker);
            }
        });

        // Add markers to cluster group
        this.markerCluster.addLayers(this.markers);
        this.map.addLayer(this.markerCluster);

        // Fit map to show all markers
        if (this.markers.length > 0) {
            this.fitToMarkers();
        }

        console.log('Added', this.markers.length, 'markers to map');
    }

    // Clear all markers
    clearMarkers() {
        if (this.markerCluster) {
            this.map.removeLayer(this.markerCluster);
            this.markerCluster.clearLayers();
        }
        this.markers = [];
    }

    // Filter markers based on criteria
    filterMarkers(filterFunction) {
        const filteredMarkers = this.markers.filter(filterFunction);
        
        // Update cluster group
        this.map.removeLayer(this.markerCluster);
        this.markerCluster = L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 50
        });

        if (filteredMarkers.length > 0) {
            this.markerCluster.addLayers(filteredMarkers);
            this.map.addLayer(this.markerCluster);
            
            // Fit map to filtered markers
            const group = new L.featureGroup(filteredMarkers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }

        return filteredMarkers;
    }

    // Create popup content for CCTV
    createPopupContent(cctv) {
        const statusInfo = getStatusInfo(cctv.status);
        const cameraTypeInfo = getCameraTypeInfo(cctv.camera_type);
        
        const cameraType = cctv.camera_type || 'N/A';
        const priority = cctv.priority || 'Normal';
        const street = cctv.street || 'N/A';
        const district = cctv.district || 'N/A';
        
        const webrtcUrl = cctv.webrtc_url || '';
        const hlsUrl = cctv.hls_url || '';
        
        return `
            <div class="popup-header">
                <div class="popup-title">${cctv.name}</div>
                <div class="popup-status ${statusInfo.class}">${statusInfo.icon} ${statusInfo.text}</div>
            </div>
            <div class="popup-body">
                <div class="popup-info">
                    <strong>📍 Lokasi:</strong> ${street}<br>
                    <strong>🏘️ Kecamatan:</strong> ${district}<br>
                    <strong>📹 Tipe:</strong> ${cameraType}<br>
                    <strong>⭐ Prioritas:</strong> ${priority}
                </div>
                <div class="popup-buttons">
                    ${webrtcUrl ? `<a href="${webrtcUrl}" target="_blank" rel="noopener" class="popup-btn popup-btn-stream">🎬 WebRTC Live</a>` : ''}
                    ${hlsUrl ? `<a href="${hlsUrl}" target="_blank" rel="noopener" class="popup-btn popup-btn-detail">📺 Buka HLS</a>` : ''}
                    <button type="button" onclick="showCCTVDetails('${cctv.id}')" class="popup-btn popup-btn-detail">
                        ℹ️ Detail &amp; Stream
                    </button>
                </div>
            </div>
        `;
    }

    // Fit map to show all markers
    fitToMarkers() {
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // Center map on specific coordinates
    centerOn(lat, lon, zoom = 15) {
        this.map.setView([lat, lon], zoom);
    }

    // Get current map bounds
    getBounds() {
        return this.map.getBounds();
    }

    // Get current zoom level
    getZoom() {
        return this.map.getZoom();
    }

    // Set zoom level
    setZoom(zoom) {
        this.map.setZoom(zoom);
    }

    // Add custom control to map
    addControl(control, position = 'topright') {
        control.addTo(this.map);
    }

    // Remove control from map
    removeControl(control) {
        this.map.removeControl(control);
    }

    // Event handlers (can be overridden)
    onMapClick(e) {
        // Override in parent class or set custom handler
    }

    onZoomEnd() {
        // Override in parent class or set custom handler
    }

    onMoveEnd() {
        // Override in parent class or set custom handler
    }

    onClusterClick(e) {
        // Override in parent class or set custom handler
    }

    // Highlight specific marker
    highlightMarker(cctvId) {
        const marker = this.markers.find(m => m.cctvData.id === cctvId);
        if (marker) {
            marker.openPopup();
            this.centerOn(
                parseFloat(marker.cctvData.latitude),
                parseFloat(marker.cctvData.longitude),
                16
            );
        }
    }

    // Get markers in current view
    getMarkersInView() {
        const bounds = this.map.getBounds();
        return this.markers.filter(marker => {
            const latlng = marker.getLatLng();
            return bounds.contains(latlng);
        });
    }

    // Add heatmap layer (if heatmap library is available)
    addHeatmapLayer(data, options = {}) {
        if (typeof L.heatLayer === 'undefined') {
            console.warn('Heatmap layer not available');
            return null;
        }

        const points = data.map(cctv => [
            parseFloat(cctv.latitude),
            parseFloat(cctv.longitude),
            cctv.status === 1 ? 1 : 0.3 // Online cameras have higher intensity
        ]);

        const heatmapLayer = L.heatLayer(points, {
            radius: options.radius || 25,
            blur: options.blur || 15,
            maxZoom: options.maxZoom || 18,
            ...options
        });

        this.map.addLayer(heatmapLayer);
        return heatmapLayer;
    }

    // Export map as image
    exportMap(format = 'png') {
        // This would require additional libraries like html2canvas
        console.warn('Map export not implemented yet');
        return null;
    }

    // Destroy map instance
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
        this.markerCluster = null;
        this.isInitialized = false;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapManager;
}

if (typeof window !== 'undefined') {
    window.MapManager = MapManager;
}
