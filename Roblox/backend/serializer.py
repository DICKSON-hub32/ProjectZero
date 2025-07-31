from rest_framework import serializers
from .models import User,RealTimeData,profile_pic,aiMessages,cropSpecs,arduinoData,climateAverageDataPerMonth,climateLocation,SMSSettings,SMSPhoneNumber,SMSLog

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

class SMSPhoneNumberSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSPhoneNumber
        fields = ['id', 'phone_number', 'is_active']

class SMSSettingsSerializer(serializers.ModelSerializer):
    phone_numbers = SMSPhoneNumberSerializer(many=True, read_only=True)
    phone_numbers_data = serializers.ListField(
        child=serializers.CharField(max_length=20),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = SMSSettings
        fields = ['id', 'interval_seconds', 'is_enabled', 'phone_numbers', 'phone_numbers_data', 'last_sent', 'created_at', 'updated_at']
        read_only_fields = ['last_sent', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        phone_numbers_data = validated_data.pop('phone_numbers_data', [])
        sms_settings = SMSSettings.objects.create(**validated_data)
        
        for phone_number in phone_numbers_data:
            if phone_number.strip():
                SMSPhoneNumber.objects.create(
                    sms_settings=sms_settings,
                    phone_number=phone_number.strip()
                )
        
        return sms_settings
    
    def update(self, instance, validated_data):
        phone_numbers_data = validated_data.pop('phone_numbers_data', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if phone_numbers_data is not None:
            instance.phone_numbers.all().delete()
            for phone_number in phone_numbers_data:
                if phone_number.strip():
                    SMSPhoneNumber.objects.create(
                        sms_settings=instance,
                        phone_number=phone_number.strip()
                    )
        
        return instance

class SMSLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSLog
        fields = ['id', 'phone_number', 'message', 'status', 'sent_at', 'error_message']

   
