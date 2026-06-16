import { useState, useEffect, useRef } from 'react'

export default function RecordingOverlay({ show, onClose, onResult }) {
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!show) {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
      setTranscript('')
      return
    }

    // Attempt to use speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.lang = 'zh-CN'
      rec.interimResults = true
      rec.continuous = true

      rec.onresult = (e) => {
        let final = ''
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript
          else interim += e.results[i][0].transcript
        }
        setTranscript(final || interim)
      }

      rec.onerror = () => {
        setTranscript('语音识别不可用，请手动输入')
      }

      rec.start()
      recognitionRef.current = rec
    } else {
      setTranscript('⚠️ 浏览器不支持语音识别，请使用 Chrome')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [show])

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    onResult(transcript || '')
  }

  if (!show) return null

  return (
    <div className="rec-overlay show">
      <div className="rec-card">
        <div className="rec-wave">
          {[1,2,3,4,5,6,7,8].map(i => <div className="bar" key={i} />)}
        </div>
        <div className="rec-text">{transcript || '正在录音...'}</div>
        <div className="rec-sub">{transcript ? '识别结果如上' : '请清晰说出内容，点击停止按钮结束'}</div>
        {transcript && (
          <div style={{ margin: '12px 0', padding: '10px 14px', background: '#0D1117', borderRadius: 10, fontSize: 14, color: '#C8D0E0', maxWidth: 400, wordBreak: 'break-all' }}>
            {transcript}
          </div>
        )}
        <button className="rec-stop" onClick={handleStop}>
          {transcript ? '✓ 确认并插入' : '■ 停止录音'}
        </button>
        <button
          onClick={onClose}
          style={{ display: 'block', margin: '8px auto 0', background: 'none', border: 'none', color: '#6B7A9F', cursor: 'pointer', fontSize: 12 }}
        >取消</button>
      </div>
    </div>
  )
}
