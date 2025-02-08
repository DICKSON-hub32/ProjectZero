import requests

url = "https://gemini-pro-ai.p.rapidapi.com/"

payload = { "contents": [
		{
			"role": "user",
			"parts": [{ "text": "Hello" }]
		}
	] }
headers = {
	"x-rapidapi-key": "9eaa8c7b5emsh15813134738b8c2p1495d9jsn5a973fe692fb",
	"x-rapidapi-host": "gemini-pro-ai.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

