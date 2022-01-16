function update_user_dialog() {
    document.getElementById('update_user_dialog').show()
}
function cance_update(){
    document.getElementById('update_user_dialog').close()

}
function mypageimgopen(data){
    document.getElementById(`${data}_feed_dialog`).show()
}
function mypageimgclose(data){
    document.getElementById(`${data}_feed_dialog`).close()
}
function dialog_close_btn(data){
    document.getElementById(`${data}_feed_dialog`).close()
}

function eventHandler(e) {
    var $eTarget = $(e.currentTarget);
    var $targetPanel = $('[aria-labelledby="' + $eTarget.attr('id') + '"]');
    $eTarget
        .attr('aria-selected', true)
        .addClass('Mypage-grid-box-active') // 구버전 IE
        .siblings('[role="tab"]')
        .attr('aria-selected', false)
        .removeClass('Mypage-grid-box-active'); // 구버전 IE

    $targetPanel
        .attr('aria-hidden', false)
        .addClass('panel') // 구버전 IE
        .siblings('[role="tabpanel"]')
        .attr('aria-hidden', true)
        .removeClass('panel'); // 구버전 IE
}

// 이벤트 바인딩 - 이벤트와, 실행될 함수를 연결해줌
$('[role="tab"]').on('click', eventHandler);
//



function loadFile1(input) {
    console.log(input)
    // let file_name = input.files[0]['name']
    let file = input.files[0];
    let file_img = document.createElement("img");
    file_img.setAttribute("class", 'img')
    file_img.src = URL.createObjectURL(file);

    file_img.style.width = "300px";
    file_img.style.height = "300px";
    file_img.style.visibility = "visible";
    file_img.style.objectFit = "cover";
    file_img.style.borderRadius = "150px";

    document.getElementById('update_user_img').classList.add('hidden')


    let container1 = document.getElementById("update_box");
    container1.appendChild(file_img);
}

function updating1(data) {
    let file = $('#file1')[0].files[0]
    let nick = $('#update_user_nick').val()
    let form_data = new FormData()

    form_data.append("file_give", file)
    form_data.append("nick_give", nick)
    form_data.append("id_give", data)

    $.ajax({
        type: "POST",
        url: '/user_update',
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