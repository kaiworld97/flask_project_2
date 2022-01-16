function load() {
    window.location.reload()
    window.scrollTo(0, 0)
}

function back() {
    history.back()
}

function go_main() {
    location.href = '/'
}

function go_recipe() {
    location.href = '/recipe'
}

function go_auction() {
    location.href = '/auction'
}

$(window).on('load', function () {
    setTimeout(function () {
        $("#waiting").fadeOut();
    }, 500);
});

function dropdownmenu() {
    document.getElementById("dropdown").classList.toggle("show");
}

function dropupmenu() {
    document.getElementById("dropup").classList.toggle("show");
}

function feed_write_dialog() {
    document.getElementById("feed_write_dialog").showModal();

    document.querySelector('#_next').style.visibility = "hidden";
    document.querySelector('#_share').style.visibility = "hidden";

    document.getElementById('second_part').classList.add("hidden")

}

function feed_recipe_dialog() {
    document.getElementById("recipe_write_dialog").showModal();
}

function camera_dialog() {
    document.getElementById("camera_dialog").showModal();
    camera_restart()
}

function close_camera_dialog() {
    document.getElementById('camera_dialog').close()
}


(function () {
    var height = 0;
    var streaming = false;
    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');

        navigator.mediaDevices.getUserMedia({video: true, audio: false})
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
                document.getElementById('cameraoff').addEventListener('click', function () {
                    stopStream(stream);
                });
            })
            .catch(function (err) {
                console.log("An error occurred: " + err);
            });

        video.addEventListener('canplay', function (ev) {
            var width = document.getElementById("all-container").offsetWidth;
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);


                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        startbutton.addEventListener('click', function (ev) {
            takepicture();
            ev.preventDefault();
        }, false);

        clearphoto();
    }


    function stopStream(stream) {
        console.log('stop called');
        stream.getVideoTracks().forEach(function (track) {
            track.stop();
        });
    }


    function clearphoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }

    function takepicture() {
        var width = document.getElementById("all-container").offsetWidth;
        document.getElementById('video').classList.add('hidden')
        document.getElementById('startbutton').classList.add('hidden')
        document.getElementById('restart').classList.remove('hidden')
        document.getElementById('output').classList.remove('hidden')
        document.getElementById('camera_feed').classList.remove('hidden')
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/jpeg');
            photo.setAttribute('src', data);
        } else {
            clearphoto();
        }
    }

    document.getElementById('camera_icon').addEventListener('click', startup, false);
    // window.addEventListener('load', startup, false);
})();

function camera_posting(data) {
    let camera_feed = $('#camera_feed').val()
    let img = $('#photo').attr('src')
    fetch(img)
        .then(res => res.blob())
        .then(blob => {

            const file = new File([blob], 'photo.png', blob)
            const date = new Date();
            let time = String(date.getTime())
            let form_data = new FormData()
            let user_id = data

            form_data.append("file_give", file)
            form_data.append("content_give", camera_feed)
            form_data.append("id_give", user_id)
            form_data.append("date_give", time)

            $.ajax({
                type: "POST",
                url: '/feed_upload',
                data: form_data,
                cache: false,
                contentType: false,
                processData: false,
                success: function (response) {
                    alert(response["msg"])
                    location.href = '/'
                }
            });
        })
}

function camera_restart() {
    document.getElementById('video').classList.remove('hidden')
    document.getElementById('startbutton').classList.remove('hidden')
    document.getElementById('restart').classList.add('hidden')
    document.getElementById('output').classList.add('hidden')
    document.getElementById('camera_feed').classList.add('hidden')
}

function back_home() {
    // console.log('홈으로 돌아가기')
    history.back()
}


// 2200자 넘으면 글자수제한하는부분 추가하기
function contentLength() {

    let max_length = document.querySelector("#textarea")
    document.querySelector('#max-len').innerHTML = max_length.value.length + '/2,200';

    console.log(max_length.value, max_length.value.length)

    if (max_length.value.length >= 2200) {
        // console.log('2200자넘음')
        alert('2,200자 이내로 작성해 주세요')
    }
}


function loadFile(input) {

    document.querySelector('#_back').style.visibility = "visible";
    document.querySelector('#_next').style.visibility = "visible";
    document.getElementById('_share').classList.add('hidden')
    document.getElementById('header_title').classList.add('hidden')

    // let file_name = input.files[0]['name']
    let file = input.files[0];
    let file_img = document.createElement("img");
    file_img.setAttribute("class", 'img')
    file_img.src = URL.createObjectURL(file);

    file_img.style.width = "100%";
    file_img.style.height = "100%";
    file_img.style.visibility = "visible";
    file_img.style.objectFit = "cover"

    document.getElementById('uf_one').classList.add('hidden')
    document.getElementById('uf_two').classList.add('hidden')
    document.getElementById('uf_three').classList.add('hidden')

    let container = document.getElementById("upload_box");

    container.style.width = "100%";
    container.appendChild(file_img);

    let form_data = new FormData()
    form_data.append("file_give", file)

    $.ajax({
        type: "POST",
        url: "/fileupload",
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            console.log(response)
        }
    });
}

