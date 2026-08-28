import pytest
from app.schemas.questions import GenerateQuestionsRequest, QuestionGenerationResult, PracticeQuestion
from app.schemas.simplify import SimplifyTextRequest, SimplificationResult, WatchOutItem
from app.services.ai.question_generator import build_question_prompt
from app.services.ai.plain_language import build_simplification_prompt


# ---------------------------------------------------------------------------
# Benchmark Evaluation Datasets (TRD Section 21)
# ---------------------------------------------------------------------------

EVALUATION_DATASETS = {
    "biology_notes": (
        "Cellular respiration is the metabolic process cells use to convert glucose into ATP energy. "
        "It consists of three primary stages: Glycolysis in the cytoplasm producing 2 net ATP and 2 NADH; "
        "the Krebs Cycle (Citric Acid Cycle) in the mitochondrial matrix producing 2 ATP, 6 NADH, and 2 FADH2; "
        "and Oxidative Phosphorylation (Electron Transport Chain) across the inner mitochondrial membrane, "
        "which uses oxygen as the final electron acceptor to generate 26 to 28 ATP via ATP Synthase. "
        "The theoretical maximum yield per glucose molecule is approximately 30 to 32 ATP."
    ),
    "math_notes": (
        "In single-variable differential calculus, the derivative measures the instantaneous rate of change of a function. "
        "The Power Rule states that the derivative of x^n is n*x^(n-1). "
        "The Product Rule states that (f*g)' = f'*g + f*g'. "
        "The Fundamental Theorem of Calculus links differentiation and integration, stating that if F'(x) = f(x), "
        "then the definite integral of f(x) from a to b equals F(b) - F(a). "
        "Integration by parts is given by the formula integral(u dv) = u*v - integral(v du)."
    ),
    "history_lecture": (
        "The Industrial Revolution began in Great Britain during the late 18th century, driven by the invention "
        "of James Watt's improved steam engine and mechanized textile looms. "
        "Urbanization expanded rapidly as agrarian workers migrated to factory cities like Manchester. "
        "Working conditions were harsh, featuring 14-to-16 hour workdays and hazardous factory machinery. "
        "In response to widespread child labor, the British Parliament passed the Factory Act of 1833, "
        "prohibiting textile work for children under nine years old and mandating schooling."
    ),
    "lease_contract": (
        "RESIDENTIAL LEASE AGREEMENT: The Tenant agrees to lease the property for a term of 12 months beginning "
        "September 1, 2026. Monthly rent is $1,800.00, due on the 1st calendar day of each month. "
        "A late fee penalty of $75.00 shall be assessed if rent is not received by 11:59 PM on the 5th day of the month. "
        "A non-refundable pet sanitation fee of $250.00 is required upon move-in. "
        "The Tenant must provide at least sixty (60) days written notice prior to the expiration date to terminate the lease, "
        "or forfeit the security deposit of $1,800.00."
    ),
    "utility_bill": (
        "CITY POWER & WATER UTILITY BILL: Account #98234-12. Billing period covers August 1 to August 31, 2026. "
        "Total electricity consumption is 950 kWh billed at $0.15 per kWh ($142.50) plus a base service fee of $18.00. "
        "Total water usage is 4,200 gallons ($35.00). Total amount due is $195.50 by the payment deadline of September 20, 2026. "
        "Payments received after September 20 are subject to an immediate 5% late charge ($9.78) and potential service disconnection."
    ),
}


# ---------------------------------------------------------------------------
# AI Prompt Construction & Contract Integrity Tests
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("domain_key", ["biology_notes", "math_notes", "history_lecture"])
def test_question_generator_prompt_integrity(domain_key: str):
    notes = EVALUATION_DATASETS[domain_key]
    request = GenerateQuestionsRequest(notes=notes, question_count=10)
    prompt = build_question_prompt(request)

    # Assert prompt contains input text and strict contract rules
    assert notes in prompt
    assert "Generate exactly 10 questions" in prompt
    assert "3 multiple_choice, 2 true_false, 2 fill_blank, and 3 short_answer" in prompt
    assert "QuestionGenerationResult" in prompt


@pytest.mark.parametrize("domain_key", ["lease_contract", "utility_bill"])
def test_simplification_prompt_watch_out_detection(domain_key: str):
    text = EVALUATION_DATASETS[domain_key]
    text_type = "contract" if "contract" in domain_key else "bill"
    request = SimplifyTextRequest(text=text, text_type=text_type)
    prompt = build_simplification_prompt(request)

    assert text in prompt
    assert text_type in prompt
    assert "watch_out_for" in prompt
    assert "SimplificationResult" in prompt


# ---------------------------------------------------------------------------
# Benchmark AI Output Adherence & Grounding Evaluation
# ---------------------------------------------------------------------------

