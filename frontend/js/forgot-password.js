document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('forgotPasswordForm');
  const emailInput = document.getElementById('forgotEmail');
  const submitBtn = document.getElementById('forgotSubmitBtn');
  const messageDiv = document.getElementById('forgotMessage');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    messageDiv.textContent = '';
    if (!email) {
      messageDiv.textContent = 'Please enter your email address.';
      messageDiv.style.color = 'red';
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        messageDiv.textContent = 'Reset instructions have been sent. Please check your email.';
        messageDiv.style.color = 'green';
        form.reset();
      } else {
        messageDiv.textContent = data.message || 'Failed to send reset instructions.';
        messageDiv.style.color = 'red';
      }
    } catch (error) {
      messageDiv.textContent = 'An error occurred. Please try again.';
      messageDiv.style.color = 'red';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Reset Link';
    }
  });
});
