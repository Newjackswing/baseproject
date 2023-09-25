var map;
var layers;
var geoserverBaseUrl = 'http://localhost:8080/geoserver';
var draw;



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
					'LAYERS': 'wtl_pipe_lm_3000000000_u', // 첫 번째 레이어 이름
					'TILED': true
				},
				serverType: 'geoserver'
			})
		});

var manhole = /* 맨홀 */
	new ol.layer.Tile({
		source: new ol.source.TileWMS({
			url: geoserverBaseUrl+'/kwater/wms', // GeoServer의 WMS URL
			params: {
				'LAYERS': 'manhole', // 맨홀
				// layers=kwater%3Aw_etc_depthgroundwater_wgs_p
				'TILED': true
			},
			serverType: 'geoserver'
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
			waterPipe,
			manhole,
			vectorDraw

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
	});
}
