from flask import Flask, render_template, request, redirect, url_for, Response
import os

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Configurazione per il dominio di produzione
if os.getenv('FLASK_ENV') == 'production':
    app.config['SERVER_NAME'] = 'patriziobuonaiuto.vercel.app'
    app.config['PREFERRED_URL_SCHEME'] = 'https'


def get_best_language():
    # Ottiene l'header 'Accept-Language' e lo divide in una lista di preferenze.
    language_preferences = request.headers.get('Accept-Language', 'en')
    languages = [lang.split(';')[0] for lang in language_preferences.split(',')]

    # Stampa le lingue preferite per il debugging.
    print("Preferenze linguistiche del browser:", languages)

    # Controlla le lingue in ordine di preferenza e sceglie la prima che supportiamo.
    for lang in languages:
        if lang.startswith('it'):
            print("Lingua scelta: italiano")
            return 'it'
        elif lang.startswith('en'):
            print("Lingua scelta: inglese")
            return 'en'

    # Se nessuna delle preferenze è supportata, default a inglese.
    print("Nessuna delle preferenze linguistiche è supportata, default a inglese")
    return 'en'


@app.route('/')
def home():
    best_lang = get_best_language()
    print(best_lang)
    return render_template(f'{best_lang}/index.html')

@app.route('/it/')
def it_home():
    return render_template('it/index.html')

@app.route('/en/')
def en_home():
    return render_template('en/index.html')

@app.route('/it/<page>')
def it_page(page):
    # Verifica che il file esista, altrimenti restituisce un 404
    try:
        return render_template(f'it/{page}.html')
    except:
        return "Pagina non trovata", 404

@app.route('/en/<page>')
def en_page(page):
    # Verifica che il file esista, altrimenti restituisce un 404
    try:
        return render_template(f'en/{page}.html')
    except:
        return "Page not found", 404


# @app.route('/sitemap.xml', methods=['GET'])
# def sitemap():
#     pages = []
#     with app.test_request_context():
#         # Aggiungi solo le pagine esistenti
#         static_pages = [
#             url_for('home', _external=True),
#             url_for('it_home', _external=True),
#             url_for('en_home', _external=True)
#         ]
#         pages.extend(static_pages)
#
#         # Aggiungi le pagine dinamiche esistenti
#         dynamic_pages = [
#             url_for('it_page', page='contact', _external=True),
#             url_for('it_page', page='portfolio', _external=True),
#             url_for('it_page', page='su-di-me', _external=True),
#             url_for('en_page', page='contact', _external=True),
#             url_for('en_page', page='about-me', _external=True),
#             url_for('en_page', page='portfolio', _external=True)
#         ]
#         pages.extend(dynamic_pages)
#
#     sitemap_xml = ['<?xml version="1.0" encoding="UTF-8"?>']
#     sitemap_xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
#
#     for page in pages:
#         sitemap_xml.append(f"<url><loc>{page}</loc></url>")
#
#     sitemap_xml.append('</urlset>')
#     sitemap_xml = "\n".join(sitemap_xml)
#
#     return Response(sitemap_xml, mimetype='application/xml')

@app.route('/sitemap.xml', methods=['GET'])
def sitemap():
    base_url = 'https://patriziobuonaiuto.vercel.app'
    pages = [
        f"{base_url}/",
        f"{base_url}/it/",
        f"{base_url}/en/",
        f"{base_url}/it/contact",
        f"{base_url}/it/portfolio",
        f"{base_url}/it/su-di-me",
        f"{base_url}/en/contact",
        f"{base_url}/en/about-me",
        f"{base_url}/en/portfolio"
    ]

    sitemap_xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for page in pages:
        sitemap_xml.append(f"<url><loc>{page}</loc></url>")

    sitemap_xml.append('</urlset>')
    sitemap_xml = "\n".join(sitemap_xml)

    return Response(sitemap_xml, mimetype='application/xml')


# Robots.txt
@app.route('/robots.txt', methods=['GET'])
def robots():
    robots_txt = f"""
    User-agent: *
    Allow: /
    Sitemap: {url_for('sitemap', _external=True)}
    """
    return Response(robots_txt, mimetype='text/plain')

if __name__ == '__main__':
    if not app.config.get('SERVER_NAME'):
        app.run(debug=True, host='0.0.0.0')
    else:
        app.run(debug=False)
