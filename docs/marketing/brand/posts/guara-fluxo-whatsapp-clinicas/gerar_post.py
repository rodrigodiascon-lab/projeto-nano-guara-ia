from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
OUT = ROOT / "FEED"
W, H = 1080, 1350
GREEN = "#176342"
GREEN_DARK = "#123B2B"
GREEN_DEEP = "#0D2C20"
RED = "#D5382F"
CREAM = "#FDF9F0"
PAPER = "#F3F0E7"
INK = "#17231B"
GRAY = "#5E6D63"
MINT = "#DCEADF"
WHITE = "#FFFFFF"
REGULAR = "/System/Library/Fonts/HelveticaNeue.ttc"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
POSE = Path(__file__).parents[2] / "guara-bot" / "poses" / "04-explicando.png"

def font(size, weight="regular"):
    path = {"regular": REGULAR, "bold": BOLD, "black": BLACK}[weight]
    return ImageFont.truetype(path, size)

def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def wrap(draw, text, ft, width):
    words = text.split()
    lines, line = [], ""
    for word in words:
        candidate = (line + " " + word).strip()
        if draw.textbbox((0, 0), candidate, font=ft)[2] <= width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines

def paragraph(draw, xy, text, ft, fill, width, line_gap=7):
    x, y = xy
    for line in wrap(draw, text, ft, width):
        draw.text((x, y), line, font=ft, fill=fill)
        y += ft.size + line_gap
    return y

def fit_crop(im, size):
    target_w, target_h = size
    scale = max(target_w / im.width, target_h / im.height)
    im = im.resize((round(im.width*scale), round(im.height*scale)), Image.Resampling.LANCZOS)
    left = (im.width - target_w)//2
    top = (im.height - target_h)//2
    return im.crop((left, top, left+target_w, top+target_h))

def draw_chat(draw, top):
    # Compact WhatsApp-like conversation card; text is original and illustrative.
    x, y = 633, top+54
    rounded(draw, (x, y, 1018, y+235), 26, CREAM)
    rounded(draw, (x, y, 1018, y+48), 26, GREEN)
    draw.rectangle((x, y+25, 1018, y+48), fill=GREEN)
    draw.ellipse((x+18, y+11, x+45, y+38), fill="#E8F0E8")
    draw.text((x+57, y+10), "Clínica · WhatsApp", font=font(20, "bold"), fill=WHITE)
    rounded(draw, (x+19, y+66, x+344, y+178), 17, "#FFFFFF", outline="#E7E4DC")
    paragraph(draw, (x+34, y+82), "Olá! Gostaria de saber mais sobre o tratamento.", font(21), INK, 290, 2)
    draw.text((x+263, y+151), "09:41", font=font(15), fill=GRAY)
    rounded(draw, (x+245, y+186, x+366, y+222), 15, MINT)
    draw.text((x+263, y+194), "Recebida", font=font(16, "bold"), fill=GREEN)

def draw_calendar(draw, top):
    x, y = 635, top+33
    rounded(draw, (x, y, 1018, y+270), 26, WHITE, outline="#D7DED5", width=2)
    rounded(draw, (x+20, y+19, x+105, y+108), 19, GREEN)
    draw.text((x+42, y+34), "AGENDA", font=font(14, "bold"), fill=WHITE)
    draw.line((x+40, y+67, x+50, y+77), fill=WHITE, width=5)
    draw.line((x+50, y+77, x+70, y+52), fill=WHITE, width=5)
    draw.text((x+129, y+23), "Horários disponíveis", font=font(23, "bold"), fill=INK)
    draw.text((x+129, y+57), "Exemplo · agenda do profissional", font=font(16), fill=GRAY)
    times = [("09h", 0), ("10h30", 1), ("15h", 2)]
    for label, i in times:
        bx = x+22+i*118
        rounded(draw, (bx, y+134, bx+105, y+183), 15, MINT)
        draw.text((bx+18, y+147), label, font=font(19, "bold"), fill=GREEN)
    draw.line((x+23, y+205, x+360, y+205), fill="#E4E8E1", width=2)
    draw.text((x+24, y+219), "Marca • remarca • confirma", font=font(19, "bold"), fill=INK)

