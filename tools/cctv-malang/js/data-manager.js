/**
 * Data management module for CCTV Map Application
 */

let utilsModule = {};

if (typeof module !== 'undefined' && module.exports) {
    try {
        utilsModule = require('./utils');
    } catch (error) {
        utilsModule = {};
    }
}

const isValidCoordinateHelper = (typeof isValidCoordinate === 'function')
    ? isValidCoordinate
    : utilsModule.isValidCoordinate;

const calculateDistanceHelper = (typeof calculateDistance === 'function')
    ? calculateDistance
    : utilsModule.calculateDistance;

class CCTVDataManager {
    constructor() {
        this.cctvData = [];
        this.filteredData = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.summary = null;
        this.generatedAt = null;
        this.currentDistrict = 'all';
    }

    // Load CCTV data from embedded JSON
    async loadData() {
        try {
            // Try to load from embedded data first
            if (typeof cctvData !== 'undefined' && cctvData) {
                const { cameras, summary, generatedAt } = this.flattenCCTVData(cctvData);
                this.cctvData = cameras;
                this.summary = summary;
                this.generatedAt = generatedAt;
                console.log('Loaded CCTV data from embedded source:', this.cctvData.length, 'cameras');
                return this.cctvData;
            }

            // Fallback: try to fetch from external file
            const response = await fetch('./data/cctv_organized.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jsonData = await response.json();
            const { cameras, summary, generatedAt } = this.flattenCCTVData(jsonData);
            this.cctvData = cameras;
            this.summary = summary;
            this.generatedAt = generatedAt;
            console.log('Loaded CCTV data from file:', this.cctvData.length, 'cameras');
            return this.cctvData;
        } catch (error) {
            console.error('Error loading CCTV data:', error);
            throw new Error('Gagal memuat data CCTV');
        }
    }

    // Flatten nested JSON structure
    flattenCCTVData(nestedData) {
        if (!nestedData) {
            return { cameras: [], summary: null };
        }

        const cameras = [];
        let summary = null;
        let generatedAt = null;

        const pushCamera = (camera, defaultDistrict = '') => {
            const normalized = this.normalizeCamera(camera, defaultDistrict);
            if (normalized) {
                cameras.push(normalized);
            }
        };

        if (nestedData.summary && Array.isArray(nestedData.districts)) {
            summary = nestedData.summary;
            generatedAt = nestedData.generated_at || nestedData.generatedAt || null;
            if (summary && generatedAt && !summary.generated_at) {
                summary.generated_at = generatedAt;
            }
            nestedData.districts.forEach(district => {
                const districtName = district.name || district.district || '';
                (district.cameras || []).forEach(camera => pushCamera(camera, districtName));
            });
        } else if (Array.isArray(nestedData)) {
            nestedData.forEach(camera => pushCamera(camera));
        } else if (typeof nestedData === 'object') {
            Object.keys(nestedData).forEach(districtName => {
                const items = nestedData[districtName];
                if (Array.isArray(items)) {
                    items.forEach(camera => pushCamera(camera, districtName));
                }
            });
        }

        return { cameras, summary, generatedAt };
    }

    // Normalize CCTV record into a consistent shape
    normalizeCamera(camera, fallbackDistrict = '') {
        if (!camera || typeof camera !== 'object') {
            return null;
        }

        const attributes = camera.attributes || {};
        const location = camera.location || {};
        const stream = camera.stream || {};
        const metadata = camera.metadata || {};

        const toSlug = (value) => {
            const base = clean(value);
            if (!base) return '';
            return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        };

        const statusCode = typeof camera.status === 'object'
            ? (camera.status.is_online ? 1 : 0)
            : Number(camera.status);

        const priority = attributes.priority || camera.priority || 'Normal';

        const toFloat = (value) => {
            if (value === null || value === undefined || value === '') return null;
            const num = typeof value === 'string' ? parseFloat(value) : Number(value);
            return Number.isFinite(num) ? parseFloat(num.toFixed(8)) : null;
        };

        const clean = (value) => {
            if (typeof value !== 'string') {
                return value == null ? '' : value;
            }
            return value.replace(/\s+/g, ' ').trim();
        };

        const lat = location.coordinates ? location.coordinates.lat : camera.latitude;
        const lng = location.coordinates ? location.coordinates.lng : camera.longitude;

        const districtName = clean(location.district || camera.district || fallbackDistrict);

        return {
            id: camera.id,
            name: clean(camera.name),
            status: Number.isNaN(statusCode) ? 0 : statusCode,
            status_label: typeof camera.status === 'object' ? camera.status.label : (statusCode === 1 ? 'Online' : 'Offline'),
            stream_id: stream.id || camera.stream_id || '',
            host: stream.host || camera.host || '',
            isIntersection: typeof attributes.is_intersection === 'boolean' ? attributes.is_intersection : Boolean(camera.isIntersection),
            isPublic: typeof attributes.is_public === 'boolean' ? attributes.is_public : Boolean(camera.isPublic),
            created_at: metadata.created_at || camera.created_at || '',
            updated_at: metadata.updated_at || camera.updated_at || '',
            street: clean(location.street || camera.street),
            area: clean(location.area || camera.area),
            district: districtName,
            district_slug: location.slug || attributes.slug || toSlug(districtName),
            city: clean(location.city || camera.city),
            province: clean(location.province || camera.province),
            postal_code: clean(location.postal_code || camera.postal_code),
            formatted_address: clean(location.formatted || camera.formatted_address || camera.street),
            camera_type: clean(attributes.camera_type || camera.camera_type),
            location_type: clean(location.type || camera.location_type),
            priority: clean(priority),
            latitude: toFloat(lat),
            longitude: toFloat(lng),
            coordinates: {
                lat: toFloat(lat),
                lng: toFloat(lng)
            },
            webrtc_url: stream.webrtc || camera.webrtc_url || '',
            hls_url: stream.hls || camera.hls_url || '',
            stream,
            location: {
                ...location,
                coordinates: {
                    lat: toFloat(lat),
                    lng: toFloat(lng)
                }
            },
            attributes: {
                camera_type: clean(attributes.camera_type || camera.camera_type),
                priority: clean(priority),
                is_intersection: typeof attributes.is_intersection === 'boolean'
                    ? attributes.is_intersection
                    : Boolean(camera.isIntersection),
                is_public: typeof attributes.is_public === 'boolean'
                    ? attributes.is_public
                    : Boolean(camera.isPublic)
            },
            metadata: {
                created_at: metadata.created_at || camera.created_at || '',
                updated_at: metadata.updated_at || camera.updated_at || '',
                district_category: metadata.district_category || camera.district_category || '',
                tags: Array.isArray(metadata.tags) ? metadata.tags : []
            },
            raw: camera
        };
    }

    // Filter data based on current criteria
    filterData() {
        let filtered = [...this.cctvData];

        if (this.currentDistrict && this.currentDistrict !== 'all') {
            const districtTarget = this.currentDistrict.toLowerCase();
            filtered = filtered.filter(cctv => {
                const slug = (cctv.district_slug || '').toLowerCase();
                const name = (cctv.district || '').toLowerCase();
                return slug === districtTarget || name === districtTarget;
            });
        }

        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(cctv => 
                cctv.name.toLowerCase().includes(query) ||
                cctv.street.toLowerCase().includes(query) ||
                cctv.district.toLowerCase().includes(query) ||
                cctv.camera_type.toLowerCase().includes(query)
            );
        }

        // Apply status/type filter
        switch (this.currentFilter) {
            case 'online':
                filtered = filtered.filter(cctv => cctv.status === 1);
                break;
            case 'offline':
                filtered = filtered.filter(cctv => cctv.status === 0);
                break;
            case 'intersection':
                filtered = filtered.filter(cctv => cctv.camera_type === 'Persimpangan');
                break;
            case 'street':
                filtered = filtered.filter(cctv => cctv.camera_type === 'Jalan');
                break;
            case 'all':
            default:
                // No additional filtering
                break;
        }

        this.filteredData = filtered;
        return this.filteredData;
    }

