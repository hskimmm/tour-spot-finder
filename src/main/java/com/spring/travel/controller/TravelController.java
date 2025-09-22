package com.spring.travel.controller;

import com.spring.travel.domain.Travel;
import com.spring.travel.dto.PageDTO;
import com.spring.travel.service.TravelService;
import com.spring.travel.util.Pagination;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
@Log4j2
public class TravelController {

    private final TravelService travelService;

    @GetMapping
    public HashMap<String, Object> list(@ModelAttribute(value = "pagination") Pagination pagination) {
        List<Travel> travels = travelService.list(pagination);
        PageDTO pageDTO = new PageDTO(pagination, travelService.count(pagination));

        HashMap<String, Object> dataMap = new HashMap<>();
        dataMap.put("travels", travels);
        dataMap.put("pageDTO", pageDTO);

        return dataMap;
    }
}
