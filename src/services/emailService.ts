/**
 * Email Service using EmailJS
 * 
 * Sends contact form submissions to groceriesfarm1@gmail.com
 * 
 * Setup:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create a Gmail service and template
 * 3. Add these to .env:
 *    VITE_EMAILJS_PUBLIC_KEY=your_public_key
 *    VITE_EMAILJS_SERVICE_ID=your_service_id
 *    VITE_EMAILJS_TEMPLATE_ID=your_template_id
 */

import emailjs from '@emailjs/browser';

// Initialize EmailJS on app load
export const initEmailJS = () => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  
  if (!publicKey) {
    console.warn('EmailJS public key not configured. Contact form will not work.');
    return false;
  }
  
  try {
    emailjs.init(publicKey);
    return true;
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
    return false;
  }
};

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * Send contact form email
 * @param formData - Contact form data
 * @returns Promise that resolves when email is sent
 */
export const sendContactEmail = async (formData: ContactFormData): Promise<void> => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  if (!serviceId || !templateId) {
    throw new Error('EmailJS configuration incomplete. Please check your .env file.');
  }

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || 'Not provided',
        message: formData.message,
        to_email: 'groceriesfarm1@gmail.com',
      }
    );

    if (response.status !== 200) {
      throw new Error(`Email service returned status ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Fallback: Send email using FormSubmit.co if EmailJS fails
 * This is a free alternative that doesn't require setup
 */
export const sendContactEmailFallback = async (formData: ContactFormData): Promise<void> => {
  try {
    const response = await fetch('https://formsubmit.co/groceriesfarm1@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        message: formData.message,
      }),
    });

    if (!response.ok) {
      throw new Error(`FormSubmit returned status ${response.status}`);
    }

    return;
  } catch (error) {
    console.error('Error sending email via FormSubmit:', error);
    throw error;
  }
};

/**
 * Send contact email with automatic fallback
 * Tries EmailJS first, falls back to FormSubmit.co if needed
 */
export const sendContactEmailWithFallback = async (formData: ContactFormData): Promise<void> => {
  try {
    // Try EmailJS first
    await sendContactEmail(formData);
  } catch (emailjsError) {
    console.warn('EmailJS failed, trying FormSubmit fallback:', emailjsError);
    try {
      // Fallback to FormSubmit.co
      await sendContactEmailFallback(formData);
    } catch (fallbackError) {
      console.error('Both email services failed:', fallbackError);
      throw new Error('Failed to send email. Please try again later.');
    }
  }
};
