// Email service utility for sending alerts
// Note: This is a client-side implementation. For production, 
// you should use a server-side solution or email service API

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
}

export const sendEmailAlert = async (subject: string, htmlBody: string): Promise<void> => {
  try {
    // For demonstration purposes, we'll log the email content
    // In production, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun  
    // - AWS SES
    // - Or use a backend API endpoint
    
    console.log('📧 EMAIL ALERT WOULD BE SENT:');
    console.log('Subject:', subject);
    console.log('Body:', htmlBody);
    
    // Example of how you might integrate with an email service:
    /*
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'admin@yourcompany.com', // Configure your admin email
        subject,
        html: htmlBody
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    */
    
    // For now, we'll show a browser notification as a demo
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(subject, {
        body: htmlBody.replace(/<[^>]*>/g, ''), // Strip HTML tags
        icon: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(subject, {
            body: htmlBody.replace(/<[^>]*>/g, ''),
            icon: '/favicon.ico'
          });
        }
      });
    }
    
  } catch (error) {
    console.error('Failed to send email alert:', error);
    throw error;
  }
};

// Configuration for email settings
export const EMAIL_CONFIG = {
  // Configure these for your production environment
  ADMIN_EMAIL: 'himanshusinghdon29@gmail.com',
  FROM_EMAIL: 'alerts@SmartInventoryManagementSystem.com',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 587,
};