try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    print("Import successful")
except ImportError as e:
    print(f"Import failed: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
