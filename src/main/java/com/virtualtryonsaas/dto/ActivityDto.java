package com.virtualtryonsaas.dto;

import java.time.LocalDateTime;

public class ActivityDto {
    private String text;
    private String time;
    private String color;
    private LocalDateTime timestamp;

    public ActivityDto() {}

    public ActivityDto(String text, String time, String color, LocalDateTime timestamp) {
        this.text = text;
        this.time = time;
        this.color = color;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
