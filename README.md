# react-use-qrcode

React hook that allows you to decode QR Code data in a webworker (through comlink) using [@zxing/library](https://github.com/zxing-js/library) with some adaptations for web workers. Performance-first, non-ui blocking code. Uses [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) if available

## Example

```tsx
import useQrcode from 'react-use-qrcode'

const App: React.FC = () => {
  const { ref, result, stop } = useQrcode({
    width: 300,
    height: 300
  })

  useEffect(() => {
    if (result) {
      stop()
    }
  }, [result, stop])

  return (
    <>
      <video ref={ref} autoPlay width={300} height={300} />
      <p>{ result ? result : null }</p>
    </>
  )
}
```

## Example

Run `npm run example` on the root then open `https://localhost` (accept the self signed certificate generated by Parcel)

## Caveats

* Need to always use a `<video ref={ref}>` element and provide the ref.
* Need to always pass in a number width / height to the hook, can't use percentages or `vh`/`vw` (doesn't mean you can't stretch the `<video>` element itself)
* Not tested on non-evergreen browsers (IE, Opera, Samsung Browser, etc)
* `webrtc-adapter` might be needed for some weird browsers

## License

MIT