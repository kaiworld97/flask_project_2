from pymongo import MongoClient
import jwt
import hashlib
from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime, timedelta
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import tensorflow as tf
import PIL
import scipy
import numpy as np
import os

import certifi
import gridfs
import codecs
import io
from bson.objectid import ObjectId

client = MongoClient('mongodb+srv://test:sparta@cluster0.mr6mv.mongodb.net/Cluster0?retryWrites=true&w=majority',
                     tlsCAFile=certifi.where())
db = client.dbsparta

app = Flask(__name__)
fs = gridfs.GridFS(db)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = "./static/profile_pics"

SECRET_KEY = 'SPARTA'

# 학습시킨 binary classification model 불러오기 (출력층을 sigmoid 로 설정했기에, predict 하면 아웃풋이 0~1 로 나옴)
model = tf.keras.models.load_model('static/model/model_fruits.h5')
# 아웃풋이 어떤지는 모델 생성 시 출력층을 어떻게 구성했는지에 따라 얼마든지 달라질 수 있음에 유의
# 모델 생성 시 출력층을 softmax 로 설정했다면 카테고리 갯수만큼 아웃풋이 나올 것
# 모델 생성 시 출력층을 sigmoid 로 설정했다면 0~1로 아웃풋이 나올 것
app = Flask(__name__)

fs = gridfs.GridFS(db)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = "./static/profile_pics"

SECRET_KEY = 'SPARTA'

fruits = ['apple', 'avocado', 'banana', 'blueberry', 'cherry', 'dragonfruit', 'durian', 'grape', 'guava', 'kiwi', 'lemon', 'mandarine', 'mango', 'orange', 'pear', 'strawberry', 'tomato', 'watermelon']


@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user = db.user.find_one({"id": payload['id']}, {'_id': False, 'pw': False})
        if user['img'] == 'x':
            pass
        else:
            img_binary = fs.get(user['img'])
            base64_data = codecs.encode(img_binary.read(), 'base64')
            image = base64_data.decode('utf-8')
            user['img'] = image
        rows = []
        info = db.feed
        # user = db.user.find_one({'id': 'carrot_vely'}, {'_id': False, 'pw': False})
        # print(user[])
        for x in info.find():
            print(x)
            img_binary = fs.get(x['img'])
            base64_data = codecs.encode(img_binary.read(), 'base64')
            image = base64_data.decode('utf-8')
            x['img'] = image
            x_user = db.user.find_one({'id': x['id']}, {'_id': False, 'pw': False})

            if x_user['img'] == 'x':
                pass
            else:
                img_binary = fs.get(x_user['img'])
                base64_data = codecs.encode(img_binary.read(), 'base64')
                image = base64_data.decode('utf-8')
                x_user['img'] = image
            x['write_user'] = x_user
            # for a in db.comment.find():
            #     print(a)w
            comments = list(db.comment.find({'feed_id': str(x['_id'])}))
            comment = []
            if len(comments) != 0:
                for b in comments:
                    comments_user = db.user.find_one({'id': b['id']}, {'_id': False, 'pw': False})
                    b['nick'] = comments_user['nick']
                    if comments_user['img'] == 'x':
                        b['img'] = comments_user['img']
                    else:
                        img_binary = fs.get(comments_user['img'])
                        base64_data = codecs.encode(img_binary.read(), 'base64')
                        image = base64_data.decode('utf-8')
                        b['img'] = image
                    t = str(
                        datetime.fromtimestamp(
                            round(datetime.now().timestamp() * 1000) / 1000.0) - datetime.fromtimestamp(
                            int(b['date']) / 1000.0))
                    if 'days,' in t.split(' '):
                        time = t.split(' ')[0] + '일 전'
                    else:
                        if t.split('.')[0].split(':')[0] == '0' and t.split('.')[0].split(':')[1] == '00':
                            time = str(int(t.split('.')[0].split(':')[2])) + '초 전'
                        elif t.split('.')[0].split(':')[0] == '0' and t.split('.')[0].split(':')[1] != '00':
                            time = str(int(t.split('.')[0].split(':')[1])) + '분 전'
                        else:
                            time = str(int(t.split('.')[0].split(':')[0])) + '시간 전'

                    b['time'] = time
                    comment.append(b)
                x['comments'] = comment

            else:
                x['comments'] = []
                comments_user = {'img': 'x'}
                x['comments_user'] = comments_user

            t = str(datetime.fromtimestamp(round(datetime.now().timestamp() * 1000) / 1000.0) - datetime.fromtimestamp(
                int(x['date']) / 1000.0))
            if 'days,' in t.split(' '):
                time = t.split(' ')[0] + '일 전'
            else:
                if t.split('.')[0].split(':')[0] == '0' and t.split('.')[0].split(':')[1] == '00':
                    time = str(int(t.split('.')[0].split(':')[2])) + '초 전'
                elif t.split('.')[0].split(':')[0] == '0' and t.split('.')[0].split(':')[1] != '00':
                    time = str(int(t.split('.')[0].split(':')[1])) + '분 전'
                else:
                    time = str(int(t.split('.')[0].split(':')[0])) + '시간 전'

            x['time'] = time
            try:
                like = list(db.like.find({'feed_id': str(x['_id'])}))
                like_count = len(like)
                x['like_count'] = like_count
            except:
                x['like_count'] = 0

            if db.like.find_one({'id': user['id'], 'feed_id': str(x['_id'])}) is None:
                x['like_this'] = False
            else:
                x['like_this'] = True
            rows.append(x)
        return render_template('index.html', html='index', rows=rows, user=user)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


