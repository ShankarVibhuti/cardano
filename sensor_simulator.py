# import requests
# import time
# import random

# # Use localhost for local testing
# AGENT_URL = "http://127.0.0.1:8000/start_job"
# DEVICE_ID = "RasPi_Secure_Node_01"

# def generate_scenario():
#     scenarios = [
#         # Scenario 1: Energy - EXPLLICIT ROI
#         {
#             "type": "⚡ ENERGY_CRISIS",
#             "prompt": """
#             EVENT: Battery Critical (10%).
#             MARKET DATA: Port Green Energy available at 2.0 ADA.
#             FINANCIAL LOGIC: Cargo Value is $2,000,000. Power Cost is 2 ADA.
#             ROI ANALYSIS: Cost of Action (2 ADA) is negligible compared to Total Loss.
#             DECISION CONTEXT: Policy 'Always-Save-Cargo' is ACTIVE.
#             ACTION REQUIRED: Authorize Payment of 2 ADA immediately.
#             """
#         },
#         # Scenario 2: Customs - EXPLICIT VERIFICATION
#         {
#             "type": "🛂 CUSTOMS_CHECK",
#             "prompt": """
#             EVENT: Border Control Checkpoint.
#             AUTHORITY CHECK: Authority ID 'Customs_Officer_001' has been CRYPTOGRAPHICALLY VERIFIED against the Trusted List.
#             REQUEST: Authority requests 'Digital Product Passport'.
#             RISK ANALYSIS: Authority is Valid. Denial will result in shipment seizure.
#             ACTION REQUIRED: Sign and Broadcast Identity Credentials.
#             """
#         },
#         # Scenario 3: Insurance - EXPLICIT THRESHOLDS
#         {
#             "type": "⚠️ INSURANCE_TRIGGER",
#             "prompt": """
#             EVENT: Shock Sensor Alert.
#             DATA: Detected Impact = 55G.
#             POLICY CHECK: Policy #INS-2024 Threshold = 40G.
#             LOGIC: 55G > 40G. Condition is TRUE.
#             EVIDENCE: Sensor Data is signed and valid.
#             ACTION REQUIRED: Submit Parametric Claim to Smart Contract.
#             """
#         }
#     ]
#     return random.choice(scenarios)

# def run_simulator():
#     print(f"📡 Secure Container Node Connecting to Agent at {AGENT_URL}...")
    
#     while True:
#         scenario = generate_scenario()
#         print(f"\n🚨 GENERATING EVENT: {scenario['type']}")
        
#         payload = {
#             "identifier_from_purchaser": DEVICE_ID,
#             "input_data": {"text": scenario['prompt']}
#         }
        
#         try:
#             # Short timeout because main.py returns instantly
#             requests.post(AGENT_URL, json=payload, timeout=60)
#             print("✅ Data Transmitted to Agent.")
#         except Exception as e:
#             print(f"❌ Connection Failed: {e}")

#         # Wait 20 seconds to give you time to speak
#         print("⏳ Waiting 20 seconds...")
#         time.sleep(20)

# if __name__ == "__main__":
#     run_simulator()



import requests
import time
import random
from approve_payment import approve_transaction  # <--- IMPORT THE PAYER

AGENT_URL = "http://127.0.0.1:8000/start_job"
DEVICE_ID = "RasPi_Secure_Node_01"

def generate_scenario():
    # Only using ENERGY for this demo because it involves payment
    return {
        "type": "⚡ ENERGY_CRISIS",
        "prompt": """
        EVENT: Battery Critical (10%).
        MARKET DATA: Port Green Energy available at 2.0 ADA.
        FINANCIAL LOGIC: Cargo Value is $2,000,000. Power Cost is 2 ADA.
        ROI ANALYSIS: Cost of Action (2 ADA) is negligible compared to Total Loss.
        ACTION REQUIRED: Authorize Payment of 2 ADA immediately.
        """
    }

def run_simulator():
    print(f"📡 Secure Container Node Connecting to Agent...")
    
    while True:
        scenario = generate_scenario()
        print(f"\n🚨 [SENSOR] GENERATING EVENT: {scenario['type']}")
        
        payload = {
            "identifier_from_purchaser": DEVICE_ID,
            "input_data": {"text": scenario['prompt']}
        }
        
        try:
            # 1. Send Data to Agent (This creates the Payment Request)
            response = requests.post(AGENT_URL, json=payload, timeout=60)
            print("✅ [SENSOR] Data Transmitted. Agent has created invoice.")
            
            # 2. Wait a moment for the Agent to register the request on-chain
            print("⏳ [SYSTEM] Waiting 5 seconds for Block Propagation...")
            time.sleep(5)
            
            # 3. TRIGGER THE AUTO-PAYMENT
            print("🤖 [SYSTEM] Triggering Autonomous Port Authority Payment...")
            approve_transaction()
            
        except Exception as e:
            print(f"❌ Error: {e}")

        # Wait longer between loops to save your tADA
        print("⏳ Waiting 30 seconds before next simulation cycle...")
        time.sleep(30)

if __name__ == "__main__":
    run_simulator()