import base64
import os
from bson.objectid import ObjectId
from flask import Flask, jsonify, render_template, request
import png
from pymongo import MongoClient
import requests

MONGO_URL = os.environ.get('MONGO_URL')
CLIENT = MongoClient(MONGO_URL)
DB = CLIENT['collision']
FLAGS = DB['flags']

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

@APP.route('/submit-flag', methods=["POST"])
def submit_flag():
    submission = FLAGS.insert_one({**{"approved": False}, **request.get_json()})
    return jsonify(submitted=True, id=str(submission.inserted_id))

@APP.route('/get-flag/<flag_id>', methods=["GET"])
def get_flag(flag_id):
    requested_flag = FLAGS.find_one({'_id': ObjectId(flag_id)})
    if (requested_flag):
        flag_png = base64.b64decode(requested_flag.get('png').split('base64,')[1])
        reader = png.Reader(bytes=flag_png)
        width, height, pixels, metadata = reader.read_flat()
        return jsonify(found=True, png=list(pixels))
    else:
        return jsonify(found=False, png="")


if __name__ == '__main__':
    APP.run(host="0.0.0.0", debug=True)
