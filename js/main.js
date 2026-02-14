// ===========================
// Apple TV Weather App
// - Keyboard navigation for Apple TV Remote
// - Auto-refresh every 5 minutes
// - Remember last selected city
// - Hourly temperature and precipitation
// ===========================

class AppleTVWeatherApp {
    constructor() {
        // State
        this.currentCity = this.loadSavedCity() || 'tokyo';
        this.currentTimeRange = 24;
        this.focusableElements = [];
        this.currentFocusIndex = 0;
        this.isDropdownOpen = false;
        this.weatherData = null;
        this.chart = null;
        this.autoRefreshInterval = null;
        
        // City coordinates
        this.cities = {
            tokyo: { name: '東京', lat: 35.6762, lon: 139.6503 },
            osaka: { name: '大阪', lat: 34.6937, lon: 135.5023 },
            nagoya: { name: '名古屋', lat: 35.1815, lon: 136.9066 },
            sapporo: { name: '札幌', lat: 43.0642, lon: 141.3469 },
            fukuoka: { name: '福岡', lat: 33.5904, lon: 130.4017 },
            sendai: { name: '仙台', lat: 38.2682, lon: 140.8694 },
            hiroshima: { name: '広島', lat: 34.3853, lon: 132.4553 },
            kyoto: { name: '京都', lat: 35.0116, lon: 135.7681 },
            naha: { name: '那覇', lat: 26.2124, lon: 127.6809 },
            okayama: { name: '岡山', lat: 34.6551, lon: 133.9195 }
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('🍎 Initializing Apple TV Weather App...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize focusable elements
        this.updateFocusableElements();
        
        // Load weather data for saved city
        this.loadWeatherData();
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        // Update selected city display
        document.getElementById('selectedCity').textContent = this.cities[this.currentCity].name;
        
        console.log('✅ App initialized successfully');
    }
    
    // ===========================
    // Keyboard Navigation
    // ===========================
    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // City selector
        document.getElementById('citySelector').addEventListener('click', () => this.toggleCityDropdown());
        
        // City options
        document.querySelectorAll('.city-option').forEach(option => {
            option.addEventListener('click', () => this.selectCity(option.dataset.city));
        });
        
        // Time range buttons
        document.getElementById('range24h').addEventListener('click', () => this.setTimeRange(24));
        document.getElementById('range48h').addEventListener('click', () => this.setTimeRange(48));
        
        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => this.loadWeatherData());
        
        // Focus on first element
        setTimeout(() => this.focusElement(0), 100);
    }
    
    handleKeyDown(e) {
        const key = e.key;
        
        // Prevent default for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(key)) {
            e.preventDefault();
        }
        
