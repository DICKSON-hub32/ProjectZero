from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
import os
from django.utils import timezone


class User(AbstractUser):
 created = models.DateTimeField(default=timezone.now)
 updated = models.DateTimeField(auto_now=True)

 def __str__(self):
    return self.username

class RealTimeData(models.Model):
  Temperature=models.FloatField(blank=False)
  Humidity=models.FloatField(blank=False)
  Moisture=models.FloatField(blank=False)
  Nitrogen=models.FloatField(blank=False,default=55)
  Phosporous=models.FloatField(blank=False,default=33)
  Potassium=models.FloatField(blank=False,default=47)
  user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='realTimeData')
  created = models.DateTimeField(default=timezone.now)
  updated = models.DateTimeField(auto_now=True)
 
  def __str__(self):
     return self.Temperature
 

class profile_pic(models.Model):
  image=models.ImageField(upload_to='images/')
  user=models.ForeignKey(User,related_name='image',on_delete=models.CASCADE)
  created = models.DateTimeField(default=timezone.now)
  updated = models.DateTimeField(auto_now=True)
 


  def __str__(self):
    return self.user
  def save(self, *args, **kwargs):
        # Check if the instance already exists in the database
        if self.pk:
            try:
                # Get the existing instance before saving the new one
                old_instance = profile_pic.objects.get(pk=self.pk)
                # Check if the image is being updated
                if old_instance.image and old_instance.image != self.image:
                    old_image_path = old_instance.image.path
                    if os.path.isfile(old_image_path):
                        os.remove(old_image_path)  # Delete the old image file
            except profile_pic.DoesNotExist:
                pass

        # Call the parent save method
        super().save(*args, **kwargs)
    
    
class aiMessages(models.Model):
    request=models.TextField(blank=False)
    response=models.TextField(blank=False)
    user=models.ForeignKey(User,related_name='aimessages',on_delete=models.CASCADE)
    created_at=models.DateTimeField(default=timezone.now())

class cropSpecs(models.Model):
    crop_name=models.TextField(blank=False)
    Temperature=models.CharField(max_length=100,blank=False)
    Humidity=models.CharField(max_length=100,blank=False)
    Moisture=models.CharField(max_length=100,blank=False)
    Nitrogen=models.CharField(max_length=100,blank=False)
    Phosporous=models.CharField(max_length=100,blank=False)
    description=models.TextField(blank=False,default='provide More information about why farmer should plant the crop you specified')
    Potassium=models.CharField(max_length=100,blank=False)
    created_at=models.DateTimeField(default=timezone.now())
    isChosen=models.BooleanField(default=False)
    No_of_irigation_per_day=models.CharField(max_length=100,blank=False, default=1)
    No_of_irigation_per_week=models.CharField(max_length=100,blank=False, default=1)
    Altitude= models.CharField(max_length=100,blank=False, default=1)
    Soil_pH = models.CharField(max_length=100,blank=False, default=1)

  
class arduinoData(models.Model):
  Temperature=models.IntegerField(blank=False)
  Humidity=models.IntegerField(blank=False)
  Moisture=models.IntegerField(blank=False)
  Nitrogen=models.FloatField(blank=False)
  Phosporous=models.FloatField(blank=False)
  description=models.CharField(max_length=300,blank=False,default='provide More information about why farmer should plant the crop you specified')
  Potassium=models.FloatField(blank=False)
  Irrigation_interval=models.IntegerField(blank=False,default=1)
  created_at=models.DateTimeField(default=timezone.now())
  user=models.ForeignKey(User,related_name='arduinoData',on_delete=models.CASCADE)

class climateLocation(models.Model):
   Country=models.CharField(max_length=100,blank=False)
   County=models.CharField(max_length=100,blank=False)
   Sub_county=models.CharField(max_length=100,blank=False)
   created_at=models.DateTimeField(default=timezone.now())

class climateAverageDataPerMonth(models.Model):
  Month=models.IntegerField(blank=False)
  Temperature=models.IntegerField(blank=False)
  Humidity=models.IntegerField(blank=False)
  Rainfall_mm=models.IntegerField(blank=False)
  created_at=models.DateTimeField(default=timezone.now())
  Location=models.ForeignKey(climateLocation,related_name='climateLocation',on_delete=models.CASCADE)
  