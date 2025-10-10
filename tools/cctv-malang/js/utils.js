/**
 * Utility functions for CCTV Map Application
 */

// Parse URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format address for display
function formatAddress(cctv) {
    if (!cctv) return 'N/A';

    const location = cctv.location || {};
    const street = location.street || cctv.street;
    const district = location.district || cctv.district;
    const city = location.city || cctv.city;
    const province = location.province || cctv.province;
    const postalCode = location.postal_code || cctv.postal_code;

    const parts = [];
    if (street) parts.push(street);
    if (district) parts.push(district);
    if (city) parts.push(city);
    if (province) parts.push(province);
    if (postalCode) parts.push(postalCode);
    
    if (parts.length === 0 && location.formatted) {
        return location.formatted;
    }

    return parts.join(', ') || 'N/A';
}

// Validate coordinates
function isValidCoordinate(lat, lon) {
    if (lat === undefined || lat === null || lon === undefined || lon === null) {
        return false;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return false;
    }

    return latitude >= -90 && latitude <= 90 &&
           longitude >= -180 && longitude <= 180;
}

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
        return Infinity;
    }

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Format number with thousands separator
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format coordinates
function formatCoordinates(lat, lon, precision = 5) {
    if (!isValidCoordinate(lat, lon)) {
        return 'N/A';
    }
    return `${parseFloat(lat).toFixed(precision)}, ${parseFloat(lon).toFixed(precision)}`;
}

// Format datetime string
function formatDateTime(value, locale = 'id-ID') {
    if (!value) return '-';

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get status icon and text
function getStatusInfo(status) {
    return {
        isOnline: status === 1,
        icon: status === 1 ? '🟢' : '🔴',
        text: status === 1 ? 'Online' : 'Offline',
        class: status === 1 ? 'status-online' : 'status-offline'
    };
}

// Get camera type info
function getCameraTypeInfo(cameraType) {
    const types = {
        'Persimpangan': { icon: '🚦', color: '#ffc107' },
        'Jalan': { icon: '🛣️', color: '#17a2b8' },
        'default': { icon: '📹', color: '#667eea' }
    };
    
    return types[cameraType] || types.default;
}

// Create loading element
function createLoadingElement(message = 'Memuat...') {
    return `
        <h2>📡 ${message}</h2>
        <div class="spinner" aria-hidden="true"></div>
        <p>Mohon tunggu sebentar.</p>
    `;
}

// Show error message
function showError(message, containerId = 'loading') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <h2>❌ Error</h2>
            <p>${message}</p>
            <button onclick="location.reload()" class="popup-btn">🔄 Reload</button>
        `;
    }
}

// Generate unique ID
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Smooth scroll to element
function scrollToElement(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Local storage helpers
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage not available:', e);
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('LocalStorage not available:', e);
        }
    }
};

// Attach helpers to browser global
if (typeof window !== 'undefined') {
    Object.assign(window, {
        getUrlParameter,
        debounce,
        formatAddress,
        isValidCoordinate,
        calculateDistance,
        formatNumber,
        getStatusInfo,
        getCameraTypeInfo,
        createLoadingElement,
        showError,
        generateId,
        deepClone,
        isInViewport,
        scrollToElement,
        formatCoordinates,
        formatDateTime,
        Storage
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getUrlParameter,
        debounce,
        formatAddress,
        isValidCoordinate,
        calculateDistance,
        formatNumber,
        getStatusInfo,
        getCameraTypeInfo,
        createLoadingElement,
        showError,
        generateId,
        deepClone,
        isInViewport,
        scrollToElement,
        formatCoordinates,
        formatDateTime,
        Storage
    };
}
