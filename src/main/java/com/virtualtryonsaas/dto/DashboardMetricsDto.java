package com.virtualtryonsaas.dto;

public class DashboardMetricsDto {
    private long totalCustomers;
    private long totalProducts;
    private long totalTryOns;
    private double conversionRate;
    private double averageRating;
    private long newCustomersThisMonth;

    public DashboardMetricsDto() {}

    public DashboardMetricsDto(long totalCustomers, long totalProducts, long totalTryOns, 
                               double conversionRate, double averageRating, long newCustomersThisMonth) {
        this.totalCustomers = totalCustomers;
        this.totalProducts = totalProducts;
        this.totalTryOns = totalTryOns;
        this.conversionRate = conversionRate;
        this.averageRating = averageRating;
        this.newCustomersThisMonth = newCustomersThisMonth;
    }

    // Getters and Setters
    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalTryOns() { return totalTryOns; }
    public void setTotalTryOns(long totalTryOns) { this.totalTryOns = totalTryOns; }

    public double getConversionRate() { return conversionRate; }
    public void setConversionRate(double conversionRate) { this.conversionRate = conversionRate; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public long getNewCustomersThisMonth() { return newCustomersThisMonth; }
    public void setNewCustomersThisMonth(long newCustomersThisMonth) { this.newCustomersThisMonth = newCustomersThisMonth; }
}
