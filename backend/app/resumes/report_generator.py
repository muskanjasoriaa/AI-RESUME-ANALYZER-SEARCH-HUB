import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(analysis_data: Dict[str, Any]) -> io.BytesIO:
    """Generates a professional PDF report summarizing the ATS resume analysis."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=12
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E293B'),
        leftIndent=12
    )
    
    story = []
    
    # 1. Header
    story.append(Paragraph("AI Resume Analyzer & Career Hub", title_style))
    candidate_name = analysis_data.get("contact_info", {}).get("name", "Candidate")
    target_role = analysis_data.get("target_role", "Software Engineer")
    story.append(Paragraph(f"Official ATS Compatibility & Diagnostic Evaluation Report | Candidate: <b>{candidate_name}</b> | Target Role: <b>{target_role}</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceAfter=14))
    
    # 2. Score Summary Box
    ats_score = analysis_data.get("general_score", 0.0)
    tier = analysis_data.get("rating_tier", "Evaluation")
    
    score_data = [
        [
            Paragraph(f"<b>Overall ATS Score:</b> <font size=16 color='#2563EB'><b>{ats_score} / 100</b></font>", body_style),
            Paragraph(f"<b>Readiness Rating:</b> <b>{tier}</b>", body_style),
            Paragraph(f"<b>File:</b> {analysis_data.get('filename', 'Resume')}", body_style)
        ]
    ]
    score_table = Table(score_data, colWidths=[200, 180, 160])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
    ]))
    story.append(score_table)
    story.append(Spacer(1, 10))
    
    # 3. Category Breakdown Table
    story.append(Paragraph("Detailed Category Breakdown", section_heading))
    cat_scores = analysis_data.get("category_scores", {})
    table_rows = [["Evaluation Dimension", "Score Achieved", "Maximum Points", "Status"]]
    for k, v in cat_scores.items():
        sc = v.get("score", 0)
        mx = v.get("max", 20)
        pct = (sc / mx) * 100
        status_label = "Optimal" if pct >= 80 else ("Acceptable" if pct >= 50 else "Needs Action")
        table_rows.append([v.get("label", k), f"{sc} pts", f"{mx} pts", status_label])
        
    cat_table = Table(table_rows, colWidths=[220, 100, 100, 120])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(cat_table)
    story.append(Spacer(1, 10))
    
    # 4. Identified Strengths
    story.append(Paragraph("Key Resume Strengths", section_heading))
    strengths = analysis_data.get("strengths", [])
    if strengths:
        for s in strengths[:5]:
            story.append(Paragraph(f"• {s}", bullet_style))
    else:
        story.append(Paragraph("• Standard layout detected.", bullet_style))
    story.append(Spacer(1, 8))
    
    # 5. Weaknesses & Improvement Areas
    story.append(Paragraph("Areas Requiring Optimization", section_heading))
    weaknesses = analysis_data.get("weaknesses", [])
    if weaknesses:
        for w in weaknesses[:5]:
            story.append(Paragraph(f"• {w}", bullet_style))
    else:
        story.append(Paragraph("• No critical parsing bottlenecks detected.", bullet_style))
    story.append(Spacer(1, 8))
    
    # 6. Actionable Recommendations
    story.append(Paragraph("Prioritized ATS Recommendations", section_heading))
    recs = analysis_data.get("recommendations", [])
    for idx, r in enumerate(recs[:4]):
        issue = r.get("issue", "")
        action = r.get("action", "")
        gain = r.get("potential_gain", "")
        story.append(Paragraph(f"<b>{idx+1}. {issue}</b> ({gain}): {action}", bullet_style))
    story.append(Spacer(1, 10))
    
    # 7. Skills & Target Role Gap
    story.append(Paragraph(f"Skill Alignment for {target_role}", section_heading))
    matched = analysis_data.get("matched_skills", [])
    missing = analysis_data.get("missing_skills", [])
    
    matched_text = ", ".join(matched[:15]) if matched else "None identified"
    missing_text = ", ".join(missing[:15]) if missing else "None"
    
    story.append(Paragraph(f"<b>Verified Matched Skills:</b> {matched_text}", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Recommended Skills to Acquire:</b> <font color='#DC2626'>{missing_text}</font>", body_style))
    story.append(Spacer(1, 14))
    
    # Footer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94A3B8'), spaceAfter=6))
    story.append(Paragraph("Generated by AI Resume Analyzer and Career Roadmap Generator | Academic Project", subtitle_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer
