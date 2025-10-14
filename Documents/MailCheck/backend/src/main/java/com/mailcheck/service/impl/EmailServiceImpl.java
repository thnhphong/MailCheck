package com.mailcheck.service.impl;

import com.mailcheck.model.EmailDto;
import com.mailcheck.service.EmailService;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
//use interface EmailService 
//send, load inbox, load sent, fetchInboxFromIMAP
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final List<EmailDto> inbox = new CopyOnWriteArrayList<>();
    private final List<EmailDto> sent = new CopyOnWriteArrayList<>();

    @Autowired
    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

public void sendEmail(EmailDto email, List<MultipartFile> attachments) throws Exception {

    if (email.getTo().equalsIgnoreCase(email.getFrom())) {
        inbox.add(email);
    } else {
        inbox.add(new EmailDto(email.getFrom(), email.getTo(), email.getSubject(), email.getBody(), email.getAttachments()));
    }

    System.out.println("📧 Sent email:");
    System.out.println("  From: " + email.getFrom());
    System.out.println("  To: " + email.getTo());
    System.out.println("  Subject: " + email.getSubject());

    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true); // 'true' enables multipart

    helper.setFrom(email.getFrom());
    helper.setTo(email.getTo());
    helper.setSubject(email.getSubject());
    helper.setText(email.getBody(), false);

    // ✅ Attach directly from memory (no saving)
    if (attachments != null && !attachments.isEmpty()) {
        for (MultipartFile file : attachments) {
            if (file != null && !file.isEmpty()) {
                helper.addAttachment(file.getOriginalFilename(), file::getInputStream);
                System.out.println("  ✅ Attachment added: " + file.getOriginalFilename());
            }
        }
    }

    // ✅ Send email
    try {
        mailSender.send(message);
        sent.add(email);
        System.out.println("✅ Email sent successfully!");
    } catch (Exception e) {
        System.err.println("? Error sending email:");
        e.printStackTrace();
        throw e;
    }
}


    @Override
    public List<EmailDto> getInbox() {
        return new ArrayList<>(inbox);
    }

    @Override
    public List<EmailDto> getSent() {
        return new ArrayList<>(sent);
    }

    @Override
    public List<EmailDto> fetchInboxFromIMAP(String userEmail, String appPassword) throws Exception {
        List<EmailDto> fetchedEmails = new ArrayList<>();

        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.host", "imap.gmail.com");
        props.put("mail.imaps.port", "993");
        props.put("mail.imaps.ssl.enable", "true");

        Session session = Session.getInstance(props);
        Store store = session.getStore("imaps");

        System.out.println("Connecting to Gmail IMAP...");
        store.connect("imap.gmail.com", userEmail, appPassword);

        Folder inboxFolder = store.getFolder("INBOX");
        inboxFolder.open(Folder.READ_ONLY);

        int messageCount = inboxFolder.getMessageCount();
        int start = Math.max(1, messageCount - 20);
        Message[] messages = inboxFolder.getMessages(start, messageCount);

        for (int i = messages.length - 1; i >= 0; i--) {
            Message msg = messages[i];
            String from = msg.getFrom() != null ? msg.getFrom()[0].toString() : "(unknown)";
            String subject = msg.getSubject() != null ? msg.getSubject() : "(no subject)";
            String body = extractTextFromMessage(msg);

            fetchedEmails.add(new EmailDto(from, userEmail, subject, body, List.of()));
        }

        inboxFolder.close(false);
        store.close();

        System.out.println("✅ IMAP Inbox Fetch Complete — " + fetchedEmails.size() + " messages loaded.");
        return fetchedEmails;
    }

    private String extractTextFromMessage(Message message) throws Exception {
        if (message.isMimeType("text/plain")) {
            return message.getContent().toString();
        } else if (message.isMimeType("multipart/*")) {
            Multipart multipart = (Multipart) message.getContent();
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < multipart.getCount(); i++) {
                BodyPart part = multipart.getBodyPart(i);
                if (part.isMimeType("text/plain")) {
                    result.append(part.getContent());
                }
            }
            return result.toString();
        }
        return "(unsupported format)";
    }
}
