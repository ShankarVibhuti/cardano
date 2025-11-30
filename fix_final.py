# import requests
# import json

# # --- CONFIGURATION ---
# BASE_URL = "http://localhost:3001/api/v1/api-key/"
# ADMIN_PASSWORD = "abcdef_this_should_be_very_secure"

# headers = {
#     "token": ADMIN_PASSWORD,
#     "Content-Type": "application/json"
# }

# def create_key():
#     print(f"🔑 Requesting API Key...")
    
#     payload = {
#         "name": "Agent1",
#         # FIX 1: Use PascalCase 'UsageCredits' (matches error log)
#         # FIX 2: Use STRING for amount ("10000...") (matches error log)
#         "UsageCredits": [
#             {
#                 "unit": "lovelace", 
#                 "amount": "10000000000" 
#             }
#         ]
#     }
    
#     try:
#         response = requests.post(BASE_URL, headers=headers, json=payload)
        
#         if response.status_code in [200, 201]:
#             raw_data = response.json()
#             # Handle Masumi's data wrapper
#             data = raw_data.get("data", raw_data)
            
#             # Key might be 'apiKey' or 'token'
#             api_key = data.get("apiKey") or data.get("token")
            
#             print(f"\n✅ SUCCESS! API KEY CREATED:")
#             print("-" * 50)
#             print(f"{api_key}")
#             print("-" * 50)
#             print("👉 Copy this into your .env as PAYMENT_API_KEY")
#         else:
#             print(f"\n❌ FAILED. Status: {response.status_code}")
#             print(f"Error: {response.text}")
            
#     except Exception as e:
#         print(f"❌ Connection Error: {e}")

# if __name__ == "__main__":
#     create_key()

import requests
import json

# --- CONFIGURATION ---
BASE_URL = "http://localhost:3001/api/v1/api-key/"
# Ensure this matches the ADMIN_KEY in your .env
ADMIN_PASSWORD = "abcdef_this_should_be_very_secure"

headers = {
    "token": ADMIN_PASSWORD,
    "Content-Type": "application/json"
}

def create_super_key():
    print(f"🔑 Requesting SUPER API Key...")
    
    payload = {
        "name": "SuperAgent1",
        # FIX: Use 'Admin' (PascalCase), not 'ADMIN'
        "permission": "Admin",  
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
            print("👉 1. Update 'api_register.py' with this key.")
            print("👉 2. Update your main '.env' with this key.")
        else:
            print(f"\n❌ FAILED. Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    create_super_key()