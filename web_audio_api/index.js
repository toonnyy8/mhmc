"use strict"
console.log(
    navigator.mediaDevices.getSupportedConstraints())

navigator
    .mediaDevices
    .enumerateDevices()
    .then(devices => {
        console.log(
            devices)
    })


navigator
    .mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(stream => {
        const track = stream.getAudioTracks()[0]


        document.getElementById("start").onclick = () => {
            document.getElementById("start").onclick = null
            /**
             * @type {HTMLCanvasElement} canvas
             */
            const canvas = document.getElementById("canvas")
            const ctx = canvas.getContext("2d")
            ctx.clearRect(0, 0, 400, 200)
            ctx.fillStyle = "#ff2e88"

            const audioCtx = new window.AudioContext()
            const source = audioCtx.createMediaStreamSource(stream)
            const processor = audioCtx.createScriptProcessor(undefined, 1, 1)
            const gainNode = audioCtx.createGain();
            console.log(processor.bufferSize)
            let i = 0
            /**
             * @type {Float32Array}
             */
            let arr = []
            processor.onaudioprocess =
                e => {
                    i += processor.bufferSize
                    const inpbuf = e.inputBuffer.getChannelData(0)
                    // arr.push(inpbuf)
                    arr = [...arr, ...inpbuf]

                    e.outputBuffer.copyToChannel(inpbuf, 0)

                    ctx.clearRect(0, 0, 400, 200)
                    inpbuf.forEach((val, idx) => {
                        ctx.fillRect(
                            400 * (idx / processor.bufferSize),
                            100, Math.ceil(400 / processor.bufferSize),
                            - (100 * Math.abs(val))
                        )
                    })
                    // console.log(inpbuf)
                    if (i > 96000) {
                        console.log("end")
                        gainNode.disconnect()
                        console.log(i)
                        ctx.clearRect(0, 0, 400, 200)
                        console.log(arr)
                        arr.forEach((val, idx) => {
                            ctx.fillRect(
                                400 * (idx / i),
                                100,
                                Math.ceil(400 / i),
                                - (100 * val)
                            )
                        })
                    }

                }



            source.connect(processor)
            processor.connect(gainNode)
            gainNode.connect(audioCtx.destination)

            console.log(source)
            console.log(processor)
        }
    })
    .catch(err => {
        console.log(err)
    })