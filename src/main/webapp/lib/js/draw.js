var map;
var layers;
// var geoserverBaseUrl = 'http://http://172.19.5.65:9009/goserver';
var geoserverBaseUrl = 'https://kwatergeo.com:8443/geoserver';
var draw;
var vworldBackgroundMap = 'https://map.vworld.kr/js/apis.do?type=Base&apiKey=31C4DA3E-17FA-34E2-8469-5C81922B53C5';



/* 도형그리기 */
var source = new ol.source.Vector({wrapX: false});
var vectorDraw = new ol.layer.Vector({
	source: source,
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'red', // 테두리 색상을 빨간색으로 설정
			width: 2 // 테두리 두께
		}),
		fill: new ol.style.Fill({
			color: 'rgba(255, 0, 0, 0.2)' // 다각형 내부 색상 및 투명도 설정
		})
	})
});
/* OSM 배경지도 */
var OSM = new ol.layer.Tile({
		// 일반적인 사용자 지정 타일을 삽입할 때 사용하는 코드입니다.
		// 오픈스트리트맵 공식 지도 타일을 이용할 때는 ol.source.XYZ(...) 대신
		// new ol.source.OSM()을 삽입하는 것만으로도 충분합니다.
		source: new ol.source.XYZ({
			attributions: [
				ol.source.OSM.ATTRIBUTION,
				'Tiles courtesy of ' +
				'<a href="http://openstreetmap.org">' +
				'OpenStreetMap' +
				'</a>'
			],
			url: 'https://tiles.osm.kr/hot/{z}/{x}/{y}.png'
		})
	});

var waterPipe = /* 수도관로 */
		new ol.layer.Tile({
			source: new ol.source.TileWMS({
				url: geoserverBaseUrl+'/kwater/wms', // GeoServer의 WMS URL
				params: {
					'LAYERS': 'dj', // 첫 번째 레이어 이름
					'TILED': true
					// 'CQL_FILTER' : 'bbox(geom, 14174233.741360625,4348698.598450952,14177539.64283396,4350513.977872726)'
				},
				serverType: 'geoserver'
			})
		});

var manhole = /* 맨홀 */
	new ol.layer.Tile({
		source: new ol.source.TileWMS({
			url: geoserverBaseUrl+'/kwater/wms', // GeoServer의 WMS URL
			params: {
				'LAYERS': 'w_etc_river_wgs_p', // 맨홀
				// layers=kwater%3Aw_etc_depthgroundwater_wgs_p
				'TILED': true
			},
			serverType: 'geoserver'
		})
	});

// var wtl_national = new ol.layer.Tile({
// 	source : new ol.source.TileWMS({
// 		url : geoserverBaseUrl+'/kwater/wms',
// 		// https://kwatergeo.com:8443/geoserver/gwc/kwater:wtl_national_line?gridSet=EPSG:4326&format=image/png
// 		params : {
// 			'LAYERS' : 'kwater:wtl_national_line',
// 			'TILED' : true
// 		},
// 		serverType : 'geoserver'
// 	})
// });

var wtl_national = new ol.layer.Image({
	source: new ol.source.ImageWMS({
		ratio: 1,
		url: 'https://kwatergeo.com:8443/geoserver/kwater/wms',
		params: {'FORMAT': 'image/png',
			'VERSION': '1.1.1',
			"STYLES": '',
			"LAYERS": 'kwater:index_wtl_national_line',
			"exceptions": 'application/vnd.ogc.se_inimage',
		}
	})
});



document.addEventListener("DOMContentLoaded", function () {
	initMap();
});

