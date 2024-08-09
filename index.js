import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const API_URL = "https://api.open-meteo.com"

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.post('/weather', async(req,res) => {
    const city = req.body.city;
    try{
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        const location = geoResponse.data.results[0];
        const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`);
        const weather = weatherResponse.data.current_weather;

        const weatherDescription = getWeatherDescription(weather.weathercode);

        res.render('weather.ejs', {city: location.name, weather: weather, weatherDescription: weatherDescription});
    } catch (error){
        res.status(500).send('Error fetching weather data');
    }
})

function getWeatherDescription(code) {
    switch (code) {
      case 0:
        return 'Clear/Sunny';
      case 1:
        return 'Mainly Clear';
      case 2:
        return 'Partly Cloudy';
      case 3:
        return 'Overcast';
      case 45:
        return 'Foggy';
      case 48:
        return 'Depositing Rime Fog';
      case 51:
      case 53:
      case 55:
        return 'Drizzle';
      case 56:
      case 57:
        return 'Freezing Drizzle';
      case 61:
      case 63:
      case 65:
        return 'Rainy';
      case 66:
      case 67:
        return 'Freezing Rain';
      case 71:
      case 73:
      case 75:
        return 'Snowy';
      case 77:
        return 'Snow Grains';
      case 80:
        return 'Rain Showers';
      case 81:
      case 82:
        return 'Heavy Rain Showers';
      case 85:
      case 86:
        return 'Snow Showers';
      case 95:
        return 'Thunderstorms';
      case 96:
      case 99:
        return 'Thunderstorms with Hail';
      default:
        return 'Unknown';
    }
  }
  

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
  