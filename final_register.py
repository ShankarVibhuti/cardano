import requests
import json

# --- CONFIGURATION ---
BASE_URL = "http://localhost:3001/api/v1"
API_TOKEN = "masumi-payment-admin-ar93v0hzoisdm9d9d092piae"
ADMIN_PASSWORD = "abcdef_this_should_be_very_secure"

def create_wallet():
    print(f"1️⃣  Creating New Master Wallet...")
    try:
        res = requests.post(f"{BASE_URL}/wallet/", 
                          headers={"token": ADMIN_PASSWORD, "Content-Type": "application/json"}, 
                          json={"network": "Preprod"})
        if res.status_code == 200:
            data = res.json().get("data", res.json())
            print(f"   ✅ Wallet Created! Address: {data.get('walletAddress')}")
            print(f"   👉 FUND THIS ADDRESS WITH 1000 tADA NOW!")
            return data.get("walletVkey")
    except: pass
    return None

def register_agent(vkey):
    print(f"\n2️⃣  Starting Brute Force Registration...")
    headers = {"token": API_TOKEN, "Content-Type": "application/json"}
    
    # Base Metadata
    base_payload = {
        "network": "Preprod",
        "sellingWalletVkey": vkey,
        "name": "SovereignContainer",
        "description": "Logistics Agent",
        "apiBaseUrl": "http://localhost:8000",
        "image": "https://placehold.co/400",
        "version": "1.0.0",
        "Tags": ["Logistics"],
        "Author": {"name": "Team D-902", "contact": "admin@d902.io"},
        "Capability": {"name": "decision", "version": "1.0.0", "description": "AI"},
        "ExampleOutputs": [{"name": "Log", "description": "Audit", "url": "http://x", "mimeType": "application/json"}]
    }

    # --- THE 4 COMBINATIONS ---
    pricing_attempts = [
        # Format A: String Amount + Policy/Asset
        [{"policyId": "", "assetName": "", "amount": "2000000"}],
        # Format B: Integer Amount + Policy/Asset
        [{"policyId": "", "assetName": "", "amount": 2000000}],
        # Format C: String Amount + Unit
        [{"unit": "lovelace", "amount": "2000000"}],
        # Format D: Integer Amount + Unit
        [{"unit": "lovelace", "amount": 2000000}]
    ]

    for i, price_format in enumerate(pricing_attempts):
        print(f"   🔄 Attempt {i+1}...")
        payload = base_payload.copy()
        payload["AgentPricing"] = price_format
        
        try:
            res = requests.post(f"{BASE_URL}/registry/", headers=headers, json=payload)
            if res.status_code in [200, 201]:
                data = res.json().get("data", res.json())
                print(f"\n   ✅ SUCCESS! FORMAT {i+1} WORKED!")
                print("-" * 60)
                print(f"AGENT_IDENTIFIER={data.get('identifier')}")
                print("-" * 60)
                return
            else:
                print(f"      ❌ Failed: {res.text}")
        except Exception as e:
            print(f"      ❌ Error: {e}")

    print("\n⛔ ALL ATTEMPTS FAILED.")

if __name__ == "__main__":
    vkey = create_wallet()
    if vkey:
        register_agent(vkey)