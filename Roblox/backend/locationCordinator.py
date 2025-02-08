# from geopy.geocoders import Nominatim

# def get_coordinates(country, county, sub_county):
#     # Initialize the geolocator
#     geolocator = Nominatim(user_agent="geoapiExercises")
    
#     # Combine the location details into a single string
#     location_name = f"{sub_county}, {county}, {country}"
    
#     # Use the geolocator to get the location details
#     location = geolocator.geocode(location_name)
    
#     if location:
#         return (location.latitude, location.longitude)
#     else:
#         return "Location not found"

# # Example usage
# country = "Kenya"
# county = "Machakos"
# sub_county = "Mwala"

# coordinates = get_coordinates(country, county, sub_county)
# print(f"Coordinates for {sub_county}, {county}, {country}: {coordinates}")

from geopy.geocoders import Nominatim
import requests
from meteostat import Point, Daily
from datetime import datetime
import pandas as pd
import requests
from datetime import datetime, timedelta

    
def get_elevation(lat, lon):
    url = f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}"
    
    response = requests.get(url)
    data = response.json()
    
    if "results" in data:
        elevation = data["results"][0]["elevation"]
        return elevation
    else:
        return "Elevation data not found"



# from geopy.geocoders import Nominatim

# def get_coordinates(country, county, sub_county):
#     # Initialize the geolocator
#     geolocator = Nominatim(user_agent="geoapiExercises")
    
#     # Combine the location details into a single string
#     location_name = f"{sub_county}, {county}, {country}"
    
#     # Use the geolocator to get the location details
#     location = geolocator.geocode(location_name)
    
#     if location:
#         return (location.latitude, location.longitude)
#     else:
#         return "Location not found"

# # Example usage
# country = "Kenya"
# county = "Machakos"
# sub_county = "Mwala"

# coordinates = get_coordinates(country, county, sub_county)
# print(f"Coordinates for {sub_county}, {county}, {country}: {coordinates}")


def get_coordinates(country, county, sub_county):
    geolocator = Nominatim(user_agent="brianjhfng", timeout=10)
    
    location_name = f"{sub_county}, {county}, {country}"
    
    location = geolocator.geocode(location_name)
    
    if location:
        latitude = location.latitude
        longitude = location.longitude
        
        # Fetch elevation using Google Maps Elevation API
        elevation = get_elevation(latitude, longitude)
        start_date = datetime(2023, 10, 1)
        end_date = datetime(2024, 9, 1)
        print(longitude,latitude,elevation)
        try:
            weather_data = get_historical_weather("11cef9ffbae0467ba92175244241309", latitude, longitude, start_date, end_date)
        except Exception as e:
            print(f'error {e}')
            return e
    
       
        i,month_no,sumDay, humidity, rainfall_mm = 0, 0, 0,0,0
        
        my_list = []

        for day in weather_data:
            i +=1
            sumDay += (day['max_temp_c'] + day['min_temp_c']) / 2
            humidity += day['humidity']
            rainfall_mm += day['rainfall_mm']
            if i == 28:
                  month_no +=1
                  my_list.append({
            'month':month_no,
            'average_temp': sumDay / 28,
            'average_humidity': humidity / 28,
            'average_rainfall': rainfall_mm / 28
                     })
                  i,sumDay, humidity, rainfall_mm = 0, 0, 0,0
        return my_list

    else:
       return "Location not found"


def get_historical_weather(api_key, lat, lon, start_date, end_date):
    url = "http://api.weatherapi.com/v1/history.json"
    historical_data = []

    current_date = start_date
    while current_date <= end_date:
        params = {
            'key': api_key,
            'q': f"{lat},{lon}",
            'dt': current_date.strftime('%Y-%m-%d')
        }
        response = requests.get(url, params=params)
        data = response.json()

        if 'error' not in data:
            forecast = data['forecast']['forecastday'][0]['day']
            weather_info = {
                'date': current_date.strftime('%Y-%m-%d'),
                'max_temp_c': forecast['maxtemp_c'],
                'min_temp_c': forecast['mintemp_c'],
                'humidity': forecast['avghumidity'],
                'rainfall_mm': forecast['totalprecip_mm']
            }
            historical_data.append(weather_info)
        else:
            print(f"Error fetching data for {current_date}: {data['error']['message']}")

        current_date += timedelta(days=1)

    return historical_data



