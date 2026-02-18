const PDFDocument = require('pdfkit');
const QRCode     = require('qrcode');
const prisma     = require('../utils/prisma');
const path       = require('path');
const fs         = require('fs');

const FONT_PATH = path.join(__dirname, '../fonts/NanumGothic.ttf');
const HAS_FONT  = fs.existsSync(FONT_PATH);

const fmtDate = (d) => {
  const dt = new Date(d);
  const y  = dt.getFullYear();
  const m  = String(dt.getMonth() + 1).padStart(2, '0');
  const dy = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
};

const fmtMoney = (n) => `₩ ${Number(n).toLocaleString('ko-KR')}`;

const CATEGORIES = [
  { code: 'ELECTRICAL', label: '전기/조명' },
  { code: 'PLUMBING',   label: '배관/수도' },
  { code: 'WALLPAPER',  label: '도배/장판' },
  { code: 'AIRCON',     label: '에어컨'    },
  { code: 'CARPENTRY',  label: '목공/가구' },
  { code: 'GENERAL',    label: '기타수리'  },
];

const guessCategory = (name = '') => {
  if (name.includes('전기') || name.includes('조명')) return 'ELECTRICAL';
  if (name.includes('배관') || name.includes('수도')) return 'PLUMBING';
  if (name.includes('도배') || name.includes('장판')) return 'WALLPAPER';
  if (name.includes('에어컨'))                        return 'AIRCON';
  if (name.includes('목공') || name.includes('가구')) return 'CARPENTRY';
  return 'GENERAL';
};

