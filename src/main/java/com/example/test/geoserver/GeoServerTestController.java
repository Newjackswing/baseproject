package com.example.test.geoserver;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
public class GeoServerTestController {

    @RequestMapping("/test")
    private String geoserverTest(
            HttpServletRequest request,
            HttpServletResponse response,
            Model model
    ){
        model.addAttribute("paramGeo", "Geoserver prototype");
        return "/geoserver";
    }
}
