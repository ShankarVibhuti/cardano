import requests
import json

# --- CONFIGURATION ---
BASE_URL = "http://localhost:3001/api/v1/api-key/"
ADMIN_PASSWORD = "abcdef_this_should_be_very_secure"

headers = {
    "token": ADMIN_PASSWORD,
    "Content-Type": "application/json"
}

def create_super_key():
    print(f"🔑 Requesting SUPER API Key...")
    
    payload = {
        "name": "SuperAdminKey",
        "permission": "Admin",  # <--- THIS IS CRITICAL
        "UsageCredits": [
            {
                "unit": "lovelace", 
                "amount": "10000000000" 
            }
        ]
    }
    
    try:
        response = requests.post(BASE_URL, headers=headers, json=payload)
        
        if response.status_code in [200, 201]:
            raw_data = response.json()
            data = raw_data.get("data", raw_data)
            api_key = data.get("apiKey") or data.get("token")
            
            print(f"\n✅ SUCCESS! SUPER KEY CREATED:")
            print("-" * 50)
            print(f"{api_key}")
            print("-" * 50)
            print("👉 Copy this key and paste it into 'final_register.py'")
        else:
            print(f"\n❌ FAILED. Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    create_super_key()