// ─── PDF Generator ───────────────────────────────────────────────────────────
exports.generateWarrantyPDF = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    const userId = req.user.id;

    // ── Data ──
    let d;
    if (['1', '2', '3'].includes(serviceRequestId)) {
      const mock = {
        '1': { name: '배관/수도', cat: 'PLUMBING',   desc: '싱크대 배수구 누수 수리',      addr: '서울특별시 강남구 테헤란로 123', amount: 65000, tech: '김기사', customer: '고객님', phone: '010-0000-0000' },
        '2': { name: '전기/조명', cat: 'ELECTRICAL', desc: '거실 조명 교체 및 스위치 수리', addr: '서울특별시 강남구 테헤란로 123', amount: 45000, tech: '이기사', customer: '고객님', phone: '010-0000-0000' },
        '3': { name: '에어컨',   cat: 'AIRCON',      desc: '에어컨 청소 및 필터 교체',      addr: '서울특별시 강남구 테헤란로 123', amount: 80000, tech: '박기사', customer: '고객님', phone: '010-0000-0000' },
      }[serviceRequestId];
      const now = new Date(), exp = new Date(now.getTime() + 365 * 86400000);
      d = { num: `SM-DEMO-00${serviceRequestId}`, issue: fmtDate(now), expiry: fmtDate(exp), days: 365, ...mock, completed: fmtDate(now) };
    } else {
      const sr = await prisma.serviceRequest.findUnique({
        where: { id: serviceRequestId },
        include: { user: true, technician: true, service: true },
      });
      if (!sr)               return res.status(404).json({ error: 'Service request not found' });
      if (sr.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
      const now  = new Date();
      const days = sr.service?.warrantyDays || 365;
      const exp  = new Date(now.getTime() + days * 86400000);
      const amount = sr.finalCost || sr.estimatedCost || 0;
      d = {
        num:      `SM-${serviceRequestId.slice(-8).toUpperCase()}`,
        issue:    fmtDate(now),
        expiry:   fmtDate(exp),
        days,
        name:     sr.service?.name || '주택수리',
        cat:      sr.service?.category || guessCategory(sr.service?.name),
        desc:     sr.description || sr.service?.name || '',
        addr:     sr.address || '',
        amount,
        tech:     sr.technician?.name || '담당기사',
        customer: sr.user?.name  || '고객',
        phone:    sr.user?.phone || '010-0000-0000',
        completed: sr.completedAt ? fmtDate(sr.completedAt) : fmtDate(now),
      };
    }

    // ── PDF init ──
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="warranty-${d.num}.pdf"`);
    doc.pipe(res);

    if (HAS_FONT) doc.registerFont('K', FONT_PATH);
    const F  = HAS_FONT ? 'K' : 'Helvetica';
    const FB = HAS_FONT ? 'K' : 'Helvetica-Bold';

    const PW = doc.page.width;   // 595.28
    const PH = doc.page.height;  // 841.89
    const ML = 36, MR = 36;
    const TW = PW - ML - MR;     // 523.28

    // Colors (matching template)
    const ORANGE   = '#d97706';   // top bar
    const TEAL     = '#1e4d6b';   // section headers
    const LBL_BG   = '#dce8f0';   // label cell background
    const BORDER   = '#9db8c8';   // cell border
    const WHITE    = '#ffffff';
    const LBL_FC   = '#1e3a4f';   // label text color
    const VAL_FC   = '#111111';   // value text color

    // ── Helpers ──
    const fillText = (font, size, color, text, x, y, opts = {}) => {
      doc.font(font).fontSize(size).fillColor(color).text(String(text), x, y, opts);
    };

    // 4-column row: [lbl | val | lbl | val]
    const row4 = (l1, v1, l2, v2, cy, rh = 28, lw = 100) => {
      const vw = (TW - lw * 2) / 2;
      const cols = [
        { x: ML,             w: lw,  bg: LBL_BG, text: l1, fc: LBL_FC, font: FB },
        { x: ML + lw,        w: vw,  bg: WHITE,  text: v1, fc: VAL_FC, font: F  },
        { x: ML + lw + vw,   w: lw,  bg: LBL_BG, text: l2, fc: LBL_FC, font: FB },
        { x: ML + lw + vw + lw, w: vw, bg: WHITE, text: v2, fc: VAL_FC, font: F  },
      ];
      cols.forEach(({ x, w, bg, text, fc, font }) => {
        doc.rect(x, cy, w, rh).fillAndStroke(bg, BORDER);
        fillText(font, 8.5, fc, text, x + 5, cy + 6, { width: w - 10, lineBreak: true });
      });
      return cy + rh;
    };

    // 2-column row: [lbl | val]
    const row2 = (label, value, cy, rh = 28, lw = 110) => {
      doc.rect(ML, cy, lw, rh).fillAndStroke(LBL_BG, BORDER);
      doc.rect(ML + lw, cy, TW - lw, rh).fillAndStroke(WHITE, BORDER);
      fillText(FB, 8.5, LBL_FC, label, ML + 5, cy + (rh > 30 ? 8 : 6), { width: lw - 10, lineBreak: true });
      fillText(F,  8.5, VAL_FC, value, ML + lw + 6, cy + 6, { width: TW - lw - 12, lineBreak: true });
      return cy + rh;
    };

    // Section header (dark teal)
    const secHdr = (title, cy) => {
      doc.rect(ML, cy, TW, 22).fill(TEAL);
      fillText(FB, 10, WHITE, title, ML + 10, cy + 6, { width: TW - 20, lineBreak: false });
      return cy + 22;
    };

    // ── Top header bar ──
    doc.rect(0, 0, PW, 36).fill(ORANGE);
    fillText(FB, 11, WHITE, '마하수리(주)  하자보증보험증권 발행기관', ML, 11, { width: TW * 0.6 });
    fillText(F,   9, WHITE, `발행번호: ${d.num}`, ML, 13, { width: TW, align: 'right' });

    // ── Title ──
    let y = 50;
    fillText(FB, 24, '#111111', '하자보증보험증권', ML, y, { width: TW, align: 'center' });
    y += 32;
    fillText(F, 10, '#666666', '( 인터넷 발급용 )', ML, y, { width: TW, align: 'center' });
    y += 20;

    // ── 기본사항 ──
    y = secHdr('기본사항', y);
    y = row4('보증서번호', d.num, '발행일자', d.issue, y);
    y = row4('보증계약자', `${d.customer}(의뢰인)`, '피보증자', '마하수리(주)', y);
    y = row4('공사명', `${d.name} 수리 공사`, '공사장소', d.addr, y, 32);
    y = row4('보증가입금액', fmtMoney(d.amount), '보증료', '₩ 0', y);
    y = row4('보증기간', `${d.issue} ~ ${d.expiry}\n(${d.days}일)`, '연락처', `${d.phone}\nsupport@mahasuri.com`, y, 36);
    y += 8;

    // ── 보증하는 사항 ──
    y = secHdr('보증하는 사항', y);
    y = row2('보증내용', `${d.name} 수리 공사에 대한 하자보증`, y);

    // Checkbox category row
    const chkH = 34, lw0 = 110;
    doc.rect(ML, y, lw0, chkH).fillAndStroke(LBL_BG, BORDER);
    doc.rect(ML + lw0, y, TW - lw0, chkH).fillAndStroke(WHITE, BORDER);
    fillText(FB, 8.5, LBL_FC, '공사종류\n(대분류)', ML + 5, y + 6, { width: lw0 - 10, lineBreak: true });
    const catStr = CATEGORIES.map(c => `${c.code === d.cat ? '☑' : '☐'} ${c.label}`).join('   ');
    fillText(F, 8.5, VAL_FC, catStr, ML + lw0 + 6, y + 10, { width: TW - lw0 - 12, lineBreak: true });
    y += chkH;

    y = row2('보증범위', '계약서 및 작업지시서에 명시된 시공 범위 내 하자(누수, 마감불량, 기능불량 등)로 인한 재시공/수리 비용', y, 38);
    y = row2('면책/제외', '천재지변, 사용자 과실(고의·중대한 과실), 소모품 및 정상 마모, 제 3자 개입으로 인한 손상 등', y, 38);
    y += 8;

    // ── 특이사항 / 주계약내용 ──
    y = secHdr('특이사항 / 주계약내용', y);
    const specH = 115;
    const leftW = Math.floor(TW * 0.57);
    const rightW = TW - leftW;

    doc.rect(ML, y, leftW, specH).fillAndStroke(WHITE, BORDER);
    doc.rect(ML + leftW, y, rightW, specH).fillAndStroke(WHITE, BORDER);

    // Left: 특이사항
    let ly = y + 8;
    fillText(FB, 8.5, TEAL, '특이사항', ML + 7, ly, { width: leftW - 14, lineBreak: false });
    ly += 14;
    [
      '입주자대표회의/관리단 구성 시, 보증금 청구권은 해당 관리주체로 승계될 수 있습니다.',
      '본 보증서는 마하수리(주)가 발행하며 실제 발급 시 약관/특별약관이 첨부됩니다.',
    ].forEach(note => {
      fillText(F, 8, '#333333', `• ${note}`, ML + 7, ly, { width: leftW - 14, lineBreak: true });
      ly += 20;
    });

    ly += 4;
    fillText(FB, 8.5, TEAL, '주계약내용', ML + 7, ly, { width: leftW - 14, lineBreak: false });
    ly += 13;
    [
      `계약일자: ${d.completed}`,
      `담보기간: ${d.issue} ~ ${d.expiry}`,
      `계약금액: ${fmtMoney(d.amount)}`,
      `보증금율: 10%`,
    ].forEach(line => {
      fillText(F, 8, '#333333', line, ML + 7, ly, { width: leftW - 14, lineBreak: false });
      ly += 12;
    });

    // Right: QR
    fillText(FB, 8.5, TEAL, '진위확인 QR', ML + leftW + 4, y + 8, { width: rightW - 8, align: 'center' });
    try {
      const verifyUrl = `https://surisuri-mahasuri.pages.dev/warranty/verify?no=${d.num}`;
      const qrBuf = await QRCode.toBuffer(verifyUrl, { width: 75, margin: 1 });
      const qrX   = ML + leftW + (rightW - 75) / 2;
      doc.image(qrBuf, qrX, y + 22, { width: 75 });
      fillText(F, 6.5, '#555555', 'surisuri-mahasuri.pages.dev', ML + leftW + 4, y + 99, { width: rightW - 8, align: 'center', lineBreak: false });
    } catch (_) {}

    y += specH + 8;

    // ── 알아두셔야 할 사항 ──
    y = secHdr('알아두셔야 할 사항', y);
    const noticeH = 76;
    doc.rect(ML, y, TW, noticeH).fillAndStroke('#fffef5', BORDER);
    let noteY = y + 8;
    [
      { text: '보증서증권으로 보증하는 내용이 주계약상 보증이 필요한 내용과 일치하는지 반드시 확인하시기 바랍니다.', red: true },
      { text: '보증금 청구(보상) 및 진행상황은 마하수리 고객센터(1588-0000) 또는 홈페이지에서 확인할 수 있습니다.', red: false },
      { text: '본 보증서의 권리·의무는 약관 및 본 증권 기재 내용에 따릅니다.', red: false },
    ].forEach((n, i) => {
      fillText(n.red ? FB : F, 8.5, n.red ? '#cc0000' : '#333333',
        `${i + 1}. ${n.text}`, ML + 10, noteY, { width: TW - 20, lineBreak: true });
      noteY += 22;
    });
    y += noticeH + 8;

    // ── 서명/직인 ──
    fillText(F, 8.5, '#333333',
      `※ 서명/직인   발행기관: 마하수리 주식회사                    담당자: _________________  (직인)`,
      ML, y, { width: TW, lineBreak: false });

    // ── Footer bar ──
    doc.rect(0, PH - 26, PW, 26).fill(TEAL);
    fillText(F, 7.5, '#90b8cc',
      '본 증권은 마하수리(주)가 발행하였으며, 위변조 방지 기술이 적용됩니다.  |  support@mahasuri.com  |  고객센터 1588-0000',
      ML, PH - 15, { width: TW, align: 'center', lineBreak: false });

    doc.end();
  } catch (error) {
    console.error('Generate warranty PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate warranty PDF' });
    }
  }
};

// ─── Get warranty JSON ───────────────────────────────────────────────────────
exports.getWarranty = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    const userId = req.user.id;

    const sr = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: { service: true, technician: true },
    });
    if (!sr) return res.status(404).json({ error: 'Service request not found' });
    if (sr.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const days   = sr.service?.warrantyDays || 365;
    const now    = new Date();
    const expiry = new Date(now.getTime() + days * 86400000);

    res.json({
      success: true,
      data: {
        warrantyNumber:  `SM-${serviceRequestId.slice(-8).toUpperCase()}`,
        serviceRequestId,
        serviceName:     sr.service?.name || '주택수리',
        issueDate:       now.toISOString(),
        expiryDate:      expiry.toISOString(),
        warrantyPeriod:  days,
        technicianName:  sr.technician?.name || '담당기사',
        status: 'ACTIVE',
      },
    });
  } catch (error) {
    console.error('Get warranty error:', error);
    res.status(500).json({ error: 'Failed to get warranty' });
  }
};
