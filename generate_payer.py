from pycardano import PaymentSigningKey, PaymentVerificationKey, Address, Network
import os

def setup_payer():
    # 1. Generate Keys
    psk = PaymentSigningKey.generate()
    pvk = PaymentVerificationKey.from_signing_key(psk)
    
    # 2. Generate Address (Preprod)
    address = Address(payment_part=pvk.hash(), network=Network.TESTNET)
    
    # 3. Save to files
    psk.save("port_authority.skey")
    print(f"✅ Port Authority Wallet Created!")
    print(f"👉 ADDRESS: {address}")
    print(f"⚠️  CRITICAL: Send 100 tADA to this address using the Faucet NOW.")

if __name__ == "__main__":
    setup_payer()