from geopy.geocoders import Nominatim
import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry
from datetime import datetime, timedelta
import requests


# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after=-1)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)


def get_elevation(lat, lon):
    url = f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}"
    response = requests.get(url)
    data = response.json()
    
    if "results" in data:
        elevation = data["results"][0]["elevation"]
        return elevation
    else:
        return "Elevation data not found"


def get_coordinates(country, county, sub_county):
    geolocator = Nominatim(user_agent="gehhhhbhen", timeout=10)
    location_name = f"{sub_county}, {county}, {country}"
    location = geolocator.geocode(location_name)
    
    if location:
        latitude = location.latitude
        longitude = location.longitude
        elevation = get_elevation(latitude, longitude)
        
        # Set the date range
        start_date = "2023-11-01"
        end_date = "2024-09-01"
        
        print(f"Coordinates for {sub_county}, {county}, {country}: {latitude}, {longitude} at elevation {elevation}m")

        try:
            # Use Open-Meteo for historical data
            weather_data = get_historical_weather(latitude, longitude, start_date, end_date)
        except Exception as e:
            print(f"Error: {e}")
            return e

        process_weather_data(weather_data)

    else:
        return "Location not found"


def get_historical_weather(lat, lon, start_date, end_date):
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": "temperature_2m,humidity_2m,rain_sum"
    }

    # Fetch the weather data
    response = openmeteo.weather_api(url, params=params)
    if response:
        return response[0]
    else:
        raise Exception("Failed to retrieve data")


def process_weather_data(weather_data):
    i, month_no, sum_day, humidity, rainfall_mm = 0, 0, 0, 0, 0
    my_list = []

    hourly = weather_data.Hourly()
    hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
    hourly_humidity_2m = hourly.Variables(1).ValuesAsNumpy()
    hourly_rain_sum = hourly.Variables(2).ValuesAsNumpy()

    for temp, hum, rain in zip(hourly_temperature_2m, hourly_humidity_2m, hourly_rain_sum):
        i += 1
        sum_day += temp
        humidity += hum
        rainfall_mm += rain
        if i == 28:
            month_no += 1
            my_list.append({
                'month': month_no,
                'average_temp': sum_day / 28,
                'average_humidity': humidity / 28,
                'average_rainfall': rainfall_mm / 28
            })
            i, sum_day, humidity, rainfall_mm = 0, 0, 0, 0
    
    print(my_list)
    return my_list


# Example usage
coordinates = get_coordinates('Kenya', 'Machakos', 'Mwala')
print(coordinates)
