import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const API_URL = "https://api.open-meteo.com"

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.post('/weather', async(req,res) => {
    const location = req.body.city;
    try{
        const geoResponse = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${process.env.API_KEY}`);
        const geoData = geoResponse.data[0];
        const lat = geoData.lat;
        const lon = geoData.lon;

        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.API_KEY}`);
        const weather = weatherResponse.data;

        res.render('weather.ejs', {
            city: geoData.name,
            weather: {
                temperature: weather.main.temp,
                feelsLike: weather.main.feels_like,
                humidity: weather.main.humidity,
                pressure: weather.main.pressure,
                windspeed: weather.wind.speed,
                weatherDescription: weather.weather[0].description,
            }
        });    
    } catch (error){
        res.status(500).send('Error fetching weather data');
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
  