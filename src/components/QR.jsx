import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

export default function QR({ text = '', size = 220 }) {
  const canvasRef = useRef(null)
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    const el = canvasRef.current
    if (!el || !text) { setDataUrl(''); return }
    // Render y luego crear el link de descarga
    QRCode.toCanvas(el, text, { width: size }, (err) => {
      if (err) {
        console.error(err)
        setDataUrl('')
        return
      }
      try {
        setDataUrl(el.toDataURL('image/png'))
      } catch (e) {
        console.error(e)
        setDataUrl('')
      }
    })
  }, [text, size])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ background: '#fff', borderRadius: 12 }}
      />
      <a className="btn" href={dataUrl || '#'} download="qr.png" onClick={(e)=>{ if(!dataUrl) e.preventDefault() }}>
        Descargar QR
      </a>
    </div>
  )
}
