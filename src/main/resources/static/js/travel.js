const mapContainer = document.getElementById('map'); //지도를 표시할 HTML 요소
const mapOption = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 5 }; //초기 중심 좌표
const map = new kakao.maps.Map(mapContainer, mapOption); //카카오맵 객체 생성

const ps = new kakao.maps.services.Places(); //장소 검색 서비스 객체
const listContainer = $('#list'); //리스트 표시할 컨테이너 선택

let mainMarker = null; //파란색 마커(메인)
let openInfoWindow = null; //현재 알림 정보창
let nearbyMarkers = []; //노란색 마커(서브)
let currentMainPlace = null; //카카오맵에서 받은 메인 관광지 정보
let currentTourData = null; //서버에서 받은 메인 관광지 데이터

// 모달 관련 변수
let currentModalImages = [];
let currentModalIndex = 0;
let currentModalTitle = '';

// 이미지 모달 열기
function openImageModal(images, startIndex = 0, title = '') {
    currentModalImages = images;
    currentModalIndex = startIndex;
    currentModalTitle = title;

    document.getElementById('modalTitle').textContent = title || '이미지 갤러리';
    updateModalImage();
    createModalThumbnails();
    document.getElementById('imageModal').style.display = 'block';

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', handleModalKeydown);
}

// 이미지 모달 닫기
function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.removeEventListener('keydown', handleModalKeydown);
}

// 모달 키보드 이벤트
function handleModalKeydown(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    } else if (e.key === 'ArrowLeft') {
        changeModalImage(-1);
    } else if (e.key === 'ArrowRight') {
        changeModalImage(1);
    }
}

// 모달 이미지 변경
function changeModalImage(direction) {
    if (currentModalImages.length <= 1) return;

    currentModalIndex = (currentModalIndex + direction + currentModalImages.length) % currentModalImages.length;
    updateModalImage();
    updateModalThumbnails();
}

// 모달 이미지 업데이트
function updateModalImage() {
    const modalImage = document.getElementById('modalImage');
    const modalCounter = document.getElementById('modalCounter');

    if (currentModalImages.length > 0) {
        modalImage.src = `/images/${currentModalImages[currentModalIndex]}`;
        modalCounter.textContent = `${currentModalIndex + 1} / ${currentModalImages.length}`;

        // 네비게이션 버튼 표시/숨기기
        const prevBtn = document.querySelector('.modal-nav.prev');
        const nextBtn = document.querySelector('.modal-nav.next');

        if (currentModalImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }
}

// 모달 썸네일 생성
function createModalThumbnails() {
    const thumbnailContainer = document.getElementById('modalThumbnails');
    thumbnailContainer.innerHTML = '';

    if (currentModalImages.length <= 1) return;

    currentModalImages.forEach((filename, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.className = `modal-thumbnail ${index === currentModalIndex ? 'active' : ''}`;
        thumbnail.src = `/images/${filename}`;
        thumbnail.onclick = () => {
            currentModalIndex = index;
            updateModalImage();
            updateModalThumbnails();
        };
        thumbnailContainer.appendChild(thumbnail);
    });
}

// 모달 썸네일 업데이트
function updateModalThumbnails() {
    const thumbnails = document.querySelectorAll('.modal-thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentModalIndex);
    });
}

// 모달 외부 클릭시 닫기
document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeImageModal();
    }
});

// 리스트 하이라이트(선택된 관광지 리스트 항목을 강조 이벤트)
function highlightList(index) {
    $('.tour-item').each(function (i) {
        $(this).toggleClass('active', i === index);
    });
}

