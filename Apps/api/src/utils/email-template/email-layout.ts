export function buildEmailWrapper(content: string): string {
  return `<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px 16px;text-align:center;"><div style="max-width:640px;margin:0 auto;">${content}</div></div>`;
}

export function buildSuccessIconBadge(icon = "✓"): string {
  return `<div style="position:relative;display:inline-flex;margin-bottom:32px;"><div style="position:absolute;inset:0;border-radius:9999px;background:#ccfbf1;opacity:0.75;"></div><div style="position:relative;display:flex;height:96px;width:96px;align-items:center;justify-content:center;border-radius:9999px;background:#f0fdfa;color:#0f766e;font-size:48px;line-height:1;">${icon}</div></div>`;
}

export function buildInfoCard(bodyHtml: string): string {
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;padding:24px;border-radius:16px;">${bodyHtml}</div>`;
}

export function buildInfoGrid(rows: Array<{ label: string; value: string }>): string {
  const rowsHtml = rows
    .map((row, i) => {
      const borderStyle = i < rows.length - 1 ? "border-bottom:1px solid #e2e8f0;" : "";
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;${borderStyle}"><span style="font-weight:600;color:#374151;font-size:14px;">${row.label}</span><span style="color:#475569;font-size:14px;">${row.value}</span></div>`;
    })
    .join("");
  return `<div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px 24px;border-radius:16px;text-align:left;">${rowsHtml}</div>`;
}

export function buildStatusBadge(isApproved: boolean): string {
  const bg = isApproved ? "#dcfce7" : "#fee2e2";
  const color = isApproved ? "#15803d" : "#dc2626";
  const label = isApproved ? "✓ Approved" : "✗ Not Approved";
  return `<div style="display:inline-block;margin-bottom:24px;padding:10px 24px;border-radius:9999px;background:${bg};color:${color};font-weight:700;font-size:16px;">${label}</div>`;
}
