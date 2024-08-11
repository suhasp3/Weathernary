import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.post('/weather', async (req, res) => {
    const location = req.body.city;
    try {
        // Geocoding to get latitude and longitude
        const geoResponse = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${process.env.API_KEY}`);
        const geoData = geoResponse.data[0];
        const lat = geoData.lat;
        const lon = geoData.lon;

        // Fetching the 12-hour forecast (consecutive hours)
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=12&appid=${process.env.API_KEY}`);
        const weather = weatherResponse.data;

        // Extracting consecutive hourly data
        const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.API_KEY}`);
        const forecastData = forecastResponse.data.list.slice(0, 12).map(entry => ({
            time: new Date(entry.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(entry.dt * 1000).toLocaleDateString(),
            temp: entry.main.temp,
            icon: entry.weather[0].icon
        }));


        res.render('weather.ejs', {
            city: geoData.name,
            weather: {
                temperature: weather.list[0].main.temp,
                feelsLike: weather.list[0].main.feels_like,
                humidity: weather.list[0].main.humidity,
                pressure: weather.list[0].main.pressure,
                windspeed: weather.list[0].wind.speed,
                weatherDescription: weather.list[0].weather[0].description,
                icon: weather.list[0].weather[0].icon, 
                hourlyData: forecastData // Passing hourly data to the template
            }
        });
    } catch (error) {
        res.status(500).send('Error fetching weather data');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
