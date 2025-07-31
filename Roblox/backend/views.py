from django.shortcuts import render
from rest_framework import generics
from .models import User,RealTimeData,profile_pic,aiMessages,cropSpecs,arduinoData,climateLocation,climateAverageDataPerMonth,SMSSettings,SMSPhoneNumber,SMSLog
from rest_framework.permissions import IsAuthenticated,AllowAny
from .serializer import UserSerializer,RealTimeDataSerializer,ImageSerializer,OnStartDataSerializer,aiMessagesSerializer,cropsSpecificationSerializer,arduinoDataSerializer,averageClimateDataPerMonthSerializer,SMSSettingsSerializer,SMSLogSerializer
from rest_framework.response import Response
from rest_framework import status
import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.cache import cache
import json
import hashlib
import requests
import re
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import TokenError,InvalidToken
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import permission_classes,api_view
from .projects.main import suggest_plant
import math
# Django Views (views.py)
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import requests
from datetime import datetime, timedelta
import logging
import google.generativeai as genai
logger = logging.getLogger(__name__)

# Country-specific API configurations
COUNTRY_API_MAP = {
    "Kenya": {
        "url": "https://kilimostat.go.ke/api/v1/crops",
        "headers": {"Content-Type": "application/json"},
        "crop_field": "crop_name",
        "price_field": "price_per_kg",
        "date_field": "date_recorded"
    },
    "Uganda": {
        "url": "https://api.farmgainafrica.org/prices",
        "headers": {"Authorization": "Bearer YOUR_TOKEN"},
        "crop_field": "commodity",
        "price_field": "average_price",
        "date_field": "price_date"
    },
    "Ghana": {
        "url": "https://api-agrosmart-esoko.onrender.com/market-prices/v1/daily",
        "headers": {"X-API-Key": "YOUR_API_KEY"},
        "crop_field": "product_name",
        "price_field": "retail_price",
        "date_field": "market_date"
    },
    "Tanzania": {
        "url": "https://sautiafrica.org/api/prices",
        "headers": {"Content-Type": "application/json"},
        "crop_field": "crop_type",
        "price_field": "market_price",
        "date_field": "timestamp"
    }
}

from .locationCordinator import get_coordinates


class realTimeData(generics.CreateAPIView):
    permission_classes=[AllowAny]
    serializer_class=RealTimeDataSerializer

    def hash_username(self,username):
         hash_object = hashlib.sha256(username.encode())
         hashed_username = hash_object.hexdigest()
         return hashed_username[0:10]

    def perform_create(self,serializer):
           id=serializer.validated_data['user_id']
           user=get_object_or_404(User,pk=id)
           instance=serializer.save(user=user)
           channel_layers=get_channel_layer()
           username=user.username
           room_name=self.hash_username(username)
           print(user.username,'self   user',room_name)
           message_data = {
            'Humidity': instance.Humidity,
             'Temperature': instance.Temperature,
             'Moisture': instance.Moisture
    }
           async_to_sync(channel_layers.group_send)(
             room_name,{
                'type':'data_message',
                    'message':{
                       'data':message_data
                    }
                
             }
           )
    def post(self, request, *args, **kwargs):

        print(request.data)

        serializer=self.get_serializer(data=request.data)

        if serializer.is_valid():

            self.perform_create(serializer)

            return Response(serializer.data,status=status.HTTP_201_CREATED)

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def get(self,request):

        return Response({'message':'Method not Allowed '},status=status.HTTP_405_METHOD_NOT_ALLOWED)



    def get(self,request):
        return Response({'message':'Method not Allowed '},status=status.HTTP_405_METHOD_NOT_ALLOWED)

