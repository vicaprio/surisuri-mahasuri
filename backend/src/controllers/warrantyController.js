const prisma = require('../utils/prisma');
const path   = require('path');
const fs     = require('fs');

const SAMPLE_PDF = path.join(__dirname, '../assets/warranty-sample.pdf');

// ─── Download warranty PDF ───────────────────────────────────────────────────
exports.generateWarrantyPDF = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    const userId = req.user.id;

    // Validate ownership for real IDs
    if (!['1', '2', '3'].includes(serviceRequestId)) {
      const sr = await prisma.serviceRequest.findUnique({
        where: { id: serviceRequestId },
      });
      if (!sr)                  return res.status(404).json({ error: 'Service request not found' });
      if (sr.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!fs.existsSync(SAMPLE_PDF)) {
      return res.status(500).json({ error: 'Warranty PDF template not found' });
    }

    const filename = `하자보증보험증권-${serviceRequestId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    fs.createReadStream(SAMPLE_PDF).pipe(res);

  } catch (error) {
    console.error('Warranty PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to serve warranty PDF' });
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
    if (!sr)                  return res.status(404).json({ error: 'Service request not found' });
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
        status:          'ACTIVE',
      },
    });
  } catch (error) {
    console.error('Get warranty error:', error);
    res.status(500).json({ error: 'Failed to get warranty' });
  }
};
