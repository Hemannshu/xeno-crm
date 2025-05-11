package com.xeno.crm.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class CustomerEventDTO implements Serializable {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private Boolean active;
    private String segment;
    private String tags;
    // Add other fields as needed
} 