def draw_reminder(draw, top):
    x, y = 650, top+33
    rounded(draw, (x, y, 980, y+266), 42, "#17231B", outline="#536256", width=3)
    rounded(draw, (x+12, y+12, 968, y+254), 32, "#F7F5EF")
    rounded(draw, (x+126, y+22, x+205, y+30), 4, "#9BA39B")
    draw.text((x+37, y+52), "LEMBRETE DE CONSULTA", font=font(16, "bold"), fill=GREEN)
    rounded(draw, (x+30, y+84, x+296, y+203), 21, WHITE, outline="#E5E4DC")
    rounded(draw, (x+48, y+102, x+91, y+145), 11, GREEN)
    draw.line((x+58, y+124, x+67, y+133), fill=WHITE, width=4)
    draw.line((x+67, y+133, x+81, y+114), fill=WHITE, width=4)
    draw.text((x+106, y+98), "Sua consulta é", font=font(17, "bold"), fill=INK)
    draw.text((x+106, y+120), "amanhã", font=font(17, "bold"), fill=INK)
    draw.text((x+106, y+151), "Horário e endereço", font=font(16), fill=GRAY)
    draw.text((x+106, y+179), "nanoguará.ia", font=font(15), fill=GRAY)
    draw.text((x+34, y+216), "Enviado na véspera", font=font(17, "bold"), fill=GREEN)

def make():
    OUT.mkdir(parents=True, exist_ok=True)
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    cuts = [337, 674, 1012, 1350]

    # Panel 1 — inbound message.
    d.rectangle((0, 0, W, cuts[0]), fill=GREEN_DEEP)
    d.text((64, 28), "guara.bot  /  clínicas", font=font(19, "bold"), fill="#B9D5BD")
    d.text((64, 92), "A MENSAGEM", font=font(32, "black"), fill=CREAM)
    paragraph(d, (64, 143), "O paciente chama no WhatsApp da clínica.", font(27), CREAM, 475, 5)
    draw_chat(d, 0)

    # Panel 2 — the approved mascot and its role.
    d.rectangle((0, cuts[0], W, cuts[1]), fill=CREAM)
    top = cuts[0]
    d.text((64, top+57), "O guara.bot", font=font(32, "black"), fill=GREEN)
    paragraph(d, (64, top+112), "Responde e informa sobre o atendimento.", font(27), INK, 490, 5)
    d.text((64, top+235), "Sempre pelo WhatsApp.", font=font(21, "bold"), fill=GRAY)
    mascot = Image.open(POSE).convert("RGBA")
    mascot.thumbnail((340, 326), Image.Resampling.LANCZOS)
    im.paste(mascot, (690, top+5), mascot)

    # Panel 3 — real availability, booking and rescheduling.
    d.rectangle((0, cuts[1], W, cuts[2]), fill="#E8EEE6")
    top = cuts[1]
    d.text((64, top+62), "O AGENDAMENTO", font=font(31, "black"), fill=GREEN)
    paragraph(d, (64, top+116), "Mostra horários livres e ajuda a marcar ou remarcar.", font(26), INK, 510, 6)
    d.text((64, top+246), "Na agenda do profissional certo.", font=font(20, "bold"), fill=GRAY)
    draw_calendar(d, top)

    # Panel 4 — a concrete reminder feature.
    d.rectangle((0, cuts[2], W, H), fill=GREEN_DEEP)
    top = cuts[2]
    d.text((64, top+53), "O LEMBRETE", font=font(32, "black"), fill=CREAM)
    paragraph(d, (64, top+105), "Na véspera, envia o horário e o endereço da consulta.", font(26), CREAM, 495, 6)
    d.text((64, top+241), "Atende. Agenda. Lembra.", font=font(22, "bold"), fill="#B9D5BD")
    draw_reminder(d, top)
    d.line((64, H-30, 1016, H-30), fill="#476351", width=1)
    d.text((64, H-25), "nanoguará.ia", font=font(17, "bold"), fill="#B9D5BD")

    # Thin separators clarify the four stages while keeping one unified composition.
    d.line((0, cuts[0], W, cuts[0]), fill="#FFFFFF", width=3)
    d.line((0, cuts[1], W, cuts[1]), fill="#FFFFFF", width=3)
    d.line((0, cuts[2], W, cuts[2]), fill="#FFFFFF", width=3)
    im.save(OUT / "01-guarabot-atendimento-agenda-lembrete.png", optimize=True)

if __name__ == "__main__":
    make()
