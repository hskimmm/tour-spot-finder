package com.spring.travel.controller;

import com.spring.travel.domain.Travel;
import com.spring.travel.service.TravelService;
import com.spring.travel.util.Pagination;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
@Log4j2
public class TravelController {

    private final TravelService travelService;

    @GetMapping
    public List<Travel> list(@ModelAttribute(value = "pagination") Pagination pagination) {
        return travelService.list(pagination);
    }
}
