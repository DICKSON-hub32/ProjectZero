from django.shortcuts import render
from rest_framework import generics
from .models import User,RealTimeData,profile_pic,aiMessages,cropSpecs,arduinoData,climateLocation,climateAverageDataPerMonth
from rest_framework.permissions import IsAuthenticated,AllowAny
from .serializer import UserSerializer,RealTimeDataSerializer,ImageSerializer,OnStartDataSerializer,aiMessagesSerializer,cropsSpecificationSerializer,arduinoDataSerializer,averageClimateDataPerMonthSerializer
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
    #    url = "https://gemini-pro-ai.p.rapidapi.com/"
       url = "https://chatgpt4-ai-chatbot.p.rapidapi.com/ask"

#        payload = { "query": request.data['request'] }
#        headers = {
# 	"x-rapidapi-key": "5fc7178995msh2782aca5a7c677ep1c55bfjsn44e47f7e452e",
# 	"x-rapidapi-host": "chatgpt4-ai-chatbot.p.rapidapi.com",
# 	"Content-Type": "application/json"
# }
       
       payload = { "query": request.data['request'] }

       headers = {

            "x-rapidapi-key": "e08368f7a7msha8ba132fff83c24p146541jsn00e14b7db420",

            "x-rapidapi-host": "chatgpt4-ai-chatbot.p.rapidapi.com",

            "Content-Type": "application/json"

        }
# #  def suggest_plant(Nitrogen,Phosphorous,Potassium,Latitude,Ph):
# crop_name,Nitrogen (g/kg),Phosphorous (g/kg),Potassium (g/kg),Soil Moisture (%),Number of times of irrigation in a day,Number of days of irrigation in a week,Latitude,Soil pH
# Maize,1.8-2.2,1.3-1.7,2.8-3.2,60-70,1,3,1.2900-1.2950,5.5-7.0
# Rice,2.3-2.7,1.6-2.0,2.6-3.0,70-80,2,6,1.2900-1.2950,5.0-6.5
# Wheat,1.6-1.9,1.1-1.3,2.3-2.7,50-60,1,3,1.2900-1.2950,6.0-7.5
# Sorghum,1.4-1.6,0.9-1.1,1.9-2.1,40-50,1,2,1.2900-1.2950,5.5-7.0
# Millet,1.1-1.3,0.7-0.9,1.7-1.9,30-40,1,2,1.2900-1.2950,5.0-6.5

      
         
       response = requests.post(url, json=payload, headers=headers)
       print(response.json(),"hellooo")
       response=response.json()['response']
     
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
                data=request.data
                print('mydata ',data)
                language=request.query_params.get('ln')
                print(language)
                    # Fetch data using your AI function
                # def suggest_plant(Nitrogen, Phosphorous, Potassium, Latitude, Ph):
                # print(res, 'my data set for crops')
                    # Fetch data using your AI function{'Temperature': 26, 'Humidity': 65, 
# 'Moisture': 
# 66, 'Nitrogen': 0.2, 'Phosporous': 0.15, 'Potassium': 0.3}
                #   (Nitrogen, Phosphorous, Potassium, Latitude, Ph,Humidity,Temperature
                # response = suggest_plant(data["Nitrogen"],data["Phosporous"] ,data["Potassium"] ,6.0, data["Humidity"],data["Temperature"],data["Moisture"])
                response = suggest_plant(0.18, 0.13, 0.25, 6.5, 70, 24, 70,language)
                # Check if response is a JsonResponse and extract data
                if (response):
                    print('my response =',response)
                    serializer = self.get_serializer(data=response, many=True)
                    if serializer.is_valid():
                        serializer.save()
                        print('serialized data= ',serializer.data)
                        return Response({'message':serializer.data}, status=status.HTTP_200_OK)
                    return Response({'Error':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'message': 'No Match Found'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'Error ':str(e)},status=status.HTTP_400_BAD_REQUEST)
                # Extract the suggested crops from the response data
            #     res= response_data.get('suggested_crops', [])
                
            #     # Create instances of cropSpecs
            #     crops_to_create = []
            #     for element in res:
            #         crops_to_create.append(cropSpecs(
            #             crop_name=element['crop_name'],
            #             Temperature=element['Temperature'],
            #             Humidity=element['Humidity'],
            #             Moisture=element['Moisture'],
            #             Nitrogen=element['Nitrogen'],
            #             description=element['description'],
            #             Phosporous=element['Phosporous'],
            #             Potassium=element['Potassium'],
            #             Irrigation_interval=element.get('Irrigation_interval', 1),  # Default to 1 if not provided
            #             No_of_irigation_per_day=element.get('No_of_irigation_per_day', 1),  # Default to 1 if not provided
            #             No_of_irigation_per_week=element.get('No_of_irigation_per_week', 1),  # Default to 1 if not provided
            #             Altitude=element.get('Altitude', 1),  # Default to 1 if not provided
            #             Soil_pH=element.get('Soil_pH', 1),  # Default to 1 if not provided
            #             created_at=timezone.now(),
            #             isChosen=False
            #         ))

            #     # Bulk create instances
            #     cropSpecs.objects.bulk_create(crops_to_create)
                
                # Serialize the created instances
            #     print(serializer.data, 'my serializer')

            #     return Response({'message': 'Crops created successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
            
            # except Exception as e:
            #     return Response({'message': 'Error in AI', 'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            #         serializer=self.get_serializer(data=res)
            #         if serializer.is_valid():
            #             try:
            #                 instance=serializer.save()
            #                 return Response(serializer.data,status=status.HTTP_200_OK)
            #             except Exception as e:
            #                 return Response({'message':str(e)},status=status.HTTP_400_BAD_REQUEST)
            #         else:
            #             return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
              
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
