import requests
import json

# --- CONFIGURATION ---
BASE_URL = "http://localhost:3001/api/v1"
# Ensure this is the SUPER KEY you just created (with 'Admin' permission)
# If you lost it, put your 'abcdef_...' ADMIN_KEY here, it usually works for local admin ops
API_TOKEN = "masumi-payment-admin-khy039hd31rq9x04ifbulkcf" 
# Fallback to Admin Password if the API key fails
ADMIN_PASSWORD = "abcdef_this_should_be_very_secure"

def get_headers(token):
    return {
        "token": token,
        "Content-Type": "application/json"
    }

def get_wallet_vkey():
    """Fetches the Master Wallet's Verification Key (vkey)"""
    print(f"🔍 Fetching Wallet VKey...")
    # We use the ADMIN_PASSWORD here because GET /wallet often requires Root Admin
    try:
        response = requests.get(f"{BASE_URL}/wallet/", headers=get_headers(ADMIN_PASSWORD))
        
        if response.status_code == 200:
            data = response.json()
            # Handle possible list or object response
            if isinstance(data, list) and len(data) > 0:
                wallet = data[0]
            elif isinstance(data, dict) and "data" in data:
                wallet = data["data"]
            else:
                wallet = data

            vkey = wallet.get("walletVkey") or wallet.get("vkey")
            print(f"   ✅ Found VKey: {vkey[:15]}...")
            return vkey
        else:
            print(f"   ❌ Failed to get wallet: {response.text}")
            return None
    except Exception as e:
        print(f"   ❌ Connection Error: {e}")
        return None

def register_agent(vkey):
    """Registers the agent with the FULL required payload"""
    print(f"\n🚀 Registering Agent with Full Metadata...")
    
    # This payload satisfies all the "Required" errors you saw
    payload = {
        "network": "Preprod",
        "sellingWalletVkey": vkey,  # The key we just found
        "name": "SovereignContainer",
        "description": "Autonomous Logistics Agent for Cold Chain and Compliance",
        "apiBaseUrl": "http://localhost:8000", # Where your Agent listens
        "image": "https://i.imgur.com/8u1D8q0.png", # Placeholder image
        "tags": ["Logistics", "IoT", "Compliance"],
        "exampleOutputs": [
            "Decision: APPROVED", 
            "Audit Log: 0x123..."
        ],
        "capability": "autonomous-decision-making",
        "author": "Team D-902",
        "version": "1.0.0",
        
        # FIXING THE PRICING FORMAT
        "agentPricing": [
            {
                "unit": "lovelace",
                "amount": 2000000  # 2 ADA
            }
        ]
    }

    try:
        # Use the API_TOKEN (The one with credits) to pay for registration
        response = requests.post(f"{BASE_URL}/registry/", headers=get_headers(API_TOKEN), json=payload)
        
        if response.status_code in [200, 201]:
            data = response.json().get("data", response.json())
            did = data.get("identifier")
            print(f"\n✅ SUCCESS! AGENT REGISTERED")
            print("-" * 60)
            print(f"AGENT_IDENTIFIER={did}")
            print("-" * 60)
            print("👉 Update your .env file with this ID immediately.")
        else:
            print(f"\n❌ REGISTRATION FAILED. Status: {response.status_code}")
            print(f"Error: {response.text}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    # 1. Get the VKey first
    vkey = get_wallet_vkey()
    
    # 2. Use it to register
    if vkey:
        register_agent(vkey)
    else:
        print("\n⛔ Cannot register without Wallet VKey. Ensure Bank is running and Wallet is created.")