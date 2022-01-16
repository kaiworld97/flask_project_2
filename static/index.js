let dialog = document.getElementById('dialog');

function opendia() {
    if (typeof dialog.showModal === "function") {
        dialog.showModal();
    } else {
        alert("The <dialog> API is not supported by this browser");
    }
}

// dialog.addEventListener('cancel', function onClose() {
//     window.location.reload()
// });
function dialog_open(data) {
    document.getElementById(`${data.id.split('_')[0]}dialog`).showModal()
}

function feed_dialog_open(data) {
    document.getElementById(`${data}_feed_dialog`).showModal()
}
function dialog_close_btn(data){
    document.getElementById(`${data}_feed_dialog`).close()
}

function feed_delete(data) {
    $.ajax({
        type: "POST",
        url: "/feed_delete",
        data: {'feed_id': data},
        success: function (response) {
            window.location.reload()
        }
    });
}

function feed_update(data) {
    // $.ajax({
    //     type: "POST",
    //     url: "/feed_update",
    //     data: {'feed_id': data, 'content': content},
    //     success: function (response) {
    //         window.location.reload()
    //     }
    // });
}

let story_list = [{'src': '/static/img/12344.gif', 'name': '제리', 'msg': '여러분 안녕하세요!'}, {
    'src': '/static/img/595454.PNG',
    'name': '제리',
    'msg': '토요일에 한살 더 먹는다 ㅜㅜ'
},
    {'src': '/static/img/12344.jpg', 'name': '제리', 'msg': '발표 너무 떨려'}, {
        'src': '/static/img/13444.jpg',
        'name': '제리',
        'msg': '같이 롤 하실 분...ㅎ'
    }, {'src': '/static/img/15202.PNG', 'name': '제리', 'msg': '쒸익 쒸익!'}]

function storyclick(data) {
    data.classList.replace('story-img', 'clicked-story-img')
}

function like(data, id) {
    // let likey = Number(document.getElementById(`${data.id}likey`).innerText.split('명')[0])
    let feed_id = data.id.split('_')[0]
    if (data.attributes[2].value === '/static/img/like@3x.png') {
        document.getElementById(`${feed_id}_heart`).classList.remove('hidden')
        document.getElementById(`${feed_id}_no_heart`).classList.add('hidden')
        // data.setAttribute('src', '/static/img/like@4x.png')
        if (document.getElementById(`${feed_id}_like_count`).innerText.length == 3) {
            let temp = `
            <div id="${data.id}someone_like" class="flex">
            <div id="${data.id}likey" class="strong flex">좋아요 <div id="${feed_id}_like_count">1</div>개</div>
            </div>
            `
            document.getElementById(`${feed_id}_like_wrapper`).innerHTML = temp
        } else {
            let c = Number(document.getElementById(`${feed_id}_like_count`).innerText)
            document.getElementById(`${feed_id}_like_count`).innerText = String(c + 1)
        }
        document.getElementById(`${feed_id}_heart1`).classList.remove('hidden')
        document.getElementById(`${feed_id}_no_heart1`).classList.add('hidden')
        // data.setAttribute('src', '/static/img/like@4x.png')
        if (document.getElementById(`${feed_id}_like_count1`).innerText.length == 3) {
            let temp = `
            <div id="${data.id}someone_like1" class="flex">
            <div id="${data.id}likey1" class="strong flex">좋아요 <div id="${feed_id}_like_count1">1</div>개</div>
            </div>
            `
            document.getElementById(`${feed_id}_like_wrapper1`).innerHTML = temp
        } else {
            let c = Number(document.getElementById(`${feed_id}_like_count1`).innerText)
            document.getElementById(`${feed_id}_like_count1`).innerText = String(c + 1)
        }
        $.ajax({
            type: 'POST',
            url: '/feed_like',
            data: {'feed_id': feed_id, 'id': id, 'type': 'up'},
            success: function (response) {
            }
        });
    } else {
        document.getElementById(`${feed_id}_heart`).classList.add('hidden')
        document.getElementById(`${feed_id}_no_heart`).classList.remove('hidden')
        // data.setAttribute('src', '/static/img/like@3x.png')
        if (document.getElementById(`${feed_id}_like_count`).innerText == '1') {
            let temp = `
            <div id="${data.id}no_like" class="flex width">
            가장 먼저 <div id="${feed_id}_like_count" class="strong margin_left"> 좋아요</div>를 눌러보세요
            </div>
            `
            document.getElementById(`${feed_id}_like_wrapper`).innerHTML = temp
        } else {
            let c = Number(document.getElementById(`${feed_id}_like_count`).innerText)
            document.getElementById(`${feed_id}_like_count`).innerText = String(c - 1)
        }
        document.getElementById(`${feed_id}_heart1`).classList.add('hidden')
        document.getElementById(`${feed_id}_no_heart1`).classList.remove('hidden')
        // data.setAttribute('src', '/static/img/like@3x.png')
        if (document.getElementById(`${feed_id}_like_count1`).innerText == '1') {
            let temp = `
            <div id="${data.id}no_like1" class="flex width">
            가장 먼저 <div id="${feed_id}_like_count1" class="strong margin_left"> 좋아요</div>를 눌러보세요
            </div>
            `
            document.getElementById(`${feed_id}_like_wrapper1`).innerHTML = temp
        } else {
            let c = Number(document.getElementById(`${feed_id}_like_count1`).innerText)
            document.getElementById(`${feed_id}_like_count1`).innerText = String(c - 1)
        }
        $.ajax({
            type: 'POST',
            url: '/feed_like',
            data: {'feed_id': feed_id, 'id': id, 'type': 'down'},
            success: function (response) {
            }
        });
    }
}