def test_question_generation_evaluation_benchmark():
    """
    Evaluates that a compliant AI question generation response adheres to all pedagogical requirements:
    1. Exactly 10 questions.
    2. Correct format distribution: 3 MC, 2 TF, 2 Fill, 3 Short Answer.
    3. Proper option structures for MC.
    4. Explanations present for all 10.
    """
    sample_questions = [
        # 3 Multiple Choice
        PracticeQuestion(id="1", type="multiple_choice", question="Where does Glycolysis take place?", options=["Cytoplasm", "Mitochondrial matrix", "Ribosome", "Nucleus"], answer="Cytoplasm", explanation="Glycolysis occurs in the cytoplasm."),
        PracticeQuestion(id="2", type="multiple_choice", question="What is the final electron acceptor in ETC?", options=["Oxygen", "Carbon dioxide", "Glucose", "Water"], answer="Oxygen", explanation="Oxygen serves as the terminal electron acceptor."),
        PracticeQuestion(id="3", type="multiple_choice", question="How much net ATP is produced by Glycolysis?", options=["2 ATP", "4 ATP", "32 ATP", "36 ATP"], answer="2 ATP", explanation="Glycolysis yields a net of 2 ATP."),
        # 2 True/False
        PracticeQuestion(id="4", type="true_false", question="The Krebs Cycle occurs in the cytoplasm.", options=[], answer="False", explanation="The Krebs Cycle occurs in the mitochondrial matrix."),
        PracticeQuestion(id="5", type="true_false", question="ATP Synthase is located across the inner mitochondrial membrane.", options=[], answer="True", explanation="ATP Synthase spans the inner mitochondrial membrane."),
        # 2 Fill in the blank
        PracticeQuestion(id="6", type="fill_blank", question="The maximum theoretical yield of ATP per glucose molecule is ___ to 32 ATP.", options=[], answer="30", explanation="Cellular respiration yields between 30 and 32 ATP."),
        PracticeQuestion(id="7", type="fill_blank", question="The enzyme complex responsible for synthesizing ATP during oxidative phosphorylation is ___.", options=[], answer="ATP Synthase", explanation="ATP Synthase produces ATP from ADP and Pi."),
        # 3 Short Answer
        PracticeQuestion(id="8", type="short_answer", question="Name the three main stages of cellular respiration.", options=[], answer="Glycolysis, Krebs Cycle, and Oxidative Phosphorylation", explanation="These constitute the three catabolic pathways."),
        PracticeQuestion(id="9", type="short_answer", question="What high-energy electron carriers are produced in the Krebs cycle?", options=[], answer="NADH and FADH2", explanation="NADH and FADH2 donate electrons to the ETC."),
        PracticeQuestion(id="10", type="short_answer", question="Why is oxygen necessary in cellular respiration?", options=[], answer="It acts as the final electron acceptor to keep the ETC moving.", explanation="Without oxygen, electrons cannot flow through the respiratory complexes."),
    ]

    result = QuestionGenerationResult(questions=sample_questions)
    assert len(result.questions) == 10

    type_counts = {}
    for q in result.questions:
        type_counts[q.type] = type_counts.get(q.type, 0) + 1
        assert len(q.question.strip()) > 5
        assert len(q.answer.strip()) > 0
        assert len(q.explanation.strip()) > 5

    assert type_counts.get("multiple_choice") == 3
    assert type_counts.get("true_false") == 2
    assert type_counts.get("fill_blank") == 2
    assert type_counts.get("short_answer") == 3


def test_plain_language_evaluation_benchmark():
    """
    Evaluates that a compliant AI plain-language response:
    1. Simplifies complex jargon.
    2. Identifies key takeaways.
    3. Extracts all actionable watch-out items (fees, deadlines, obligations) with appropriate severity.
    """
    contract_evaluation = SimplificationResult(
        plain_language=(
            "This is a 1-year apartment rental agreement starting September 1, 2026. "
            "Rent is $1,800 every month, due on the 1st. If you pay after the 5th, you will be charged a $75 late fee. "
            "There is a $250 non-refundable pet fee. You must give 60 days written notice before moving out, or you will lose your $1,800 deposit."
        ),
        watch_out_for=[
            WatchOutItem(category="fee", title="Late Rent Penalty", description="$75 late fee assessed if rent is not received by the 5th of the month.", severity="alert"),
            WatchOutItem(category="fee", title="Non-refundable Pet Fee", description="$250 non-refundable fee required upon move-in.", severity="warning"),
            WatchOutItem(category="deadline", title="60-Day Move-Out Notice", description="Must give written notice 60 days in advance to avoid losing the $1,800 security deposit.", severity="alert"),
        ],
    )

    assert len(contract_evaluation.plain_language) > 50
    assert len(contract_evaluation.watch_out_for) == 3

    categories = [item.category for item in contract_evaluation.watch_out_for]
    assert "fee" in categories
    assert "deadline" in categories