// 파란색 마커(HTML 정보창) - 다중 이미지 지원 (2개씩 나란히)
function createMainInfoWindowContent(place, tourData) {
    // 이미지 갤러리 HTML 생성
    let imageGalleryHtml = '';

    // filename 필드에서 콤마로 구분된 문자열을 배열로 변환
    let filenamesArray = [];
    if (tourData && tourData.filename) {
        filenamesArray = tourData.filename.split(',');
    }

    if (filenamesArray.length > 0) {
        // 항상 첫 번째 이미지만 표시 (대표 이미지)
        const hasMultipleImages = filenamesArray.length > 1;
        imageGalleryHtml = `
            <div style="width:120px; height:100px; flex-shrink:0; position:relative;">
                <img src="/images/${filenamesArray[0]}"
                     style="width:100%; height:100%; object-fit:cover; border-radius:8px; cursor:pointer;"
                     onclick="openImageModal(['${filenamesArray.join("','")}'], 0, '${place.place_name}')" />
                ${hasMultipleImages ? `
                    <div style="position:absolute; bottom:4px; right:4px; background:rgba(0,0,0,0.7); color:white; padding:4px 8px; border-radius:12px; font-size:11px; font-weight:bold;">
                        +${filenamesArray.length - 1}
                    </div>
                ` : ''}
                ${hasMultipleImages ? `
                    <div style="position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.5); color:white; padding:2px 6px; border-radius:8px; font-size:10px;">
                        📷 ${filenamesArray.length}
                    </div>
                ` : ''}
            </div>
        `;
    }

    return `
        <div style="
            display:flex; align-items:flex-start; padding:12px; min-width:400px; max-width:500px;
            border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background:#ffffff; color:#333; line-height:1.5;
        ">
            <div style="flex:1; padding-right:10px;">
                <div style="
                    font-weight:bold; font-size:16px; margin-bottom:6px; color:#00bfa5;
                    white-space: normal;
                ">
                    ${place.place_name}
                </div>
                <div style="
                    font-size:14px; color:#555; margin-bottom:4px;
                    white-space: normal;
                ">
                    ${place.address_name || '주소 없음'}
                </div>
                ${place.phone ? `<div style="
                    font-size:14px; color:#555; margin-bottom:6px;
                    white-space: normal;
                ">전화: ${place.phone}</div>` : ''}
                <div style="text-align:left; margin-top:6px;">
                    <a href="https://place.map.kakao.com/${place.id}" target="_blank" style="
                        font-size:13px; color:#00bfa5; text-decoration:none; font-weight:600;
                    ">
                        상세보기 ▶
                    </a>
                </div>
            </div>
            ${imageGalleryHtml}
        </div>
    `;
}

// 파란색 마커 클릭 이벤트 함수
function addMainMarkerClickEvent(marker, place, tourData) {
    kakao.maps.event.addListener(marker, 'click', function () {
        if (openInfoWindow) openInfoWindow.close(); //기존에 열려있던 창 닫기

        const infoWindow = new kakao.maps.InfoWindow({ //새로운 정보창 생성
            content: createMainInfoWindowContent(place, tourData)
        });
        infoWindow.open(map, marker); //새로운 정보창 열기
        openInfoWindow = infoWindow; //열린 정보창을 openInfoWindow 변수에 저장(기존에 열려있던 정보창을 닫기 위해)
    });
}

// 노란색 마커(주변 관광지)
function showNearbyTours(lat, lng, mainTourData) {
    nearbyMarkers.forEach(m => m.setMap(null)); //기존 마커 제거
    nearbyMarkers = [];

    const radius = 500; //반경500m
    const categoryCode = 'AT4'; //AT4 카테고리

    ps.categorySearch(categoryCode, function (result, status) { //메인 관광지의 동일한 좌표는 제외
        if (status === kakao.maps.services.Status.OK) {
            result.forEach(place => {
                if (Math.abs(parseFloat(place.y) - lat) < 0.00001 && Math.abs(parseFloat(place.x) - lng) < 0.00001) return;

                const nearbyMarker = new kakao.maps.Marker({ //노란색별 마커 이미지 사용
                    map: map,
                    position: new kakao.maps.LatLng(place.y, place.x),
                    title: place.place_name,
                    image: new kakao.maps.MarkerImage(
                        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                        new kakao.maps.Size(24, 35)
                    )
                });

                nearbyMarkers.push(nearbyMarker);

                // 노란색 마커 정보 HTML
                const infoWindow = new kakao.maps.InfoWindow({
                    content: `
                        <div style="
                            padding:10px 14px; font-size:14px; color:#333;
                            background:#fff; border-radius:8px;
                            box-shadow:0 2px 6px rgba(0,0,0,0.15);
                            line-height:1.4; min-width:280px; max-width:400px;
                            white-space: normal;
                        ">
                            <div style="font-weight:bold; color:#00bfa5; margin-bottom:4px;">
                                ${place.place_name}
                            </div>
                            <div style="color:#555; margin-bottom:4px;">
                                ${place.address_name || '주소 없음'}
                            </div>
                            <div style="text-align:left; margin-top:6px;">
                                <a href="https://place.map.kakao.com/${place.id}" target="_blank" style="
                                    font-size:13px; color:#00bfa5; text-decoration:none; font-weight:600;
                                ">상세보기 ▶</a>
                            </div>
                        </div>
                    `
                });

                kakao.maps.event.addListener(nearbyMarker, 'click', function () { //노란색 마커 클릭 시 마다 정보창 열림
                    if (openInfoWindow) openInfoWindow.close();
                    infoWindow.open(map, nearbyMarker);
                    openInfoWindow = infoWindow;
                });
            });
        }
    }, { x: lng, y: lat, radius: radius });
}

// 관광지 리스트
function loadTourList(keyword = '') {
    listContainer.empty();

    $.ajax({
        url: '/api/tours',
        type: 'GET',
        data: { keyword },
        dataType: 'json',
        success: function (data) {
            if (data.length === 0) {
                listContainer.html('<p style="padding:10px;">검색 결과가 없습니다.</p>');
                return;
            }

            data.forEach((tour, idx) => {
                const item = $('<div class="tour-item"></div>')
                    .attr('data-title', tour.title)
                    .attr('data-address', tour.address);
                const titleDiv = $('<div class="tour-title"></div>').text(tour.title);
                const addressDiv = $('<div class="tour-address"></div>').text(tour.address);
                item.append(titleDiv, addressDiv);
                listContainer.append(item);

                (function (tourCopy, idxCopy) { //tourCopy -> tour, idx -> idxCopy
                    ps.keywordSearch(tourCopy.title, function (result, status) {
                        if (status === kakao.maps.services.Status.OK && result[0]) {
                            const place = result[0]; //검색 결과중 의 첫번째 장소 정보
                            const lat = parseFloat(place.y); //위도
                            const lng = parseFloat(place.x); //경도

                            item.on('click', function () { //리스트 클릭 시 마다 실행
                                const position = new kakao.maps.LatLng(lat, lng);
                                map.setCenter(position);
                                highlightList(idxCopy);

                                currentMainPlace = place;
                                currentTourData = tourCopy;

                                if (mainMarker) mainMarker.setMap(null);

                                mainMarker = new kakao.maps.Marker({
                                    map: map,
                                    position: position
                                });

                                addMainMarkerClickEvent(mainMarker, place, tourCopy);

                                if (openInfoWindow) openInfoWindow.close();
                                const selectedInfoWindow = new kakao.maps.InfoWindow({
                                    content: createMainInfoWindowContent(place, tourCopy)
                                });
                                selectedInfoWindow.open(map, mainMarker);
                                openInfoWindow = selectedInfoWindow;

                                showNearbyTours(lat, lng);
                            });
                        }
                    });
                })(tour, idx);
            });
        },
        error: function (err) {
            console.error(err);
            listContainer.html('<p style="padding:10px;">데이터를 가져오는 중 오류가 발생했습니다.</p>');
        }
    });
}

$('#search-btn').on('click', function () {
    const keyword = $('#keyword').val().trim();
    loadTourList(keyword);
});

$('#keyword').on('keyup', function (e) {
    if (e.key === 'Enter') $('#search-btn').click();
});

// init
$(document).ready(function () {
    loadTourList();
});
