from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

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
    return render_template(f'it/{page}.html')

@app.route('/en/<page>')
def en_page(page):
    return render_template(f'en/{page}.html')

if __name__ == '__main__':
    app.run(debug=True)
