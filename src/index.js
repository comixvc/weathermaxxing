
import "./styles.css";

const tempData = document.getElementById("tempData");
const feelsLikeData = document.getElementById("feelsLikeData");
const humidityData = document.getElementById("humidityData");
const windData = document.getElementById("windData");
const forecastData = document.getElementById("forecastData");
const searchButton = document.getElementById("searchButton");
const cityInput = document.getElementById("cityInput");
const locationElement = document.getElementById("location");
const dropdown = document.querySelector("#citySuggestions");
const errorMessage = document.getElementById("errorMessage");
const toggleTemp = document.querySelector(".toggle");
const slider = document.querySelector(".slider");

toggleTemp.checked = false; // Set the initial state to Celsius


let data = null;

getCurrentLocation();

toggleTemp.addEventListener("change", () => {
    if (toggleTemp.checked) {
        setTemperature(data, "F");
        slider.textContent = "F";
    } else {
        // Convert temperature to Celsius
        setTemperature(data, "C");
        slider.textContent = "C";
    }
});


async function fetchWeatherData(city) {
  const url = `https://data.api.xweather.com/conditions/${encodeURIComponent(city)}?client_id=hznOzGDKw5OtIz8EL4Db9&client_secret=qZz6RWy8YpiFOChHyAu5wU2T1MyUkeXmglrTMDJB`;
  const response = await fetch(url);
  const data = await response.json();
  console.log("Fetched weather data for city:", city);
  console.log(data);
  return data;
}

async function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const cityandcountry = await getCityAndCountryFromCoordinates(latitude, longitude);
      updateLocation(cityandcountry);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}


async function getCityAndCountryFromCoordinates(latitude, longitude) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
  const response = await fetch(url);
  const data = await response.json();
  const city = data.city || data.locality || "Unknown Location";
  const countryCode = data.countryCode || "Unknown Country";
  return `${city}, ${countryCode}`;
}
                                               


cityInput.addEventListener("input", async () => {
    dropdown.innerHTML = "";
    const query = cityInput.value.trim().split(",")[0];
    if (query.length < 2) {
        dropdown.innerHTML = "";
        return;
    }
    else{
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
        const data = await response.json();
        dropdown.innerHTML = "";
        if (data.results) {
            data.results.forEach((result) => {
                const option = document.createElement("option");
                option.value = `${result.name.toLowerCase()}, ${result.country_code.toLowerCase()}`;
                dropdown.appendChild(option);
            });

        }
        else{
            const option = document.createElement("option");
            option.value = `No results found for the query: ${query}`;
            dropdown.appendChild(option);
        }        
    }
});

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        updateLocation(cityInput.value.trim());
    }
});

searchButton.addEventListener("click", () => {
    updateLocation(cityInput.value.trim());
});

// updateLocation("Tokyo, jp");

async function updateLocation(city) {
    errorMessage.textContent = "";
    try {
        locationElement.textContent = city;
        data = await fetchWeatherData(city);
        setTemperature(data, toggleTemp.checked ? "F" : "C");
        setFeelsLike(data);
        setHumidity(data);
        setWind(data);
        setForecast(data)
    } catch (error) {
        errorMessage.textContent = "Error: Invalid city name or data not available.";
        tempData.textContent = "N/A";
        feelsLikeData.textContent = "N/A";
        humidityData.textContent = "N/A";
        windData.textContent = "N/A";
        forecastData.textContent = "N/A";
    }
}

function setTemperature(data, unit) {
    let temperature = 0;
    const Ctemperature = data.response[0].periods[0].tempC;
    const Ftemperature = data.response[0].periods[0].tempF;
    if (unit === "C") {
        temperature = Ctemperature;
    } else {
        temperature = Ftemperature;
    }
    tempData.textContent = `${temperature}°${unit}`;
}
function setFeelsLike(data) {
    const feelsLike = data.response[0].periods[0].feelslikeC;
    feelsLikeData.textContent = `${feelsLike}°C`;
}
function setHumidity(data) {
    const humidity = data.response[0].periods[0].humidity;
    humidityData.textContent = `${humidity}%`;
}
function setWind(data) {
    const windSpeed = data.response[0].periods[0].windSpeedKPH;
    windData.textContent = `${windSpeed} km/h`;
}
function setForecast(data) {
    const forecast = data.response[0].periods[0].forecast;
    forecastData.textContent = forecast;
}