    // Set search query
    setSearchQuery(query) {
        this.searchQuery = query;
        return this.filterData();
    }

    // Set filter type
    setFilter(filter) {
        this.currentFilter = filter;
        return this.filterData();
    }

    // Set active district filter
    setDistrict(districtValue = 'all') {
        this.currentDistrict = (districtValue || 'all').toLowerCase();
        return this.filterData();
    }

    // Get valid CCTVs (with coordinates)
    getValidCCTVs(data = null) {
        const sourceData = data || this.filteredData;
        if (!isValidCoordinateHelper) {
            return [...sourceData];
        }

        return sourceData.filter(cctv => 
            isValidCoordinateHelper(cctv.latitude, cctv.longitude)
        );
    }

    // Get statistics
    getStatistics(data = null) {
        const sourceData = data || this.cctvData;
        const validCCTVs = this.getValidCCTVs(sourceData);
        
        return {
            total: validCCTVs.length,
            online: validCCTVs.filter(c => c.status === 1).length,
            offline: validCCTVs.filter(c => c.status === 0).length,
            intersection: validCCTVs.filter(c => c.camera_type === 'Persimpangan').length,
            street: validCCTVs.filter(c => c.camera_type === 'Jalan').length,
            districts: [...new Set(validCCTVs.map(c => c.district))].length
        };
    }

