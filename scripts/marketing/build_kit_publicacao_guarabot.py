#!/usr/bin/env python3
"""Organiza os criativos aprovados em um kit local para configuração no Meta Ads."""

from __future__ import annotations

import csv
import hashlib
import html
import json
import os
import shutil
import subprocess
import zipfile
from pathlib import Path
from urllib.parse import urlencode


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output/marketing"
DEST = OUTPUT / "kit-publicacao-guarabot-consultorios"
BASE_URL = "https://nanoguara.ia.br/iaparaconsultorios"
SERIES = {
    "OBJ": ("objetos-estranhos", "meta-ads-guarabot-objetos-estranhos"),
    "SUR": ("surreal", "meta-ads-guarabot-surreal"),
    "PS": ("promessa-simples", "meta-ads-guarabot-promessa-simples-serie"),
}

# Texto editorial para o Gerenciador. As copies originais seguem nas pastas de origem.
COPY = {
    "OBJ01": ("Mensagens de agendamento chegam enquanto a recepção atende outras tarefas. O guara.bot responde dúvidas de rotina e ajuda a conferir horários no WhatsApp. Veja como funciona.", "Ajuda no atendimento"),
    "OBJ02": ("Telefone, balcão e WhatsApp dividem a atenção da recepção. O guara.bot pode assumir perguntas de rotina e apoiar o agendamento. Veja como funciona.", "Apoio para a recepção"),
    "OBJ03": ("Conversas diferentes podem chegar ao mesmo tempo. O guara.bot organiza pedidos de rotina no WhatsApp e chama a equipe quando precisa. Veja como funciona.", "Conversas organizadas"),
    "OBJ04": ("Depois do expediente, mensagens continuam chegando. O guara.bot pode responder informações configuradas e ajudar a consultar a agenda. Veja como funciona.", "Atendimento após o expediente"),
    "OBJ05": ("A recepção pode fechar sem interromper as respostas de rotina no WhatsApp. Conheça como o guara.bot usa as informações do consultório.", "WhatsApp além do expediente"),
    "OBJ06": ("Lembretes de consulta fazem parte do atendimento. O guara.bot pode enviá-los conforme o fluxo configurado pelo consultório. Veja como funciona.", "Lembretes pelo WhatsApp"),
    "OBJ07": ("Endereço, serviços e horários são dúvidas frequentes. O guara.bot responde com as informações configuradas pelo consultório. Veja como funciona.", "Dúvidas de rotina com IA"),
    "OBJ08": ("A recepção continua no centro do atendimento. O guara.bot ajuda com conversas de rotina e passa à equipe o que pede atenção humana. Veja como funciona.", "Mais apoio para a equipe"),
    "OBJ09": ("A equipe pode conferir e bloquear horários pelo fluxo autorizado do WhatsApp, conforme a configuração do guara.bot. Veja uma demonstração.", "Agenda acessível à equipe"),
    "OBJ10": ("Cada mensagem é um pedido de atendimento. O guara.bot acolhe dúvidas de rotina e ajuda a encontrar o próximo passo. Veja como funciona.", "Primeiro contato no WhatsApp"),
    "SUR01": ("O atendimento do consultório também pode começar no WhatsApp. O guara.bot responde dúvidas de rotina e ajuda no agendamento. Veja como funciona.", "Recepção no WhatsApp"),
    "SUR02": ("Responder mensagens e consultar horários ocupa parte da rotina da recepção. O guara.bot ajuda nessas tarefas pelo WhatsApp. Veja como funciona.", "Apoio à recepção"),
    "SUR03": ("A fila de atendimento também pode aparecer no WhatsApp. O guara.bot acolhe pedidos de rotina e chama a equipe quando necessário. Veja como funciona.", "Fila de mensagens no WhatsApp"),
    "SUR04": ("Mensagens podem chegar depois do expediente. O guara.bot responde com as informações configuradas pelo consultório. Veja como funciona.", "Atendimento fora do horário"),
    "SUR05": ("Uma conversa no WhatsApp pode seguir até a consulta de horários. O guara.bot ajuda no agendamento conforme a agenda configurada. Veja como funciona.", "Da conversa ao horário"),
    "SUR06": ("Um pedido por áudio também pode iniciar o atendimento. O guara.bot interpreta a solicitação e ajuda com o próximo passo administrativo. Veja como funciona.", "Áudio no WhatsApp"),
    "SUR07": ("Perguntas sobre serviços, endereço e horários se repetem ao longo do dia. O guara.bot responde com os dados do consultório. Veja como funciona.", "Respostas de rotina"),
    "SUR08": ("A consulta marcada pode gerar um lembrete no WhatsApp. O guara.bot envia a mensagem conforme o fluxo configurado. Veja como funciona.", "Lembretes de consulta"),
    "SUR09": ("Algumas conversas precisam de uma pessoa. O guara.bot encaminha esses pedidos para a equipe do consultório. Veja como funciona.", "IA com apoio humano"),
    "SUR10": ("Antes de oferecer um horário, o guara.bot consulta a agenda configurada e apresenta as opções disponíveis. Veja como funciona.", "Agenda antes de marcar"),
    "PS01": ("Enquanto a consulta acontece, mensagens continuam chegando ao WhatsApp. O guara.bot ajuda a responder dúvidas de rotina e a consultar horários. Veja como funciona.", "IA no WhatsApp do consultório"),
    "PS02": ("O horário precisa estar livre antes do agendamento. O guara.bot consulta a agenda configurada e apresenta opções pelo WhatsApp. Veja como funciona.", "Horários antes de marcar"),
    "PS03": ("Pedidos enviados por áudio também podem entrar no fluxo de atendimento administrativo. Conheça como o guara.bot ajuda no WhatsApp.", "A IA entende o áudio"),
    "PS04": ("O expediente termina, mas o WhatsApp pode receber novos pedidos. O guara.bot responde informações de rotina conforme a configuração do consultório. Veja como funciona.", "Atendimento depois do expediente"),
    "PS05": ("A agenda também pode orientar o envio de lembretes de consulta. O guara.bot ajuda nessa etapa pelo WhatsApp. Veja como funciona.", "Lembretes de consulta"),
    "PS06": ("Quando um pedido exige atenção humana, o guara.bot encaminha a conversa à equipe do consultório. Veja como funciona.", "A equipe entra quando precisa"),
    "PS07": ("Dúvidas de rotina podem ser respondidas com as informações configuradas pelo consultório. Conheça o atendimento do guara.bot no WhatsApp.", "Respostas para dúvidas de rotina"),
    "PS08": ("Uma remarcação começa com a consulta de outros horários disponíveis. O guara.bot ajuda nesse fluxo pelo WhatsApp. Veja como funciona.", "Remarcação pelo WhatsApp"),
    "PS09": ("O guara.bot consulta a agenda configurada e apresenta horários disponíveis antes de marcar a consulta. Veja como funciona.", "Horários livres na agenda"),
    "PS10": ("A recepção ganha apoio para responder mensagens de rotina e encaminhar conversas que pedem uma pessoa. Conheça o guara.bot.", "Apoio para a recepção"),
}


