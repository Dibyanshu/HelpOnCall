export function buildNewStaffTemplate({
  fullName,
  staffEmail,
  password,
}) {
  const safeName = fullName || 'Team Member';
  const safeStaffEmail = staffEmail || '';
  const safePassword = password || '';

  return {
    subject: 'Your HelpOnCall staff id is created',
    text: [
      `Hi ${safeName},`,
      '',
      'Your HelpOnCall staff id has been created successfully.',
      'You can now log in using the credentials below:',
      '',
      `Login Email: ${safeStaffEmail}`,
      `Password: ${safePassword}`,
      '',
      'Please change your password after first login.',
      '',
      'Regards,',
      'HelpOnCall Team',
    ].join('\n'),
    html: `
      <p>Hi ${safeName},</p>
      <p>Your HelpOnCall staff id has been created successfully.</p>
      <p>You can now log in using the credentials below:</p>
      <ul>
        <li><strong>Login Email:</strong> ${safeStaffEmail}</li>
        <li><strong>Password:</strong> ${safePassword}</li>
      </ul>
      <p>Please change your password after first login.</p>
      <p>Regards,<br/>HelpOnCall Team</p>
    `.trim(),
  };
}
