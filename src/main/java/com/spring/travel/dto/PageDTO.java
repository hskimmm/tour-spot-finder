package com.spring.travel.dto;

import com.spring.travel.util.Pagination;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class PageDTO {
    private int startPage; // 시작 페이지 번호
    private int endPage;   // 마지막 페이지 번호
    private boolean prev, next; // 이전, 다음 버튼
    private int total;     // 전체 데이터 개수
    private Pagination pagination;

    public PageDTO(Pagination pagination, int total) {
        this.pagination = pagination;
        this.total = total;

        if (total == 0) {
            this.startPage = 1;
            this.endPage = 1;
            this.prev = false;
            this.next = false;
            return;
        }

        int blockSize = 5;
        this.endPage = (int) (Math.ceil(pagination.getPageNum() / (double) blockSize)) * blockSize;
        this.startPage = endPage - (blockSize - 1);

        int realEnd = (int) Math.ceil((total * 1.0) / pagination.getAmount());
        if (realEnd <= this.endPage) {
            this.endPage = realEnd;
        }

        this.prev = this.startPage > 1;
        this.next = this.endPage < realEnd;
    }
}