def link_or_copy(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        target.unlink()
    try:
        os.link(source, target)
    except OSError:
        shutil.copy2(source, target)


def probe_video(path: Path) -> dict:
    return json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-count_frames", "-show_entries",
        "format=duration:stream=codec_name,codec_type,width,height,r_frame_rate,nb_read_frames",
        "-of", "json", str(path),
    ]))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def load_concepts(code: str, source: Path) -> list[dict]:
    if code == "OBJ":
        return json.loads((source / "manifesto.json").read_text())["assets"]
    return json.loads((source / "conceitos.json").read_text())["concepts"]


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    records = []
    for code, (label, folder_name) in SERIES.items():
        source = OUTPUT / folder_name
        concepts = load_concepts(code, source)
        assert len(concepts) == 10
        for c in concepts:
            number = int(c["id"])
            key = f"{code}{number:02d}"
            src_feed = source / c["feed"]
            src_story = source / c["stories"]
            target_folder = DEST / "criativos" / label / Path(c["feed"]).parent
            feed = target_folder / "feed-1080x1350.png"
            story = target_folder / "stories-1080x1920.png"
            link_or_copy(src_feed, feed)
            link_or_copy(src_story, story)
            original_copy = source / Path(c["feed"]).parent / "copy.md"
            if original_copy.exists():
                link_or_copy(original_copy, target_folder / "copy-original.md")
            video = target_folder / "video-stories-1080x1920.mp4"
            source_video = source / Path(c["stories"]).parent / "animacao-stories-1080x1920.mp4"
            if source_video.exists():
                if code == "SUR":
                    # Os masters SUR têm 122 quadros. A entrega tem 120 quadros exatos.
                    subprocess.run([
                        "ffmpeg", "-y", "-loglevel", "error", "-i", str(source_video),
                        "-frames:v", "120", "-an", "-c:v", "copy", "-movflags", "+faststart", str(video),
                    ], check=True)
                else:
                    link_or_copy(source_video, video)
                detail = probe_video(video)
                streams = detail["streams"]
                assert len(streams) == 1
                assert streams[0] == {
                    "codec_name": "h264", "codec_type": "video", "width": 1080,
                    "height": 1920, "r_frame_rate": "24/1", "nb_read_frames": "120",
                }, (key, streams)
                assert float(detail["format"]["duration"]) == 5.0, key
                video_rel = str(video.relative_to(DEST))
            else:
                video_rel = ""
                if video.exists():
                    video.unlink()
            primary, title = COPY[key]
            assert "—" not in primary + title and "–" not in primary + title
            tags = urlencode({
                "utm_source": "meta", "utm_medium": "paid_social",
                "utm_campaign": "guarabot_consultorios", "utm_content": key.lower(),
            })
            record = {
                "id": key,
                "serie": label,
                "lote_sugerido": "piloto" if key in {"PS01", "PS02", "PS06"} else "biblioteca",
                "conceito": c.get("name") or c.get("headline") or c.get("angle"),
                "angulo": c.get("angle") or c.get("headline"),
                "nome_anuncio": f"GB | Consultórios | {key} | {title}",
                "texto_principal": primary,
                "titulo": title,
                "descricao": "Assistente de IA para consultórios.",
                "cta_nativo": "SAIBA_MAIS",
                "destino": BASE_URL,
                "url_tags": tags,
                "feed_png": str(feed.relative_to(DEST)),
                "stories_png": str(story.relative_to(DEST)),
                "stories_video_mp4": video_rel,
                "uso_recomendado": "Feed PNG 4:5 + Stories/Reels MP4 9:16 no mesmo anúncio" if video_rel else "Feed PNG 4:5 + Stories PNG 9:16 no mesmo anúncio",
                "fonte_original": str((source / Path(c["feed"]).parent).relative_to(ROOT)),
                "sha256_feed": sha256(feed),
                "sha256_stories": sha256(story),
                "sha256_video": sha256(video) if video_rel else "",
            }
            records.append(record)
    assert len(records) == 30
    for filename in (
        "IDENTIDADE-GUARA-BOT.md",
        "guara-bot-concept-floating-v3.png",
        "peca-guarabot-como-funciona.pdf",
    ):
        source = OUTPUT / "meta-ads-guarabot-objetos-estranhos" / "referencias" / filename
        link_or_copy(source, DEST / "referencias" / filename)
    csv_columns = [
        "id", "serie", "lote_sugerido", "conceito", "angulo", "nome_anuncio", "texto_principal", "titulo",
        "descricao", "cta_nativo", "destino", "url_tags", "feed_png", "stories_png",
        "stories_video_mp4", "uso_recomendado", "fonte_original", "sha256_feed",
        "sha256_stories", "sha256_video",
    ]
    with (DEST / "anuncios-meta-ads.csv").open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=csv_columns)
        writer.writeheader()
        writer.writerows(records)
    (DEST / "manifesto.json").write_text(json.dumps({
        "campanha": "guara.bot para consultórios", "destino_confirmado_pelo_usuario": BASE_URL,
        "estado": "kit local para Claude; nenhum anúncio criado ou publicado na Meta",
        "total_conceitos": 30, "total_imagens_feed": 30, "total_imagens_stories": 30,
        "total_videos_stories": 20, "anuncios": records,
    }, ensure_ascii=False, indent=2) + "\n")
    cards = []
    for row in records:
        visual = (
            f'<video controls playsinline loop preload="metadata" poster="{html.escape(row["stories_png"])}">'
            f'<source src="{html.escape(row["stories_video_mp4"])}" type="video/mp4"></video>'
            if row["stories_video_mp4"] else
            f'<img src="{html.escape(row["stories_png"])}" alt="Stories {html.escape(row["id"])}">'
        )
        cards.append(
            f'<article><h2>{html.escape(row["id"])} · {html.escape(str(row["conceito"]))}</h2>'
            f'<div class="images"><img src="{html.escape(row["feed_png"])}" alt="Feed {html.escape(row["id"])}">'
            f'{visual}</div><p>{html.escape(row["texto_principal"])}</p></article>'
        )
    (DEST / "galeria.html").write_text(
        '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>guara.bot · Kit Meta Ads</title><style>body{margin:0;background:#faf7ef;color:#123027;font:16px system-ui}'
        'header,main{max-width:1400px;margin:auto;padding:24px}h1{font-size:clamp(30px,4vw,50px)}'
        'main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px}'
        'article{background:white;border-radius:16px;padding:16px;box-shadow:0 3px 18px #173c2318}'
        'article h2{font-size:18px;min-height:44px}.images{display:flex;gap:8px;align-items:flex-start}'
        '.images>*{display:block;width:50%;height:auto;border-radius:8px}.images video{aspect-ratio:9/16;object-fit:cover}'
        'article p{line-height:1.5}a{color:#07633c}</style>'
        '<header><small>NANOGUARÁ.IA</small><h1>Kit de publicação · guara.bot</h1>'
        '<p>30 conceitos para consultórios: 30 peças Feed, 30 peças Stories e 20 vídeos Stories/Reels de 5 segundos.</p>'
        '<p><a href="COMECE-AQUI-CLAUDE.md">Instruções para Claude</a> · <a href="anuncios-meta-ads.csv">Tabela dos anúncios</a></p></header>'
        '<main>' + "".join(cards) + '</main></html>'
    )
    print(json.dumps({"kit": str(DEST), "concepts": len(records), "videos": sum(bool(r["stories_video_mp4"]) for r in records)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
