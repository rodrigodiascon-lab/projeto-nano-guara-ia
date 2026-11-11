from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

W, H = 1080, 1350
BG = "#F6F4EC"
INK = "#17211C"
GREEN = "#176342"
MINT = "#DDEADF"
RED = "#D84435"
GRAY = "#647067"
WHITE = "#FFFFFF"
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
OUT = Path(__file__).parent / "FEED"
HERO = Path("/Users/rodri/.codex/generated_images/01a090d5-1a4b-7e33-8707-40d0f88cae35/exec-e0ba5c11-2f94-408c-ba9d-11f4d2bb1fbb.png")

def f(size, weight="regular"):
    path = {"regular": FONT, "bold": FONT_BOLD, "black": FONT_BLACK}[weight]
    return ImageFont.truetype(path, size)

def rr(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def wrap(draw, text, font, max_width):
    words, lines, line = text.split(), [], ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines

def text_block(draw, xy, text, font, fill, max_width, spacing=8):
    x, y = xy
    for line in wrap(draw, text, font, max_width):
        draw.text((x, y), line, font=font, fill=fill)
        y += font.size + spacing
    return y

def base(n, section):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((76, 62), "GUARA.BOT  /  CLÍNICAS", font=f(24, "bold"), fill=GREEN)
    d.text((W-184, 64), f"{n} / 5", font=f(22, "bold"), fill=GRAY)
    d.line((76, 112, W-76, 112), fill="#D7D9D1", width=2)
    d.text((76, 1254), "nanoguará.ia", font=f(22, "bold"), fill=GRAY)
    d.text((W-268, 1254), section.upper(), font=f(18, "bold"), fill=GRAY)
    return im

def save(im, name):
    im.save(OUT / name, format="PNG", optimize=True)

def bubble(draw, xy, width, message, time, outgoing=False, small=30):
    x, y = xy
    font = f(small)
    lines = wrap(draw, message, font, width-48)
    height = 30 + len(lines)*(small+9) + 34
    fill = MINT if outgoing else WHITE
    rr(draw, (x, y, x+width, y+height), 26, fill)
    ty = y+20
    for line in lines:
        draw.text((x+24, ty), line, font=font, fill=INK)
        ty += small+9
    draw.text((x+width-116, y+height-34), time, font=f(18), fill=GRAY)
    if outgoing:
        draw.text((x+width-42, y+height-34), "✓✓", font=f(16, "bold"), fill=GREEN)
    return y+height

def make_slides():
    OUT.mkdir(parents=True, exist_ok=True)

    # Slide 1: the late rescheduling request.
    im = base(1, "o problema")
    d = ImageDraw.Draw(im)
    d.text((76, 166), "UM CENÁRIO COMUM NA CLÍNICA", font=f(23, "bold"), fill=RED)
    y = text_block(d, (76, 218), "O PACIENTE PEDE PARA REMARCAR ÀS 21H.", f(70, "black"), INK, 920, 4)
    rr(d, (76, y+46, 1004, 981), 36, "#E9E7DE")
    d.text((116, y+78), "WhatsApp  ·  paciente", font=f(24, "bold"), fill=GRAY)
    bottom = bubble(d, (116, y+144), 768, "Oi, não vou conseguir ir amanhã. Tem como remarcar?", "21:12", False, 32)
    d.text((116, bottom+32), "A consulta está marcada para amanhã, às 9h.", font=f(27), fill=GRAY)
    text_block(d, (76, 1072), "E a mensagem chegou quando a recepção já encerrou o expediente.", f(32, "bold"), GREEN, 915, 8)
    save(im, "01-paciente-pede-remarcacao.png")

    # Slide 2: the delay and the unhelpful next-morning window.
    im = base(2, "a espera")
    d = ImageDraw.Draw(im)
    d.text((76, 169), "NOITE  →  MANHÃ", font=f(24, "bold"), fill=RED)
    y = text_block(d, (76, 224), "A RECEPÇÃO SÓ VÊ NO DIA SEGUINTE.", f(66, "black"), INK, 920, 3)
    rr(d, (76, y+46, 1004, 955), 36, "#E9E7DE")
    d.text((116, y+78), "WhatsApp  ·  conversa", font=f(24, "bold"), fill=GRAY)
    bottom = bubble(d, (116, y+144), 770, "Oi, preciso remarcar a consulta de amanhã.", "21:12", False, 31)
    bottom = bubble(d, (206, bottom+25), 680, "Consegue me responder?", "21:18", False, 31)
    bottom = bubble(d, (116, bottom+48), 770, "Bom dia! Ainda dá tempo de trocar o horário?", "08:07", False, 30)
    text_block(d, (76, 1061), "Enquanto isso, o horário continua na agenda e o paciente espera.", f(32, "bold"), GREEN, 915, 8)
    save(im, "02-a-mensagem-espera.png")

    # Slide 3: show the first response in the clinic's WhatsApp.
    im = base(3, "a resposta")
    d = ImageDraw.Draw(im)
    d.text((76, 169), "A CONVERSA PODE CONTINUAR", font=f(23, "bold"), fill=GREEN)
    y = text_block(d, (76, 224), "COM O GUARA.BOT, O PRIMEIRO ATENDIMENTO NÃO PRECISA ESPERAR.", f(59, "black"), INK, 920, 2)
    rr(d, (76, y+38, 1004, 958), 36, "#E9E7DE")
    d.text((116, y+70), "WhatsApp  ·  clínica", font=f(24, "bold"), fill=GRAY)
    bottom = bubble(d, (116, y+132), 760, "Oi, não vou conseguir ir amanhã. Tem como remarcar?", "21:12", False, 30)
    bubble(d, (206, bottom+30), 680, "Claro! Vou consultar os horários disponíveis para você.", "21:12", True, 30)
    text_block(d, (76, 1060), "O guara.bot responde pelo WhatsApp da clínica e dá sequência ao atendimento.", f(31, "bold"), GREEN, 915, 8)
    save(im, "03-guarabot-responde.png")

    # Slide 4: calendar lookup and patient choice, without claiming fabricated slots.
    im = base(4, "a remarcação")
    d = ImageDraw.Draw(im)
    d.text((76, 169), "AGENDA CONECTADA À CONVERSA", font=f(23, "bold"), fill=GREEN)
    y = text_block(d, (76, 224), "ELE CONSULTA A AGENDA E AJUDA O PACIENTE A REMARCAR.", f(62, "black"), INK, 920, 3)
    rr(d, (76, y+36, 1004, 941), 36, WHITE, outline="#D7D9D1", width=2)
    # Calendar/list icon and explanatory steps.
    rr(d, (122, y+82, 294, y+254), 26, MINT)
    d.text((160, y+98), "AGENDA", font=f(21, "bold"), fill=GREEN)
    d.line((150, y+146, 266, y+146), fill=GREEN, width=5)
    for row in range(3):
        for col in range(3):
            rr(d, (151+col*39, y+163+row*25, 171+col*39, y+183+row*25), 7, GREEN if (row, col)==(1, 1) else "#B8C8BA")
    d.text((338, y+102), "1", font=f(32, "black"), fill=RED)
    d.text((390, y+104), "Consulta os horários livres", font=f(32, "bold"), fill=INK)
    d.text((338, y+168), "2", font=f(32, "black"), fill=RED)
    d.text((390, y+170), "Apresenta opções ao paciente", font=f(32, "bold"), fill=INK)
    d.text((338, y+234), "3", font=f(32, "black"), fill=RED)
    d.text((390, y+236), "Registra a remarcação", font=f(32, "bold"), fill=INK)
    bubble(d, (116, y+339), 790, "Pronto. Sua consulta foi remarcada.", "21:13", True, 31)
    text_block(d, (76, 1061), "A conversa e a agenda ficam no mesmo fluxo de atendimento.", f(32, "bold"), GREEN, 915, 8)
    save(im, "04-agenda-e-remarcacao.png")

    # Slide 5: closing CTA over the approved mascot reference-based illustration.
    hero = Image.open(HERO).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    d = ImageDraw.Draw(hero)
    d.rounded_rectangle((72, 74, 638, 110), radius=16, fill="#F6F4EC")
    d.text((91, 76), "GUARA.BOT  /  PARA CLÍNICAS", font=f(22, "bold"), fill=GREEN)
    y = text_block(d, (76, 154), "ENQUANTO VOCÊ CUIDA DE QUEM ESTÁ NA CLÍNICA, O GUARA.BOT CUIDA DA CONVERSA.", f(48, "black"), INK, 620, 3)
    # A subtle light panel keeps CTA readable without obscuring the mascot.
    rr(d, (72, 1003, 1008, 1262), 32, "#F6F4EC")
    d.text((110, 1040), "Atendimento, agenda e lembretes", font=f(29, "bold"), fill=INK)
    d.text((110, 1080), "pelo WhatsApp da sua clínica.", font=f(29, "bold"), fill=INK)
    rr(d, (110, 1144, 546, 1210), 28, GREEN)
    d.text((141, 1157), "CONHEÇA O GUARA.BOT  →", font=f(25, "bold"), fill=WHITE)
    d.text((110, 1220), "nanoguará.ia", font=f(20, "bold"), fill=GRAY)
    # Correct required chest inscription, centered once on the mascot's cream torso.
    d.text((550, 889), "guara.bot", font=f(19, "bold"), fill=GREEN, stroke_width=1, stroke_fill="#F4EDE0")
    save(hero, "05-conheca-o-guarabot.png")

    # Contact sheet to preview the full sequence at a glance.
    cards = []
    for path in sorted(OUT.glob("0[1-5]-*.png")):
        thumb = Image.open(path).convert("RGB")
        thumb.thumbnail((324, 405), Image.Resampling.LANCZOS)
        cards.append(thumb)
    sheet = Image.new("RGB", (1080, 870), "#E9E7DE")
    for i, thumb in enumerate(cards):
        x = 18 + (i % 3) * 354
        y = 18 + (i // 3) * 422
        sheet.paste(thumb, (x, y))
    sheet.save(OUT / "PREVIA-CARROSSEL.jpg", quality=92, optimize=True)

if __name__ == "__main__":
    make_slides()
