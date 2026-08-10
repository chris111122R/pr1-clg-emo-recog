from typing import Dict, Any, List

class InterventionEngine:
    """
    Evidence-based intervention engine matching emotional states and uncertainty bounds 
    to clinical-grade guidance recommendations.
    """
    def __init__(self):
        pass

    def generate_intervention(self, 
                             emotion: str, 
                             confidence: float, 
                             uncertainty: float, 
                             risk_level: str = "Low") -> Dict[str, Any]:
        """
        Generates clinical interventions based on prediction, confidence, uncertainty, and risk constraints.
        
        Args:
            emotion: Classified emotional state (Joy, Sadness, Anger, Fear, etc.)
            confidence: Calibration confidence score percentage.
            uncertainty: MC predictive uncertainty score percentage.
            risk_level: External risk triage label (Low, Medium, High).
        """
        
        # High uncertainty fallback
        if uncertainty > 70.0:
            return {
                "intervention_type": "Data Clarification Request",
                "risk_assessment": "Unreliable Prediction Bounds",
                "recommendation": "The system detected high uncertainty. Please provide additional context, voice tone records, or clarify text phrasing to calibrate a reliable emotional twin profile.",
                "evidence_base": "Information Theory: High entropy predictions have low information density and should fallback to request-for-input.",
                "disclaimer": "AUTOMATED RECOMMENDATION. This is an information request and not a clinical diagnosis or medical directive."
            }

        # Intervention mappings
        interventions = {
            "Joy": {
                "type": "Capitalizing positive affect",
                "recommendation": "Incorporate journaling to document triggers that contributed to this high positive state. Reflecting on positive triggers builds long-term psychological resilience.",
                "evidence": "Positive Psychology: Fredrickson's Broaden-and-Build Theory (1998)."
            },
            "Sadness": {
                "type": "Behavioral Activation / Reflection",
                "recommendation": "Consider engaging in a brief physical activity (e.g., a 10-minute walk) or a grounding breathing exercise (4-7-8 method). Reach out to a support circle peer if state persists.",
                "evidence": "Cognitive Behavioral Therapy (CBT) behavioral activation protocol."
            },
            "Anger": {
                "type": "Cognitive Reappraisal & De-escalation",
                "recommendation": "Engage in progressive muscle relaxation (PMR). Pause before reacting and list three objective factors contributing to the current situation to shift cognitive appraisal.",
                "evidence": "Beck's Cognitive Therapy for emotional regulation (1979)."
            },
            "Fear": {
                "type": "Somatic Grounding & Stabilization",
                "recommendation": "Practice the 5-4-3-2-1 sensory grounding exercise (5 things you see, 4 you can touch, 3 hear, 2 smell, 1 taste). This shifts attention away from internal stress loops.",
                "evidence": "Mindfulness-Based Stress Reduction (MBSR) somatic grounding protocols."
            },
            "Surprise": {
                "type": "Cognitive Integration",
                "recommendation": "Allow yourself time to orient. Break down the sudden input into manageable steps to assimilate the surprise into your current schema.",
                "evidence": "Cognitive Schema Theory on novelty orientation."
            },
            "Disgust": {
                "type": "Boundary Identification",
                "recommendation": "Evaluate if the disgust is physical or moral. Clearly delineate boundaries and establish protective measures to maintain your baseline comfort zone.",
                "evidence": "Affective Science: Disgust as an evolutionary avoidance vector."
            },
            "Neutral": {
                "type": "Baseline Stabilization",
                "recommendation": "Maintain standard workflows. Continue monitoring emotional metrics periodically to track baseline shifts.",
                "evidence": "General Adaptive Systems baseline homeostasis monitoring."
            }
        }

        selected = interventions.get(emotion, interventions["Neutral"])
        
        # Adjust recommendation for High Risk scenarios
        if risk_level == "High":
            recommendation = f"CRITICAL ELEVATION ALERT: {selected['recommendation']} Additionally, please consult a certified healthcare professional or contact crisis services immediately."
            risk_assessment = "Critical Intervention Threshold Triggered"
        elif risk_level == "Medium":
            recommendation = f"MODERATE TRAGE WARNING: {selected['recommendation']} Consider schedule a sync with a peer counselor or setting aside time for self-care."
            risk_assessment = "Moderate Intervention Baseline"
        else:
            recommendation = selected["recommendation"]
            risk_assessment = "Standard Baseline Support"

        return {
            "intervention_type": selected["type"],
            "risk_assessment": risk_assessment,
            "recommendation": recommendation,
            "evidence_base": selected["evidence"],
            "disclaimer": "AUTOMATED RECOMMENDATION. This system is a self-care utility. Recommendations are not medical treatments. For mental health emergencies, dial local crisis hotlines."
        }
