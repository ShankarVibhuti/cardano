from pycardano import *
import os

# --- CONFIGURATION ---
# 1. Your Blockfrost Preprod Key (From .env)
BLOCKFROST_ID = "preprod7ScQ1K3ehvSzK5GlSEtAVu0ZZiABM2tE" 

# 2. The Agent's Wallet (Where the money goes)
# Paste the 'addr_test...' you created for the Agent here
RECEIVER_ADDRESS = "addr_test1qqew86s09xqjxum5nrl6pggfu8ckncc95gnvthrj50dlhe4ynu7m4jgagd36878t2tqsngc05e2appdw4f506udf6m7s29c3rh" 

def approve_transaction():
    print("🔌 Port Authority: Initiating Power Connection...")
    
    # Load the Port Authority's Keys
    try:
        psk = PaymentSigningKey.load("port_authority.skey")
        pvk = PaymentVerificationKey.from_signing_key(psk)
        sender_address = Address(pvk.hash(), network=Network.TESTNET)
    except:
        print("❌ Error: Run 'generate_payer.py' first!")
        return

    # Setup Chain Context
    context = BlockFrostChainContext(BLOCKFROST_ID, base_url="https://cardano-preprod.blockfrost.io/api")

    # Build Transaction: Send 2 ADA
    tx_builder = TransactionBuilder(context)
    tx_builder.add_input_address(sender_address)
    tx_builder.add_output(TransactionOutput(Address.from_primitive(RECEIVER_ADDRESS), 2000000)) # 2 ADA

    # Sign and Submit
    print("✍️  Signing Transaction...")
    signed_tx = tx_builder.build_and_sign([psk], change_address=sender_address)
    
    print("🚀 Submitting to Preprod Network...")
    context.submit_tx(signed_tx)
    
    print("\n✅ PAYMENT SENT!")
    print(f"Tx ID: {signed_tx.id}")
    print("The Agent should detect this in 10-20 seconds...")

if __name__ == "__main__":
    approve_transaction()