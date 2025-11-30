import requests

# Configuration
url = "http://localhost:3001/api/v1/api-key/"
# Ensure this matches the ADMIN_KEY in your .env exactly
admin_password = "abcdef_this_should_be_very_secure" 

headers = {
    "token": admin_password,
    "Content-Type": "application/json"
}

# FIX: usageCredits must be a LIST of objects specifying unit and amount
payload = {
    "name": "Agent1",
    "usageCredits": [
        {
            "unit": "lovelace", 
            "amount": 1000000000  # 1000 ADA (in Lovelace)
        }
    ]
}

try:
    print(f"📡 Requesting API Key from {url}...")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code in [200, 201]:
        data = response.json()
        print("\n✅ SUCCESS! Here is your API Key:")
        print("-" * 40)
        # Handle different response formats
        key = data.get('apiKey') or data.get('token') or data
        print(f"API KEY: {key}")
        print("-" * 40)
        print("👉 Copy this key into your .env file as PAYMENT_API_KEY")
    else:
        print(f"\n❌ FAILED. Status Code: {response.status_code}")
        print(f"Error: {response.text}")

except Exception as e:
    print(f"\n❌ CONNECTION ERROR: {e}")
    print("Is the bank server running on port 3001?")