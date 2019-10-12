import React, { useEffect, useCallback, useState } from 'react'
import ReactDOM from 'react-dom'
import useQrCode from '../src/index'

import 'webrtc-adapter'

const videoStyle: React.CSSProperties = {
  height: 'calc(100vh - 100px)',
  width: 'calc(100vw - 40px)'
}

const containerStyle: React.CSSProperties = {
  textAlign: 'center',
  minHeight: '90px',
  paddingBottom: '10px'
}

const App: React.FC = () => {
  const qrcode = useQrCode({
    height: 300,
    width: 300
  })
  const [ resetBtn, setResetBtn ] = useState(false)

  const reset = useCallback(() => {
    setResetBtn(false)
    qrcode.reset()
  }, [qrcode, setResetBtn])

  useEffect(() => {
    if (qrcode.result && !resetBtn) {
      setResetBtn(true)
    }
  }, [qrcode.result, resetBtn, setResetBtn])

  return (
    <div>
      <div  style={containerStyle}>
        <div>{ qrcode.result ? qrcode.result : null}</div>
        { resetBtn ? <button onClick={reset}>Reset</button> : null }
        <button onClick={qrcode.stop}>Stop</button>
      </div>

      <video ref={qrcode.ref} autoPlay style={videoStyle} />
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)