# 이전에 드렸던 파일 업로드 자료의 함수와 거의 동일합니다.
@app.route('/fileupload', methods=['POST'])
def file_upload():
    file = request.files['file_give']
    # 해당 파일에서 확장자명만 추출
    extension = file.filename.split('.')[-1]
    # 파일 이름이 중복되면 안되므로, 지금 시간을 해당 파일 이름으로 만들어서 중복이 되지 않게 함!
    today = datetime.now()
    mytime = today.strftime('%Y-%m-%d-%H-%M-%S')
    filename = f'{mytime}'
    # 파일 저장 경로 설정 (파일은 서버 컴퓨터 자체에 저장됨)
    save_to = f'static/img/fruits/fruit/{filename}.{extension}'
    # 파일 저장!
    file.save(save_to)

    return jsonify({'result': 'success'})

@app.route('/feed_upload', methods=['POST'])
def feed_upload():
    date_receive = request.form['date_give']
    content_receive = request.form['content_give']
    id_receive = request.form['id_give']
    user_id = db.user.find_one({'id': id_receive})['id']
    file = request.files['file_give']
    # gridfs 활용해서 이미지 분할 저장
    fs_image_id = fs.put(file)
    feed_doc = {
        'id': user_id,
        'content': content_receive,
        'date': date_receive,
        'img': fs_image_id
    }
    db.feed.insert_one(feed_doc)

    return jsonify({'msg': 'saved!!!!'})

@app.route('/result', methods=['GET'])
def result():
    # 모델은 불러와져 있으니, 사용자가 올린 데이터를 predict 함수에 넣어주면 됨
    # 이미지이기에, rescale 및 size 조정을 위해 ImageDataGenerator 활용
    test_datagen = ImageDataGenerator(rescale=1. / 255)
    test_dir = 'static/img/fruits'
    test_generator = test_datagen.flow_from_directory(
        test_dir,
        # target_size 는 학습할때 설정했던 사이즈와 일치해야 함
        target_size=(128, 128),
        color_mode="rgb",
        shuffle=False,
        # test 셋의 경우, 굳이 클래스가 필요하지 않음
        # 학습할때는 꼭 binary 혹은 categorical 로 설정해줘야 함에 유의
        class_mode=None,
        batch_size=1)
    pred = model.predict(test_generator)

    # 마지막으로 업로드한 사진에 대한 판별결과를 보여줌
    # 이 부분은 어떤 서비스를 만들고자 하는지에 따라서 얼마든지 달라질 수 있음
    result = max(pred[-1])
    fruit_index = list(pred[-1]).index(result)
    fruit = fruits[fruit_index]

    return jsonify({'msg': fruit})

@app.route('/feed_like', methods=['POST'])
def feed_like():
    feed_id_receive = request.form['feed_id']
    id_receive = request.form['id']
    type_receive = request.form['type']
    if type_receive == 'up':
        if db.like.find_one({'feed_id': feed_id_receive, 'id': id_receive}) is None:
            doc = {
                'id': id_receive,
                'feed_id': feed_id_receive
            }
            db.like.insert_one(doc)
        else:
            pass
    else:
        db.like.delete_one({'feed_id': feed_id_receive, 'id': id_receive})
    return jsonify({'msg': 'saved!!!!'})

@app.route("/feed_delete", methods=["POST"])
def feed_delete():
    feed_id_receive = request.form['feed_id']
    img_id = db.feed.find_one({'_id': ObjectId(feed_id_receive)})
    fs.delete(img_id['img'])
    db.comment.delete_many({'feed_id': feed_id_receive})
    db.like.delete_many({'feed_id': feed_id_receive})
    db.feed.delete_one({'_id': ObjectId(feed_id_receive)})
    return jsonify({'msg': '피드 삭제!'})


