import requests

url = "https://gemini-pro-ai.p.rapidapi.com/"

payload = { "contents": [
		{
			"role": "user",
			"parts": [{ "text": "Hello" }]
		}
	] }
headers = {
	"x-rapidapi-key": "dc46cec689msh3399416613e328ap1a47a8jsn5f0f0c3abec4",
	"x-rapidapi-host": "gemini-pro-ai.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())