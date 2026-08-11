import { JobMatch } from './types';

export interface AlertNotificationResult {
  telegramSent: boolean;
  resendSent: boolean;
  message: string;
}

/**
 * Triggers alert workflow for high-matching jobs (>= 80% match score)
 */
export async function sendHighMatchAlert(match: JobMatch, appBaseUrl: string = 'http://localhost:3000'): Promise<AlertNotificationResult> {
  const result: AlertNotificationResult = {
    telegramSent: false,
    resendSent: false,
    message: ''
  };

  if (match.match_score < 80) {
    result.message = `Match score is ${match.match_score}%, below alert threshold of 80%. No notification dispatched.`;
    return result;
  }

  const job = match.job;
  const title = job?.title || 'High Match Opportunity';
  const company = job?.company || 'Target Company';
  const score = match.match_score;
  const category = match.match_category;
  const fitReasons = match.fit_reasons.join('\n• ');
  const clickLink = `${appBaseUrl}?matchId=${match.id}&action=tailor`;

  const alertText = `🚨 *HIGH MATCH JOB ALERT (${score}% Fit)*

*Position:* ${title}
*Company:* ${company}
*Category:* ${category}
*Score:* ${score}/100

*Why It Fits (Transferable Analysis):*
• ${fitReasons}

👉 [Click to Review & Tailor Resume](${clickLink})`;

  // 1. TELEGRAM BOT ALERT
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (telegramBotToken && telegramChatId && telegramBotToken !== '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ') {
    try {
      const tgUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      const res = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: alertText,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        })
      });

      if (res.ok) {
        result.telegramSent = true;
      } else {
        console.warn('Telegram Bot API response error:', await res.text());
      }
    } catch (err) {
      console.error('Error sending Telegram alert:', err);
    }
  }

  // 2. RESEND EMAIL API ALERT
  const resendApiKey = process.env.RESEND_API_KEY;
  const alertEmailTo = process.env.ALERT_EMAIL_TO;
  const alertEmailFrom = process.env.ALERT_EMAIL_FROM || 'onboarding@resend.dev';

  if (resendApiKey && alertEmailTo && resendApiKey !== 're_123456789') {
    try {
      const resendUrl = 'https://api.resend.com/emails';
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; background-color: #0b0f17; color: #e2e8f0; padding: 24px; border-radius: 12px;">
          <h2 style="color: #14b8a6; margin-top: 0;">🚀 High Match Job Alert (${score}% Fit)</h2>
          <p style="font-size: 18px; margin-bottom: 4px;"><strong>${title}</strong> at <strong>${company}</strong></p>
          <span style="background-color: #0f766e; color: #ccfbf1; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: bold; display: inline-block; margin-bottom: 16px;">${category}</span>
          
          <h3 style="color: #cbd5e1; margin-bottom: 8px;">Why It Fits (Transferable Analysis):</h3>
          <ul style="line-height: 1.6; color: #94a3b8;">
            ${match.fit_reasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
          
          <div style="margin-top: 24px;">
            <a href="${clickLink}" style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">1-Click Review & Tailor Resume</a>
          </div>
        </div>
      `;

      const res = await fetch(resendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: alertEmailFrom,
          to: [alertEmailTo],
          subject: `🎯 High Match Alert (${score}%): ${title} at ${company}`,
          html: htmlBody
        })
      });

      if (res.ok) {
        result.resendSent = true;
      } else {
        console.warn('Resend API response error:', await res.text());
      }
    } catch (err) {
      console.error('Error sending Resend email alert:', err);
    }
  }

  // Console output fallback for local inspection
  console.log('====================================================');
  console.log(`[JOB ALERT DISPATCHED] Score: ${score}% | ${title} @ ${company}`);
  console.log(`Telegram: ${result.telegramSent ? 'SENT' : 'DISABLED/SIMULATED'}`);
  console.log(`Resend Email: ${result.resendSent ? 'SENT' : 'DISABLED/SIMULATED'}`);
  console.log('====================================================');

  result.message = `Alert processed successfully. (Telegram: ${result.telegramSent ? 'Sent' : 'Simulated'}, Resend: ${result.resendSent ? 'Sent' : 'Simulated'})`;
  return result;
}