function initMap() {
	var layer1Checkbox = document.getElementById('layer1Checkbox');

	layers = new ol.layer.Group({
		layers: [
			/* OSM */
			OSM,
			// waterPipe,
			// manhole,
			// vectorDraw,
			wtl_national

		]
	});

	/* 그리기 벡터 레이어 추가 */
	// source = new ol.source.Vector();
	// var vector = new ol.layer.Vector({
	// 	source: source
	// });
	// map.addLayer(vector);

	map = new ol.Map({
		layers: [
			layers
		],
		controls: ol.control.defaults({
			// 기본 오픈스트리트맵 저작자 표기를 지도 오른쪽 아래에 표시
			attributionOptions:  {
				collapsed: false
			}
		}).extend([
			new ol.control.ScaleLine() // 축척 막대를 지도 왼쪽 하단에 노출
		]),
		target: 'map',
		view: new ol.View({
			center: ol.proj.fromLonLat([127.376, 36.355]), // 대충 대전 위치
			zoom: 13
		})
	});

	layer1Checkbox.addEventListener('change', function() {

		layers.getLayers().getArray()[1].setVisible(layer1Checkbox. checked);
		// console.log(layers.getLayers().getArray()[1].getSource().getUrls()); // 레이어 url wms
		// console.log(layers.getLayers().getArray()[1].getSource().getParams().LAYERS); // 레이어 이름

		/* 공간쿼리 요청을 위해 활성화된 레이어 URL 출력 */
		for (var i = 0; i < layers.getLayers().getLength(); i++) {
			console.log('Layer Length ::: ', layers.getLayers().getLength());
			if(layers.getLayers().getArray()[i].getVisible() == true){
				try {
					var laname = layers.getLayers().getArray()[i].getSource().getParams().LAYERS;
					console.log('VISIBLE ::: ' ,layers.getLayers().getArray()[i].getSource().getUrls()[0], ' :::: ', laname);
				}catch (e){
					// console.log('TypeERROR ::: ', e);
				}
			}
		}

	});



	// 버튼 클릭 시 그리기 도구 준비
	var drawButton = document.getElementById('draw-button');
	drawButton.addEventListener('click', function () {
		startDrawing();
	});
}


function startDrawing() {
	if (draw) {
		map.removeInteraction(draw);
	}

	// 이미 그려진 도형이 있으면 해당 도형 삭제
	source.clear();

	// polygon 그리기 도구 준비
	draw = new ol.interaction.Draw({
		source: source,
		type: 'Polygon',
		// freehand: false, // 더블클릭으로의 그리기 종료 비활성화
		// finishCondition: ol.events.condition.doubleClick // 더블클릭으로 그리기 종료
	});

	map.addInteraction(draw);

	// 그리기가 완료되면 이벤트 처리
	draw.once('drawend', function (event) {
		var feature = event.feature;
		map.removeInteraction(draw); // 그리기 이벤트 종료
		// 도형의 영역을 GeoServer에 보내어 다른 레이어 정보를 가져옴
		// queryLayerData(feature.getGeometry());
		dra(event);

	});
}


// GeoServer에서 다른 레이어 정보를 가져오는 함수
function queryLayerData(geometry) {
	// GeoServer WFS URL 설정
	var geoServerUrl = geoserverBaseUrl+'/kwater/wfs';

	// GeoServer에 WFS 요청 보내기
	var layerName = 'kwater:dj';

// 공간 쿼리를 수행할 다각형 geometry를 GeoJSON 형식으로 정의합니다.
	var polygonGeometry = {
		type: geometry.getType(),
		coordinates: geometry.getCoordinates()
	};

// 공간 쿼리를 수행할 CQL 표현식을 작성합니다.
// 이 예제에서는 폴리곤 내에 위치한 피처를 찾습니다.

	var cqlFilter = 'INTERSECTS(geom,' + geometry.getExtent().join(',') + ')';
	// var cqlFilter = 'BBOX(geom,' + geometry.getExtent().join(',') + ')';
	// var cqlFilter = `INTERSECTS (geom, "${geometry.getExtent().toString()}")`;
	// var cqlFilter = 'ID IN (386,388,389,399,3847)';
	// layers.getLayers().getArray()[1].getSource().updateParams({CQL_FILTER : "ID IN (386,389,388,399,393)"});
// URL 구성
	var requestUrl = `${geoServerUrl}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${layerName}&outputFormat=application/json&CQL_FILTER=${encodeURIComponent(cqlFilter)}`;
// WFS 요청 보내기
	fetch(requestUrl)
		.then(function(response) {
			return response;
		})
		.then(function(data) {
			// 공간 쿼리 결과를 처리합니다.
			console.log('Features matching the spatial query:', data);
		})
		.catch(function(error) {
			console.error('Error querying the layer:', error);
		});
}

