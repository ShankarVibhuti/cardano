import requests
import json

# --- CONFIGURATION ---
BASE_URL = "http://localhost:3001/api/v1"
ADMIN_PASSWORD = "abcdef_this_should_be_very_secure"

headers = {
    "token": ADMIN_PASSWORD,
    "Content-Type": "application/json"
}

def get_inner_data(response_json):
    """Helper to handle {status: success, data: ...} wrapper"""
    if "data" in response_json and isinstance(response_json["data"], dict):
        return response_json["data"]
    return response_json

def create_wallet():
    print(f"\n1️⃣  Creating Master Wallet...")
    url = f"{BASE_URL}/wallet/"
    payload = {"network": "Preprod"}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code in [200, 201]:
            raw_data = response.json()
            data = get_inner_data(raw_data)
            
            address = data.get("walletAddress") or data.get("address")
            
            if address:
                print(f"✅ WALLET CREATED!")
                print(f"   Address: {address}")
                print(f"👉 ACTION REQUIRED: Send 1000 tADA to this address now.")
                return True
            else:
                print(f"❌ Wallet created but address not found.")
                return False
        else:
            print(f"❌ Wallet Creation Failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

def create_api_key():
    print(f"\n2️⃣  Creating Agent API Key...")
    url = f"{BASE_URL}/api-key/"
    
    # FIX: 'amount' must be a STRING ("10000000000"), not a number
    payload = {
        "name": "Agent1",
        "usageCredits": [
            {
                "unit": "lovelace", 
                "amount": "10000000000"  # <--- STRING FORMAT
            }
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code in [200, 201]:
            raw_data = response.json()
            data = get_inner_data(raw_data)
            
            # Key might be 'apiKey', 'token', or just the string itself
            api_key = data.get("apiKey") or data.get("token")
            
            if api_key:
                print(f"✅ API KEY CREATED!")
                print(f"   Key: {api_key}")
                print(f"👉 ACTION REQUIRED: Paste this into your agent's .env file.")
                return True
            else:
                print(f"❌ Key created but not found in response: {data}")
                return False
        else:
            print(f"❌ API Key Failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Masumi Setup...")
    # You can comment out create_wallet() if you already have one funded
    if create_wallet():
        create_api_key()
    print("\nDone.")