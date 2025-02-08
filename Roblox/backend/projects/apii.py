import requests

url = "https://gemini-pro-ai.p.rapidapi.com/"

querystring = {"who was the first president of kenya?"}

headers = {
	"x-rapidapi-key": "dc46cec689msh3399416613e328ap1a47a8jsn5f0f0c3abec4",
	"x-rapidapi-host": "gemini-pro-ai.p.rapidapi.com",
}

response = requests.post(url, headers=headers, params=querystring)

print(response.json())