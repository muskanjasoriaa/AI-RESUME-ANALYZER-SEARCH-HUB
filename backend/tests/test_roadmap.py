from app.roadmap.generator import generate_personalized_roadmap
from app.roadmap.roles_data import CAREER_ROLES

def test_generate_personalized_roadmap():
    target = "Full-Stack Developer"
    user_skills = ["JavaScript", "React", "HTML/CSS"]
    
    roadmap = generate_personalized_roadmap(target, user_skills, "Intermediate")
    
    assert roadmap["target_role"] == target
    assert len(roadmap["phases"]) == 4
    assert roadmap["readiness_percentage"] > 0
    assert "TypeScript" in roadmap["skill_gap_summary"]["missing_critical_skills"]
    assert "React" in roadmap["skill_gap_summary"]["matched_core_skills"]
    
    # Verify phases have milestones with resources
    for phase in roadmap["phases"]:
        assert len(phase["milestones"]) > 0
        for m in phase["milestones"]:
            assert "resources" in m
            assert len(m["action_items"]) > 0
