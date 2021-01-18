import base64
import csv
import datetime
import json
import os
from functools import wraps
from bson.objectid import ObjectId
from flask import Flask, abort, jsonify, make_response, render_template, redirect, request, send_from_directory, session, url_for
from flask_cors import CORS
from passlib.hash import pbkdf2_sha512
import png
from pymongo import MongoClient
from pywebpush import webpush, WebPushException
import requests

MONGO_URL = os.environ.get('MONGO_URL')
CLIENT = MongoClient(MONGO_URL)
DB = CLIENT['collision']
FLAGS = DB['flags']
PLANTS = DB['plants']
SUBS = DB['subs']
PALETTES = DB['palettes']
STREAM = DB['stream']

PUSH_PRIVATE_KEY = os.environ.get('PUSH_PRIVATE_KEY')
PUSH_PUBLIC_KEY = os.environ.get('PUSH_PUBLIC_KEY')

MAPS_API = os.environ.get('MAPS_API')

APP = Flask(__name__)

CORS(APP)


def login_required(f):
    @wraps(f)
    def login_check(*args, **kwargs):
        if not session.get('username'):
            return redirect(url_for('login', next=request.path))
        return f(*args, **kwargs)
    return login_check


@APP.route('/')
def index():
    return render_template('index.html', MAPS_API=MAPS_API)

@APP.route('/flag-space')
def gallery():
    flags=list(FLAGS.find({'approved':True}, sort=[('_id', -1)]).limit(25))
    stream = STREAM.find_one({'stream':'live'})
    return render_template('gallery.html', key=stream.get('key'),flags=flags[0:20])

@APP.route('/admin')
def admin():
    return render_template('admin.html', PUSH_PUBLIC_KEY=PUSH_PUBLIC_KEY)


@APP.route('/login', methods=['GET', 'POST'])
def login(username=""):
    if request.method == 'POST':
        username = request.form.get('username')
        user_info = LOGINS.find_one({'username': username}, {'password': 1})
        if user_info:
            hash = user_info.get('password')
            allow = pbkdf2_sha512.verify(request.form.get('password'), hash)
            if allow:
                session.update({'username': username})
                return redirect(request.args.get('next') or url_for('index'))
    return render_template('login.html', username=username)

@APP.route('/palettes/<number_of_colours>')
def palettes(number_of_colours):
    palettes = PALETTES.find_one({'number_of_colours': number_of_colours})
    if not palettes or palettes.get('timestamp') < datetime.datetime.now() - datetime.timedelta(days=1):
        palettes = fetch_new_colours(number_of_colours)
    else:
        palettes = palettes.get('palettes')
    return jsonify(palettes=palettes)


@APP.route('/submit-flag', methods=["POST"])
def submit_flag():
    flag_data = request.get_json()
    submission = FLAGS.insert_one({"approved": False, "stored": False, **flag_data})
    push_to = list(SUBS.find({}, {'_id': 0}))
    for sub in push_to:
        try:
            webpush(subscription_info=json.loads(sub.get('subscription_json')),
                    vapid_private_key=PUSH_PRIVATE_KEY,
                    vapid_claims={'sub': 'mailto:hello@jamesmedd.co.uk'},
                    data=json.dumps({"title": "New flag", "image":flag_data.get("png"), "data":str(submission.inserted_id)}))
        except:
            print("Could not send")
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

@APP.route('/manage-subs', methods=["POST", "DELETE"])
def create_push_subscription():
    json_data = request.get_json()
    if request.method == "POST":
        SUBS.update_one(json_data, {"$set":json_data}, upsert=True)
    elif request.method == "DELETE":
        SUBS.delete_one(json_data)
    return jsonify(status="success")

@APP.route('/locations', methods=["GET"])
def locations():
    with open('static/location/manchester-markers.csv') as f:
        places = [{k: v for k, v in row.items()}
            for row in csv.DictReader(f, skipinitialspace=True)]
    return render_template('labels.html', places=places)

@APP.route('/image/<id>', methods=["GET"])
def show_image(id):
    id = id.split('.png')[0]
    entry = FLAGS.find_one({'_id': ObjectId(id)})
    if entry:
        image = base64.b64decode(entry.get('png').split('base64,')[1])
        response = make_response(image)
        response.headers.set('Content-Type', 'image/png')
        return response
    else:
        abort(404)

@APP.route('/sw.js')
def sw():
    response = make_response(
        send_from_directory('static', filename='sw.js'))
    response.headers['Content-Type'] = 'application/javascript'
    return response

def fetch_new_colours(number_of_colours):
    r = requests.get(
        "https://lospec.com/palette-list/load?colorNumberFilterType=exact&colorNumber=%s&page=0&tag=&sortingType=downloads" % (number_of_colours))
    if r.status_code == 200:
        returned_palettes = r.json().get('palettes')
        processed_palettes = [{'colors': ["#%s" % (color) for color in palette.get(
            'colorsArray')][::-1], 'name': palette.get('title'), 'author': palette.get('user')} for palette in returned_palettes]
        PALETTES.update_one({'number_of_colours': number_of_colours}, {"$set": {
                            'number_of_colours': number_of_colours, 'palettes': processed_palettes, 'timestamp': datetime.datetime.now()}}, upsert=True)
        return processed_palettes
    else:
        return []
if __name__ == '__main__':
    APP.run(host="0.0.0.0", debug=True)
