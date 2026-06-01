# Email Integration Setup Guide

## Steps to Enable Email Functionality

### 1. Sign Up for EmailJS (Free)
- Go to https://www.emailjs.com/
- Click "Sign Up" and create a free account
- Verify your email

### 2. Create an Email Service
- In the dashboard, go to **Email Services**
- Click **Add Service**
- Choose **Gmail** (or your preferred email provider)
- Connect your email account (groceriesfarm1@gmail.com)
- Copy the **Service ID** (format: `service_xxxxx`)

### 3. Create an Email Template
- Go to **Email Templates**
- Click **Create New Template**
- Use this template structure:

```
Subject: New Contact Form Message from {{from_name}}

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

Message:
{{message}}
```

- Copy the **Template ID** (format: `template_xxxxx`)

### 4. Get Your Public Key
- Go to **Account** > **API Keys**
- Copy your **Public Key**

### 5. Update Environment Variables
Replace the placeholders in `.env.local`:
```
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
```

### 6. Test the Integration
- Restart your development server
- Fill out the contact form
- Submit and you should receive an email at groceriesfarm1@gmail.com

## Troubleshooting
- **Emails not sending?** Check browser console for errors
- **Template not working?** Ensure template variables match exactly: `{{from_name}}`, `{{from_email}}`, `{{phone}}`, `{{message}}`
- **Check EmailJS dashboard** for API call logs and any errors
