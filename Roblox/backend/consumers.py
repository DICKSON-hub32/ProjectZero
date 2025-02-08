import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async,SyncToAsync
from django.core.cache import cache
import json
import hashlib
import re



class DataConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        
        token=self.scope['query_string'].decode().split('=')[1]
        DecodeToken=get_decode_token_view()
        payload=await sync_to_async(DecodeToken)(token)
        if(payload):
            user=await self.get_user(payload['user_id'])
            print(user.username,'my username')
            self.room_name=self.hashing_username(user.username)
            self.room_group_name=f'{self.room_name}'
            print(self.room_group_name,'room_name',)

            await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
             )

            await self.accept()
        else:
            await self.close()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self,text_data):
      message=json.loads(text_data)
      await self.channel_layer.group_send(
          self.room_group_name,{
              'type':'data_message',
              'message':message
          }
      )

    async def data_message(self,event):
        message=event['message']
        await self.send(
            text_data=json.dumps({'message':message})
        )

    def hashing_username(self,username):
        hash_object=hashlib.sha256(username.encode())
        hashed_username=hash_object.hexdigest()
        return hashed_username[0:10]
    
    @sync_to_async
    def get_user(self,id):
        from .models import User
        user=User.objects.get(pk=id)
        return user
    

def get_decode_token_view():
    from .views import DecodeToken
    return DecodeToken