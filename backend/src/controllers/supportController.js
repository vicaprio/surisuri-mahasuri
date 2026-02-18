const OpenAI = require('openai');

// Lazy initialization - avoid crash if OPENAI_API_KEY is not set at startup
let _openai = null;
const getOpenAI = () => {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
};

const SYSTEM_PROMPT = `당신은 마하수리(수리수리 마하수리) 고객지원 AI 어시스턴트입니다.
마하수리는 한국의 집수리 전문 플랫폼으로 사진 한 장으로 AI 예상 견적을 즉시 제공하고 근처 전문 기사님을 매칭해주는 서비스입니다.

제공 서비스:
- 전기/조명: 콘센트, 스위치, 조명 교체
- 배관/수도: 수전, 배수구, 누수 수리
- 도배/장판: 벽지, 장판 시공
- 에어컨: 설치, 세척, 점검
- 목공/가구: 문, 가구, 선반
- 기타수리: 위 분류 외 일반 수리

이용 방법:
1. 앱/웹에서 사진 업로드 → AI 예상 견적 확인
2. 전문가 매칭 시작 → 근처 기사님 배정
3. 기사님 방문 및 작업 완료
4. 이행(하자)보증보험증권 자동 발행 (1년 보증)

결제: 에스크로 방식 (작업 완료 확인 후 기사님에게 지급, 안심 거래)
보증: 작업 완료 후 1년 이행(하자)보증보험증권 자동 발행
고객센터: 1588-0000 (평일 09:00-18:00)
이메일: support@mahasuri.com

답변 원칙:
- 한국어로 친절하고 간결하게 답변 (2-4문장)
- 구체적인 정보를 먼저 제공하고, 추가 도움이 필요하면 고객센터 안내
- 환불/분쟁/법적 문제/개인정보 관련 민감한 문의는 반드시 담당자 연결 안내
- 모르는 내용은 솔직하게 모른다고 하고 고객센터(1588-0000) 안내
- 담당자 연결이 필요한 경우 답변에 "담당자 연결" 문구를 반드시 포함`;

// Keywords that indicate escalation is needed
const ESCALATION_KEYWORDS = ['담당자 연결', '고객센터', '직접 연락', '1588-0000'];

exports.supportChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: true,
        data: {
          reply: '현재 AI 서비스를 이용할 수 없습니다. 고객센터(1588-0000)로 연락해 주시거나 support@mahasuri.com으로 문의해 주세요.',
          needsEscalation: true,
        },
      });
    }

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10).map(({ role, content }) => ({ role, content })),
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const reply = completion.choices[0].message.content.trim();
    const needsEscalation = ESCALATION_KEYWORDS.some(kw => reply.includes(kw));

    res.json({ success: true, data: { reply, needsEscalation } });
  } catch (error) {
    console.error('Support chat error:', error?.status, error?.message, error?.code);
    res.json({
      success: true,
      data: {
        reply: `[DEBUG] 오류: ${error?.status || ''} ${error?.message || error?.toString()}`,
        needsEscalation: true,
      },
    });
  }
};
