package com.spring.travel.mapper;

import com.spring.travel.domain.Travel;
import com.spring.travel.util.Pagination;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TravelMapper {
    List<Travel> list(Pagination pagination);

    int count(Pagination pagination);
}
