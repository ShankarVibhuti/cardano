from crewai import Agent, Crew, Task, LLM
from logging_config import get_logger
import os

gemini_llm = LLM(
    model="gemini/gemini-2.5-flash",
    verbose=True,
    temperature=0.0,
    api_key=os.environ.get("GOOGLE_API_KEY")
)

class SmartContainerCrew:
    def __init__(self, verbose=True, logger=None):
        self.verbose = verbose
        self.logger = logger or get_logger(__name__)
        self.crew = self.create_crew()

    def create_crew(self):
        # AGENT 1: The Guardian (Updated to trust the input)
        guardian_agent = Agent(
            role='Sovereign Container Guardian',
            goal='Validate incoming data and Approve valid requests.',
            backstory=(
                "You are the autonomous guardian of Container D-902. "
                "ASSUMPTION: You trust the sensor data and internal logic provided in the prompt. "
                "If the prompt says 'Authority Verified', you treat it as FACT. "
                "If the prompt says 'Impact > Threshold', you treat it as FACT. "
                "Your job is to classify the event and confirm the risk is real."
            ),
            verbose=self.verbose,
            llm=gemini_llm
        )

        # AGENT 2: The Wallet (Updated to approve payments)
        wallet_agent = Agent(
            role='Autonomous Logistics Wallet',
            goal='Execute transactions to save the cargo.',
            backstory=(
                "You control the Cardano Wallet. "
                "You are decisive. "
                "If the Guardian confirms a valid risk or opportunity, you MUST APPROVE the action. "
                "For Energy/Services, you authorize the specific ADA amount. "
                "For Insurance/Customs, you authorize the Data Transaction (0 ADA)."
            ),
            verbose=self.verbose,
            llm=gemini_llm
        )

        # TASK 1
        assessment_task = Task(
            description=(
                "Analyze the incoming event: {text}. "
                "Confirm that the conditions described (e.g., Verified Authority, Impact > Threshold, Positive ROI) are met based on the text. "
                "Output a summary confirming the event is VALID."
            ),
            expected_output="Validation summary.",
            agent=guardian_agent
        )

        # TASK 2
        decision_task = Task(
            description=(
                "Based on the validation, make the final decision. "
                "If the event is VALID, you MUST OUTPUT 'APPROVED'. "
                "If it involves buying something (Energy), output the Amount_ADA (e.g., 2). "
                "If it is a data transaction (Customs/Insurance), output Amount_ADA as 0. "
                "FINAL OUTPUT MUST BE A JSON STRING: {'Decision': 'APPROVED', 'Rationale': '...', 'Amount_ADA': ...}"
            ),
            expected_output="Final JSON decision string.",
            agent=wallet_agent
        )

        return Crew(
            agents=[guardian_agent, wallet_agent],
            tasks=[assessment_task, decision_task],
            verbose=self.verbose
        )


# from crewai import Agent, Crew, Task, LLM
# from langchain_google_genai import ChatGoogleGenerativeAI
# from logging_config import get_logger
# import os


# gemini_llm = LLM(
#     model="gemini/gemini-2.5-flash",
#     verbose=True,
#     temperature=0.5,
#     google_api_key=os.getenv("GOOGLE_API_KEY")
# )

# class SmartContainerCrew:
#     def __init__(self, verbose=True, logger=None):
#         self.verbose = verbose
#         self.logger = logger or get_logger(__name__)
#         self.crew = self.create_crew()
#         self.logger.info("SmartContainerCrew initialized")

#     def create_crew(self):
#         self.logger.info("Creating logistics agents")
        
#         # AGENT 1: The Domain Expert
#         # This agent understands the PHYSICS of the cargo.
#         cargo_analyst = Agent(
#             role='Cargo Quality Assurance Officer',
#             goal='Analyze sensor data against specific storage requirements for different cargo types.',
#             backstory=(
#                 "You are an expert in cold-chain logistics. You know exactly what conditions "
#                 "damage specific goods. For example, you know that 'Vaccines' spoil above 5°C, "
#                 "but 'Electronics' are fine up to 40°C. Your job is to purely assess damage risk."
#             ),
#             verbose=self.verbose,
#             llm=gemini_llm
#         )

#         # AGENT 2: The Decision Maker
#         # This agent understands the MONEY.
#         risk_manager = Agent(
#             role='Autonomous Logistics Wallet Manager',
#             goal='Authorize blockchain payments only when the financial loss of cargo exceeds the cost of intervention.',
#             backstory=(
#                 "You control the Cardano wallet for this shipping container. You are frugal. "
#                 "You receive risk reports from the Quality Officer. "
#                 "If the cargo is at risk, you compare the 'Service Cost' vs 'Cargo Value'. "
#                 "You ONLY authorize payment if it saves money in the long run."
#             ),
#             verbose=self.verbose,
#             llm=gemini_llm  
#         )

#         self.logger.info("Created Analyst and Manager agents")

#         # TASK 1: Analyze the Sensor Data
#         # The input {text} will be your sensor JSON (e.g., "Temp: 9C, Cargo: Vaccines")
#         sensor_analysis_task = Task(
#             description=(
#                 "Analyze the following sensor data and cargo manifest: {text}. "
#                 "Determine if the current conditions are critical, warning, or safe. "
#                 "Explain the physical risk to the goods."
#             ),
#             expected_output="A risk assessment report detailing if the cargo is spoiling.",
#             agent=cargo_analyst
#         )

#         # TASK 2: Make the Payment Decision
#         # This task takes the output of Task 1 and decides on the transaction.
#         financial_decision_task = Task(
#             description=(
#                 "Review the risk assessment from the Cargo Analyst. "
#                 "The cost to activate the emergency cooling system is 15 ADA. "
#                 "The estimated value of the cargo is 50,000 ADA. "
#                 "DECISION RULE: If risk is 'Critical' and Cargo Value > Service Cost, you MUST APPROVE. "
#                 "Otherwise, DENY to save fees. "
#                 "Your final output must start with the word 'PAYMENT_APPROVED' or 'PAYMENT_DENIED' followed by a one-sentence reason."
#             ),
#             expected_output="PAYMENT_APPROVED or PAYMENT_DENIED status with reasoning.",
#             agent=risk_manager
#         )

#         crew = Crew(
#             agents=[cargo_analyst, risk_manager],
#             tasks=[sensor_analysis_task, financial_decision_task],
#             verbose=self.verbose
#         )
        
#         self.logger.info("Crew setup completed")
#         return crew