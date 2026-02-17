const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const prisma = require('../utils/db');

// Generate warranty PDF
exports.generateWarrantyPDF = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    const userId = req.user.id;

    // Check if this is a mock ID (1-3 for demo purposes)
    const isMockId = ['1', '2', '3'].includes(serviceRequestId);

    let warrantyData;

    if (isMockId) {
      // Generate mock warranty data for demo
      const mockServices = {
        '1': { name: '배관/수도', description: '싱크대 배수구 누수 수리', address: '서울시 강남구 테헤란로 123', amount: 65000 },
        '2': { name: '전기/조명', description: '거실 조명 교체 및 스위치 수리', address: '서울시 강남구 테헤란로 123', amount: 45000 },
        '3': { name: '에어컨', description: '에어컨 청소 및 필터 교체', address: '서울시 강남구 테헤란로 123', amount: 80000 }
      };

      const mockService = mockServices[serviceRequestId];
      warrantyData = {
        warrantyNumber: `WRT-DEMO-${serviceRequestId}-${Date.now()}`,
        issueDate: new Date().toLocaleDateString('ko-KR'),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'),
        serviceName: mockService.name,
        serviceDescription: mockService.description,
        completedDate: new Date().toLocaleDateString('ko-KR'),
        technicianName: '김기사',
        customerName: '고객님',
        address: mockService.address,
        amount: mockService.amount
      };
    } else {
      // Get service request details from database
      const serviceRequest = await prisma.serviceRequest.findUnique({
        where: { id: serviceRequestId }
      });

      if (!serviceRequest) {
        return res.status(404).json({ error: 'Service request not found' });
      }

      if (serviceRequest.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get service details
      const service = await prisma.service.findUnique({
        where: { id: serviceRequest.serviceId }
      });

      warrantyData = {
        warrantyNumber: `WRT-${Date.now()}`,
        issueDate: new Date().toLocaleDateString('ko-KR'),
        expiryDate: new Date(Date.now() + service.warrantyDays * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'),
        serviceName: service.name,
        serviceDescription: service.description,
        completedDate: new Date().toLocaleDateString('ko-KR'),
        technicianName: '김기사',
        customerName: '고객님',
        address: serviceRequest.address,
        amount: serviceRequest.estimatedCost
      };
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=warranty-${warrantyData.warrantyNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // === Header ===
    doc.fontSize(28)
       .fillColor('#1e40af')
       .text('디지털 AS 하자이행보증서', { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(12)
       .fillColor('#6b7280')
       .text('마하수리 - 투명한 집수리 플랫폼', { align: 'center' })
       .moveDown(2);

    // === QR Code ===
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://mahasuri.com/warranty/${warrantyData.warrantyNumber}`,
        { width: 120, margin: 0 }
      );

      const qrX = (doc.page.width - 120) / 2;
      doc.image(qrCodeDataUrl, qrX, doc.y, { width: 120 });
      doc.moveDown(8);
    } catch (error) {
      console.error('QR Code generation error:', error);
      doc.moveDown(5);
    }

    // === Warranty Information ===
    doc.fontSize(10)
       .fillColor('#000000')
       .text(`보증서 번호: ${warrantyData.warrantyNumber}`, { align: 'center' })
       .moveDown(2);

    // === Service Details Box ===
    const boxY = doc.y;
    doc.rect(50, boxY, doc.page.width - 100, 280)
       .fillAndStroke('#f3f4f6', '#d1d5db');

    doc.fillColor('#000000');
    const contentX = 70;
    const contentY = boxY + 30;
    let currentY = contentY;

    const addField = (label, value) => {
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text(label, contentX, currentY, { continued: false });
      doc.fontSize(11)
         .fillColor('#111827')
         .text(value, contentX + 150, currentY, { width: 300 });
      currentY += 30;
    };

    addField('서비스 항목', warrantyData.serviceName);
    addField('서비스 설명', warrantyData.serviceDescription);
    addField('작업 완료일', warrantyData.completedDate);
    addField('담당 기사', warrantyData.technicianName);
    addField('고객명', warrantyData.customerName);
    addField('서비스 주소', warrantyData.address);
    addField('서비스 금액', `${warrantyData.amount.toLocaleString('ko-KR')}원`);

    doc.y = boxY + 300;
    doc.moveDown(1);

    // === Warranty Period ===
    doc.fontSize(14)
       .fillColor('#1e40af')
       .text('보증 기간', { underline: true })
       .moveDown(0.5);

    doc.fontSize(11)
       .fillColor('#111827')
       .text(`발급일: ${warrantyData.issueDate}`)
       .text(`만료일: ${warrantyData.expiryDate}`)
       .moveDown(1);

    // === Warranty Terms ===
    doc.fontSize(14)
       .fillColor('#1e40af')
       .text('보증 내용 및 조건', { underline: true })
       .moveDown(0.5);

    doc.fontSize(10)
       .fillColor('#374151')
       .text('【 무상 보증 범위 】')
       .moveDown(0.3)
       .fontSize(9)
       .text('• 작업 완료일로부터 1년간 무상 A/S를 제공합니다.')
       .text('• 정품 부품 사용을 보증하며, 부품 하자 발생 시 무상 교체합니다.')
       .text('• 시공 하자로 인한 재수리는 무상으로 처리됩니다.')
       .text('• 동일 부위 동일 증상에 대해 3개월 내 재발 시 무상 재수리 보장합니다.')
       .moveDown(0.5);

    doc.fontSize(10)
       .fillColor('#374151')
       .text('【 보증 제외 사항 】')
       .moveDown(0.3)
       .fontSize(9)
       .text('• 고객 과실 또는 부주의로 인한 손상')
       .text('• 천재지변, 화재, 침수 등 불가항력적 사유')
       .text('• 타업체 시공으로 인한 손상')
       .text('• 정상적인 사용 조건을 벗어난 경우')
       .moveDown(0.5);

    doc.fontSize(10)
       .fillColor('#374151')
       .text('【 A/S 신청 방법 】')
       .moveDown(0.3)
       .fontSize(9)
       .text('• 마하수리 앱/웹에서 수리이력 → 보증서 확인 → A/S 신청')
       .text('• 보증서 분실 시에도 시스템 등록 이력으로 A/S 가능')
       .text('• QR 코드 스캔으로 간편하게 보증서 확인 및 A/S 신청 가능')
       .moveDown(2);

    // === Footer ===
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text('본 보증서는 마하수리 플랫폼에서 디지털로 발급되었습니다.', { align: 'center' })
       .text('블록체인 기술로 보증서 위변조가 불가능합니다.', { align: 'center' })
       .moveDown(0.5)
       .text('고객센터: support@mahasuri.com | 1588-0000', { align: 'center' })
       .text('평일 09:00-18:00 (주말 및 공휴일 휴무)', { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Generate warranty PDF error:', error);
    res.status(500).json({ error: 'Failed to generate warranty PDF' });
  }
};

// Get warranty details (JSON)
exports.getWarranty = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    const userId = req.user.id;

    // Get service request
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId }
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (serviceRequest.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceRequest.serviceId }
    });

    // Mock warranty data
    const warranty = {
      warrantyNumber: `WRT-${serviceRequestId.slice(-8)}`,
      serviceRequestId: serviceRequestId,
      serviceName: service.name,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + service.warrantyDays * 24 * 60 * 60 * 1000).toISOString(),
      warrantyPeriod: service.warrantyDays,
      technicianName: '김기사',
      status: 'ACTIVE'
    };

    res.json({
      success: true,
      data: warranty
    });
  } catch (error) {
    console.error('Get warranty error:', error);
    res.status(500).json({ error: 'Failed to get warranty' });
  }
};
