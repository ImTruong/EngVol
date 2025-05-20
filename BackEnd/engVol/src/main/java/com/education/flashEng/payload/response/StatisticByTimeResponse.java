package com.education.flashEng.payload.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.sql.Date;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)

public class StatisticByTimeResponse {
    private LocalDate date;
    private long numberOfWords;

    public StatisticByTimeResponse(Date date, Long numberOfWords) {
        this.date = date.toLocalDate();  // Chuyển từ Date sang LocalDate
        this.numberOfWords = numberOfWords;
    }
}
