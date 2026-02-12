// CONFIGURATION

const API_KEY = "73ee1f837398bd39b5a63effc41d430b";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM ELEMENTS


const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const currentWeatherDiv = document.getElementById("currentWeather");
const forecastContainer = document.getElementById("forecastContainer");
const forecastSection = document.getElementById("forecastSection");
const errorMessage = document.getElementById("errorMessage");
const recentContainer = document.getElementById("recentContainer");
const recentCitiesSelect = document.getElementById("recentCities");
const body = document.getElementById("body");

// EVENT LISTENERS

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city === "") {
    showError("Please enter a city name.");
    return;
  }
  fetchWeatherByCity(city);
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => showError("Location permission denied.")
  );
});

recentCitiesSelect.addEventListener("change", () => {
  const city = recentCitiesSelect.value;
  fetchWeatherByCity(city);
});

// FETCH WEATHER

async function fetchWeatherByCity(city) {
  try {
    const weatherRes = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}`
    );

    if (!weatherRes.ok) throw new Error("City not found.");

    const weatherData = await weatherRes.json();

    const forecastRes = await fetch(
      `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}`
    );

    const forecastData = await forecastRes.json();

    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    saveRecentCity(city);
    clearError();

  } catch (error) {
    showError(error.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    const weatherRes = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    const weatherData = await weatherRes.json();

    const forecastRes = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    const forecastData = await forecastRes.json();

    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    saveRecentCity(weatherData.name);
    clearError();

  } catch {
    showError("Unable to fetch weather data.");
  }
}

// DISPLAY FUNCTIONS

function displayCurrentWeather(data) {
  const tempC = (data.main.temp - 273.15).toFixed(1);
  const tempF = ((tempC * 9) / 5 + 32).toFixed(1);

  let isCelsius = true;

  currentWeatherDiv.classList.remove("hidden");

  currentWeatherDiv.innerHTML = `
    <h2 class="text-xl font-semibold mb-2">${data.name}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" />
    <p id="temperature" class="text-2xl font-bold">${tempC} °C</p>
    <button id="toggleTemp" class="mt-2 bg-blue-500 text-white px-4 py-1 rounded">
      Toggle °C / °F
    </button>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;

  document.getElementById("toggleTemp").addEventListener("click", () => {
    const tempElement = document.getElementById("temperature");
    if (isCelsius) {
      tempElement.textContent = `${tempF} °F`;
    } else {
      tempElement.textContent = `${tempC} °C`;
    }
    isCelsius = !isCelsius;
  });

  updateBackground(data.weather[0].main);
}

function displayForecast(data) {
  forecastSection.classList.remove("hidden");
  forecastContainer.innerHTML = "";

  const dailyData = data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  dailyData.slice(0, 5).forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString();
    const temp = (day.main.temp - 273.15).toFixed(1);

    const card = `
      <div class="bg-white text-black rounded-lg p-4 shadow">
        <h3 class="font-semibold">${date}</h3>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" />
        <p>Temp: ${temp} °C</p>
        <p>Humidity: ${day.main.humidity}%</p>
        <p>Wind: ${day.wind.speed} m/s</p>
      </div>
    `;

    forecastContainer.innerHTML += card;
  });
}

// RECENT SEARCH STORAGE

function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (!cities.includes(city)) {
    cities.unshift(city);
  }

  cities = cities.slice(0, 5);
  localStorage.setItem("recentCities", JSON.stringify(cities));

  updateRecentDropdown();
}

function updateRecentDropdown() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (cities.length === 0) return;

  recentContainer.classList.remove("hidden");
  recentCitiesSelect.innerHTML = "";

  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesSelect.appendChild(option);
  });
}

updateRecentDropdown();

// ERROR HANDLING

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function clearError() {
  errorMessage.classList.add("hidden");
}

// DYNAMIC BACKGROUND

function updateBackground(condition) {

  let imageUrl = "";

  console.log("Weather condition:", condition);

  if (condition.includes("Clear")||
    condition.includes("Haze")) {
    imageUrl = "sunny.jpg";
  } 
  else if (condition.includes("Rain")) {
    imageUrl = "rainy.jpg";
  } 
  else if (condition.includes("Cloud")) {
    imageUrl = "cloudy.jpg";
  } 
  else if (
           condition.includes("mist")||
          condition.includes("Smoke") ||
          condition.includes("Fog")
        )
         {
           imageUrl = "cloudy.jpg";
          } 
  else if (condition.includes("Thunderstorm")) {
    imageUrl = "storm.jpg";
  } 
  else {
    imageUrl = "default.jpg";
  }

  body.style.backgroundImage = `url('${imageUrl}')`;
  body.style.transition = "background-image 0.5s ease-in-out";

}
body.style.backgroundImage = "url('default.jpg')";

