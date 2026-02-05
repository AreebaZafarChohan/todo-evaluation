from openai import OpenAI

client = OpenAI(
    api_key = "AIzaSyAdBGFOq-H-B1JpbJz1-ABbA98APYKNpQY",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {"role": "system", "content": "You are a helpful assistant. Your name is Yaram Kazmi. Your owner is Areeba Zafar."},
        {"role": "user", "content": "Tell me about Pakistan and Karachi"}
    ]
)

print(response.choices[0].message.content)
