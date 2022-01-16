let auction_data = [{
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


make_auction_story(auction_data)
make_ganggo(auction_data)

function make_auction_story(data) {
    let b = 1
    for (a of data) {
        let imgsrc = a['img']
        let name = a['recipe_id']

        let storytemp = `<div class="story-wrapper">
                    <img class="story-img " src= "../static/img/${imgsrc}" alt="" onClick="storyclick(this)">
                        <div>${name}${b}</div>
                </div>`

        $('#Auction-page-header').append(storytemp)
        b++
    }
}


function make_ganggo(data) {
    let b = 1
    for (a of data) {
        let imgsrc = a['img']
        let name = a['recipe_id']
        let content = a['content']

        let gango_page = ` <div class=gango-header>
                        <div class="gango-img-text-box">
                            <div class=gango-img-box>
                                <img class=story-img src=../static/img/${imgsrc}>
                            </div>
                            <div class="gango-text-box">
                                <p class="gango-user_name">${name}${b}</p>
                            </div>
                        </div>
                        <div class="gango-main-img-box">
                            <div class="gango-click-info">

                                <p>${content}</p>
                            </div>
                            <img class="gango-main-img" src=../static/img/${imgsrc}>
                        </div>
                    </div>
                  
                  `
        $('#Auction-page-ganggo-main').append(gango_page)
        b++
    }
}

function open_box() {
    $('#post-box').show()
}

function close_box() {
    $('#post-box').hide()
}

