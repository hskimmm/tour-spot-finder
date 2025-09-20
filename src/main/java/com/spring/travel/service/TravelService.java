package com.spring.travel.service;

import com.spring.travel.domain.Travel;
import com.spring.travel.util.Pagination;

import java.util.List;

public interface TravelService {
    List<Travel> list(Pagination pagination);
}
