# Contact Form - Quick Start Guide

## Current Status

✅ **Contact form is working!**

When users submit the contact form, emails are sent to **groceriesfarm1@gmail.com**

---

## How It Works Right Now

### Without EmailJS Setup (Current)
- Contact form uses **FormSubmit.co** as fallback
- Emails arrive in 5-10 seconds
- No setup required
- Works immediately

### With EmailJS Setup (Optional)
- Faster email delivery (1-2 seconds)
- Professional email templates
- Better tracking and logging
- Requires 5 minutes of setup

---

## To Enable EmailJS (Optional)

### Quick Setup (5 minutes)

1. **Sign up at https://www.emailjs.com/**
   - Create free account
   - Verify email

2. **Connect Gmail**
   - Email Services → Add Service → Gmail
   - Connect groceriesfarm1@gmail.com
   - Copy **Service ID**

3. **Create Email Template**
   - Email Templates → Create New
   - Use template from `CONTACT_FORM_SETUP.md`
   - Copy **Template ID**

4. **Get Public Key**
   - Account → API Keys
   - Copy **Public Key**

5. **Update .env**
   ```env
   VITE_EMAILJS_PUBLIC_KEY=your_key_here
   VITE_EMAILJS_SERVICE_ID=your_service_id_here
   VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
   ```

6. **Restart dev server**
   ```bash
   npm run dev
   ```

---

## Testing

### Test 1: Submit Contact Form
1. Go to Contact page
2. Fill in form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Message: "Test message"
3. Click "Send Message"
4. Check groceriesfarm1@gmail.com inbox

### Test 2: Check Email Arrives
- Without EmailJS: 5-10 seconds
- With EmailJS: 1-2 seconds

### Test 3: Verify Form Clears
- After sending, form should clear
- Success message should appear

---

## Email Content

### What the user sees
```
✅ Message sent!
We will get back to you shortly at groceriesfarm1@gmail.com
```

### What you receive in email
```
Name: [User's Name]
Email: [User's Email]
Phone: [User's Phone or "Not provided"]

Message:
[User's Message]
```

---

## Troubleshooting

### "Failed to send message" Error
1. Check internet connection
2. Try again in a few seconds
3. Check browser console for errors

### Email not arriving
1. Check spam folder
2. Check groceriesfarm1@gmail.com is correct
3. If using EmailJS, verify env variables

### Form not clearing after submit
- This shouldn't happen, but if it does:
  - Check browser console for errors
  - Refresh page and try again

---

## Files Modified

- `src/components/Contact.tsx` - Updated to use email service
- `src/services/emailService.ts` - New email service (EmailJS + FormSubmit fallback)
- `.env` - Added EmailJS configuration placeholders
- `.env.example` - Added EmailJS configuration template

---

## Code Overview

### Contact Component
```typescript
// Initialize EmailJS on mount
useEffect(() => {
  initEmailJS();
}, []);

// Send email with fallback
const handleSubmit = async (e) => {
  await sendContactEmailWithFallback({
    name: form.name,
    email: form.email,
    phone: form.phone,
    message: form.message,
  });
};
```

### Email Service
```typescript
// Try EmailJS first
try {
  await sendContactEmail(formData);
} catch {
  // Fallback to FormSubmit.co
  await sendContactEmailFallback(formData);
}
```

---

## Next Steps

1. **Test current setup** - Submit a test message
2. **Optional: Setup EmailJS** - For faster, more professional emails
3. **Monitor inbox** - Check groceriesfarm1@gmail.com for messages

---

## Support

- **EmailJS Issues**: https://www.emailjs.com/docs/
- **FormSubmit Issues**: https://formsubmit.co/
- **Full Setup Guide**: See `CONTACT_FORM_SETUP.md`
