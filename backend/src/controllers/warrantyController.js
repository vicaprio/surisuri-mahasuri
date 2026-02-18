const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const prisma = require('../utils/prisma');
const path = require('path');
const fs = require('fs');

const FONT_PATH = path.join(__dirname, '../fonts/NanumGothic.ttf');
const HAS_FONT = fs.existsSync(FONT_PATH);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '');

const fmtMoney = (n) => `${Number(n).toLocaleString('ko-KR')}원`;

// Generate warranty PDF - SGI 서울보증 스타일 "이행(하자)보증보험증권"
exports.generateWarrantyPDF = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    const userId = req.user.id;

    // --- Data fetching ---
    let d;
    if (['1', '2', '3'].includes(serviceRequestId)) {
      const mockMap = {
        '1': { name: '배관/수도', desc: '싱크대 배수구 누수 수리', addr: '서울시 강남구 테헤란로 123', amount: 65000, tech: '김기사', customer: '고객님' },
        '2': { name: '전기/조명', desc: '거실 조명 교체 및 스위치 수리', addr: '서울시 강남구 테헤란로 123', amount: 45000, tech: '이기사', customer: '고객님' },
        '3': { name: '에어컨', desc: '에어컨 청소 및 필터 교체', addr: '서울시 강남구 테헤란로 123', amount: 80000, tech: '박기사', customer: '고객님' },
      };
      const m = mockMap[serviceRequestId];
      const now = new Date();
      const exp = new Date(now.getTime() + 365 * 86400000);
      d = {
        num: `SM-DEMO-${serviceRequestId}`,
        issue: fmtDate(now), expiry: fmtDate(exp), days: 365,
        name: m.name, desc: m.desc, addr: m.addr, amount: m.amount,
        tech: m.tech, customer: m.customer, completed: fmtDate(now),
      };
    } else {
      const sr = await prisma.serviceRequest.findUnique({
        where: { id: serviceRequestId },
        include: { user: true, technician: true, service: true },
      });
      if (!sr) return res.status(404).json({ error: 'Service request not found' });
      if (sr.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

      const now = new Date();
      const days = sr.service?.warrantyDays || 365;
      const exp = new Date(now.getTime() + days * 86400000);
      d = {
        num: `SM-${serviceRequestId.slice(-8).toUpperCase()}`,
        issue: fmtDate(now), expiry: fmtDate(exp), days,
        name: sr.service?.name || sr.category || '주택수리',
        desc: sr.description || '',
        addr: sr.address || '',
        amount: sr.finalCost || sr.estimatedCost || 0,
        tech: sr.technician?.name || '담당기사',
        customer: sr.user?.name || '고객',
        completed: sr.completedAt ? fmtDate(sr.completedAt) : fmtDate(now),
      };
    }

    // --- PDF Setup ---
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="warranty-${d.num}.pdf"`);
    doc.pipe(res);

    if (HAS_FONT) {
      doc.registerFont('K', FONT_PATH);
    }
    const F  = HAS_FONT ? 'K' : 'Helvetica';
    const FB = HAS_FONT ? 'K' : 'Helvetica-Bold';

    const PW = doc.page.width;    // 595.28
    const PH = doc.page.height;   // 841.89
    const L  = 40;
    const TW = PW - 2 * L;        // 515.28
    const RH = 26;                 // standard row height

    // ─── Blue Header Bar ──────────────────────────────────────────
    doc.rect(0, 0, PW, 52).fill('#1e3a5f');
    doc.fillColor('white').font(FB).fontSize(14)
       .text('마하수리(주)', L, 12, { width: TW / 2 });
    doc.fillColor('#a0b8d0').font(F).fontSize(8.5)
       .text('MAHASURI Co., Ltd.  |  주택수리 전문 플랫폼', L, 30, { width: TW / 2 });
    doc.fillColor('#a0b8d0').font(F).fontSize(8.5)
       .text('고객센터  1588-0000  |  평일 09:00 – 18:00', L, 20, { width: TW, align: 'right' });

    // ─── Main Title ───────────────────────────────────────────────
    let y = 68;
    doc.fillColor('#1e3a5f').font(FB).fontSize(22)
       .text('이행(하자)보증보험증권', L, y, { width: TW, align: 'center' });
    y += 32;
    doc.fillColor('#555555').font(F).fontSize(10)
       .text('( 인터넷 발급용 )', L, y, { width: TW, align: 'center' });
    y += 18;
    doc.fillColor('#777777').font(F).fontSize(9)
       .text(`증권번호  제  ${d.num}  호`, L, y, { width: TW, align: 'center' });
    y += 16;
    doc.moveTo(L, y).lineTo(PW - L, y).strokeColor('#c5cdd6').lineWidth(0.5).stroke();
    y += 14;

    // ─── Table Helpers ────────────────────────────────────────────
    const sectionHeader = (title, cy) => {
      doc.rect(L, cy, TW, 24).fill('#1e3a5f');
      doc.fillColor('white').font(FB).fontSize(10)
         .text(title, L + 10, cy + 7, { width: TW - 20 });
      return cy + 24;
    };

    // 2-column row: [label | value]
    const row2 = (label, value, cy, rh = RH) => {
      const lw = 130;
      const vw = TW - lw;
      doc.rect(L,      cy, lw, rh).fillAndStroke('#eef2f7', '#d1d5db');
      doc.rect(L + lw, cy, vw, rh).fillAndStroke('#ffffff', '#d1d5db');
      doc.fillColor('#374151').font(F).fontSize(9)
         .text(label,        L + 6,       cy + (rh - 10) / 2, { width: lw - 10, lineBreak: false });
      doc.fillColor('#111827').font(F).fontSize(9)
         .text(String(value), L + lw + 6, cy + (rh - 10) / 2, { width: vw - 12, lineBreak: false });
      return cy + rh;
    };

    // 4-column row: [label1 | value1 | label2 | value2]
    const row4 = (l1, v1, l2, v2, cy) => {
      const lw = 110;
      const vw = (TW - 2 * lw) / 2;
      doc.rect(L,               cy, lw, RH).fillAndStroke('#eef2f7', '#d1d5db');
      doc.rect(L + lw,          cy, vw, RH).fillAndStroke('#ffffff', '#d1d5db');
      doc.rect(L + lw + vw,     cy, lw, RH).fillAndStroke('#eef2f7', '#d1d5db');
      doc.rect(L + lw + vw + lw, cy, vw, RH).fillAndStroke('#ffffff', '#d1d5db');
      doc.fillColor('#374151').font(F).fontSize(9).text(l1,        L + 4,                cy + 8, { lineBreak: false });
      doc.fillColor('#111827').font(F).fontSize(9).text(String(v1), L + lw + 4,          cy + 8, { lineBreak: false });
      doc.fillColor('#374151').font(F).fontSize(9).text(l2,        L + lw + vw + 4,     cy + 8, { lineBreak: false });
      doc.fillColor('#111827').font(F).fontSize(9).text(String(v2), L + lw + vw + lw + 4, cy + 8, { lineBreak: false });
      return cy + RH;
    };

    // ─── 기본사항 ─────────────────────────────────────────────────
    y = sectionHeader('기본사항', y);
    y = row4('보험계약자', d.customer, '피보험자', '마하수리(주)', y);
    y = row4('보험가입금액', fmtMoney(d.amount), '보험료', fmtMoney(Math.max(1000, Math.round(d.amount * 0.01))), y);
    y = row2('보험기간', `${d.issue}  ~  ${d.expiry}  (${d.days}일간)`, y);
    y = row2('작업 주소', d.addr, y);
    y += 12;

    // ─── 보증하는 사항 ────────────────────────────────────────────
    y = sectionHeader('보증하는 사항', y);
    y = row2('보증내용',   '하자이행보증 (주택수리 시공 하자 담보)', y);
    y = row2('특별약관',   '시공하자보증특약', y);
    y = row2('특기사항',   `작업완료일(${d.completed})로부터 ${d.days}일간 하자보증`, y);
    y = row2('주계약내용', d.desc || d.name, y, 36);
    y = row2('담당 기사',  d.tech, y);
    y = row2('서비스 항목', d.name, y);
    y += 12;

    // ─── 알아두셔야 할 사항 ───────────────────────────────────────
    const alertH = 148;
    doc.rect(L, y, TW, alertH).fillAndStroke('#fffbeb', '#f59e0b');
    doc.rect(L, y, 4, alertH).fill('#f59e0b');
    doc.fillColor('#92400e').font(FB).fontSize(10)
       .text('[ 알아두셔야 할 사항 ]', L + 12, y + 10, { width: TW - 20 });

    const notes = [
      '본 증권은 마하수리 플랫폼에서 발급된 이행(하자)보증보험증권입니다.',
      '보증기간 내 시공 하자 발생 시, 앱/웹 [수리이력 → 하자보증 신청] 메뉴를 이용하십시오.',
      '고객 과실, 천재지변, 타업체 시공, 정상 사용 범위 초과로 인한 손상은 보증에서 제외됩니다.',
      '보증기간 만료 후 하자 발생 시 별도 유상 수리로 진행됩니다.',
      '본 증권 진위 여부는 마하수리 고객센터(1588-0000)로 문의하십시오.',
    ];
    let ny = y + 30;
    notes.forEach((note) => {
      doc.fillColor('#78350f').font(F).fontSize(8)
         .text(`•  ${note}`, L + 12, ny, { width: TW - 24, lineBreak: false });
      ny += 22;
    });
    y += alertH + 16;

    // ─── QR Code + 서명란 ─────────────────────────────────────────
    try {
      const qrDataUrl = await QRCode.toDataURL(
        `https://mahasuri.com/warranty/${d.num}`,
        { width: 80, margin: 0 }
      );
      doc.image(qrDataUrl, L, y, { width: 80 });
      doc.fillColor('#888888').font(F).fontSize(7)
         .text('증권 확인 QR', L, y + 83, { width: 80, align: 'center' });
    } catch (_) { /* QR 생략 */ }

    const sx = L + 96;
    doc.fillColor('#374151').font(F).fontSize(9)
       .text(`발     급     일 :   ${d.issue}`,   sx, y + 4,  { width: TW - 96 })
       .text(`보  증  만  료  일 :   ${d.expiry}`, sx, y + 20, { width: TW - 96 })
       .text(`보  증  기  간   :   ${d.days}일 (1년)`, sx, y + 36, { width: TW - 96 });
    doc.fillColor('#1e3a5f').font(FB).fontSize(11)
       .text('마하수리 주식회사', sx, y + 58, { width: TW - 96 });
    doc.fillColor('#374151').font(F).fontSize(9)
       .text('대 표 이 사                              ( 인 )', sx, y + 74, { width: TW - 96 });
    doc.moveTo(PW - L - 90, y + 90).lineTo(PW - L, y + 90)
       .strokeColor('#999999').lineWidth(0.5).stroke();

    // ─── Footer ───────────────────────────────────────────────────
    doc.rect(0, PH - 34, PW, 34).fill('#1e3a5f');
    doc.fillColor('#a0b8d0').font(F).fontSize(7.5)
       .text(
         '본 증권은 마하수리(주)가 발행하였으며, 위변조 방지 기술이 적용되어 있습니다.  |  support@mahasuri.com  |  고객센터 1588-0000',
         L, PH - 20, { width: TW, align: 'center' }
       );

    doc.end();
  } catch (error) {
    console.error('Generate warranty PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate warranty PDF' });
    }
  }
};

// Get warranty details (JSON)
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

    const days = sr.service?.warrantyDays || 365;
    const now  = new Date();
    const expiry = new Date(now.getTime() + days * 86400000);

    res.json({
      success: true,
      data: {
        warrantyNumber: `SM-${serviceRequestId.slice(-8).toUpperCase()}`,
        serviceRequestId,
        serviceName:    sr.service?.name || sr.category || '주택수리',
        issueDate:      now.toISOString(),
        expiryDate:     expiry.toISOString(),
        warrantyPeriod: days,
        technicianName: sr.technician?.name || '담당기사',
        status: 'ACTIVE',
      },
    });
  } catch (error) {
    console.error('Get warranty error:', error);
    res.status(500).json({ error: 'Failed to get warranty' });
  }
};
