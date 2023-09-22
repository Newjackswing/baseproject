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
            height: 600px;
            width: 100%;
        }
    </style>
    <script src="/lib/js/draw.js" type="application/javascript"></script>
</head>
<body>
    <h2>${paramGeo}</h2>
    <div>
        <input type="checkbox" id="layer1Checkbox" checked>
        <label for="layer1Checkbox">수도관로</label>
    </div>
    <div>
        <button id="draw-button" onclick="drawClickEvent();">다각형 그리기</button>
    </div>
    <div id="map" class="map"></div>
</body>
</html>
