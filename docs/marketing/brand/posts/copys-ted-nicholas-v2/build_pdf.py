from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "copys.md"
OUTPUT = ROOT / "copys-nanoguara-instagram-v2.pdf"

CREAM = colors.HexColor("#FDF9F0")
CREAM_DARK = colors.HexColor("#F1EBDD")
FOREST = colors.HexColor("#123B26")
GREEN = colors.HexColor("#2E7D32")
RED = colors.HexColor("#D5382F")
INK = colors.HexColor("#17231B")
MUTED = colors.HexColor("#5D685F")
WHITE = colors.white


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Arial", "/System/Library/Fonts/Supplemental/Arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Italic", "/System/Library/Fonts/Supplemental/Arial Italic.ttf"))


def clean(text: str) -> str:
    return (
        text.replace("\u2014", "-")
        .replace("\u2013", "-")
        .replace("\u2011", "-")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def inline_md(text: str) -> str:
    text = clean(text.strip())
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`(.+?)`", r"<font name='Arial'>\1</font>", text)
    return text


def parse_sections(md: str) -> tuple[list[dict], list[dict]]:
    feeds: list[dict] = []
    carousels: list[dict] = []
    feed_matches = list(re.finditer(r"^## FEED (\d+) - (.+)$", md, re.M))
    carousel_matches = list(re.finditer(r"^## CARROSSEL (\d+) - (.+)$", md, re.M))

    carousel_start = carousel_matches[0].start()
    for i, match in enumerate(feed_matches):
        end = feed_matches[i + 1].start() if i + 1 < len(feed_matches) else carousel_start
        block = md[match.end() : end]
        image_match = re.search(r"### TEXTO DA IMAGEM\s+(.+?)\s+### LEGENDA", block, re.S)
        caption_match = re.search(r"### LEGENDA\s+(.+?)(?:\n---|\Z)", block, re.S)
        if not image_match or not caption_match:
            raise ValueError(f"Feed {match.group(1)} incompleto")
        feeds.append(
            {
                "number": match.group(1),
                "title": match.group(2).strip(),
                "image": image_match.group(1).strip(),
                "caption": caption_match.group(1).strip(),
            }
        )

    next_test = md.find("# Próximo teste recomendado")
    for i, match in enumerate(carousel_matches):
        end = carousel_matches[i + 1].start() if i + 1 < len(carousel_matches) else next_test
        block = md[match.end() : end]
        slides_match = re.search(r"### TEXTO NAS IMAGENS\s+(.+?)\s+### LEGENDA", block, re.S)
        caption_match = re.search(r"### LEGENDA\s+(.+?)(?:\n---|\Z)", block, re.S)
        if not slides_match or not caption_match:
            raise ValueError(f"Carrossel {match.group(1)} incompleto")
        slides = []
        for slide_match in re.finditer(
            r"\*\*SLIDE (\d+)\*\*\s+(.+?)(?=\n\*\*SLIDE|\Z)",
            slides_match.group(1).strip(),
            re.S,
        ):
            slides.append((slide_match.group(1), slide_match.group(2).strip()))
        carousels.append(
            {
                "number": match.group(1),
                "title": match.group(2).strip(),
                "slides": slides,
                "caption": caption_match.group(1).strip(),
            }
        )
    return feeds, carousels


def paragraphize(block: str, style: ParagraphStyle) -> list:
    flowables = []
    paragraphs = re.split(r"\n\s*\n", block.strip())
    for part in paragraphs:
        part = part.strip()
        if not part:
            continue
        if part.startswith("#") and not part.startswith("# "):
            flowables.append(Paragraph(clean(part), style))
        elif part.startswith("- "):
            items = [line[2:].strip() for line in part.splitlines() if line.strip().startswith("- ")]
            for item in items:
                flowables.append(Paragraph("<font color='#D5382F'>•</font> " + inline_md(item), style))
        else:
            lines = [inline_md(line.rstrip()) for line in part.splitlines()]
            flowables.append(Paragraph("<br/>".join(lines), style))
        flowables.append(Spacer(1, 2.8 * mm))
    return flowables


def draw_cover(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFillColor(FOREST)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setFillColor(RED)
    canvas.rect(0, A4[1] - 8 * mm, A4[0], 8 * mm, fill=1, stroke=0)
    canvas.restoreState()


def draw_page(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setStrokeColor(colors.HexColor("#D8D2C5"))
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, A4[1] - 15 * mm, A4[0] - 18 * mm, A4[1] - 15 * mm)
    canvas.setFont("Arial-Bold", 7.5)
    canvas.setFillColor(GREEN)
    canvas.drawString(18 * mm, A4[1] - 11.5 * mm, "nanoguará.ia  |  banco de copys para Instagram")
    canvas.setFont("Arial", 8)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"{doc.page}")
    canvas.restoreState()


def slide_box(number: str, text: str, styles: dict) -> Table:
    content = [
        Paragraph(f"SLIDE {number}", styles["eyebrow"]),
        Spacer(1, 1.5 * mm),
        Paragraph(inline_md(text), styles["slide_text"]),
    ]
    table = Table([[content]], colWidths=[169 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), CREAM_DARK),
                ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#D8D2C5")),
                ("LINEBEFORE", (0, 0), (0, -1), 4, RED),
                ("LEFTPADDING", (0, 0), (-1, -1), 7 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 4.5 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5 * mm),
            ]
        )
    )
    return table


