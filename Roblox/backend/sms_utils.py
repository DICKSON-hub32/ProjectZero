import os
import africastalking
import threading
import time
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from decouple import config
from .models import SMSSettings, SMSLog, RealTimeData

class SMSManager:
    def __init__(self):
        self.api_key = config('AFRICAS_TAKING_API_KEY', default=None)
        self.username = config('AT_USERNAME', default='sandbox')
        self.sender_id = config('AT_SENDER_ID', default=None)
        self.default_country_code = '254'  # Kenya
        self._scheduler_running = False
        self._scheduler_thread = None
        
        # Initialize Africa's Talking SDK
        if self.api_key:
            africastalking.initialize(self.username, self.api_key)
            self.sms = africastalking.SMS
            
            # Log environment status like Node.js version
            if self.username == 'sandbox':
                print('⚠️ IMPORTANT: Africa\'s Talking is configured to use SANDBOX environment!')
                print('⚠️ SMS messages will NOT be delivered to actual phone numbers.')
                print('⚠️ To send real SMS messages, update AT_USERNAME in .env file to your production username.')
            else:
                print('✅ Africa\'s Talking is configured to use PRODUCTION environment.')
                print(f'✅ SMS messages will be delivered to actual phone numbers using account: {self.username}')
                print('✅ Each SMS sent will consume credits from your Africa\'s Talking account.')
    
    def format_phone_number(self, phone_number):
        """Format phone number like the Node.js version"""
        print(f"[SMS Service] Original phone number: {phone_number}")
        
        # Remove any spaces, dashes, or parentheses
        formatted_number = phone_number.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        print(f"[SMS Service] After removing spaces/special chars: {formatted_number}")
        
        # Check if the phone number starts with a country code
        import re
        has_country_code = bool(re.match(r'^\+\d{1,3}', formatted_number)) or bool(re.match(r'^00\d{1,3}', formatted_number))
        print(f"[SMS Service] Has country code: {has_country_code}")
        
        # If no country code, assume Kenya (+254) as default
        if not has_country_code:
            # If the number starts with 0, remove it before adding country code
            if formatted_number.startswith('0'):
                formatted_number = formatted_number[1:]
                print(f"[SMS Service] Removed leading zero: {formatted_number}")
            
            # Add the default country code
            formatted_number = '+' + self.default_country_code + formatted_number
            print(f"[SMS Service] Added default country code ({self.default_country_code}): {formatted_number}")
        elif not formatted_number.startswith('+') and not formatted_number.startswith('00'):
            # If it has a country code but doesn't start with + or 00, add +
            formatted_number = '+' + formatted_number
            print(f"[SMS Service] Added + prefix: {formatted_number}")
        
        print(f"[SMS Service] Final formatted number: {formatted_number}")
        return formatted_number

    def send_sms(self, phone_numbers, message, sms_settings=None):
        """Send SMS to multiple phone numbers"""
        if not self.api_key:
            return {'success': False, 'error': 'SMS API key not configured'}
        
        print(f"[SMS Service] Starting SMS send process")
        
        # Check if in sandbox mode and provide clear indication
        if self.username == 'sandbox':
            print(f"[SMS Service] ⚠️ SANDBOX MODE: SMS will be simulated but NOT delivered")
            print(f"[SMS Service] ⚠️ For testing in sandbox mode")
        else:
            print(f"[SMS Service] 🚀 PRODUCTION MODE: Sending real SMS")
            print(f"[SMS Service] 🚀 This will consume credits from your Africa's Talking account")
        
        # Format phone numbers using the same logic as Node.js
        formatted_numbers = []
        for number in phone_numbers:
            formatted_number = self.format_phone_number(number)
            formatted_numbers.append(formatted_number)
        
        print(f"[SMS Service] Message content: {message}")
        print(f"[SMS Service] Sending SMS via Africa's Talking API...")
        
        try:
            # Use Africa's Talking SDK to send SMS with sender_id if available
            sms_options = {
                'message': message,
                'recipients': formatted_numbers
            }
            if self.sender_id:
                sms_options['sender_id'] = self.sender_id

            print(sms_options)
                
            response = self.sms.send(**sms_options)
            print(f"[SMS Service] Africa's Talking API Response: {response}")
            
            # Special handling based on mode - like Node.js version
            if self.username == 'sandbox':
                print(f"[SMS Service] 📱 SANDBOX SIMULATION RESULT:")
                print(f"[SMS Service] 📱 SMS would have been sent to {', '.join(formatted_numbers)} in production mode")
                print(f"[SMS Service] 📱 Since this is sandbox mode, NO ACTUAL SMS was delivered to the phone")
            else:
                print(f"[SMS Service] 📱 PRODUCTION SMS SENT:")
                print(f"[SMS Service] 📱 SMS has been sent to {', '.join(formatted_numbers)}")
                print(f"[SMS Service] 📱 Credits have been consumed from your Africa's Talking account")
            
            # Check if SMS was sent successfully
            success = False
            error_details = []
            
            if 'SMSMessageData' in response and 'Recipients' in response['SMSMessageData']:
                recipients = response['SMSMessageData']['Recipients']
                
                if recipients and len(recipients) > 0:
                    for recipient in recipients:
                        number = recipient.get('number', 'Unknown')
                        status = recipient.get('status', 'Unknown')
                        message_id = recipient.get('messageId', 'Unknown')
                        cost = recipient.get('cost', 'Unknown')
                        status_code = recipient.get('statusCode', 'Unknown')
                        
                        print(f"[SMS Service] Recipient status - Number: {number}, Status: {status}, MessageId: {message_id}, Cost: {cost}")
                        
                        if status == 'Success':
                            success = True
                        else:
                            print(f"[SMS Service] SMS delivery issue - Status: {status}, StatusCode: {status_code}")
                            if status == 'UserInBlacklist':
                                error_details.append(f"Phone {number} is blacklisted. For sandbox mode, add this number to your test numbers in Africa's Talking dashboard.")
                            else:
                                error_details.append(f"Phone {number}: {status} (Code: {status_code})")
                else:
                    print(f"[SMS Service] No recipients in the response")
                    error_details.append("No recipients in the response")
                
                # Log each SMS attempt
                if sms_settings:
                    for i, phone_number in enumerate(formatted_numbers):
                        recipient_data = recipients[i] if i < len(recipients) else {}
                        log_status = 'sent' if recipient_data.get('status') == 'Success' else 'failed'
                        error_message = recipient_data.get('status') if log_status == 'failed' else None
                        
                        SMSLog.objects.create(
                            sms_settings=sms_settings,
                            phone_number=phone_number,
                            message=message,
                            status=log_status,
                            error_message=error_message
                        )
            else:
                print(f"[SMS Service] Unexpected response format from Africa's Talking API")
                error_details.append("Unexpected response format")
            
            if success:
                return {'success': True, 'data': response}
            else:
                error_msg = '; '.join(error_details) if error_details else 'SMS sending failed'
                return {'success': False, 'error': error_msg, 'data': response}
                
        except Exception as e:
            print(f"SMS Error: {e}")
            # Log failed attempts
            if sms_settings:
                for phone_number in formatted_numbers:
                    SMSLog.objects.create(
                        sms_settings=sms_settings,
                        phone_number=phone_number,
                        message=message,
                        status='failed',
                        error_message=str(e)
                    )
            
            return {'success': False, 'error': str(e)}
    
    def get_latest_sensor_data(self, user):
        """Get the latest sensor data for a user"""
        try:
            latest_data = RealTimeData.objects.filter(user=user).order_by('-created').first()
            if latest_data:
                return {
                    'temperature': latest_data.Temperature,
                    'humidity': latest_data.Humidity,
                    'moisture': latest_data.Moisture,
                    'nitrogen': latest_data.Nitrogen,
                    'phosphorus': latest_data.Phosporous,
                    'potassium': latest_data.Potassium,
                    'timestamp': latest_data.created
                }
            return None
        except Exception as e:
            print(f"Error getting sensor data: {e}")
            return None
    
    def create_notification_message(self, user, sensor_data):
        """Create a notification message based on sensor data"""
        if not sensor_data:
            return f"Hello {user.username}, no recent sensor data available for your farm."
        
        message = f"shambaSmart Update for {user.username}:\n"
        message += f"🌡️ Temp: {sensor_data['temperature']}°C\n"
        message += f"💧 Humidity: {sensor_data['humidity']}%\n"
        message += f"🌱 Soil Moisture: {sensor_data['moisture']}%\n"
        message += f"🧪 N-P-K: {sensor_data['nitrogen']}-{sensor_data['phosphorus']}-{sensor_data['potassium']}\n"
        message += f"📅 Last Updated: {sensor_data['timestamp'].strftime('%Y-%m-%d %H:%M')}\n"
        
        # Add recommendations based on data
        recommendations = []
        if sensor_data['moisture'] < 30:
            recommendations.append("💡 Consider irrigation - soil moisture is low")
        if sensor_data['temperature'] > 35:
            recommendations.append("🌡️ High temperature detected - ensure adequate shade")
        if sensor_data['humidity'] < 40:
            recommendations.append("🌫️ Low humidity - consider misting")
        
        if recommendations:
            message += "\nRecommendations:\n" + "\n".join(recommendations)
        
        return message
    
    def send_scheduled_notifications(self):
        """Send notifications to users based on their SMS settings"""
        current_time = timezone.now()
        
        # Get all enabled SMS settings that need to send notifications
        sms_settings_list = SMSSettings.objects.filter(
            is_enabled=True,
            interval_seconds__gt=0
        )
        
        for sms_setting in sms_settings_list:
            try:
                # Check if it's time to send based on interval
                if sms_setting.last_sent:
                    next_send_time = sms_setting.last_sent + timedelta(seconds=sms_setting.interval_seconds)
                    if current_time < next_send_time:
                        continue
                
                # Get phone numbers
                phone_numbers = [pn.phone_number for pn in sms_setting.phone_numbers.filter(is_active=True)]
                if not phone_numbers:
                    continue
                
                # Get sensor data and create message
                sensor_data = self.get_latest_sensor_data(sms_setting.user)
                message = self.create_notification_message(sms_setting.user, sensor_data)
                
                # Send SMS
                result = self.send_sms(phone_numbers, message, sms_setting)
                
                if result['success']:
                    # Update last_sent timestamp
                    sms_setting.last_sent = current_time
                    sms_setting.save()
                    print(f"SMS sent successfully to {sms_setting.user.username}")
                else:
                    print(f"Failed to send SMS to {sms_setting.user.username}: {result['error']}")
                    
            except Exception as e:
                print(f"Error processing SMS for user {sms_setting.user.username}: {e}")
    
    def start_scheduler(self):
        """Start the SMS scheduler in a separate thread"""
        if self._scheduler_running:
            return
        
        self._scheduler_running = True
        self._scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        self._scheduler_thread.start()
        print("SMS Scheduler started")
    
    def stop_scheduler(self):
        """Stop the SMS scheduler"""
        self._scheduler_running = False
        if self._scheduler_thread:
            self._scheduler_thread.join()
        print("SMS Scheduler stopped")
    
    def _scheduler_loop(self):
        """Main scheduler loop that runs in the background"""
        while self._scheduler_running:
            try:
                self.send_scheduled_notifications()
                # Sleep for 10 seconds before checking again
                time.sleep(10)
            except Exception as e:
                print(f"Error in SMS scheduler loop: {e}")
                time.sleep(60)  # Wait 1 minute before retrying

# Global SMS manager instance
sms_manager = SMSManager()