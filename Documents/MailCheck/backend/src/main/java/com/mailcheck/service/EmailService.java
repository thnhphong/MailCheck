package com.mailcheck.service;

import com.mailcheck.model.EmailDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
//make an interface EmailService to implementation
public interface EmailService {
    void sendEmail(EmailDto email, List<MultipartFile> attachments) throws Exception;
    List<EmailDto> getInbox();
    List<EmailDto> getSent();
    List<EmailDto> fetchInboxFromIMAP(String userEmail, String appPassword) throws Exception;
}
