// more 눌렸을때 나타나는 팝업메뉴
let rasipi_list = [{
    'img': '12344.gif',
    'recipe_id': '제리',
    'content': '여러분 안녕하세요!',
    'like_count': '1'
}, {'img': '595454.PNG', 'recipe_id': '제리', 'content': '토요일에 한살 더 먹는다 ㅜㅜ', 'like_count': '25'},
    {'img': '12344.jpg', 'recipe_id': '제리', 'content': '발표 너무 떨려', 'like_count': '100'}, {
        'img': '13444.jpg',
        'recipe_id': '제리',
        'content': '같이 롤 하실 분...ㅎ',
        'like_count': '250'
    }, {'img': '15202.PNG', 'recipe_id': '제리', 'content': '쒸익 쒸익!', 'like_count': '300'}]


rasipi(rasipi_list)

function rasipi(data) {
    let b = 1
    for (a of data) {
        let imgsrc = a['img']
        let name = a['recipe_id']
        let comment = a['content']
        let like = a['like_count']
        let temp = `<li class ="rasipi_li_list">
                        <div class = "rasipi_img_box">
                            <a class ="rasipi_img">
                                  <img class ="rasipi-imgs" src = ../static/img/${imgsrc} >
                            </a>                          
                        </div>
                        <div class =rasipi_comant_box">
                            <div class="rasipi_commant">
                                      ${comment}                              
                           </div>
                           <div class = "name_box">
                                <img class ="name_img" src =../static/img/${imgsrc}> "${name}"
                           </div>
                           <div class="rasipi_poot_box">
                                <span class ="heart_box" >
                                    <img  style="width: 14px; margin: 0; " src= ../static/img/like@4x.png>
                                    공감수
                                </span>
                                <span class ="heart_count">
                                        ${like}                                
                                </span>
                           
                           </div>
                             
                        </div>
                        
                        </div>


                </li>`
        $('#rasipi_container').append(temp)
        b++
    }
}

let dialog = document.getElementById('dialog');

function opendia() {
    if (typeof dialog.showModal === "function") {
        dialog.showModal();
    } else {
        alert("The <dialog> API is not supported by this browser");
    }
};
dialog.addEventListener('cancel', function onClose() {
    window.location.reload()
});