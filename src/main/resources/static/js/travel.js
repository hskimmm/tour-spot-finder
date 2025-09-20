const mapContainer = document.getElementById('map');
const mapOption = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 5 };
const map = new kakao.maps.Map(mapContainer, mapOption);

const ps = new kakao.maps.services.Places();
const listContainer = $('#list');

let mainMarker = null;
let openInfoWindow = null;
let nearbyMarkers = [];
let currentMainPlace = null;
let currentTourData = null;

// 리스트 하이라이트
function highlightList(index) {
    $('.tour-item').each(function (i) {
        $(this).toggleClass('active', i === index);
    });
}

// 파란색 마커
function createMainInfoWindowContent(place, imgUrl) {
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
            ${imgUrl ? `<div style="width:100px; height:100px; flex-shrink:0;">
                <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" />
            </div>` : ''}
        </div>
    `;
}

// 파란색 마커 클릭 이벤트 함수
function addMainMarkerClickEvent(marker, place, tourData) {
    kakao.maps.event.addListener(marker, 'click', function () {
        if (openInfoWindow) openInfoWindow.close();

        const infoWindow = new kakao.maps.InfoWindow({
            content: createMainInfoWindowContent(place, tourData.filename ? `/images/${tourData.filename}` : null)
        });
        infoWindow.open(map, marker);
        openInfoWindow = infoWindow;
    });
}

// 노란색 마커(주변 관광지)
function showNearbyTours(lat, lng, mainTourData) {
    nearbyMarkers.forEach(m => m.setMap(null));
    nearbyMarkers = [];

    const radius = 500;
    const categoryCode = 'AT4';

    ps.categorySearch(categoryCode, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            result.forEach(place => {
                if (Math.abs(parseFloat(place.y) - lat) < 0.00001 && Math.abs(parseFloat(place.x) - lng) < 0.00001) return;

                const nearbyMarker = new kakao.maps.Marker({
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

                kakao.maps.event.addListener(nearbyMarker, 'click', function () {
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

                (function (tourCopy, idxCopy) {
                    ps.keywordSearch(tourCopy.title, function (result, status) {
                        if (status === kakao.maps.services.Status.OK && result[0]) {
                            const place = result[0];
                            const lat = parseFloat(place.y);
                            const lng = parseFloat(place.x);

                            item.on('click', function () {
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
                                    content: createMainInfoWindowContent(place, tourCopy.filename ? `/images/${tourCopy.filename}` : null)
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
