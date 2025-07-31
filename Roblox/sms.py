# import package
import africastalking


# Initialize SDK
username = "shambasmart"    # use 'sandbox' for development in the test environment
api_key = "atsk_f74c819ae36af738b65a8dbbea398ff50af51ab25ce7c2c1105b56dcdaf73e3c05f32e40"      # use your sandbox app API key for development in the test environment
africastalking.initialize(username, api_key)


# Initialize a service e.g. SMS
sms = africastalking.SMS


# Use the service synchronously
response = sms.send("Hello Message!", ["+254722765706"])
print(response)

# # Or use it asynchronously
# def on_finish(error, response):
#     if error is not None:
#         raise error
#     print(response)
#
# sms.send("Hello Message!", ["+2547xxxxxx"], callback=on_finish)