def build() -> None:
    register_fonts()
    md = SOURCE.read_text(encoding="utf-8")
    feeds, carousels = parse_sections(md)
    if len(feeds) != 10 or len(carousels) != 10:
        raise ValueError(f"Esperados 10 feeds e 10 carrosséis; recebidos {len(feeds)} e {len(carousels)}")

    base = getSampleStyleSheet()
    styles = {
        "cover_kicker": ParagraphStyle(
            "CoverKicker",
            parent=base["Normal"],
            fontName="Arial-Bold",
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#A8D5AD"),
            spaceAfter=7 * mm,
        ),
        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Title"],
            fontName="Arial-Bold",
            fontSize=34,
            leading=38,
            textColor=WHITE,
            alignment=TA_LEFT,
            spaceAfter=8 * mm,
        ),
        "cover_subtitle": ParagraphStyle(
            "CoverSubtitle",
            parent=base["Normal"],
            fontName="Arial",
            fontSize=14,
            leading=20,
            textColor=CREAM,
            spaceAfter=9 * mm,
        ),
        "cover_note": ParagraphStyle(
            "CoverNote",
            parent=base["Normal"],
            fontName="Arial",
            fontSize=10,
            leading=15,
            textColor=colors.HexColor("#D8E8DA"),
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Heading1"],
            fontName="Arial-Bold",
            fontSize=26,
            leading=31,
            textColor=FOREST,
            spaceAfter=7 * mm,
            keepWithNext=True,
        ),
        "item_title": ParagraphStyle(
            "ItemTitle",
            parent=base["Heading1"],
            fontName="Arial-Bold",
            fontSize=21,
            leading=25,
            textColor=FOREST,
            spaceAfter=7 * mm,
            keepWithNext=True,
        ),
        "eyebrow": ParagraphStyle(
            "Eyebrow",
            parent=base["Normal"],
            fontName="Arial-Bold",
            fontSize=8,
            leading=10,
            textColor=RED,
            spaceAfter=1 * mm,
            keepWithNext=True,
        ),
        "image_copy": ParagraphStyle(
            "ImageCopy",
            parent=base["Normal"],
            fontName="Arial-Bold",
            fontSize=22,
            leading=27,
            textColor=WHITE,
            alignment=TA_LEFT,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Arial",
            fontSize=10.3,
            leading=15.2,
            textColor=INK,
            spaceAfter=0,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Arial",
            fontSize=9.2,
            leading=13.5,
            textColor=INK,
        ),
        "slide_text": ParagraphStyle(
            "SlideText",
            parent=base["BodyText"],
            fontName="Arial-Bold",
            fontSize=12.3,
            leading=16.5,
            textColor=INK,
        ),
        "toc": ParagraphStyle(
            "Toc",
            parent=base["BodyText"],
            fontName="Arial",
            fontSize=10,
            leading=15,
            textColor=INK,
        ),
    }

    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=22 * mm,
        bottomMargin=18 * mm,
        title="20 copys para Instagram - nanoguará.ia",
        author="nanoguará.ia",
        subject="10 posts de feed e 10 carrosséis para profissionais liberais de saúde",
    )
    cover_frame = Frame(23 * mm, 22 * mm, A4[0] - 46 * mm, A4[1] - 44 * mm, id="cover")
    body_frame = Frame(20 * mm, 17 * mm, A4[0] - 40 * mm, A4[1] - 37 * mm, id="body")
    doc.addPageTemplates(
        [
            PageTemplate(id="Cover", frames=[cover_frame], onPage=draw_cover),
            PageTemplate(id="Body", frames=[body_frame], onPage=draw_page),
        ]
    )

    story = []
    story.append(Spacer(1, 37 * mm))
    story.append(Paragraph("NANOGUARÁ.IA  /  COPY DE RESPOSTA DIRETA", styles["cover_kicker"]))
    story.append(Paragraph("20 copys para<br/>Instagram", styles["cover_title"]))
    story.append(
        Paragraph(
            "10 posts de feed + 10 carrosséis para apresentar um assistente de IA a profissionais liberais de saúde.",
            styles["cover_subtitle"],
        )
    )
    story.append(
        Paragraph(
            "Somente texto. Legendas prontas para copiar. Sem números, depoimentos, escassez ou resultados inventados.",
            styles["cover_note"],
        )
    )
    story.append(NextPageTemplate("Body"))
    story.append(PageBreak())
    story.append(Paragraph("Como usar este material", styles["section"]))
    use_points = [
        "Cada peça começa em uma nova página para facilitar seleção, cópia e revisão.",
        "O texto da imagem foi escrito para virar a mensagem principal do criativo visual.",
        "As legendas podem ser publicadas como estão ou adaptadas ao tom pessoal do profissional.",
        "Assuntos clínicos permanecem com o profissional ou a equipe; o assistente atua no fluxo administrativo definido.",
        "Antes de citar prazo, garantia, resultado ou número, valide uma prova real e autorizada.",
    ]
    for point in use_points:
        story.append(Paragraph("<font color='#D5382F'>•</font> " + clean(point), styles["body"]))
        story.append(Spacer(1, 3 * mm))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Diagnóstico de persuasão", styles["item_title"]))
    diagnosis = [
        ("BENEFÍCIO ÓBVIO", "Organizar respostas administrativas, informações e etapas de agendamento no WhatsApp."),
        ("BENEFÍCIO ESCONDIDO", "Reduzir carga mental e proteger a presença do profissional durante o atendimento."),
        ("OBJEÇÃO DOMINANTE", "Receio de um atendimento impessoal, confuso ou sem limite clínico."),
        ("PROVA DISPONÍVEL", "Mecanismo e demonstração personalizada; coletar resultados e depoimentos autorizados antes de publicar alegações."),
    ]
    for label, value in diagnosis:
        story.append(Paragraph(label, styles["eyebrow"]))
        story.append(Paragraph(clean(value), styles["body"]))
        story.append(Spacer(1, 3.2 * mm))
    story.append(PageBreak())

    story.append(Paragraph("Cinco manchetes para testar", styles["section"]))
    headlines = [
        ("BENEFÍCIO ÓBVIO", "Você atende uma pessoa. O WhatsApp não deveria perder outra."),
        ("BENEFÍCIO ESCONDIDO", "Seu consultório precisa da sua presença, não da sua atenção fragmentada."),
        ("PERGUNTA DIRETA", "Quantas vezes o WhatsApp interrompeu seu atendimento hoje?"),
        ("CURIOSIDADE PELO MECANISMO", "A melhor IA da saúde sabe exatamente quando chamar um humano."),
        ("PERDA", "O silêncio do seu WhatsApp também comunica. E não comunica cuidado."),
    ]
    for i, (label, headline) in enumerate(headlines, 1):
        story.append(slide_box(str(i), f"{label}: {headline}", styles))
        story.append(Spacer(1, 4 * mm))
    story.append(PageBreak())

    story.append(Spacer(1, 48 * mm))
    story.append(Paragraph("PARTE 1", styles["eyebrow"]))
    story.append(Paragraph("10 posts para o feed", styles["section"]))
    story.append(Paragraph("Texto da imagem + legenda completa", styles["body"]))
    story.append(PageBreak())

    for feed in feeds:
        story.append(Paragraph(f"FEED {feed['number']}  /  {clean(feed['title']).upper()}", styles["eyebrow"]))
        story.append(Paragraph(clean(feed["title"]), styles["item_title"]))
        story.append(Paragraph("TEXTO DA IMAGEM", styles["eyebrow"]))
        image_copy = re.sub(r"\*\*", "", feed["image"])
        image_copy = "<br/>".join(clean(line.strip()) for line in image_copy.splitlines() if line.strip())
        image_table = Table([[Paragraph(image_copy, styles["image_copy"])]], colWidths=[169 * mm], hAlign="LEFT")
        image_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), FOREST),
                    ("LINEBEFORE", (0, 0), (0, -1), 5, RED),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8 * mm),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8 * mm),
                    ("TOPPADDING", (0, 0), (-1, -1), 8 * mm),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8 * mm),
                ]
            )
        )
        story.append(image_table)
        story.append(Spacer(1, 7 * mm))
        story.append(Paragraph("LEGENDA", styles["eyebrow"]))
        story.extend(paragraphize(feed["caption"], styles["body"]))
        story.append(PageBreak())

    story.append(Spacer(1, 48 * mm))
    story.append(Paragraph("PARTE 2", styles["eyebrow"]))
    story.append(Paragraph("10 carrosséis", styles["section"]))
    story.append(Paragraph("Texto de cada slide + legenda completa", styles["body"]))
    story.append(PageBreak())

    for carousel in carousels:
        story.append(
            Paragraph(
                f"CARROSSEL {carousel['number']}  /  {clean(carousel['title']).upper()}",
                styles["eyebrow"],
            )
        )
        story.append(Paragraph(clean(carousel["title"]), styles["item_title"]))
        story.append(Paragraph("TEXTO NAS IMAGENS", styles["eyebrow"]))
        story.append(Spacer(1, 1 * mm))
        for slide_number, slide_text in carousel["slides"]:
            story.append(slide_box(slide_number, slide_text, styles))
            story.append(Spacer(1, 3.5 * mm))
        story.append(Spacer(1, 3 * mm))
        story.append(Paragraph("LEGENDA", styles["eyebrow"]))
        story.extend(paragraphize(carousel["caption"], styles["body"]))
        story.append(PageBreak())

    story.append(Paragraph("Próximo teste recomendado", styles["section"]))
    story.append(
        Paragraph(
            "Teste as duas manchetes abaixo com o mesmo público, a mesma legenda e o mesmo formato visual.",
            styles["body"],
        )
    )
    story.append(Spacer(1, 6 * mm))
    story.append(slide_box("A", "Você atende uma pessoa. O WhatsApp não deveria perder outra.", styles))
    story.append(Spacer(1, 5 * mm))
    story.append(slide_box("B", "Seu consultório precisa da sua presença, não da sua atenção fragmentada.", styles))
    story.append(Spacer(1, 7 * mm))
    story.append(
        Paragraph(
            "Métrica principal: conversas qualificadas iniciadas no direct. Métrica de apoio: salvamentos. A vencedora é a que atrai profissionais com um problema real de atendimento, não apenas curiosos sobre IA.",
            styles["body"],
        )
    )
    story.append(Spacer(1, 5 * mm))
    story.append(
        Paragraph(
            "Segundo teste: confronte a vencedora com “A melhor IA da saúde sabe quando chamar um humano.” Esse contraste mede benefício operacional contra segurança percebida.",
            styles["body"],
        )
    )

    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build()
