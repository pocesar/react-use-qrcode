import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { createComlink } from 'react-use-comlink'
import { transfer } from 'comlink'
import { parseQrcode } from './qrcode.worker'
import { useUserMedia } from '@vardius/react-user-media'

const useComlink = createComlink<typeof parseQrcode>(() => {
  return new Worker('./qrcode.worker.ts')
})

function useQrCode(options: MediaTrackConstraints) {
  const ref = useRef<HTMLVideoElement>(null)
  const [ result, setResult ] = useState<string | null>(null)
  const { stream, error } = useUserMedia({ audio: false, video: {
    width: 300,
    height: 300,
    facingMode: 'environment',
    aspectRatio: window.devicePixelRatio || 1,
    ...options,
  }})
  const { proxy } = useComlink()

  const stop = useCallback(() => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => track.stop())
    }
  }, [stream])

  const reset = useCallback(() => {
    setResult(null)
  },  [setResult])

  useEffect(() => {
    const captureStream = stream
    const video = ref.current
    let objectUrl: string | null = null

    if (video && captureStream) {
      if ('srcObject' in video) {
        video.srcObject = captureStream
      } else if ('src' in video) {
        objectUrl = URL.createObjectURL(captureStream)
        video!.src = objectUrl
      }
    }

    return () => {
      if (captureStream) {
        captureStream.getVideoTracks().forEach((s) => s.stop())
      }

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [ref, stream])

  useEffect(() => {
    const video = ref.current
    const height: number = +(options.height as number) || 300
    const width: number = +(options.width as number) || 300
    let assignedCanvas: HTMLCanvasElement | OffscreenCanvas | null = null

    const notify = () => {
      //console.log('notify')
      if (assignedCanvas && video) {
        let context = assignedCanvas.getContext('2d', {
          alpha: false // should never have alpha from camera, boosts performance a bit
        })

        if (context) {
          context.drawImage(video, 0, 0)

          let imageData: ImageData | null = context.getImageData(0, 0, width, height)

          if (imageData && imageData.data) {
            (proxy(transfer(imageData, [imageData.data.buffer])) as PromiseLike<string | null>).then((res) => {
              imageData = null
              context = null

              if (res != result && res) {
                setResult(res)
              }
            })
          }
        }
      }
    }

    if (video && width && height) {
      let cv: HTMLCanvasElement | OffscreenCanvas = document.createElement('canvas')

      if ('OffscreenCanvas' in window && 'transferControlToOffscreen' in cv) {
        assignedCanvas = cv.transferControlToOffscreen()
      } else {
        assignedCanvas = cv
      }

      assignedCanvas.height = height
      assignedCanvas.width = width

      //console.log(video, height, width, assignedCanvas)

      video.addEventListener('timeupdate', notify)
    } else if (Number.isNaN(width) || Number.isNaN(height)) {
      throw new TypeError("height and width must be numbers")
    }

    return () => {
      if (video) {
        video.removeEventListener('timeupdate', notify)
      }
      assignedCanvas = null
    }
  }, [
    ref,
    setResult,
    proxy,
    options.height,
    options.width
  ])

  return useMemo(() => {
    return {
      ref,
      result,
      error,
      reset,
      stop
    }
  }, [
    ref,
    result,
    error,
    reset,
    stop
  ])
}

export default useQrCode