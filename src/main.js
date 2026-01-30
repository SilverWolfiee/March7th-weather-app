const BACKEND = import.meta.env.VITE_BACKEND_URL 

let currentTempC = 0;  
let isCelsius = true;
async function initWeatherApp() {
    const locText = document.getElementById('location-text');
    
    if ("geolocation" in navigator) {
        locText.innerText = "Finding...";
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherData(lat, lon);
            
        }, (error) => {
            console.error("GPS Error, falling back to IP:", error.message);
            fetchLocationByIP(); 
        }, { 
            enableHighAccuracy: true, 
            timeout: 35000, 
            maximumAge: 0 
        });
    } else {
        fetchLocationByIP();
    }
    setupUnitButtons();
}

//fallback if geolocation fails
async function fetchLocationByIP() {
    try {
        const response = await fetch('http://ip-api.com/json/');
        const data = await response.json();
        document.getElementById('location-text').innerText = data.city;
        fetchWeatherData(data.lat, data.lon);
    } catch (e) {
        document.getElementById('location-text').innerText = "Connection Error";
    }
}

async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(`${BACKEND}/weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        
      
        document.getElementById('location-text').innerText = data.location;
        
        updateWeatherUI(data.temperature, data.condition, data.theme);
        renderForecast(data.forecast);
    } catch (e) {
        console.error("Elysia is offline!");
        document.getElementById('location-text').innerText = "Astral Express";
    }
}
function renderForecast(forecastData) {
    const container = document.getElementById('forecast-text')
    if (!container || !forecastData || forecastData.length === 0) return
    const boxHeight = 110
    const columnWidth = 50
    const totalWidth = Math.max(forecastData.length * columnWidth, 200)
    container.innerHTML = ''
    container.className = 'forecast-scroll'
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("width", totalWidth)
    svg.setAttribute("height", boxHeight)
    svg.style.display = "block"
    const baseline = 80
    const points = forecastData.map((hour, index) => {
        const x = (index * columnWidth) + (columnWidth / 2)
        const y = baseline - (hour.chance * 0.6)
        return { x, y, chance: hour.chance, time: hour.time }
    })
    let linePathD = `M ${points[0].x},${points[0].y}`
    let areaPathD = `M ${points[0].x},${points[0].y}`
    points.forEach((p, i) => {
        if (i === 0) return
        linePathD += ` L ${p.x},${p.y}`
        areaPathD += ` L ${p.x},${p.y}`
    })
    areaPathD += ` L ${points[points.length - 1].x},${baseline} L ${points[0].x},${baseline} Z`
    const area = document.createElementNS(svgNS, "path")
    area.setAttribute("d", areaPathD)
    area.setAttribute("fill", "rgba(255, 255, 255, 0.2)")
    area.setAttribute("stroke", "none")
    svg.appendChild(area)
    const line = document.createElementNS(svgNS, "path")
    line.setAttribute("d", linePathD)
    line.setAttribute("fill", "none")
    line.setAttribute("stroke", "#fff")
    line.setAttribute("stroke-width", "2")
    svg.appendChild(line)
    points.forEach(p => {
        const circle = document.createElementNS(svgNS, "circle")
        circle.setAttribute("cx", p.x)
        circle.setAttribute("cy", p.y)
        circle.setAttribute("r", "3")
        circle.setAttribute("fill", "#fff")
        svg.appendChild(circle)
        const textPerc = document.createElementNS(svgNS, "text")
        textPerc.setAttribute("x", p.x)
        textPerc.setAttribute("y", p.y - 10)
        textPerc.setAttribute("text-anchor", "middle")
        textPerc.setAttribute("fill", "#fff")
        textPerc.setAttribute("font-family", "Jaro")
        textPerc.setAttribute("font-size", "12px")
        textPerc.textContent = `${p.chance}%`
        svg.appendChild(textPerc)
        const textTime = document.createElementNS(svgNS, "text")
        textTime.setAttribute("x", p.x)
        textTime.setAttribute("y", 98)
        textTime.setAttribute("text-anchor", "middle")
        textTime.setAttribute("fill", "#fff")
        textTime.setAttribute("font-family", "Jaro")
        textTime.setAttribute("font-size", "11px")
        textTime.textContent = p.time
        svg.appendChild(textTime)
    })
    container.appendChild(svg)
}
function updateWeatherUI(temp, condition, themeClass) {
    const frame = document.getElementById('app-frame');
    const tempDisplay = document.getElementById('temp-display');
    const condDisplay = document.getElementById('condition-display');
    const weatherIcon = document.getElementById('weather-icon');
    const chibiImg = document.getElementById('chibi-img');
    currentTempC = temp;
    renderTemperature();
    condDisplay.innerText = condition;
    tempDisplay.innerHTML = `${temp}&deg;C`;
    condDisplay.innerText = condition;

    
    if (themeClass === 'overcast-day') {
        weatherIcon.src = '/assets/overcast.png'; 
        chibiImg.src = '/assets/march-chibi-sleeping.png'; 
    } 
    else if(themeClass==='overcast-night'){
        weatherIcon.src = '/assets/overcast.png'; 
        chibiImg.src = '/assets/march-chibi-sleeping.png'; 
    }
    else if(themeClass==='rainy-day'){
        weatherIcon.src = '/assets/rainy.png'
        chibiImg.src = '/assets/evernight-rainy.png'
    }
    else if(themeClass==='rainy-night'){
        weatherIcon.src = '/assets/rainy.png'
        chibiImg.src = '/assets/evernight-rainy.png'
    }
    else if(themeClass==='Thunderstorm-day'){
        weatherIcon.src = '/assets/thunderstorm.png'
        chibiImg.src = '/assets/thunderstorm-evernight.png'
    }
    else if(themeClass==='Thunderstorm-night'){
        weatherIcon.src = '/assets/thunderstorm.png'
        chibiImg.src = '/assets/thunderstorm-evernight.png'
    }
    else if(themeClass === 'partially-cloudy-day'){
        weatherIcon.src = '/assets/cloudy-day.png'
        chibiImg.src = '/assets/march-framing.png'
    }
    else if(themeClass === 'partially-cloudy-night'){
        weatherIcon.src = '/assets/cloudy-night.png'
        chibiImg.src = '/assets/march-framing.png'
    }
    else {// Fallback to Sunny
        weatherIcon.src = '/assets/sun.svg';
        chibiImg.src = '/assets/march-chibi.png';
    }
    
    frame.className = `app-frame ${themeClass}`;
    frame.style.opacity = '1';
}
function renderTemperature() {
    const tempDisplay = document.getElementById('temp-display');
    
    if (isCelsius) {
        tempDisplay.innerHTML = `${Math.round(currentTempC)}&deg;C`;
    } else {
        const tempF = (currentTempC * 9/5) + 32;
        tempDisplay.innerHTML = `${Math.round(tempF)}&deg;F`;
    }
}
function setupUnitButtons() {
    const btnC = document.getElementById('btn-c');
    const btnF = document.getElementById('btn-f');
    btnC.addEventListener('click', () => {
        if (!isCelsius) {
            isCelsius = true;
            renderTemperature();
        }
    });
    btnF.addEventListener('click', () => {
        if (isCelsius) {
            isCelsius = false;
            renderTemperature();
        }
    });
}
initWeatherApp();
setInterval(()=>{
    initWeatherApp()
}, 60000)