function favorite(data) {
    if (data.attributes[3].value === '/static/img/favorite@3x.png') {
        data.setAttribute('src', '/static/img/favorite@4x.png')


    } else {
        data.setAttribute('src', '/static/img/favorite@3x.png')

    }
}

makestory(story_list)
makestory(story_list)
followme(story_list)

function makestory(data) {
    let b = 1
    for (a of data) {
        let imgsrc = a['src']
        let name = a['name']

        let storytemp = `<div class="story-wrapper">
                    <img class="story-img " src="${imgsrc}" alt="" onClick="storyclick(this)">
                        <div>${name}${b}</div>
                </div>`

        $('#story-container').append(storytemp)
        b++
    }
}

function followme(data) {
    let b = 1
    for (a of data) {
        let imgsrc = a['src']
        let name = a['name']
        let temp = `<div class="container">
                        <div class="wrapper">
                            <div><img class="icon" src="${imgsrc}"/>
                            </div>
                            <div style="padding-left: 5%">
                                <div class='strong'>${name}${b}${b}</div>
                                <p>회원님을 위한 추천</p>
                            </div>
                        </div>
                        <p>팔로우</p>
                    </div>`
        $('#follow-people').append(temp)
        b++
    }
}


function like_list(data) {
    data.id
}

// function open_menu(data){
//     let feed_id = data.id.split('_')[0]
//     let feed_writer = data.id.split('_')[1]
//     if (user.id == feed_writer){
//         let temp =
//     `<dialog id="dialog">
//         <form method="dialog">
//             <button class="strong">삭제 하기</button>
//             <hr>
//             <button value="update">수정 하기</button>
//             <hr>
//             <p>게시물로 이동</p>
//             <hr>
//             <button value="cancel">취소</button>
//         </form>
//     </dialog>`
//     }else{
//         let temp =
//     `<dialog id="dialog">
//         <form method="dialog">
//             <button class="font_red strong">신고</button>
//             <hr>
//             <button class="font_red strong">팔로우 취소</button>
//             <hr>
//             <p>게시물로 이동</p>
//             <hr>
//             <button value="cancel">취소</button>
//         </form>
//     </dialog>`
//     }
// }