        switch(key) {
            case 'ArrowRight':
            case 'ArrowDown':
                this.focusNext();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                this.focusPrevious();
                break;
            case 'Enter':
            case ' ':
                this.activateFocusedElement();
                break;
            case 'Escape':
            case 'Backspace':
                this.closeDropdown();
                break;
        }
    }
    
    updateFocusableElements() {
        // Get all focusable elements based on current state
        if (this.isDropdownOpen) {
            // When dropdown is open, only city options are focusable
            this.focusableElements = Array.from(document.querySelectorAll('.city-option'));
        } else {
            // Normal navigation
            this.focusableElements = [
                document.getElementById('citySelector'),
                document.getElementById('range24h'),
                document.getElementById('range48h')
            ];
        }
        
        // Filter out null elements
        this.focusableElements = this.focusableElements.filter(el => el !== null);
    }
    
    focusElement(index) {
        if (this.focusableElements.length === 0) return;
        
        // Remove focus from all elements
        this.focusableElements.forEach(el => {
            el.classList.remove('focused');
            el.blur();
        });
        
        // Ensure index is within bounds
        this.currentFocusIndex = Math.max(0, Math.min(index, this.focusableElements.length - 1));
        
        // Focus the element
        const element = this.focusableElements[this.currentFocusIndex];
        element.classList.add('focused');
        element.focus();
        
        // Scroll into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    focusNext() {
        this.focusElement(this.currentFocusIndex + 1);
    }
    
    focusPrevious() {
        this.focusElement(this.currentFocusIndex - 1);
    }
    
    activateFocusedElement() {
        const element = this.focusableElements[this.currentFocusIndex];
        if (element) {
            element.click();
        }
    }
    
    // ===========================
    // City Selection
    // ===========================
    toggleCityDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
        const dropdown = document.getElementById('cityDropdown');
        
        if (this.isDropdownOpen) {
            dropdown.classList.add('active');
            this.updateFocusableElements();
            this.focusElement(0);
        } else {
            dropdown.classList.remove('active');
            this.updateFocusableElements();
            this.focusElement(0);
        }
    }
    
    closeDropdown() {
        if (this.isDropdownOpen) {
            this.isDropdownOpen = false;
            document.getElementById('cityDropdown').classList.remove('active');
            this.updateFocusableElements();
            this.focusElement(0);
        }
    }
    
    selectCity(cityKey) {
        this.currentCity = cityKey;
        this.saveCity(cityKey);
        document.getElementById('selectedCity').textContent = this.cities[cityKey].name;
        this.closeDropdown();
        this.loadWeatherData();
    }
    
    // ===========================
    // Local Storage
    // ===========================
    saveCity(cityKey) {
        try {
            localStorage.setItem('appleTV_selectedCity', cityKey);
        } catch (e) {
            console.warn('Could not save city to localStorage:', e);
        }
    }
    
    loadSavedCity() {
        try {
            return localStorage.getItem('appleTV_selectedCity');
        } catch (e) {
            console.warn('Could not load city from localStorage:', e);
            return null;
        }
    }
    
    // ===========================
    // Time Range
    // ===========================
    setTimeRange(hours) {
        this.currentTimeRange = hours;
        
        // Update button states
        document.getElementById('range24h').classList.toggle('active', hours === 24);
        document.getElementById('range48h').classList.toggle('active', hours === 48);
        
        // Redraw chart if data exists
        if (this.weatherData) {
            this.drawChart();
        }
    }
    
    // ===========================
    // Weather Data
    // ===========================
    async loadWeatherData() {
        const city = this.cities[this.currentCity];
        
        this.showLoading(true);
        this.hideError();
        
        try {
            // Fetch hourly weather data (past 24h + future 48h)
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?` +
                `latitude=${city.lat}&longitude=${city.lon}` +
                `&hourly=temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m,weather_code` +
                `&past_hours=24&forecast_hours=${this.currentTimeRange}` +
                `&timezone=Asia/Tokyo`
            );
            
            if (!response.ok) {
                throw new Error('Weather API request failed');
            }
            
            const data = await response.json();
            this.weatherData = data;
            
            // Update current weather
            this.updateCurrentWeather(data);
            
            // Draw chart
            this.drawChart();
            
            // Update last update time
            this.updateLastUpdateTime();
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showError('天気データの取得に失敗しました。<br>インターネット接続を確認してください。');
            this.showLoading(false);
        }
    }
    
    updateCurrentWeather(data) {
        const hourly = data.hourly;
        const currentIndex = 24; // Current hour is at index 24 (after 24 past hours)
        
        const currentTemp = hourly.temperature_2m[currentIndex];
        const currentHumidity = hourly.relative_humidity_2m[currentIndex];
        const currentWindSpeed = hourly.wind_speed_10m[currentIndex];
        const currentPrecipitation = hourly.precipitation[currentIndex];
        const weatherCode = hourly.weather_code[currentIndex];
        
        // Update UI
        document.getElementById('currentTemp').textContent = `${Math.round(currentTemp)}°C`;
        document.getElementById('humidity').textContent = `${currentHumidity}%`;
        document.getElementById('windSpeed').textContent = `${currentWindSpeed} m/s`;
        document.getElementById('precipitation').textContent = `${currentPrecipitation} mm`;
        
        // Update weather icon
        this.updateWeatherIcon(weatherCode);
    }
    
    updateWeatherIcon(weatherCode) {
        const iconElement = document.getElementById('weatherIcon').querySelector('i');
        let iconClass = 'fas fa-sun';
        
        // Weather code mapping (WMO Weather interpretation codes)
        if (weatherCode === 0) {
            iconClass = 'fas fa-sun'; // Clear sky
        } else if (weatherCode <= 3) {
            iconClass = 'fas fa-cloud-sun'; // Partly cloudy
        } else if (weatherCode <= 48) {
            iconClass = 'fas fa-cloud'; // Cloudy
        } else if (weatherCode <= 67) {
            iconClass = 'fas fa-cloud-rain'; // Rain
        } else if (weatherCode <= 77) {
            iconClass = 'fas fa-snowflake'; // Snow
        } else if (weatherCode <= 82) {
            iconClass = 'fas fa-cloud-showers-heavy'; // Heavy rain
        } else {
            iconClass = 'fas fa-bolt'; // Thunderstorm
        }
        
        iconElement.className = iconClass;
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
        document.getElementById('lastUpdate').textContent = `最終更新: ${timeString}`;
    }
    
    // ===========================
    // Chart Drawing
    // ===========================
    drawChart() {
        const hourly = this.weatherData.hourly;
        const times = hourly.time;
        const temps = hourly.temperature_2m;
        const precip = hourly.precipitation;
        
        // Current time index
        const currentIndex = 24;
        
        // Split data into past and future
        const pastTimes = times.slice(0, currentIndex + 1);
        const futureTimes = times.slice(currentIndex, currentIndex + this.currentTimeRange + 1);
        
        const pastTemps = temps.slice(0, currentIndex + 1);
        const futureTemps = temps.slice(currentIndex, currentIndex + this.currentTimeRange + 1);
        
        const pastPrecip = precip.slice(0, currentIndex + 1);
        const futurePrecip = precip.slice(currentIndex, currentIndex + this.currentTimeRange + 1);
        
        // Combine for display
        const allTimes = [...pastTimes, ...futureTimes.slice(1)];
        const allTemps = [...pastTemps, ...futureTemps.slice(1)];
        const allPrecip = [...pastPrecip, ...futurePrecip.slice(1)];
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allTimes,
                datasets: [
                    // Past temperature
                    {
                        label: '過去の気温',
                        data: pastTemps.map((temp, i) => ({ x: pastTimes[i], y: temp })),
                        borderColor: '#4fc3f7',
                        backgroundColor: 'rgba(79, 195, 247, 0.1)',
                        borderWidth: 4,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 8,
                        yAxisID: 'y'
                    },
                    // Future temperature
                    {
                        label: '未来の気温',
                        data: futureTemps.map((temp, i) => ({ x: futureTimes[i], y: temp })),
                        borderColor: '#ffd54f',
                        backgroundColor: 'rgba(255, 213, 79, 0.1)',
                        borderWidth: 4,
                        borderDash: [10, 5],
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 8,
                        yAxisID: 'y'
                    },
                    // Past precipitation
                    {
                        label: '過去の降水量',
                        data: pastPrecip.map((rain, i) => ({ x: pastTimes[i], y: rain })),
                        type: 'bar',
                        backgroundColor: 'rgba(63, 81, 181, 0.6)',
                        borderWidth: 0,
                        yAxisID: 'y1',
                        barThickness: 12
                    },
                    // Future precipitation
                    {
                        label: '未来の降水量',
                        data: futurePrecip.map((rain, i) => ({ x: futureTimes[i], y: rain })),
                        type: 'bar',
                        backgroundColor: 'rgba(100, 181, 246, 0.4)',
                        borderWidth: 0,
                        yAxisID: 'y1',
                        barThickness: 12
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleFont: { size: 18, weight: 'bold' },
                        bodyFont: { size: 16 },
                        padding: 20,
                        cornerRadius: 15,
                        displayColors: true,
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].parsed.x);
                                return date.toLocaleString('ja-JP', {
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                });
                            },
                            label: (context) => {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                if (label.includes('気温')) {
                                    return `${label}: ${value.toFixed(1)}°C`;
                                } else {
                                    return `${label}: ${value.toFixed(1)} mm`;
                                }
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            currentTime: {
                                type: 'line',
                                xMin: times[currentIndex],
                                xMax: times[currentIndex],
                                borderColor: 'rgba(255, 50, 50, 0.8)',
                                borderWidth: 3,
                                borderDash: [5, 5],
                                label: {
                                    content: '現在',
                                    enabled: true,
                                    position: 'top',
                                    backgroundColor: 'rgba(255, 50, 50, 0.8)',
                                    color: 'white',
                                    font: { size: 16, weight: 'bold' },
                                    padding: 8,
                                    borderRadius: 8
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'M/d HH:mm'
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 14 },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 12
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: '気温 (°C)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 18, weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 16 }
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: '降水量 (mm)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 18, weight: 'bold' }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 16 }
                        }
                    }
                }
            }
        });
    }
    
    // ===========================
    // Auto Refresh
    // ===========================
    startAutoRefresh() {
        // Refresh every 5 minutes
        this.autoRefreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing weather data...');
            this.loadWeatherData();
        }, 5 * 60 * 1000);
    }
    
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
    
    // ===========================
    // UI Helpers
    // ===========================
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.toggle('active', show);
    }
    
    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        document.getElementById('errorText').innerHTML = message;
        errorEl.classList.add('active');
    }
    
    hideError() {
        document.getElementById('errorMessage').classList.remove('active');
    }
}

// ===========================
// Initialize App
// ===========================
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new AppleTVWeatherApp();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.stopAutoRefresh();
    }
});
