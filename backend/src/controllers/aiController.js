const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CATEGORY_NAMES = {
  ELECTRICAL: '전기/조명',
  PLUMBING: '배관/수도',
  WALLPAPER: '도배/장판',
  AIRCON: '에어컨',
  CARPENTRY: '목공/가구',
  GENERAL: '기타수리',
};

exports.analyzeEstimate = async (req, res) => {
  try {
    const { photoUrls, description, category, serviceName } = req.body;

    if (!photoUrls || photoUrls.length === 0) {
      return res.status(400).json({ error: '사진이 필요합니다.' });
    }

    const categoryName = CATEGORY_NAMES[category] || category;

    // Build image content for GPT-4o Vision
    const imageContent = photoUrls.map(url => ({
      type: 'image_url',
      image_url: { url, detail: 'low' },
    }));

    const prompt = `당신은 한국의 집수리 전문 견적 전문가입니다.
사용자가 수리가 필요한 부분의 사진을 보내왔습니다.

카테고리: ${categoryName}
${serviceName ? `서비스: ${serviceName}` : ''}
${description ? `설명: ${description}` : ''}

사진을 분석하여 아래 JSON 형식으로 한국어로 답변해주세요:
{
  "summary": "수리 현황 한 줄 요약 (예: 배관 누수로 인한 긴급 수리 필요)",
  "estimatedMinCost": 50000,
  "estimatedMaxCost": 150000,
  "difficulty": "낮음 또는 중간 또는 높음",
  "estimatedTime": "1-2시간",
  "detectedIssues": ["발견된 문제 1", "발견된 문제 2"],
  "recommendations": ["권고사항 1", "권고사항 2", "권고사항 3"],
  "urgency": "긴급 또는 일반 또는 여유"
}

비용은 한국 시장 기준 원화(KRW)로 산정하세요. JSON만 반환하세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageContent,
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0].message.content.trim();

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답 파싱 실패');
    }

    const result = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('AI estimate error:', error);
    res.status(500).json({
      success: false,
      error: 'AI 분석에 실패했습니다.',
    });
  }
};
