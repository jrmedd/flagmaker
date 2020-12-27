from flask import Flask, render_template, jsonify
import requests
APP = Flask(__name__)

@APP.route('/')
def index():
    return render_template('index.html')


@APP.route('/palettes/<number_of_colours>')
def palettes(number_of_colours):
    r = requests.get("https://lospec.com/palette-list/load?colorNumberFilterType=exact&colorNumber=%s&page=0&tag=&sortingType=downloads" % (number_of_colours))
    if r.status_code == 200:
        returned_palettes = r.json().get('palettes')
        processed_palettes = [{'colors': ["#%s" % (color) for color in palette.get('colorsArray')][::-1], 'name': palette.get('title'), 'author': palette.get('user')} for palette in returned_palettes]
        return jsonify(palettes=processed_palettes)
    else:
        return jsonify(palettes={})


if __name__ == '__main__':
    APP.run(debug=True)
