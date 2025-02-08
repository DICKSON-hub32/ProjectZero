from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from . import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns=[
    path('register/',views.createUser.as_view(),name='register'),
    path('aiMessages/',views.getAiMessages.as_view(),name='register'),
    path('user/',views.getUserData.as_view(),name='getUserData'),
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/realTimeData/',views.realTimeData.as_view(),name='realTimeData'),
    path('api/user/update/',views.updateData.as_view(),name='updateUser'),
    path('api/user/media/',views.updateProfile,name='updateProfile'),
    path('api/user/onstart/',views.OnStartData.as_view(),name='onStartData'),
    path('api/update_api_data/',views.updateArduinoData.as_view(),name='updatArduinoData'),
    path('api/Chosen_crop/',views.cropsSpecification.as_view(),name='updatArduinoData'),
    path('pump_command/',views.pump_command,name='pump_command'),
    path('api/crop_specification/',views.cropsSpecification.as_view(),name='cropSpecification'),
    path('receive_data/',views.receive_data,name='receive_data'),
    path('locationData/',views.locationData,name='locationData')
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)