function writeText() {
    document.getElementById('_next').classList.add('hidden')
    document.querySelector('#_share').style.visibility = "visible";
    document.getElementById('_share').classList.remove('hidden')
    document.getElementById('second_part').classList.remove('hidden')
        $.ajax({
        type: "GET",
        url: "/result",
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            document.getElementById('textarea').innerText = response.msg
            console.log(response)
        }
    });
}


function posting() {
    // let title = $('#chooseFile')[0].files[0].name
    let file = $('#select_file')[0].files[0]
    let content = $('#textarea').val()
    // 지금은 유저id 직접 타이핑한거라 .text로했지만 db에서 불러올경우 수정필요
    let user_id = document.querySelector("#user_name").textContent
    const date = new Date();
    let time = String(date.getTime())
    let form_data = new FormData()

    // console.log(file, content, user_id, date, time, form_data)
    // form_data.append("title_give", title)

    form_data.append("file_give", file)
    form_data.append("content_give", content)
    form_data.append("id_give", user_id)
    form_data.append("date_give", time)

    $.ajax({
        type: "POST",
        url: '/feed_upload',
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            alert(response["msg"])
            window.location.reload()
        }
    });
}




function dialog_close_btn1() {
    document.getElementById('feed_write_dialog').close()
}

function comment_write(data, id) {
    let comment = $(`#${data}comment`).val()
    const date = new Date();
    let time = String(date.getTime())
    $.ajax({
        type: 'POST',
        url: '/comments',
        data: {'comment_give': comment, 'feed_id_give': data, 'id_give': id, 'date_give': time},
        success: function (response) {
            window.location.reload()
        }
    });
}

function comment_write1(data, id) {
    let comment = $(`#${data}comment1`).val()
    const date = new Date();
    let time = String(date.getTime())
    $.ajax({
        type: 'POST',
        url: '/comments',
        data: {'comment_give': comment, 'feed_id_give': data, 'id_give': id, 'date_give': time},
        success: function (response) {
            window.location.reload()
        }
    });
}

function comment_delete(comment_id) {

    $.ajax({
        type: "POST",
        url: "/comments/delete",
        data: {'comment_id': comment_id},
        success: function (response) {
            window.location.reload()
        }
    });
}

function comment_update_btn(comment_id) {
    document.getElementById(`${comment_id}_comment`).classList.add('hidden')
    document.getElementById(`${comment_id}_update`).classList.add('hidden')
    document.getElementById(`${comment_id}_delete`).classList.add('hidden')
    document.getElementById(`${comment_id}_input`).classList.remove('hidden')
    document.getElementById(`${comment_id}_ok`).classList.remove('hidden')
    document.getElementById(`${comment_id}_cancel`).classList.remove('hidden')
}

function comment_update_cancel(comment_id) {
    document.getElementById(`${comment_id}_comment`).classList.remove('hidden')
    document.getElementById(`${comment_id}_update`).classList.remove('hidden')
    document.getElementById(`${comment_id}_delete`).classList.remove('hidden')
    document.getElementById(`${comment_id}_input`).classList.add('hidden')
    document.getElementById(`${comment_id}_ok`).classList.add('hidden')
    document.getElementById(`${comment_id}_cancel`).classList.add('hidden')
}

function comment_update_btn1(comment_id) {
    document.getElementById(`${comment_id}_comment1`).classList.add('hidden')
    document.getElementById(`${comment_id}_update1`).classList.add('hidden')
    document.getElementById(`${comment_id}_delete1`).classList.add('hidden')
    document.getElementById(`${comment_id}_input1`).classList.remove('hidden')
    document.getElementById(`${comment_id}_ok1`).classList.remove('hidden')
    document.getElementById(`${comment_id}_cancel1`).classList.remove('hidden')
}

function comment_update_cancel1(comment_id) {
    document.getElementById(`${comment_id}_comment1`).classList.remove('hidden')
    document.getElementById(`${comment_id}_update1`).classList.remove('hidden')
    document.getElementById(`${comment_id}_delete1`).classList.remove('hidden')
    document.getElementById(`${comment_id}_input1`).classList.add('hidden')
    document.getElementById(`${comment_id}_ok1`).classList.add('hidden')
    document.getElementById(`${comment_id}_cancel1`).classList.add('hidden')
}

function comment_update(comment_id) {
    let comment = $(`#${comment_id}_input`).val()
    console.log(comment)
    $.ajax({
        type: "POST",
        url: "/comments/update",
        data: {'comment_id': comment_id, 'update_comment': comment},
        success: function (response) {
            window.location.reload()
        }
    });
}

function comment_update1(comment_id) {
    let comment = $(`#${comment_id}_input1`).val()
    console.log(comment)
    $.ajax({
        type: "POST",
        url: "/comments/update",
        data: {'comment_id': comment_id, 'update_comment': comment},
        success: function (response) {
            window.location.reload()
        }
    });
}

function comment_dialog_open(data) {
    document.getElementById(`${data}_comment-dialog`).showModal()
}

function comment_dialog_open1(data) {
    document.getElementById(`${data}_comment-dialog1`).showModal()
}

function button_event(comment_id) {
    if (confirm("정말 삭제하시겠습니까?") == true) {
        comment_delete(comment_id)
    } else {
        return
    }
}