class createUser(generics.CreateAPIView):
    queryset=User.objects.all()
    permission_classes=[AllowAny]
    serializer_class=UserSerializer
    
    def post(self,request,*args,**kwargs):
        serializer=self.get_serializer(data=request.data)
        if serializer.is_valid():
            user=User.objects.create_user(username=serializer.validated_data['username'],password=serializer.validated_data['password'],email=serializer.validated_data['email'])
            refresh=RefreshToken.for_user(user)
            user_data={
            "username":user.username,
            "email":user.email,
            "access":str(refresh.access_token),
            "refresh":str(refresh)
        }
            return Response(user_data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class getUserData(generics.RetrieveAPIView):
    serializer_class=UserSerializer
    permission_classes=[IsAuthenticated]
    
    def get_object(self):
        user=self.request.user
        return User.objects.get(pk=user.pk)
    
def DecodeToken(token):
  try:
      print(token)
      payload=TokenBackend(algorithm='HS256', signing_key=settings.SIMPLE_JWT['SIGNING_KEY']).decode(token,verify=True)
      print('payload ',payload)
      return payload
  except (InvalidToken) as e:
      print('Token Error ',e)
      return None
  except (TokenError) as f:
      print('Token Error ',e)
      return None
      

class updateData(generics.RetrieveUpdateAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class=UserSerializer
    
    def get_object(self):
        return self.request.user

    def patch(self,request,*args,**kwags):
        serializer=self.get_serializer(self.get_object(),data=request.data,partial=True)
        print('okkkk',request.data)

        if serializer.is_valid():
                try:
                    instance = serializer.save()
                    print(instance.username)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                except:
                     return Response({'message':'User with useranme already exists'},status=status.HTTP_400_BAD_REQUEST)
        else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def updateProfile(request):
    user = request.user
    try:
        profile_pic_instance = profile_pic.objects.get(user=user)
    except profile_pic.DoesNotExist:
        profile_pic_instance = profile_pic.objects.create(user=user)
        print('or here')
    serializer = ImageSerializer(instance=profile_pic_instance, data=request.data, partial=True)
    
    if serializer.is_valid():
        instance = serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class OnStartData(generics.RetrieveAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class=OnStartDataSerializer


    def get_object(self):
        return self.request.user


    
    def get(self,request,*args,**kwargs):
         user=self.get_object()
         image_instance=profile_pic.objects.filter(user=user).order_by('-created').first()
         realTimeDataInstance=RealTimeData.objects.filter(user=user).order_by('-created').first()
         data={'user':user,'image':image_instance,'realTimeData':realTimeDataInstance}
         serialized_data=self.get_serializer(data)
         return Response(serialized_data.data,status=status.HTTP_200_OK)


class getAiMessages(generics.ListCreateAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class=aiMessagesSerializer

    def get_queryset(self):
        today=timezone.now().date()
        return aiMessages.objects.filter(created_at__date=today)    
    def post(self,request):
       print(request.data)
    #  url = "https://gemini-pro-ai.p.rapidapi.com/"
       genai.configure(api_key="AIzaSyD2aILZSjqcXNQ8s01iR6RoSFjNvBpzYYA")
       model = genai.GenerativeModel('gemini-2.0-flash')

        # Generate response
       response = model.generate_content(request.data['request'])
       response = response.text
     
       data={'request':request.data.get('request'),'response':response,'user':request.user.pk}
       serializer=self.get_serializer(data=data)
       if serializer.is_valid():
            try:
                instance=serializer.save()
                return Response(serializer.data,status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'message':str(e)},status=status.HTTP_400_BAD_REQUEST)
    
       else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
   

class cropsSpecification(generics.ListCreateAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class=cropsSpecificationSerializer
    # queryset=cropSpecs.objects.all()

    # def get(self,request):
    #     temperature = 22
    #     soil_moisture = 65
    #     humidity = 55
    #     response = suggest_plant(temperature, soil_moisture, humidity)
    #     print("response",response)
    #     return Response(response)

    
    def patch(self,request,*args, **kwargs):
        instance=cropSpecs.objects.get(id=request.data['id'])
        
        data={'isChosen':request.data['isChosen']}
        serializer=self.get_serializer(instance,data=data,partial=True)
        if serializer.is_valid():
            try:
                instance=serializer.save()
                return Response(serializer.data,status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'message':str(e)},status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def post(self, request):
        try:
            data = request.data
            language = request.query_params.get('ln', 'English')
            user = request.user
            
            # Get latest sensor data for the user
            latest_sensor_data = RealTimeData.objects.filter(user=user).order_by('-created').first()
            
            if not latest_sensor_data:
                # Use default values if no sensor data available
                nitrogen = 0.18
                phosphorous = 0.13
                potassium = 0.25
                temperature = 24
                humidity = 70
                moisture = 70
                ph = 6.5
            else:
                # Use actual sensor readings
                nitrogen = latest_sensor_data.Nitrogen / 100.0  # Convert to percentage
                phosphorous = latest_sensor_data.Phosporous / 100.0
                potassium = latest_sensor_data.Potassium / 100.0
                temperature = latest_sensor_data.Temperature
                humidity = latest_sensor_data.Humidity
                moisture = latest_sensor_data.Moisture
                ph = 6.5  # Default pH as it's not in sensor data
            
            # Get user location data
            user_location = climateLocation.objects.filter().order_by('-created_at').first()
            location_context = None
            if user_location:
                location_context = f"{user_location.Sub_county}, {user_location.County}, {user_location.Country}"
            
            # Determine current season based on month (East African context)
            current_month = timezone.now().month
            if current_month in [12, 1, 2]:
                season = "dry season"
            elif current_month in [3, 4, 5]:
                season = "long rains"
            elif current_month in [6, 7, 8]:
                season = "cool dry season"
            else:
                season = "short rains"
            
            print(f"Using sensor data - N: {nitrogen}, P: {phosphorous}, K: {potassium}, T: {temperature}, H: {humidity}, M: {moisture}")
            print(f"Location: {location_context}, Season: {season}")
            
            response = suggest_plant(
                nitrogen, phosphorous, potassium, ph, 
                humidity, temperature, moisture, language,
                location=location_context, season=season
            )
            
            # Add this check to handle empty responses
            if not response or len(response) == 0:
                return Response({'message': 'No Match Found'}, status=status.HTTP_200_OK)
            
            # Check if response is a list (expected format)
            if isinstance(response, list):
                serializer = self.get_serializer(data=response, many=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({'message': serializer.data}, status=status.HTTP_200_OK)
                return Response({'Error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'Invalid response format from AI'}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
class updateArduinoData(generics.ListCreateAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class=arduinoDataSerializer

    def get_object(self):
        return arduinoData.objects.filter(user=self.request.user).order_by('-created').first()
    def post(self,request):
        data=request.data.copy()
        data['user']=request.user.id
        serializer=self.get_serializer(data=data)
        if serializer.is_valid():
            try:
                instance=serializer.save()
                return Response(serializer.data,status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'message':str(e)},status=status.HTTP_400_BAD_REQUEST)
    
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['POST','GET'])
@permission_classes([AllowAny])
def receive_data(request):
    print('im in the receive data')
    if(request.method=='POST'):
            data=json.loads(request.body.decode('utf-8'))
            temperature = data.get('temperature')
            humidity = data.get('humidity')
            moisture = data.get('moisture')
            print('data',data)
            
            # Validate that all required data is present
            if temperature is None or humidity is None or moisture is None:
                return JsonResponse({'error': 'Missing required fields'}, status=400)

            # Save the data into the RealTimeData model
            dataUser=User.objects.get(id=24)
            RealTimeData.objects.create(
                Temperature=temperature,
                Humidity=humidity,
                Moisture=moisture,
                user=dataUser
            )

            # Respond with success
            return Response ({'message': 'Data saved successfully'}, status=201)

    else:
        print('getting')
        return Response({'message':'succes'},status=status.HTTP_200_OK)

@api_view(['POST'])         
@permission_classes([IsAuthenticated])         
def pump_command(request):
    if(request.method=='POST'):
        print('pump command',request.data)
        return Response({'message':'Pumping initialized'},status=status.HTTP_200_OK)
"""
    creating a frontend that let's user inputs the location in form of words such as kenya machakos then the results are the  longitudes and lattitudes 
    then i pass this longitudes and lattitudes to the open weather api which results in returning climate and weather and soil data then using this data we suggest which crop to plant 
    using the csv data then we
    
    """

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def locationData(request): 
    country = request.data['country']
    county = request.data['county']
    sub_county = request.data['sub_county']


    try:
        instance = climateLocation.objects.filter(
            Country=country,
            County=county,
            Sub_county=sub_county
        ).first()
        
        if not instance:
            instance = climateLocation.objects.create(
                Country=country,
                County=county,
                Sub_county=sub_county
            )
        
        data = climateAverageDataPerMonth.objects.filter(Location=instance)
        print(data)
        if data:
                
             data1=averageClimateDataPerMonthSerializer(data,many=True)
                
             return Response({'message': data1.data}, status=status.HTTP_200_OK)
        else:
            averageList = get_coordinates(country, county, sub_county)
            for average in averageList:
                print(average,'my average')
                climateAverageDataPerMonth.objects.create(
                    Location=instance,
                    Month=average['month'],
                    Temperature=average['average_temp'],
                    Humidity=average['average_humidity'],
                    Rainfall_mm=average['average_rainfall']
                )
            return Response({'message': averageList}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)



def normalize_crop_data(raw_data, country_config):
    """Normalize data from different APIs into a consistent format"""
    normalized_data = []
    
    for item in raw_data:
        try:
            normalized_item = {
                "crop_name": item.get(country_config["crop_field"], "Unknown"),
                "price": float(item.get(country_config["price_field"], 0)),
                "date": item.get(country_config["date_field"], datetime.now().isoformat()),
                "currency": item.get("currency", "Local Currency"),
                "market": item.get("market_name", "Unknown Market"),
                "unit": item.get("unit", "kg")
            }
            normalized_data.append(normalized_item)
        except (ValueError, TypeError) as e:
            logger.warning(f"Error normalizing item: {item}, Error: {e}")
            continue
    
    return normalized_data

@csrf_exempt
@require_http_methods(["GET", "POST"])
def get_crop_prices(request):
    """Get crop prices for a specific country"""
    
    if request.method == "GET":
        country = request.GET.get('country', 'Kenya')
        crop_type = request.GET.get('crop_type', '')
        days = int(request.GET.get('days', 30))
    else:
        data = json.loads(request.body)
        country = data.get('country', 'Kenya')
        crop_type = data.get('crop_type', '')
        days = int(data.get('days', 30))
    
    if country not in COUNTRY_API_MAP:
        return JsonResponse({
            'error': f'Country {country} not supported',
            'supported_countries': list(COUNTRY_API_MAP.keys())
        }, status=400)
    
    try:
        # Get API configuration for the country
        api_config = COUNTRY_API_MAP[country]
        
        # Build request parameters
        params = {
            'limit': 1000,
            'days': days
        }
        
        if crop_type:
            params['crop'] = crop_type
        
        # Make API request
        response = requests.get(
            api_config["url"],
            headers=api_config["headers"],
            params=params,
            timeout=30
        )
        
        if response.status_code != 200:
            return JsonResponse({
                'error': f'Failed to fetch data from {country} API',
                'status_code': response.status_code
            }, status=response.status_code)
        
        raw_data = response.json()
        
        # Handle different response structures
        if isinstance(raw_data, dict):
            crop_data = raw_data.get('data', raw_data.get('results', [raw_data]))
        else:
            crop_data = raw_data
        
        # Normalize the data
        normalized_data = normalize_crop_data(crop_data, api_config)
        
        # Filter by crop type if specified
        if crop_type:
            normalized_data = [
                item for item in normalized_data 
                if crop_type.lower() in item['crop_name'].lower()
            ]
        
        # Calculate trends and insights
        insights = calculate_market_insights(normalized_data)
        
        return JsonResponse({
            'country': country,
            'crop_type': crop_type,
            'total_records': len(normalized_data),
            'data': normalized_data,
            'insights': insights,
            'last_updated': datetime.now().isoformat()
        })
        
    except requests.RequestException as e:
        logger.error(f"API request failed for {country}: {e}")
        return JsonResponse({
            'error': 'Failed to fetch market data',
            'details': str(e)
        }, status=500)
    
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return JsonResponse({
            'error': 'Internal server error',
            'details': str(e)
        }, status=500)

def calculate_market_insights(data):
    """Calculate market trends and insights"""
    if not data:
        return {}
    
    # Group by crop
    crop_groups = {}
    for item in data:
        crop = item['crop_name']
        if crop not in crop_groups:
            crop_groups[crop] = []
        crop_groups[crop].append(item)
    
    insights = {
        'top_performing_crops': [],
        'declining_crops': [],
        'stable_crops': [],
        'market_summary': {}
    }
    
    for crop, prices in crop_groups.items():
        if len(prices) < 2:
            continue
            
        # Sort by date
        sorted_prices = sorted(prices, key=lambda x: x['date'])
        
        # Calculate trend
        recent_prices = [p['price'] for p in sorted_prices[-7:]]  # Last 7 records
        older_prices = [p['price'] for p in sorted_prices[:-7]]   # Earlier records
        
        if older_prices and recent_prices:
            avg_recent = sum(recent_prices) / len(recent_prices)
            avg_older = sum(older_prices) / len(older_prices)
            
            change_percent = ((avg_recent - avg_older) / avg_older) * 100
            
            crop_insight = {
                'crop': crop,
                'current_avg_price': round(avg_recent, 2),
                'previous_avg_price': round(avg_older, 2),
                'change_percent': round(change_percent, 2),
                'trend': 'rising' if change_percent > 5 else 'declining' if change_percent < -5 else 'stable'
            }
            
            if change_percent > 5:
                insights['top_performing_crops'].append(crop_insight)
            elif change_percent < -5:
                insights['declining_crops'].append(crop_insight)
            else:
                insights['stable_crops'].append(crop_insight)
    
    # Sort by change percentage
    insights['top_performing_crops'].sort(key=lambda x: x['change_percent'], reverse=True)
    insights['declining_crops'].sort(key=lambda x: x['change_percent'])
    
    # Market summary
    all_prices = [item['price'] for item in data]
    insights['market_summary'] = {
        'total_crops': len(crop_groups),
        'avg_market_price': round(sum(all_prices) / len(all_prices), 2) if all_prices else 0,
        'highest_price': max(all_prices) if all_prices else 0,
        'lowest_price': min(all_prices) if all_prices else 0
    }
    
    return insights

@csrf_exempt
@require_http_methods(["GET"])
def get_supported_countries(request):
    """Get list of supported countries and their crop types"""
    
    countries_info = {}
    
    for country, config in COUNTRY_API_MAP.items():
        countries_info[country] = {
            'api_url': config['url'],
            'supported_fields': [
                config['crop_field'],
                config['price_field'],
                config['date_field']
            ]
        }
    
    return JsonResponse({
        'supported_countries': countries_info,
        'total_countries': len(COUNTRY_API_MAP)
    })

@csrf_exempt
@require_http_methods(["POST"])
def compare_crop_across_countries(request):
    """Compare a specific crop across multiple countries"""
    
    data = json.loads(request.body)
    crop_name = data.get('crop_name', '')
    countries = data.get('countries', list(COUNTRY_API_MAP.keys()))
    
    if not crop_name:
        return JsonResponse({'error': 'Crop name is required'}, status=400)
    
    comparison_data = {}
    
    for country in countries:
        if country not in COUNTRY_API_MAP:
            continue
            
        try:
            # Make request to country-specific API
            api_config = COUNTRY_API_MAP[country]
            response = requests.get(
                api_config["url"],
                headers=api_config["headers"],
                params={'crop': crop_name, 'limit': 100},
                timeout=30
            )
            
            if response.status_code == 200:
                raw_data = response.json()
                if isinstance(raw_data, dict):
                    crop_data = raw_data.get('data', raw_data.get('results', []))
                else:
                    crop_data = raw_data
                
                normalized_data = normalize_crop_data(crop_data, api_config)
                
                # Filter for specific crop
                filtered_data = [
                    item for item in normalized_data 
                    if crop_name.lower() in item['crop_name'].lower()
                ]
                
                if filtered_data:
                    avg_price = sum(item['price'] for item in filtered_data) / len(filtered_data)
                    comparison_data[country] = {
                        'average_price': round(avg_price, 2),
                        'records_count': len(filtered_data),
                        'latest_price': filtered_data[-1]['price'] if filtered_data else 0,
                        'currency': filtered_data[0].get('currency', 'Local Currency')
                    }
        
        except Exception as e:
            logger.error(f"Error fetching data for {country}: {e}")
            comparison_data[country] = {'error': str(e)}
    
    return JsonResponse({
        'crop_name': crop_name,
        'comparison': comparison_data,
        'best_market': max(comparison_data.items(), 
                          key=lambda x: x[1].get('average_price', 0) if 'error' not in x[1] else 0)[0] 
                          if comparison_data else None
    })

class SMSSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = SMSSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        sms_settings, created = SMSSettings.objects.get_or_create(user=self.request.user)
        return sms_settings
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        phone_numbers = request.data.get('phone_numbers', [])
        print("phone numbers are ",phone_numbers)


        data = request.data.copy()
        data['phone_numbers_data'] = phone_numbers
        
        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SMSLogView(generics.ListAPIView):
    serializer_class = SMSLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_sms_settings = SMSSettings.objects.filter(user=self.request.user).first()
        if user_sms_settings:
            return SMSLog.objects.filter(sms_settings=user_sms_settings).order_by('-sent_at')
        return SMSLog.objects.none()