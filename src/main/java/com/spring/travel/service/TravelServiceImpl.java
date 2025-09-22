package com.spring.travel.service;

import com.spring.travel.domain.Travel;
import com.spring.travel.mapper.TravelMapper;
import com.spring.travel.util.Pagination;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class TravelServiceImpl implements TravelService{

    private final TravelMapper travelMapper;

    @Transactional(readOnly = true)
    @Override
    public List<Travel> list(Pagination pagination) {
        try {
            return travelMapper.list(pagination);
        } catch (DataAccessException e) {
            log.error("관광지 목록 조회(데이터베이스 오류) = {}", e.getMessage());
            throw new RuntimeException("관광지 목록 조회 중 오류가 발생하였습니다");
        } catch (Exception e) {
            log.error("관광지 목록 조회(기타 오류) = {}", e.getMessage());
            throw new RuntimeException("관광지 목록 조회 중 오류가 발생하였습니다");
        }
    }

    @Transactional(readOnly = true)
    @Override
    public int count(Pagination pagination) {
        try {
            return travelMapper.count(pagination);
        } catch (DataAccessException e) {
            log.error("전체 데이터 개수 조회(데이터베이스 오류) = {}", e.getMessage());
            throw new RuntimeException("전체 데이터 개수 조회 중 오류가 발생하였습니다");
        } catch (Exception e) {
            log.error("전체 데이터 개수 조회(기타 오류) = {}", e.getMessage());
            throw new RuntimeException("전체 데이터 개수 조회 중 오류가 발생하였습니다");
        }
    }
}
