import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'TOOMCARD';
    const subtitle = searchParams.get('subtitle') || '3D 인터랙티브 디지털 명함';
    const company = searchParams.get('company') || 'TOOMUS';
    
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
            color: 'white',
            fontFamily: 'sans-serif',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #1f1a2e 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1f1a2e 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', padding: '60px 80px', background: 'rgba(255,255,255,0.04)', borderRadius: '32px', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', maxWidth: '960px', width: '90%' }}>
            {company && <h2 style={{ fontSize: '32px', color: '#ffd978', margin: '0 0 16px 0', fontWeight: '700', letterSpacing: '2px' }}>{company}</h2>}
            <h1 style={{ fontSize: '68px', margin: '0 0 20px 0', fontWeight: '900', background: 'linear-gradient(90deg, #c084fc, #ec4899, #f43f5e)', backgroundClip: 'text', color: 'transparent', letterSpacing: '-1px' }}>{title}</h1>
            <p style={{ fontSize: '28px', color: '#cbd5e1', margin: 0, fontWeight: '500' }}>{subtitle}</p>
          </div>
          
          <div style={{ position: 'absolute', bottom: '40px', right: '60px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '3px', background: 'linear-gradient(90deg, #ffd978, #f59e0b)', backgroundClip: 'text', color: 'transparent' }}>TOOMCARD</span>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>.COM</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}
