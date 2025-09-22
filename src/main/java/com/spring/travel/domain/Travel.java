package com.spring.travel.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Travel {
    private int no;
    private String district;
    private String title;
    private String description;
    private String address;
    private String phone;

    private int travelNo;

    private String filename;

    public String[] getFilenameArray() {
        if (filename == null || filename.isEmpty()) {
            return new String[0];
        }
        return filename.split(",");
    }

    public String[] getFilenameList() {
        return getFilenameArray();
    }
}
