/**
 * Performance optimization module for CCTV Map Application
 */

class PerformanceManager {
    constructor() {
        this.markerCache = new Map();
        this.popupCache = new Map();
        this.imageCache = new Map();
        this.debounceTimers = new Map();
        this.animationFrameId = null;
        this.isVisible = true;
        
        this.initVisibilityAPI();
        this.initMemoryManagement();
    }

    // Initialize Page Visibility API
    initVisibilityAPI() {
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                this.isVisible = !document.hidden;
                
                if (this.isVisible) {
                    this.onPageVisible();
                } else {
                    this.onPageHidden();
                }
            });
        }
    }

    // Initialize memory management
    initMemoryManagement() {
        // Periodic cleanup
        setInterval(() => {
            this.cleanupCache();
        }, 30000); // Every 30 seconds

        // Memory pressure handling
        if ('memory' in performance) {
            setInterval(() => {
                this.checkMemoryUsage();
            }, 10000); // Every 10 seconds
        }
    }

    // Debounced function execution
    debounce(key, func, delay = 300) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);

        this.debounceTimers.set(key, timer);
    }

    // Throttled function execution
    throttle(func, delay = 100) {
        let lastCall = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func(...args);
            }
        };
    }

    // Request animation frame with cleanup
    requestAnimationFrame(callback) {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        this.animationFrameId = requestAnimationFrame(() => {
            callback();
            this.animationFrameId = null;
        });
    }

    // Optimize marker creation
    createOptimizedMarker(cctv) {
        const cacheKey = `${cctv.id}_${cctv.status}`;
        
        if (this.markerCache.has(cacheKey)) {
            return this.markerCache.get(cacheKey);
        }

        const marker = this.createMarker(cctv);
        this.markerCache.set(cacheKey, marker);
        
        return marker;
    }

    // Create marker with performance optimizations
    createMarker(cctv) {
        if (!isValidCoordinate(cctv.latitude, cctv.longitude)) {
            return null;
        }

        const lat = parseFloat(cctv.latitude);
        const lon = parseFloat(cctv.longitude);
        const statusInfo = getStatusInfo(cctv.status);

        // Use lightweight icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-${statusInfo.isOnline ? 'online' : 'offline'}"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        const marker = L.marker([lat, lon], { 
            icon: icon,
            riseOnHover: false, // Disable for better performance
            keyboard: false     // Disable keyboard navigation
        });
        
        marker.cctvData = cctv;
        
        return marker;
    }

    // Optimize popup content creation
    createOptimizedPopupContent(cctv) {
        const cacheKey = `${cctv.id}_popup`;
        
        if (this.popupCache.has(cacheKey)) {
            return this.popupCache.get(cacheKey);
        }

        const content = this.createPopupContent(cctv);
        this.popupCache.set(cacheKey, content);
        
        return content;
    }

    // Create popup content with optimizations
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

    // Batch DOM updates
    batchDOMUpdates(updates) {
        this.requestAnimationFrame(() => {
            updates.forEach(update => {
                if (typeof update === 'function') {
                    update();
                }
            });
        });
    }

    // Optimize search with virtual scrolling
    optimizeSearch(query, results, container, maxVisible = 10) {
        if (results.length <= maxVisible) {
            return this.displaySearchResults(results, container);
        }

        // Implement virtual scrolling for large result sets
        const visibleResults = results.slice(0, maxVisible);
        const hasMore = results.length > maxVisible;
        
        let html = visibleResults.map(cctv => {
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

        if (hasMore) {
            html += `<div class="search-result-item" style="text-align: center; color: #666; font-style: italic;">
                ... dan ${results.length - maxVisible} hasil lainnya
            </div>`;
        }

        container.innerHTML = html;
        container.style.display = 'block';
    }

    // Display search results with performance optimizations
    displaySearchResults(results, container) {
        if (!results.length) {
            container.innerHTML = '<div class="search-result-item">Tidak ada hasil ditemukan</div>';
            container.style.display = 'block';
            return;
        }

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        results.forEach(cctv => {
            const statusInfo = getStatusInfo(cctv.status);
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.setAttribute('data-cctv-id', cctv.id);
            item.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 4px;">${cctv.name}</div>
                <div style="font-size: 0.85em; color: #666;">
                    ${statusInfo.icon} ${statusInfo.text} • ${cctv.district} • ${cctv.camera_type}
                </div>
            `;
            
            // Add click handler
            item.addEventListener('click', () => {
                const cctvId = item.getAttribute('data-cctv-id');
                this.selectSearchResult(cctvId);
            });
            
            fragment.appendChild(item);
        });

        container.innerHTML = '';
        container.appendChild(fragment);
        container.style.display = 'block';
    }

    // Select search result with optimization
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

    // Hide search results
    hideSearchResults(container) {
        if (container) {
            container.style.display = 'none';
        }
    }

    // Optimize marker clustering
    optimizeMarkerClustering(markers, options = {}) {
        const defaultOptions = {
            chunkedLoading: true,
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            disableClusteringAtZoom: 16,
            ...options
        };

        return L.markerClusterGroup(defaultOptions);
    }

    // Lazy load images
    lazyLoadImage(img, src) {
        if (this.imageCache.has(src)) {
            img.src = this.imageCache.get(src);
            return;
        }

        const imageLoader = new Image();
        imageLoader.onload = () => {
            img.src = src;
            this.imageCache.set(src, src);
        };
        imageLoader.src = src;
    }

    // Cleanup cache
    cleanupCache() {
        // Limit cache sizes
        const maxCacheSize = 100;
        
        if (this.markerCache.size > maxCacheSize) {
            const entries = Array.from(this.markerCache.entries());
            const toDelete = entries.slice(0, entries.length - maxCacheSize);
            toDelete.forEach(([key]) => this.markerCache.delete(key));
        }

        if (this.popupCache.size > maxCacheSize) {
            const entries = Array.from(this.popupCache.entries());
            const toDelete = entries.slice(0, entries.length - maxCacheSize);
            toDelete.forEach(([key]) => this.popupCache.delete(key));
        }

        if (this.imageCache.size > maxCacheSize) {
            const entries = Array.from(this.imageCache.entries());
            const toDelete = entries.slice(0, entries.length - maxCacheSize);
            toDelete.forEach(([key]) => this.imageCache.delete(key));
        }
    }

    // Check memory usage
    checkMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const usedMB = memory.usedJSHeapSize / 1024 / 1024;
            const totalMB = memory.totalJSHeapSize / 1024 / 1024;
            
            // If memory usage is high, trigger cleanup
            if (usedMB / totalMB > 0.8) {
                console.warn('High memory usage detected, triggering cleanup');
                this.forceCleanup();
            }
        }
    }

    // Force cleanup
    forceCleanup() {
        this.markerCache.clear();
        this.popupCache.clear();
        this.imageCache.clear();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    // Page visibility handlers
    onPageVisible() {
        console.log('Page became visible, resuming operations');
        // Resume any paused operations
    }

    onPageHidden() {
        console.log('Page became hidden, pausing operations');
        // Pause non-essential operations to save resources
        this.cleanupCache();
    }

    // Get performance metrics
    getPerformanceMetrics() {
        const metrics = {
            markerCacheSize: this.markerCache.size,
            popupCacheSize: this.popupCache.size,
            imageCacheSize: this.imageCache.size,
            isVisible: this.isVisible
        };

        if ('memory' in performance) {
            const memory = performance.memory;
            metrics.memoryUsage = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit
            };
        }

        return metrics;
    }

    // Destroy performance manager
    destroy() {
        // Clear all timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();

        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Clear caches
        this.markerCache.clear();
        this.popupCache.clear();
        this.imageCache.clear();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceManager;
}

if (typeof window !== 'undefined') {
    window.PerformanceManager = PerformanceManager;
}