function dra(event) {
	var polygon = event.feature.getGeometry().getExtent();
	// 'https://kwatergeo.com:8443/geoserver/kwater/wms?' +
	// 'SERVICE=WMS&VERSION=1.3.0' +
	// '&REQUEST=GetMap' +
	// '&FORMAT=image/png' +
	// '&TRANSPARENT=true' +
	// '&LAYERS=kwater:wtl_national_line' +
	// '&TILED=true' +
	// '&WIDTH=256' +
	// '&HEIGHT=256' +
	// '&CRS=EPSG:5186' +
	// '&STYLES=' +
	// '&BBOX=14167144.570487704%2C4344069.191503137%2C14172036.540297955%2C4348961.1613133885'
	// 특정 레이어의 Feature 가져오기
	// 'your-layer-name'은 대상 레이어의 이름이어야 합니다.
	var layerName = 'kwater:wtl_national_line';
	var wfsUrl = geoserverBaseUrl+'/kwater/wms';
	var cqlFilter = "hjd_cde like \'30000%\' or hjd_cde like \'36110%\'";
	// var cqlFilter = 'INTERSECTS(geom, ' + polygon.getExtent().join(',') + ')';
	// var cqlFilter = "INTERSECTS(geom, 14174386.615417195,4349673.170561588,14175303.859756619,4352444.012836927)";
	// var cqlFilter = 'ID IN (44602)';
	var requestUrl = wfsUrl +
		'?SERVICE=WMS' +
		'&VERSION=1.3.0' +
		'&REQUEST=GetMap' +
		'&LAYERS=' + layerName +
		'&FORMAT=image/png' +
		'&CRS=EPSG:5186'+
		'&WIDTH=256'+
		'&HEIGHT=256'+
		'&STYLES=' +
		'&BBOX='+polygon.toString()+
		'&CQL_FILTER=' + encodeURIComponent(cqlFilter);

	// AJAX 요청 보내기
	var xhr = new XMLHttpRequest();
	xhr.open('GET', requestUrl, true);
	xhr.onload = function() {
		if (xhr.status === 200) {
			// var data = JSON.parse(xhr.responseText);
debugger;


			// 새 레이어에 추가
			var highlightedLayer = new ol.layer.Tile({
				source: new ol.source.TileWMS({
					url : geoserverBaseUrl+'/kwater/wms',
					params : {
						"FORMAT" : 'image/png',
						"VERSION" : '1.1.1',
						tiled : true,
						"STYLES" : "",
						"LAYERS" : "wtl_national_line"
					}
				})
			});

			// var geoserverLayer = new ol.layer.Tile({
			// 	source: new ol.source.TileWMS({
			// 		url: layer[0]
			// 		, params: {
			// 			"FORMAT": "image/png"
			// 			, "VERSION": "1.1.0"
			// 			, tiled: true
			// 			, "styles": ""
			// 			, "LAYERS": layer[1]
			// 		}
			// 	})
			// 	, id: layer[2]
			// 	, visible: true
			// 	// , showZoomLevel: layer[3] == 'wdr' ? '' : 11
			// 	, showZoomLevel: 11
			// 	, areaSe: layer[3]
			// });
			map.addLayer(highlightedLayer);
		} else {
			console.error('Error querying the layer:', xhr.statusText);
		}
	};
	xhr.onerror = function() {
		console.error('Error querying the layer:', xhr.statusText);
	};
	xhr.send();
}


/**
 * 셀렉트박스 변경시 관할 지자체 선택
 * @param {string} v
 */
function changeCity(v) {
	console.log(v);
	var wtlCql = 'https://kwatergeo.com:8443/geoserver/kwater/wms' +
	'?SERVICE=WMS&VERSION=1.1.1' +
	'&REQUEST=GetMap' +
	'&FORMAT=image/png' +
	'&TRANSPARENT=true' +
	'&STYLES' +
	'&LAYERS=kwater:wtl_national_line' +
	'&exceptions=application%2Fvnd.ogc.se_inimage' +
	'&CQL_FILTER=hjd_cde like "3000" or hjd_cde like "36110"' +
	'&SRS=EPSG:5186' +
	'&WIDTH=707' +
	'&HEIGHT=768' +
	'&BBOX=194772.57680526696,379772.1666128569,248676.7082143295,438410.0885989192'
	// map.getLayers().forEach(function(l){
	// 	console.log(l.getLayers().getArray().forEach(function (la) {
	// 		la.get('wtl_national_line');
	// 	}));
	// });
	// 레이어 대상 구하고, 소스에 업데이트 파람
	layers.getLayers().getArray()[1].getSource().updateParams({
		// 'CQL_FILTER' : "hjd_cde like \'30000%\' or hjd_cde like \'36110%\'"
		'CQL_FILTER' : "hjd_cde like \'"+v+"%\'"
	});
	// for(var l of map.getLayers().getArray()) {
	// 	console.log(l);
	// }
}