from rest_framework import serializers
from .models import User,RealTimeData,profile_pic,aiMessages,cropSpecs,arduinoData,climateAverageDataPerMonth,climateLocation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['email','password','username']
        extra_kwargs={'password':{'write_only':True}}


class ImageSerializer(serializers.ModelSerializer):
    image_url=serializers.SerializerMethodField(method_name='get_image_url',read_only=True)
    class Meta:
        model=profile_pic
        fields=['image','image_url']
    def get_image_url(self,obj):
        return obj.image.url if obj.image else None

class RealTimeDataSerializer(serializers.ModelSerializer):
    user_id=serializers.IntegerField(write_only=True)
    class Meta:
        model=RealTimeData
        fields='__all__'
        extra_kwargs={'user':{'write_only':True}}

class OnStartDataSerializer(serializers.Serializer):
    user=UserSerializer()
    image=ImageSerializer()
    realTimeData=RealTimeDataSerializer()


class aiMessagesSerializer(serializers.ModelSerializer):
    class Meta:
        model=aiMessages
        fields=['request','response','user']
        extra_kwargs={'user':{'write_only':True}}

class cropsSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model=cropSpecs
        fields='__all__'

class arduinoDataSerializer(serializers.ModelSerializer):
                  class Meta:
                    model=arduinoData
                    fields='__all__'
                    extra_kwargs={'description':{'write_only':True},'user':{'write_only':True}}



class averageClimateDataPerMonthSerializer(serializers.ModelSerializer):
    Location = serializers.PrimaryKeyRelatedField(queryset=climateLocation.objects.all())

    class Meta:
        model = climateAverageDataPerMonth
        fields = ['Month', 'Temperature', 'Humidity', 'Rainfall_mm', 'created_at', 'Location']

   