@app.route("/feed_update", methods=["POST"])
def feed_update():
    feed_id_receive = request.form['feed_id']
    feed_update_receive = request.form['feed_update']
    img_id = db.feed.find_one({'_id': ObjectId(feed_id_receive)})['img']
    fs.delete(img_id)
    db.feed.update_one({'_id': ObjectId(feed_id_receive)}, {"$set": {"content": feed_update_receive}})
    return jsonify({'msg': '피드 수정!'})

@app.route("/comments", methods=["POST"])
def comment_post():
    comment_receive = request.form['comment_give']
    feed_id_receive = request.form['feed_id_give']
    id_receive = request.form['id_give']
    date_receive = request.form['date_give']
    comment_id = feed_id_receive + '_' + id_receive + '_' + date_receive
    # comment_list = list(db.comment.find({}, {'_id': False}))
    # count = len(comment_list) + 1
    doc = {
        'comment': comment_receive,
        'feed_id': feed_id_receive,
        'id': id_receive,
        'date': date_receive,
        'comment_id': comment_id
    }
    if db.comment.find_one({'id': id_receive, 'feed_id': feed_id_receive, 'comment': comment_receive}) is None:
        db.comment.insert_one(doc)
        return jsonify({'msg': '댓글 작성!'})
    else:
        return jsonify({'msg': '중복 댓글 입니다!'})


@app.route("/comments", methods=["GET"])
def comment_get():
    comment_list = list(db.comment.find({}, {'_id': False}))
    return jsonify({'comments': comment_list})


@app.route("/comments/delete", methods=["POST"])
def comment_delete_post():
    comment_id_receive = request.form['comment_id']
    db.comment.delete_one({'comment_id': comment_id_receive})
    return jsonify({'msg': '댓글 삭제!'})


@app.route("/comments/update", methods=["POST"])
def comment_update_post():
    comment_id_receive = request.form['comment_id']
    comment_receive = request.form['update_comment']
    db.comment.update_one({'comment_id': comment_id_receive}, {"$set": {"comment": comment_receive}})
    return jsonify({'msg': '댓글 수정!'})


@app.route("/user_update", methods=["POST"])
def user_update():
    print(request.form)
    nick_receive = request.form['nick_give']
    id_receive = request.form['id_give']

    try:
        file = request.files['file_give']
        # gridfs 활용해서 이미지 분할 저장
        fs_image_id = fs.put(file)
        user_info = db.user.find_one({'id': id_receive})
        if user_info['img'] == 'x':
            db.user.update_one({'id': id_receive}, {"$set": {"nick": nick_receive, 'img': fs_image_id}})
        else:
            fs.delete(user_info['img'])
            db.user.update_one({'id': id_receive}, {"$set": {"nick": nick_receive, 'img': fs_image_id}})
    except:
        db.user.update_one({'id': id_receive}, {"$set": {"nick": nick_receive}})
    return jsonify({'msg': '수정 완료!'})

@app.route('/auction')
def auction():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user = db.user.find_one({"id": payload['id']}, {'_id': False, 'pw': False})
        if user['img'] == 'x':
            pass
        else:
            img_binary = fs.get(user['img'])
            base64_data = codecs.encode(img_binary.read(), 'base64')
            image = base64_data.decode('utf-8')
            user['img'] = image
        return render_template('auction.html', html='auction', user=user)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


