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
PLANTS = DB['plants']

MAPS_API = os.environ.get('MAPS_API')


APP = Flask(__name__)

@APP.route('/')
def index():
    return render_template('index.html', MAPS_API=MAPS_API)

@APP.route('/admin')
def admin():
    return render_template('admin.html')

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
    submission = FLAGS.insert_one({"approved": False, "stored": False, **request.get_json()})
    return jsonify(submitted=True, id=str(submission.inserted_id))

@APP.route('/get-flags', methods=["GET"])
def list_flags():
    args = request.args
    query = {'approved': False, 'stored': False}
    if args.get('stored') != None and args.get('stored') != "0":
        query['stored'] = True
    if args.get('approved') != None and args.get('approved') != "0":
        query['approved'] = True
    flags = list(FLAGS.find(query))
    for flag in flags:
        flag['_id'] = str(flag.get('_id'))
    return jsonify(flags=flags, count=len(flags))

@APP.route('/set-flags', methods=["POST"])
def set_flag():
    update = {'$set':{}}
    to_update = request.get_json()
    if to_update.get('stored') != None:
        update['$set']['stored'] = to_update.get('stored')
    if to_update.get('approved') != None:
        update['$set']['approved'] = to_update.get('approved')
    ids = {"$or":[{'_id':ObjectId(flag)} for flag in to_update.get('flags')]}
    if update.get('$set') and len(ids.get("$or")) > 0:
        result = FLAGS.update_many(ids, update)
        return jsonify(updated=result.modified_count > 0)
    else:
        return jsonify(update=False)

@APP.route('/get-flag/<flag_id>', methods=["GET"])
def get_flag(flag_id):
    requested_flag = FLAGS.find_one({'_id': ObjectId(flag_id)})
    if (requested_flag):
        flag_png = base64.b64decode(requested_flag.get('png').split('base64,')[1])
        reader = png.Reader(bytes=flag_png)
        width, height, pixels, metadata = reader.read_flat()
        return jsonify(found=True, width=width, height=height, png=list(pixels))
    else:
        return jsonify(found=False, png="")

@APP.route('/plant-flag', methods=["POST"])
def plant_flag():
    plant = PLANTS.insert_one({'stored':False, **request.get_json()})
    return jsonify(planted=plant.acknowledged)

@APP.route('/get-plants', methods=["GET"])
def get_plants():
    args = request.args
    query = {'stored': False}
    if args.get('stored') and args.get('stored') != "0":
        query['stored'] = True
    plants = list(PLANTS.find(query))
    for plant in plants:
        plant['_id'] = str(plant.get('_id'))
    return jsonify(plants=plants, count=len(plants))


@APP.route('/set-plants', methods=["POST"])
def set_plant():
    update = {'$set': {}}
    to_update = request.get_json()
    if to_update.get('stored') != None:
        update['$set']['stored'] = to_update.get('stored')
    ids = {"$or": [{'_id': ObjectId(flag)} for flag in to_update.get('plants')]}
    if update.get('$set') and len(ids.get("$or")) > 0:
        result = PLANTS.update_many(ids, update)
        return jsonify(updated=result.modified_count > 0)
    else:
        return jsonify(updated=False)

@APP.route('/reset-storage')
def reset_flags():
    FLAGS.update_many({'stored': True}, {"$set":{"stored": False}})
    PLANTS.update_many({'stored':True}, {"$set":{"stored": False}})
    return jsonify(reset=True)
if __name__ == '__main__':
    APP.run(host="0.0.0.0", debug=True)
