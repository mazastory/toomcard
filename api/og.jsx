import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'TOOMCARD';
    const subtitle = searchParams.get('subtitle') || '3D 인터랙티브 스마트 명함';
    const company = searchParams.get('company') || 'TOOMCARD';
    const theme = (searchParams.get('theme') || 'obsidian').toLowerCase();

    // 테마별 시그니처 컬러 팔레트
    let primaryGrad = 'linear-gradient(90deg, #c084fc, #ec4899, #f43f5e)';
    let accentColor = '#ffd978';
    let borderColor = 'rgba(168, 85, 247, 0.45)';
    let glowColor = 'rgba(168, 85, 247, 0.25)';
    let cardBg = 'radial-gradient(circle at 50% 20%, #1f1438 0%, #0c0817 100%)';
    let badgeText = '✦ 3D VIP EDITION';

    if (theme === 'gold' || theme.includes('gold')) {
      primaryGrad = 'linear-gradient(90deg, #fffbeb, #fde047, #f59e0b)';
      accentColor = '#fef08a';
      borderColor = 'rgba(245, 158, 11, 0.6)';
      glowColor = 'rgba(245, 158, 11, 0.3)';
      cardBg = 'radial-gradient(circle at 50% 20%, #32230a 0%, #0f0a03 100%)';
      badgeText = '👑 24K GOLD PLATINUM';
    } else if (theme === 'nexus' || theme === 'cyber' || theme.includes('nexus')) {
      primaryGrad = 'linear-gradient(90deg, #e0f2fe, #38bdf8, #06b6d4)';
      accentColor = '#67e8f9';
      borderColor = 'rgba(56, 189, 248, 0.6)';
      glowColor = 'rgba(6, 182, 212, 0.3)';
      cardBg = 'radial-gradient(circle at 50% 20%, #0d2238 0%, #030a12 100%)';
      badgeText = '⚡ CYBER NEXUS EDITION';
    } else if (theme === 'corporate' || theme === 'enterprise' || theme.includes('enterprise')) {
      primaryGrad = 'linear-gradient(90deg, #eff6ff, #60a5fa, #3b82f6)';
      accentColor = '#93c5fd';
      borderColor = 'rgba(59, 130, 246, 0.55)';
      glowColor = 'rgba(59, 130, 246, 0.25)';
      cardBg = 'radial-gradient(circle at 50% 20%, #111e38 0%, #060b14 100%)';
      badgeText = '🏢 B2B ENTERPRISE SOLUTION';
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#07050d',
            backgroundImage: 'radial-gradient(circle at 50% 25%, #18122b 0%, #050308 100%)',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '36px',
            position: 'relative',
          }}
        >
          {/* Card Frame Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '940px',
              height: '520px',
              background: cardBg,
              borderRadius: '32px',
              border: `2px solid ${borderColor}`,
              boxShadow: `0 30px 70px -10px rgba(0,0,0,0.9), 0 0 60px ${glowColor}`,
              padding: '52px 64px',
              position: 'relative',
            }}
          >
            {/* Top Bar: Company & Edition Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '7px', backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}></div>
                <span style={{ fontSize: '26px', fontWeight: '800', color: accentColor, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {company}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 20px',
                  borderRadius: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${borderColor}`,
                  fontSize: '15px',
                  color: '#f1f5f9',
                  fontWeight: '700',
                  letterSpacing: '1px',
                }}
              >
                {badgeText}
              </div>
            </div>

            {/* Middle: Full Name & Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: 'auto 0' }}>
              <h1
                style={{
                  fontSize: '72px',
                  fontWeight: '900',
                  margin: 0,
                  letterSpacing: '-1.5px',
                  background: primaryGrad,
                  backgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: '1.15',
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: '28px',
                  color: '#cbd5e1',
                  margin: 0,
                  fontWeight: '600',
                  lineHeight: '1.4',
                  maxWidth: '780px',
                }}
              >
                {subtitle}
              </p>
            </div>

            {/* Bottom Row: CTA & Branding */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '22px',
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '18px', fontWeight: '600' }}>
                <span style={{ fontSize: '20px' }}>📲</span>
                <span>탭하여 연락처(vCard) 저장 및 3D 프로필 확인</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '3px', background: 'linear-gradient(90deg, #ffd978, #f59e0b)', backgroundClip: 'text', color: 'transparent' }}>
                  TOOMCARD
                </span>
                <span style={{ fontSize: '15px', color: '#64748b', fontWeight: '800' }}>.COM</span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error("OG Generation Error:", e);
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}