@app.route('/mypage/<keyword>')
def mypage(keyword):
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user = db.user.find_one({"id": payload['id']}, {'_id': False, 'pw': False})
        mypage_user = db.user.find_one({"id": keyword}, {'_id': False, 'pw': False})
        feed_list = len(list(db.feed.find({'id': mypage_user['id']})))
        mypage_user['feed_count'] = feed_list
        if user['img'] == 'x':
            pass
        else:
            img_binary = fs.get(user['img'])
            base64_data = codecs.encode(img_binary.read(), 'base64')
            image = base64_data.decode('utf-8')
            user['img'] = image
        if mypage_user['img'] == 'x':
            pass
        else:
            img_binary = fs.get(mypage_user['img'])
            base64_data = codecs.encode(img_binary.read(), 'base64')
            image = base64_data.decode('utf-8')
            mypage_user['img'] = image

        feedrows = []
        feedrow = []
        info = db.feed
        # info = db.feed.find({'id': 'carrot_vely'})
        # user = db.user.find_one({'id': 'carrot_vely'}, {'_id': False, 'pw': False})
        for x in info.find({"id": mypage_user['id']}):
            img_binary = fs.get(x['img'])
            base64_data = codecs.encode(img_binary.read(), 'base64')
            image = base64_data.decode('utf-8')
            x['img'] = image
            x_user = db.user.find_one({'id': x['id']}, {'_id': False, 'pw': False})
            if x_user['img'] == 'x':
                pass
            else:
                img_binary = fs.get(x_user['img'])
                base64_data = codecs.encode(img_binary.read(), 'base64')
                image = base64_data.decode('utf-8')
                x_user['img'] = image
            x['write_user'] = x_user

            # for a in db.comment.find():
            #     print(a)w
            comments = list(db.comment.find({'feed_id': str(x['_id'])}))
            comment = []
            if len(comments) != 0:
                for b in comments:
                    comments_user = db.user.find_one({'id': b['id']}, {'_id': False, 'pw': False})
                    b['nick'] = comments_user['nick']
                    if comments_user['img'] == 'x':
                        b['img'] = comments_user['img']
                    else:
                        img_binary = fs.get(comments_user['img'])
                        base64_data = codecs.encode(img_binary.read(), 'base64')
                        image = base64_data.decode('utf-8')
                        b['img'] = image
                    t = str(
                        datetime.fromtimestamp(
                            round(datetime.now().timestamp() * 1000) / 1000.0) - datetime.fromtimestamp(
                            int(b['date']) / 1000.0))
                    if 'days,' in t.split(' '):
                        time = t.split(' ')[0] + '일 전'
                    else:
                        if t.split('.')[0].split(':')[0] == '0' and t.split('.')[0].split(':')[1] == '00':
                            time = str(int(t.split('.')[0].split(':')[2])) + '초 전'
                        elif t.split('.')[0].split(':')[0] == '0' and t.split('.')[0].split(':')[1] != '00':
                            time = str(int(t.split('.')[0].split(':')[1])) + '분 전'
                        else:
                            time = str(int(t.split('.')[0].split(':')[0])) + '시간 전'

                    b['time'] = time
                    comment.append(b)
                x['comments'] = comment

            else:
                x['comments'] = []
                comments_user = {'img': 'x'}
                x['comments_user'] = comments_user

            t = str(datetime.fromtimestamp(round(datetime.now().timestamp() * 1000) / 1000.0) - datetime.fromtimestamp(
                int(x['date']) / 1000.0))
            if 'days,' in t.split(' '):
                time = t.split(' ')[0] + '일 전'
            else:
                if t.split('.')[0].split(':')[0] == '0' and t.split('.')[0].split(':')[1] == '00':
                    time = str(int(t.split('.')[0].split(':')[2])) + '초 전'
                elif t.split('.')[0].split(':')[0] == '0' and t.split('.')[0].split(':')[1] != '00':
                    time = str(int(t.split('.')[0].split(':')[1])) + '분 전'
                else:
                    time = str(int(t.split('.')[0].split(':')[0])) + '시간 전'
                #
                # time = t.split(' ')[0]
            x['time'] = time

            try:
                like = list(db.like.find({'feed_id': str(x['_id'])}))
                like_count = len(like)
                x['like_count'] = like_count
            except:
                x['like_count'] = 0

            if db.like.find_one({'id': user['id'], 'feed_id': str(x['_id'])}) is None:
                x['like_this'] = False
            else:
                x['like_this'] = True

            feedrow.append(x)
            if len(feedrow) == 3:
                feedrows.append(feedrow)
                feedrow = []
        if len(feedrow) == 2 or len(feedrow) == 1:
            feedrows.append(feedrow)
        return render_template('mypage.html', html='mypage', feedrows=feedrows, reciperows=feedrows, likerows=feedrows,
                               user=user, mypage_user=mypage_user)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


@app.route('/api/register', methods=['POST'])
def api_register():
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']
    nickname_receive = request.form['nickname_give']
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
    db.user.insert_one(
        {'id': id_receive, 'pw': pw_hash, 'nick': nickname_receive, 'img': 'x'})
    return jsonify({'result': 'success'})

@app.route('/sign_in', methods=['POST'])
def sign_in():
    # 로그인
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']

    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.user.find_one({'id': username_receive, 'pw': pw_hash})
    print(result)
    if result is not None:
        payload = {
            'id': username_receive,
            'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)  # 로그인 24시간 유지
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        # token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')
        return jsonify({'result': 'success', 'token': token})
    # 찾지 못하면
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', html='login', msg=msg)

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
