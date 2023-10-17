var map;
var layers;
var geoserverBaseUrl = 'http://localhost:8080/geoserver';

document.addEventListener("DOMContentLoaded", function () {
	initMap();
	drawPolygon();
});

function initMap() {
	var layer1Checkbox = document.getElementById('layer1Checkbox');

	layers = new ol.layer.Group({
		layers: [
			/* OSM */
			new ol.layer.Tile({
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
			}),
			/* 수도관로 */
			new ol.layer.Tile({
				source: new ol.source.TileWMS({
					url: geoserverBaseUrl+'/kwater/wms', // GeoServer의 WMS URL
					params: {
						'LAYERS': 'wtl_pipe_lm_3000000000_u', // 첫 번째 레이어 이름
						'TILED': true
					},
					serverType: 'geoserver'
				})
			}),
			/*  */
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
			})
		]
	});

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

		layers.getLayers().getArray()[1].setVisible(layer1Checkbox.checked);
		console.log(layers.getLayers().getArray()[1].getSource().getUrls()); // 레이어 url wms
		console.log(layers.getLayers().getArray()[1].getSource().getParams().LAYERS); // 레이어 이름

		/* 공간쿼리 요청을 위해 활성화된 레이어 URL 출력 */
		for (var i = 0; i < layers.getLayers().getLength(); i++) {
			if(layers.getLayers().getArray()[i].getVisible() == true){
				console.log('VISIBLE ::: ' ,layers.getLayers().getArray()[i].getSource().getUrls()[0]);
			}
		}


	});
}
function drawPolygon() {

}