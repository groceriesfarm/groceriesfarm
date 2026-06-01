# Contact Form Email Setup Guide

## Overview

The contact form now sends emails to **groceriesfarm1@gmail.com** with two options:

1. **EmailJS** (Recommended) - Professional email service with templates
2. **FormSubmit.co** (Fallback) - Free alternative, no setup required

If EmailJS is not configured, the form automatically falls back to FormSubmit.co.

---

## Option 1: EmailJS Setup (Recommended)

### Step 1: Sign Up for EmailJS
1. Go to https://www.emailjs.com/
2. Click **Sign Up** and create a free account
3. Verify your email

### Step 2: Create an Email Service
1. In the dashboard, go to **Email Services**
2. Click **Add Service**
3. Choose **Gmail**
4. Click **Connect Account**
5. Sign in with **groceriesfarm1@gmail.com**
6. Grant permissions
7. Copy the **Service ID** (format: `service_xxxxx`)

### Step 3: Create an Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Set the template name (e.g., "Contact Form")
4. Use this template structure:

```
Subject: New Contact Form Message from {{from_name}}

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

Message:
{{message}}
```

5. Copy the **Template ID** (format: `template_xxxxx`)

### Step 4: Get Your Public Key
1. Go to **Account** → **API Keys**
2. Copy your **Public Key**

### Step 5: Update .env File
Add these to your `.env` file:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
```

### Step 6: Test
1. Restart your development server
2. Go to the Contact page
3. Fill out the form and submit
4. Check your email at groceriesfarm1@gmail.com

---

## Option 2: FormSubmit.co (No Setup Required)

If you don't configure EmailJS, the contact form automatically uses FormSubmit.co as a fallback.

**No setup needed** - it just works!

However, FormSubmit.co has some limitations:
- Emails may take a few seconds longer
- Limited customization
- No email templates

---

## How It Works

### Contact Form Flow

```
User submits form
    ↓
Try EmailJS (if configured)
    ↓
If EmailJS fails → Try FormSubmit.co
    ↓
Email sent to groceriesfarm1@gmail.com
    ↓
Show success message
```

### Email Service Code

The email service is in `src/services/emailService.ts`:

```typescript
// Initialize EmailJS on app load
initEmailJS();

// Send email with automatic fallback
await sendContactEmailWithFallback({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91 1234567890',
  message: 'I have a question...'
});
```

---

## Troubleshooting

### Emails Not Arriving

**Check 1: EmailJS Configuration**
- Verify all three env variables are set correctly
- Check browser console for errors
- Go to EmailJS dashboard → Logs to see API calls

**Check 2: Gmail Settings**
- Make sure you connected the correct Gmail account
- Check Gmail spam folder
- Verify Gmail allows less secure apps (if needed)

**Check 3: Template Variables**
- Ensure template uses exact variable names:
  - `{{from_name}}`
  - `{{from_email}}`
  - `{{phone}}`
  - `{{message}}`

### FormSubmit.co Fallback Not Working

- Check browser console for CORS errors
- Verify internet connection
- Try again in a few seconds

### "EmailJS configuration incomplete" Error

- Add all three env variables to `.env`
- Restart development server
- Check that values don't have extra spaces

---

## Email Template Examples

### Professional Template
```
Subject: New Contact Form Submission from {{from_name}}

Hello,

You have received a new message from your website contact form.

**Sender Details:**
Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

**Message:**
{{message}}

---
This email was sent from your Groceries Farm website contact form.
```

### Simple Template
```
Subject: Contact Form: {{from_name}}

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

Message:
{{message}}
```

---

## Environment Variables Reference

| Variable | Required | Example | Source |
|----------|----------|---------|--------|
| `VITE_EMAILJS_PUBLIC_KEY` | No | `pk_abc123...` | EmailJS Account → API Keys |
| `VITE_EMAILJS_SERVICE_ID` | No | `service_abc123...` | EmailJS Email Services |
| `VITE_EMAILJS_TEMPLATE_ID` | No | `template_abc123...` | EmailJS Email Templates |

---

## Testing the Contact Form

### Test Case 1: With EmailJS
1. Configure all three env variables
2. Submit form
3. Check email arrives within 1-2 seconds

### Test Case 2: Without EmailJS (Fallback)
1. Leave env variables empty
2. Submit form
3. Check email arrives within 5-10 seconds

### Test Case 3: Invalid Email
1. Enter invalid email address
2. Submit form
3. Should show error message

---

## Security Notes

- Public Key is safe to expose (it's public)
- Service ID and Template ID are also safe to expose
- Never commit actual email addresses to code
- Use environment variables for all sensitive data

---

## Support

For EmailJS issues:
- Visit https://www.emailjs.com/docs/
- Check EmailJS dashboard logs
- Contact EmailJS support

For FormSubmit.co issues:
- Visit https://formsubmit.co/
- Check browser console for errors

---

## Next Steps

1. **Choose your email service:**
   - EmailJS (recommended) → Follow Option 1
   - FormSubmit.co (no setup) → Already working!

2. **Test the contact form**

3. **Monitor email delivery**
   - Check spam folder
   - Verify sender address

4. **Customize email template** (if using EmailJS)
   - Add branding
   - Add footer
   - Add company details
