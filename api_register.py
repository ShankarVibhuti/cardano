import requests
import json

# --- CONFIGURATION ---
URL = "http://localhost:3001/api/v1/registry/"

# Use the API Key you just generated (It has the credits to pay the registration fee)
API_KEY = "masumi-payment-admin-khy039hd31rq9x04ifbulkcf"

headers = {
    "token": API_KEY,
    "Content-Type": "application/json"
}

payload = {
    "name": "SovereignContainer",
    "description": "Autonomous Logistics Agent",
    "price": 2,
    "tags": ["logistics", "cold-chain"]
}

def register():
    print(f"📡 Registering Agent on Masumi Network...")
    
    try:
        response = requests.post(URL, headers=headers, json=payload)
        
        if response.status_code in [200, 201]:
            raw_data = response.json()
            # Handle Masumi's data wrapper
            data = raw_data.get("data", raw_data)
            
            did = data.get("identifier")
            
            print(f"\n✅ SUCCESS! AGENT REGISTERED")
            print("-" * 60)
            print(f"AGENT_IDENTIFIER={did}")
            print("-" * 60)
            print("👉 Copy the string above (starting with did:masumi:...) into your .env file.")
        else:
            print(f"\n❌ REGISTRATION FAILED. Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("Is the bank server running on port 3001?")

if __name__ == "__main__":
    register()