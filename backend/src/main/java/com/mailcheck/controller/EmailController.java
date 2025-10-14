package com.mailcheck.controller;

import com.mailcheck.model.EmailDto;
import com.mailcheck.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/emails")
@CrossOrigin(origins = "http://localhost:5173") // adjust frontend port
public class EmailController {

    @Autowired
    private JavaMailSender mailSender;

    private final EmailService emailService;

    @Autowired
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    // ✅ GET /api/emails/imap?user=email@gmail.com&appPassword=xxxx
    @GetMapping("/imap")
    public ResponseEntity<List<EmailDto>> loadFromImap(
            @RequestParam String user,
            @RequestParam String appPassword
    ) {
        try {
            List<EmailDto> emails = emailService.fetchInboxFromIMAP(user, appPassword);
            return ResponseEntity.ok(emails);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    // ✅ GET /api/emails/inbox?user=email@example.com
    @GetMapping("/inbox")
    public ResponseEntity<List<EmailDto>> getInbox(@RequestParam(required = false) String user) {
        List<EmailDto> inbox = emailService.getInbox();

        if (user != null && !user.isEmpty()) {
            inbox = inbox.stream()
                    .filter(e -> e.getTo().equalsIgnoreCase(user) || e.getFrom().equalsIgnoreCase(user))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(inbox);
    }

    // ✅ GET /api/emails/sent
    @GetMapping("/sent")
    public ResponseEntity<List<EmailDto>> getSent() {
        return ResponseEntity.ok(emailService.getSent());
    }

    // ✅ POST /api/emails/send (multipart with attachments)
    @PostMapping(value = "/send", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendEmailMultipart(
            @RequestPart("from") String from,
            @RequestPart("to") String to,
            @RequestPart("subject") String subject,
            @RequestPart("body") String body,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments
    ) {
        try {
            System.out.println("=== Incoming Email Request ===");
            System.out.println("From: " + from);
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Attachments: " + (attachments != null ? attachments.size() : 0));
            System.out.println("================================");

            // ✅ Build DTO
            EmailDto email = new EmailDto(from, to, subject, body, null);

            // ✅ Send via EmailService (no saving to folder)
            emailService.sendEmail(email, attachments);

            return ResponseEntity.ok(Map.of("status", "✅ Email sent successfully"));

        } catch (Exception e) {
            System.err.println("❌ Email send error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Optional JSON-only endpoint (no file upload)
    @PostMapping("/send-json")
    public ResponseEntity<?> sendEmailJson(@RequestBody EmailDto payload) {
        try {
            System.out.println("=== JSON Email Request ===");
            System.out.println("From: " + payload.getFrom());
            System.out.println("To: " + payload.getTo());
            System.out.println("Subject: " + payload.getSubject());
            System.out.println("================================");

            emailService.sendEmail(payload, null);
            return ResponseEntity.ok(Map.of("status", "✅ Email sent successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Serve uploaded files (optional)
    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> getUploadedFile(@PathVariable String filename) {
        try {
            File file = new File("uploads/" + filename);
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    public JavaMailSender getMailSender() {
        return mailSender;
    }
}
