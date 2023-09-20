<%--
  Created by IntelliJ IDEA.
  User: yyugh
  Date: 2023-09-19
  Time: 오전 11:19
  To change this template use File | Settings | File Templates.
--%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>GEOSERVER TEST</title>
    <%-- openlayers css와 js 라이브러리 추가 --%>
    <link href="/lib/ol-v3.20.1/css/ol.css" rel="stylesheet">
    <script src="/lib/ol-v3.20.1/build/ol.js" type="application/javascript"></script>
    <style>
        .map {
            height: 400px;
            width: 100%;
        }
    </style>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            var map = new ol.Map({
                layers: [
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
                    })
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
                    center: ol.proj.fromLonLat([127.766, 36.355]),
                    zoom: 13
                })
            });
        });
    </script>
</head>
<body>
    <h2>${paramGeo}</h2>
    <div id="map" class="map"></div>
</body>
</html>
