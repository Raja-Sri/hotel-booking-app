const PHONE_PATTERN = /^[1-9]\d{9}$/;

export function normalizePhoneInput(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function validatePhone(phone: string): string | null {
  const normalized = normalizePhoneInput(phone);

  if (!normalized) {
    return 'Phone number is required.';
  }
  if (normalized.length !== 10) {
    return 'Phone must be exactly 10 digits.';
  }
  if (!/^\d+$/.test(normalized)) {
    return 'Phone must contain numbers only.';
  }
  if (normalized.startsWith('0')) {
    return 'Phone cannot start with 0.';
  }
  if (/^0+$/.test(normalized)) {
    return 'Phone cannot be all zeros.';
  }
  if (!PHONE_PATTERN.test(normalized)) {
    return 'Enter a valid 10-digit phone number.';
  }

  return null;
}
