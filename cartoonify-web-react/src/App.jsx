import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, Image as ImageIcon, Download } from 'lucide-react'

export default function App() {
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const hiddenCanvasRef = useRef(null)

  const [sourceImage, setSourceImage] = useState(null)
  const [streaming, setStreaming] = useState(false)
  const [mediaStream, setMediaStream] = useState(null)

  const [levels, setLevels] = useState(8)
  const [edgeThreshold, setEdgeThreshold] = useState(70)
  const [applyBlur, setApplyBlur] = useState(1)

  useEffect(() => {
    if (!sourceImage) return
    requestAnimationFrame(() => cartoonifyImage())
    // eslint-disable-next-line
  }, [sourceImage, levels, edgeThreshold, applyBlur])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setMediaStream(stream)
      setStreaming(true)
    } catch (e) {
      alert('Could not access camera — allow camera permissions and try again.')
      console.error(e)
    }
  }

  function stopCamera() {
    if (mediaStream) mediaStream.getTracks().forEach(t => t.stop())
    setStreaming(false)
    setMediaStream(null)
  }

  function captureFromCamera() {
    const video = videoRef.current
    if (!video) return
    const canvas = hiddenCanvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const img = new Image()
    img.onload = () => setSourceImage(img)
    img.src = canvas.toDataURL('image/png')
  }

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setSourceImage(img)
    img.src = url
  }

  function openFilePicker() { fileInputRef.current?.click() }

  function cartoonifyImage() {
    const img = sourceImage
    const canvas = canvasRef.current
    const hidden = hiddenCanvasRef.current
    if (!img || !canvas || !hidden) return

    const maxWidth = Math.min(window.innerWidth - 48, 1200)
    const scale = Math.min(1, maxWidth / img.width)
    const w = Math.max(320, Math.round(img.width * scale))
    const h = Math.round(img.height * (w / img.width))

    canvas.width = w
    canvas.height = h
    hidden.width = w
    hidden.height = h

    const ctx = canvas.getContext('2d')
    const hctx = hidden.getContext('2d')

    hctx.drawImage(img, 0, 0, w, h)
    let imageData = hctx.getImageData(0,0,w,h)
    let data = imageData.data

    if (applyBlur > 0) {
      for (let i=0;i<applyBlur;i++) boxBlur(imageData)
      data = imageData.data
    }

    posterize(data, levels)

    hctx.drawImage(img, 0, 0, w, h)
    const original = hctx.getImageData(0,0,w,h)
    const gray = rgbaToGrayscale(original.data)
    const edge = sobelEdgeDetect(gray, w, h)

    ctx.putImageData(imageData, 0, 0)

    // create edge overlay
    const edgeCanvas = document.createElement('canvas')
    edgeCanvas.width = w
    edgeCanvas.height = h
    const ectx = edgeCanvas.getContext('2d')
    const edgeImage = ectx.createImageData(w,h)
    for (let i=0;i<edge.length;i++){
      const v = edge[i] > edgeThreshold ? 0 : 255
      const j = i*4
      edgeImage.data[j]=v
      edgeImage.data[j+1]=v
      edgeImage.data[j+2]=v
      edgeImage.data[j+3]=255
    }
    ectx.putImageData(edgeImage,0,0)

    // blend edges with multiply
    ctx.globalCompositeOperation='multiply'
    ctx.drawImage(edgeCanvas,0,0)
    ctx.globalCompositeOperation='source-over'
  }

  function posterize(data, levels) {
    const step = Math.floor(256/levels) || 1
    for (let i=0;i<data.length;i+=4){
      data[i] = Math.floor(data[i]/step)*step + step/2
      data[i+1] = Math.floor(data[i+1]/step)*step + step/2
      data[i+2] = Math.floor(data[i+2]/step)*step + step/2
    }
  }

  function rgbaToGrayscale(data) {
    const out = new Float32Array(data.length/4)
    for (let i=0,j=0;i<data.length;i+=4,j++) out[j]=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2]
    return out
  }

  function boxBlur(imageData) {
    const {width,height,data} = imageData
    const copy = new Uint8ClampedArray(data)
    const radius = 1
    for (let y=0;y<height;y++){
      for (let x=0;x<width;x++){
        let r=0,g=0,b=0,a=0,count=0
        for (let dy=-radius;dy<=radius;dy++){
          const ny=y+dy
          if (ny<0||ny>=height) continue
          for (let dx=-radius;dx<=radius;dx++){
            const nx=x+dx
            if (nx<0||nx>=width) continue
            const idx=(ny*width+nx)*4
            r+=copy[idx]; g+=copy[idx+1]; b+=copy[idx+2]; a+=copy[idx+3]; count++
          }
        }
        const idx=(y*width+x)*4
        data[idx]=r/count; data[idx+1]=g/count; data[idx+2]=b/count; data[idx+3]=a/count
      }
    }
  }

  function sobelEdgeDetect(gray,width,height){
    const kernelX=[-1,0,1,-2,0,2,-1,0,1]
    const kernelY=[-1,-2,-1,0,0,0,1,2,1]
    const out=new Float32Array(width*height)
    for (let y=1;y<height-1;y++){
      for (let x=1;x<width-1;x++){
        let gx=0,gy=0,k=0
        for (let ky=-1;ky<=1;ky++){
          for (let kx=-1;kx<=1;kx++){
            const val=gray[(y+ky)*width+(x+kx)]
            gx+=val*kernelX[k]; gy+=val*kernelY[k]; k++
          }
        }
        out[y*width+x]=Math.hypot(gx,gy)
      }
    }
    return out
  }

  function downloadResult(){
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'cartoonified.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div style={{minHeight:'100vh'}} className="p-6 flex items-center justify-center">
      {/* decorative blobs */}
      <div className="bg-blob" style={{width:420,height:420,left:-120,top:-80,background:'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.7), rgba(99,102,241,0.1) 40%, transparent 60%)'}} />
      <div className="bg-blob" style={{width:360,height:360,right:-80,bottom:-120,background:'radial-gradient(circle at 70% 70%, rgba(236,72,153,0.65), rgba(236,72,153,0.08) 40%, transparent 60%)'}} />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 relative">
        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass p-6 rounded-2xl shadow-2xl card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white">
                <ImageIcon />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Cartoonify</h2>
                <p className="text-sm opacity-70">Upload or capture a photo — processed locally in the browser.</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={openFilePicker} className="btn glass px-3 py-2 rounded-md flex items-center gap-2">
                <Upload size={16} /> Upload
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
              {!streaming ? (
                <button onClick={startCamera} className="btn glass px-3 py-2 rounded-md flex items-center gap-2">
                  <Camera size={16} /> Camera
                </button>
              ) : (
                <button onClick={stopCamera} className="btn glass px-3 py-2 rounded-md flex items-center gap-2">
                  Stop
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-black/10 p-3 rounded-md flex items-center justify-center">
              <div className="canvas-wrap">
                <canvas ref={canvasRef} style={{maxWidth:'100%', display: sourceImage ? 'block' : 'none', borderRadius:12}} />
                {!sourceImage && (
                  <div className="min-h-[240px] flex items-center justify-center text-center p-6 opacity-70">
                    <div>
                      <p className="text-lg">No image selected</p>
                      <p className="text-sm opacity-70">Upload a photo or use the camera to take one.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-sm opacity-70">Color levels</span>
                <input type="range" min={2} max={32} value={levels} onChange={(e)=>setLevels(Number(e.target.value))} />
                <small className="opacity-70">{levels} levels</small>
              </label>

              <label className="flex flex-col">
                <span className="text-sm opacity-70">Edge threshold</span>
                <input type="range" min={10} max={200} value={edgeThreshold} onChange={(e)=>setEdgeThreshold(Number(e.target.value))} />
                <small className="opacity-70">{edgeThreshold}</small>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={applyBlur>0} onChange={(e)=>setApplyBlur(e.target.checked?1:0)} />
                <span className="text-sm opacity-70">Apply subtle smooth</span>
              </label>

              <div className="ml-auto flex gap-2">
                <button onClick={captureFromCamera} className="btn glass px-3 py-2 rounded-md flex items-center gap-2">
                  <Camera size={14} /> Capture
                </button>
                <button onClick={downloadResult} className="btn glass px-3 py-2 rounded-md flex items-center gap-2">
                  <Download size={14} /> Download
                </button>
              </div>
            </div>

            <div className="text-xs opacity-60">Processing happens inside your browser — no files are uploaded.</div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass p-6 rounded-2xl shadow-2xl flex flex-col gap-4 card-hover">
          <div>
            <h3 className="text-lg font-semibold">Live Camera</h3>
            <p className="text-sm opacity-70">Preview your camera feed and capture a frame.</p>
          </div>

          <div className="bg-black/10 rounded-md overflow-hidden h-64 flex items-center justify-center">
            <video ref={videoRef} className={`w-full h-full object-cover ${streaming ? 'block' : 'hidden'}`} playsInline muted></video>
            {!streaming && (
              <div className="text-center opacity-70 p-6">
                <p>Camera not running</p>
                <p className="text-sm opacity-60">Click Camera to start preview</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={()=>{ if (sourceImage) setSourceImage(null) }} className="py-2 rounded-md glass">Clear</button>
            <button onClick={()=>{ if (sourceImage) { const w=window.open('about:blank'); w.document.write('<img src=\"'+canvasRef.current.toDataURL()+'\"/>') } }} className="py-2 rounded-md glass">Open result</button>
          </div>

          <div className="text-sm opacity-70">
            Tips: Increase color levels for smoother gradients. Increase edge threshold to make lines thinner. Enable \"Apply subtle smooth\" on noisy photos.
          </div>
        </motion.div>
      </div>

      <canvas ref={hiddenCanvasRef} style={{display:'none'}} />
    </div>
  )
}