    // Get CCTVs by district
    getCCTVsByDistrict() {
        const districts = {};
        this.cctvData.forEach(cctv => {
            if (!districts[cctv.district]) {
                districts[cctv.district] = [];
            }
            districts[cctv.district].push(cctv);
        });
        return districts;
    }

    // Find CCTV by ID
    findCCTVById(id) {
        return this.cctvData.find(cctv => cctv.id === id);
    }

    // Search CCTVs with advanced options
    searchCCTVs(query, options = {}) {
        const {
            includeOffline = true,
            maxResults = 50,
            sortBy = 'name'
        } = options;

        let results = this.cctvData.filter(cctv => {
            // Skip offline if requested
            if (!includeOffline && cctv.status === 0) {
                return false;
            }

            // Search in multiple fields
            const searchFields = [
                cctv.name,
                cctv.street,
                cctv.district,
                cctv.camera_type,
                cctv.formatted_address
            ].join(' ').toLowerCase();

            return searchFields.includes(query.toLowerCase());
        });

        // Sort results
        results.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'status':
                    return b.status - a.status; // Online first
                case 'priority':
                    const priorityOrder = { 'Tinggi': 3, 'Sedang': 2, 'Normal': 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                default:
                    return 0;
            }
        });

        return results.slice(0, maxResults);
    }

    // Get nearby CCTVs
    getNearbyCCTVs(lat, lon, radiusKm = 5) {
        if (!calculateDistanceHelper) {
            return [];
        }

        return this.cctvData.filter(cctv => {
            if (!isValidCoordinateHelper || !isValidCoordinateHelper(cctv.latitude, cctv.longitude)) {
                return false;
            }
            
            const distance = calculateDistanceHelper(
                lat, lon,
                parseFloat(cctv.latitude),
                parseFloat(cctv.longitude)
            );
            
            return distance <= radiusKm;
        }).sort((a, b) => {
            const distA = calculateDistanceHelper(
                lat, lon,
                parseFloat(a.latitude),
                parseFloat(a.longitude)
            );
            const distB = calculateDistanceHelper(
                lat, lon,
                parseFloat(b.latitude),
                parseFloat(b.longitude)
            );
            return distA - distB;
        });
    }

    // Export data for external use
    exportData(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.cctvData, null, 2);
            case 'csv':
                return this.convertToCSV(this.cctvData);
            default:
                return this.cctvData;
        }
    }

    // Convert to CSV format
    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    `"${(row[header] || '').toString().replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    // Get data summary
    getDataSummary() {
        const stats = this.getStatistics();
        const districts = this.getCCTVsByDistrict();
        
        return {
            totalCCTVs: stats.total,
            onlineCCTVs: stats.online,
            offlineCCTVs: stats.offline,
            totalDistricts: stats.districts,
            districtBreakdown: Object.keys(districts).map(district => ({
                name: district,
                count: districts[district].length,
                online: districts[district].filter(c => c.status === 1).length
            })),
            lastUpdated: this.generatedAt || (this.summary && this.summary.generated_at) || new Date().toISOString()
        };
    }
}

// Export for module usage / browser global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CCTVDataManager;
}

if (typeof window !== 'undefined') {
    window.CCTVDataManager = CCTVDataManager;
}
